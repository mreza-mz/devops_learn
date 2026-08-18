import { SignJWT, jwtVerify } from "jose";
import { getEnv } from "@/config/env";

export type LabTokenPayload = {
  labId: string;
  userId: string;
  containerId: string;
};

function secretKey() {
  return new TextEncoder().encode(getEnv().AUTH_SECRET);
}

export async function createLabToken(payload: LabTokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(secretKey());
}

export async function verifyLabToken(token: string): Promise<LabTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.labId !== "string" ||
      typeof payload.userId !== "string" ||
      typeof payload.containerId !== "string"
    ) {
      return null;
    }
    return {
      labId: payload.labId,
      userId: payload.userId,
      containerId: payload.containerId,
    };
  } catch {
    return null;
  }
}
