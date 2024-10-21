import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { request } from "http";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function getEvent(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/events/:eventId/', {
      schema: {
        summary: "Get an event",
        tags: ["events"],
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
        throw new Error("Event not found")
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