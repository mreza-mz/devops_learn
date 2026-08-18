import { createServer } from "http";
import { WebSocketServer, type RawData, WebSocket } from "ws";
import Docker, { type Exec } from "dockerode";
import { loadGatewayEnv, logger, toBuffer } from "./lib-lite";
import { jwtVerify } from "jose";

loadGatewayEnv();

const port = Number(process.env.TERMINAL_GATEWAY_PORT ?? 3001);
const secret = process.env.AUTH_SECRET ?? "";

function dockerClient() {
  if (process.env.DOCKER_HOST?.startsWith("unix://")) {
    return new Docker({ socketPath: process.env.DOCKER_HOST.replace("unix://", "") });
  }
  if (process.platform === "win32") {
    return new Docker({ socketPath: "//./pipe/docker_engine" });
  }
  return new Docker({ socketPath: "/var/run/docker.sock" });
}

async function verifyToken(token: string) {
  if (!secret) {
    throw new Error("AUTH_SECRET is not set for the terminal gateway");
  }
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  if (
    typeof payload.labId !== "string" ||
    typeof payload.userId !== "string" ||
    typeof payload.containerId !== "string"
  ) {
    throw new Error("invalid lab token");
  }
  return {
    labId: payload.labId,
    userId: payload.userId,
    containerId: payload.containerId,
  };
}

const docker = dockerClient();
const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "terminal-gateway" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server, path: "/pty" });

wss.on("connection", (socket: WebSocket) => {
  let dockerStream: NodeJS.ReadWriteStream | null = null;
  let exec: Exec | null = null;
  let authenticating = false;
  const pendingInput: Buffer[] = [];

  const writeToPty = (chunk: Buffer) => {
    if (dockerStream) {
      dockerStream.write(chunk);
      return;
    }
    pendingInput.push(chunk);
  };

  socket.on("message", async (raw: RawData) => {
    const buffer = toBuffer(raw as Buffer | ArrayBuffer | Buffer[] | string);
    const text = buffer.toString("utf8");

    if (text.startsWith('{"type":"resize"')) {
      try {
        const parsed = JSON.parse(text) as { cols?: number; rows?: number };
        if (exec && parsed.cols && parsed.rows) {
          await exec.resize({ h: parsed.rows, w: parsed.cols }).catch(() => undefined);
        }
      } catch {
        writeToPty(buffer);
      }
      return;
    }

    if (!dockerStream && !authenticating) {
      authenticating = true;
      try {
        const message = JSON.parse(text) as { type?: string; token?: string; cols?: number; rows?: number };
        if (message.type !== "auth" || !message.token) {
          socket.close(4401, "auth required");
          return;
        }
        const claims = await verifyToken(message.token);
        const container = docker.getContainer(claims.containerId);
        exec = await container.exec({
          Cmd: ["/bin/bash"],
          AttachStdin: true,
          AttachStdout: true,
          AttachStderr: true,
          Tty: true,
          User: "root",
          Env: ["TERM=xterm-256color", "LANG=C.UTF-8"],
        });
        const stream = await exec.start({ hijack: true, stdin: true, Tty: true });
        dockerStream = stream as unknown as NodeJS.ReadWriteStream;
        dockerStream.on("data", (chunk: Buffer) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(chunk);
          }
        });
        dockerStream.on("end", () => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        });
        dockerStream.on("error", (error) => logger("pty stream error", error));
        for (const queued of pendingInput) {
          dockerStream.write(queued);
        }
        pendingInput.length = 0;
        if (message.cols && message.rows) {
          await exec.resize({ h: message.rows, w: message.cols }).catch(() => undefined);
        }
      } catch (error) {
        logger("terminal auth failed", error);
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(
            Buffer.from(`\r\n[lab] ${error instanceof Error ? error.message : "unauthorized"}\r\n`),
          );
          socket.close(4401, "unauthorized");
        }
      } finally {
        authenticating = false;
      }
      return;
    }

    writeToPty(buffer);
  });

  socket.on("close", () => {
    dockerStream?.end();
  });
});

server.listen(port, "127.0.0.1", () => {
  logger(`terminal gateway listening on 127.0.0.1:${port}`);
});
