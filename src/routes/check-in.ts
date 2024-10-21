import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { request } from "http";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function checkIn(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/attendee/:attendeeId/check-in', {
      schema: {
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
        throw new Error("Attendee already checked in")
      }

      await prisma.checkIn.create({
        data: {
          attendeeId
        }
      })

      return reply.status(201).send()
    })
}