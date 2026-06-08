import { FastifyRequest, FastifyReply } from "fastify";
import { getExpoHeaders, setManifestHeaders } from "./protocol";

export const manifestHandler = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const { platform, runtimeVersion } = getExpoHeaders(req);

  const manifest = {
    id: "1.0.0",
    createdAt: new Date().toISOString(),
    runtimeVersion: runtimeVersion,
    launchAsset: {
      url: `http://localhost:4000/public/bundles/${platform}/index.bundle`,
      contentType: "application/javascript",
    },
    assets: [],
    metadata: {},
    extra: {
      expoClient: {
        name: "LetsTry",
        slug: "letstry-mobile",
      },
    },
  };

  setManifestHeaders(reply);
  return manifest;
};
