import Docker from "dockerode";
import { getEnv } from "@/config/env";
import { errors } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { prisma } from "@/server/db/prisma";
import { LAB_STATUS } from "@/config/constants";
import type { LabSetup, ValidationSpec } from "@/types/domain";
import { checkToCommand, summarizeValidation, validationSpecSchema } from "@/services/validation/validation-engine";

function createDocker(): Docker {
  if (process.platform === "win32") {
    return new Docker({ socketPath: "//./pipe/docker_engine" });
  }
  return new Docker({ socketPath: process.env.DOCKER_HOST?.replace("unix://", "") ?? "/var/run/docker.sock" });
}

const docker = createDocker();

function parseMemory(value: string): number {
  const match = /^(\d+)(m|mb|g|gb)?$/i.exec(value.trim());
  if (!match) {
    return 512 * 1024 * 1024;
  }
  const amount = Number(match[1]);
  const unit = (match[2] ?? "m").toLowerCase();
  if (unit.startsWith("g")) {
    return amount * 1024 * 1024 * 1024;
  }
  return amount * 1024 * 1024;
}

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("error", reject);
  });
}

export class DockerSandboxService {
  async createSandbox(input: {
    userId: string;
    exerciseId?: string;
    scenarioId?: string;
    image?: string;
    networkMode?: string;
    setup?: LabSetup | null;
    lifetimeSec?: number;
  }) {
    const env = getEnv();
    const expiresAt = new Date(Date.now() + (input.lifetimeSec ?? env.LAB_TIMEOUT_SECONDS) * 1000);
    const lab = await prisma.lab.create({
      data: {
        userId: input.userId,
        exerciseId: input.exerciseId,
        scenarioId: input.scenarioId,
        status: LAB_STATUS.CREATING,
        networkMode: input.networkMode ?? "none",
        expiresAt,
      },
    });

    try {
      await this.ensureImage(input.image ?? env.LAB_IMAGE);
      const container = await docker.createContainer({
        Image: input.image ?? env.LAB_IMAGE,
        name: `devops-learn-${lab.id}`,
        Tty: true,
        OpenStdin: true,
        Cmd: ["sleep", "infinity"],
        HostConfig: {
          Memory: parseMemory(env.LAB_MEMORY_LIMIT),
          NanoCpus: Math.round(Number(env.LAB_CPU_LIMIT) * 1e9),
          PidsLimit: env.LAB_MAX_PROCESSES,
          CapDrop: ["SYS_MODULE", "SYS_RAWIO", "SYS_BOOT", "SYS_TIME", "MAC_ADMIN", "MAC_OVERRIDE"],
          Privileged: false,
          ReadonlyRootfs: false,
          NetworkMode: input.networkMode ?? "none",
          AutoRemove: false,
          Binds: [],
        },
        Labels: {
          "devops-learn.lab": lab.id,
          "devops-learn.user": input.userId,
        },
      });
      await container.start();
      if (input.setup?.commands?.length) {
        for (const command of input.setup.commands) {
          await this.execInContainer(container.id, command);
        }
      }
      await prisma.lab.update({
        where: { id: lab.id },
        data: { containerId: container.id, status: LAB_STATUS.RUNNING },
      });
      logger.info("lab created", { labId: lab.id, containerId: container.id });
      return prisma.lab.findUniqueOrThrow({ where: { id: lab.id } });
    } catch (error) {
      logger.error("lab creation failed", {
        labId: lab.id,
        error: error instanceof Error ? error.message : "unknown",
      });
      await prisma.lab.update({
        where: { id: lab.id },
        data: { status: LAB_STATUS.ERROR },
      });
      throw errors.docker();
    }
  }

  async executeCommand(labId: string, command: string) {
    const lab = await this.requireRunning(labId);
    const result = await this.execInContainer(lab.containerId!, command);
    await prisma.labCommand.create({
      data: { labId, command: command.slice(0, 2000), exitCode: result.exitCode },
    });
    return result;
  }

