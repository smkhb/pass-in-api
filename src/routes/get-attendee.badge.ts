import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { request } from "http";
import z from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function getAttendeeBagde(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/attendee/:attendeeId/bagde', {
      schema: {
        summary: "Get attendee badge",
        tags: ["attendees"],
        params: z.object({
          attendeeId: z.coerce.number().int()
        }),
        response: {
          200: z.object({
            badge: z.object({
              name: z.string(),
              email: z.string(),
              eventTitle: z.string(),
              eventDetails: z.string().nullable(),
              checkInURL: z.string().url()
            })
          })
        }
      }
    },async (request, reply) => {
      const { attendeeId } = request.params

      const attendee = await prisma.attendee.findUnique({
        select: {
          name: true,
          email: true,
          event: {
            select: {
              title: true,
              details: true
            }
          }
        },
        where: {
          id: attendeeId
        }
      })

      if (attendee === null) {
        throw new BadRequest("Attendee not found")
      }

      const baseURL = `${request.protocol}://${request.hostname}:${request.port}`
      
      const checkInURL = new URL(`/attendees/${attendeeId}/check-in`, baseURL)
      return reply.send({
        badge: {
          name: attendee.name,
          email: attendee.email,
          eventTitle: attendee.event.title,
          eventDetails: attendee.event.details,
          checkInURL: checkInURL.toString()
        }
      })
    })
}