import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { request } from "http";
import z from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function getEvent(app: FastifyInstance) {
  app
    .addHook('onRequest', async (request, reply) => {
      const apiKey = request.headers['x-api-key'];
      if (apiKey !== process.env.API_KEY) {
        reply.status(403).send({ error: 'Acesso não autorizado' });
      }
    })
    .withTypeProvider<ZodTypeProvider>()
    .get('/events/:eventId/', {
      schema: {
        summary: "Aceesse os detalhes de um evento",
        tags: ["Eventos"],
        params: z.object({
          eventId: z.string().uuid()
        }),
        response: {
          200: z.object({
            event: z.object({
              title: z.string(),
              details: z.string().nullable(),
              attendees: z.number()
            })
          })
        }
      }
    },async (request, reply) => {
      const { eventId } = request.params

      const event = await prisma.event.findUnique({
        select:{
          title: true,
          details: true,
          _count:{
            select:{
              attendees: true
            }
          }
        },where: {
          id: eventId
        }
      })

      if (event === null) {
        throw new BadRequest("Event not found")
      }

      return reply.send({
        event:{
          title: event.title,
          details: event.details,
          attendees: event._count.attendees
        }
      })
    })
}