  async getTerminalStream(labId: string) {
    const lab = await this.requireRunning(labId);
    const container = docker.getContainer(lab.containerId!);
    const exec = await container.exec({
      Cmd: ["/bin/bash", "-l"],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      User: "root",
    });
    const stream = await exec.start({ hijack: true, stdin: true, Tty: true });
    return { exec, stream, containerId: lab.containerId! };
  }

  async resetSandbox(labId: string) {
    const lab = await prisma.lab.findUnique({ where: { id: labId } });
    if (!lab) {
      throw errors.notFound("آزمایشگاه");
    }
    await this.destroySandbox(labId);
    return this.createSandbox({
      userId: lab.userId,
      exerciseId: lab.exerciseId ?? undefined,
      scenarioId: lab.scenarioId ?? undefined,
      networkMode: lab.networkMode,
    });
  }

  async stopSandbox(labId: string) {
    const lab = await prisma.lab.findUnique({ where: { id: labId } });
    if (!lab?.containerId) {
      return lab;
    }
    try {
      await docker.getContainer(lab.containerId).stop({ t: 5 });
    } catch {
      // already stopped
    }
    return prisma.lab.update({
      where: { id: labId },
      data: { status: LAB_STATUS.STOPPED, stoppedAt: new Date() },
    });
  }

  async destroySandbox(labId: string) {
    const lab = await prisma.lab.findUnique({ where: { id: labId } });
    if (lab?.containerId) {
      try {
        const container = docker.getContainer(lab.containerId);
        await container.stop({ t: 2 }).catch(() => undefined);
        await container.remove({ force: true }).catch(() => undefined);
      } catch {
        // ignore missing containers
      }
    }
    logger.info("lab destroyed", { labId });
    return prisma.lab.update({
      where: { id: labId },
      data: { status: LAB_STATUS.DESTROYED, stoppedAt: new Date(), containerId: null },
    });
  }

  async getSandboxStatus(labId: string) {
    const lab = await prisma.lab.findUnique({ where: { id: labId } });
    if (!lab) {
      throw errors.notFound("آزمایشگاه");
    }
    if (lab.expiresAt.getTime() < Date.now() && lab.status === LAB_STATUS.RUNNING) {
      await this.destroySandbox(labId);
      return prisma.lab.findUniqueOrThrow({ where: { id: labId } });
    }
    return lab;
  }

  async validateLab(labId: string, specInput: unknown) {
    const lab = await this.requireRunning(labId);
    const spec = validationSpecSchema.parse(specInput) as ValidationSpec;
    const results = [];
    for (const check of spec.checks) {
      const mapped = checkToCommand(check);
      const output = await this.execInContainer(lab.containerId!, mapped.command);
      const passed = mapped.interpret(output.exitCode, `${output.stdout}${output.stderr}`);
      results.push({
        type: check.type,
        passed,
        detail: passed ? "ok" : "check failed",
      });
    }
    const summary = summarizeValidation(results);
    await prisma.labValidation.create({
      data: {
        labId,
        passed: summary.passed,
        resultsJson: results,
      },
    });
    return { ...summary, results };
  }

  async cleanupExpired() {
    const expired = await prisma.lab.findMany({
      where: { status: LAB_STATUS.RUNNING, expiresAt: { lt: new Date() } },
    });
    for (const lab of expired) {
      await this.destroySandbox(lab.id);
    }
  }

  private async requireRunning(labId: string) {
    const lab = await this.getSandboxStatus(labId);
    if (lab.status !== LAB_STATUS.RUNNING || !lab.containerId) {
      throw errors.labExpired();
    }
    return lab;
  }

  private async ensureImage(image: string) {
    try {
      await docker.getImage(image).inspect();
    } catch {
      logger.info("lab image missing, pulling is skipped; build locally", { image });
      throw errors.docker();
    }
  }

  private async execInContainer(containerId: string, command: string) {
    const container = docker.getContainer(containerId);
    const exec = await container.exec({
      Cmd: ["bash", "-lc", command],
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      User: "root",
    });
    const stream = await exec.start({ hijack: true, stdin: false });
    const output = await streamToString(stream);
    const inspect = await exec.inspect();
    return {
      stdout: output,
      stderr: "",
      exitCode: inspect.ExitCode ?? 1,
    };
  }
}

export const dockerSandboxService = new DockerSandboxService();
