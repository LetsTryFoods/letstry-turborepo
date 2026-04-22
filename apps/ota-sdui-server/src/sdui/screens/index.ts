import { FastifyRequest, FastifyReply } from 'fastify';
import { homeScreen } from './home';
import { SDUIScreen } from '../types';

const screenRegistry: Record<string, SDUIScreen> = {
  home: homeScreen
};

export const screenHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  const screenDefinition = screenRegistry[id];

  if (screenDefinition) {
    return screenDefinition;
  }

  reply.status(404);
  return { error: `Screen definition for '${id}' not found` };
};
