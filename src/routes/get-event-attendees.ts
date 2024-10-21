import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { request } from "http";
import z, { number } from "zod";
import { prisma } from "../lib/prisma";

export async function getEventAttendees(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/events/:eventId/attendees', {
      schema: {
        params: z.object({
          eventId: z.string().uuid()
        }),
        querystring: z.object({
          query: z.string().nullish(),
          pageIndex: z.string().nullish().default('0').transform(Number),
        }),
        response: {
          200: z.object({
            attendees: z.array(
              z.object({
                id: z.number(),
                email: z.string(),
                name: z.string(),
                createAt: z.date(),
                checkInAt: z.date().nullable()
              })
            )
          })
        }
      }
    },async (request, reply) => {
      const { eventId } = request.params
      const { pageIndex, query } = request.query


      const attendees = await prisma.attendee.findMany({
        select:{
          id: true,
          email: true,
          name: true,
          createAt: true,
          checkIn: {
            select: {
              createdAt: true
            }
          }
        },
        where: query ? {
          eventId,
          name: {
            contains: query
          }
        } : {eventId},
        take: 10,
        skip: pageIndex * 10,
        orderBy: {
          createAt: 'desc'
        }
      })

      return reply.status(200).send({ 
        attendees: attendees.map(attendee => {
          return {
            id: attendee.id,
            email: attendee.email,
            name: attendee.name,
            createAt: attendee.createAt,
            checkInAt: attendee.checkIn?.createdAt ?? null
          }
        })
      })
    }
  )
}