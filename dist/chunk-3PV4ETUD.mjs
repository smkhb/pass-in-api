import {
  prisma
} from "./chunk-5KVQPZKD.mjs";

// src/routes/get-event-attendees.ts
import z from "zod";
async function getEventAttendees(app) {
  app.withTypeProvider().get(
    "/events/:eventId/attendees",
    {
      schema: {
        summary: "Aceesse os participantes de um evento",
        tags: ["Eventos"],
        params: z.object({
          eventId: z.string().uuid()
        }),
        querystring: z.object({
          query: z.string().nullish(),
          pageIndex: z.string().nullish().default("0").transform(Number)
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
    },
    async (request, reply) => {
      const { eventId } = request.params;
      const { pageIndex, query } = request.query;
      const attendees = await prisma.attendee.findMany({
        select: {
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
        } : { eventId },
        take: 10,
        skip: pageIndex * 10,
        orderBy: {
          createAt: "desc"
        }
      });
      return reply.status(200).send({
        attendees: attendees.map((attendee) => {
          return {
            id: attendee.id,
            email: attendee.email,
            name: attendee.name,
            createAt: attendee.createAt,
            checkInAt: attendee.checkIn?.createdAt ?? null
          };
        })
      });
    }
  );
}

export {
  getEventAttendees
};
