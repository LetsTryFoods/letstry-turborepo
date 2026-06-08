import { FastifyRequest, FastifyReply } from "fastify";

export const getExpoHeaders = (req: FastifyRequest) => {
  return {
    platform: (req.headers["expo-platform"] as string) || "ios",
    runtimeVersion: (req.headers["expo-runtime-version"] as string) || "1.0.0",
    protocolVersion: (req.headers["expo-protocol-version"] as string) || "1",
    expectSignature: req.headers["expo-expect-signature"] as string,
  };
};

export const setManifestHeaders = (reply: FastifyReply) => {
  reply.header("expo-protocol-version", "1");
  reply.header("content-type", "application/json");
};
