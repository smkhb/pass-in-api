import { FastifyRequest, FastifyReply } from 'fastify';

export async function verifyApiKey(request: FastifyRequest, reply: FastifyReply) {
  const apiKey = request.headers['x-api-key'];

  if (apiKey !== process.env.API_KEY) {
    reply.status(403).send({ error: 'Acesso não autorizado' });
  }
}
