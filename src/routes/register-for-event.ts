import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import z from "zod";
import { BadRequest } from "./_errors/bad-request";

export async function registerForEvent(app: FastifyInstance) {
  app
    .addHook('onRequest', async (request, reply) => {
      const apiKey = request.headers['x-api-key'];
      if (apiKey !== process.env.API_KEY) {
        reply.status(403).send({ error: 'Acesso não autorizado' });
      }
    })
    .withTypeProvider<ZodTypeProvider>()
    .post('/events/:eventId/attendees', {
      schema: {
        summary: "Registre um participante para um evento",
        tags: ["Participantes"],
        body: z.object({
          name: z.string().min(4),
          email: z.string().email(),
        }),
        params: z.object({
          eventId: z.string().uuid()
        }),
        response: {
          201: z.object({
            attendeeId: z.number()
          })
        } 
      }
    }, async (request, reply) => {
      const { eventId } = request.params
      const { name, email } = request.body
     
      const attendeeFromEmail = await prisma.attendee.findUnique({
        where: {
          eventId_email: {
            email,
            eventId
          }
        }
      })

      if (attendeeFromEmail !== null) {
        throw new BadRequest("An attendee with the same email already exists")
      }

      const [event, amountOfAttendeesForEvent] = await Promise.all([
        prisma.event.findUnique({
          where: {
            id: eventId
          }
        }),

        prisma.attendee.count({
          where: {
            eventId
          }
        })
      ])

      if (event?.maximumAttendees && amountOfAttendeesForEvent >= event.maximumAttendees) {
        throw new BadRequest("Event is full")
      }

      const attendee = await prisma.attendee.create({
          data: {
            name,
            email,
            eventId
          }
      })

      return reply.status(201).send({ attendeeId: attendee.id })
    })
}