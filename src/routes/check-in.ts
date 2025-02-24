import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function checkIn(app: FastifyInstance) {
  app
    .addHook('onRequest', async (request, reply) => {
      const apiKey = request.headers['x-api-key'];
      if (apiKey !== process.env.API_KEY) {
        reply.status(403).send({ error: 'Acesso não autorizado' });
      }
    })
    .withTypeProvider<ZodTypeProvider>()
    .get('/attendee/:attendeeId/check-in', {
      schema: {
        summary: "Faça o check-in de um participante",
        tags: ["Check-ins"],
        params: z.object({
          attendeeId: z.coerce.number().int()
        }),
        response: {
          201: z.null(),
        }
      }
    }, async (request, reply) => {
      const { attendeeId } = request.params

      const attendeeCheckIn = await prisma.checkIn.findUnique({
        where: {
          id: attendeeId
        }
      })

      if (attendeeCheckIn !== null) {
        throw new BadRequest("Attendee already checked in")
      }

      await prisma.checkIn.create({
        data: {
          attendeeId
        }
      })

      return reply.status(201).send()
    })
}