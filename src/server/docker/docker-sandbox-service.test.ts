import { describe, expect, it } from "vitest";
import { checkToCommand } from "@/services/validation/validation-engine";

describe("docker sandbox contract", () => {
  it("never targets the host docker socket from student checks", () => {
    const mapped = checkToCommand({ type: "fileExists", path: "/tmp/notes.txt" });
    expect(mapped.command).not.toContain("docker.sock");
    expect(mapped.command).not.toContain("C:\\\\");
  });
});
