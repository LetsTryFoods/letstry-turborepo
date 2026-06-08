import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import * as dotenv from "dotenv";
import { manifestHandler } from "./ota/manifest";
import { screenHandler } from "./sdui/screens";
import { navigationHandler } from "./sdui/navigation";

dotenv.config();

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "../public"),
  prefix: "/public/",
});

fastify.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

fastify.get("/updates/manifest", manifestHandler);

fastify.get("/sdui/screen/:id", screenHandler);
fastify.get("/sdui/navigation", navigationHandler);

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;
    await fastify.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
