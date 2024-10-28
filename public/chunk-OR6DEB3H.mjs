import {
  prisma
} from "./chunk-5KVQPZKD.mjs";

// src/routes/get-event-attendees.ts
import z from "zod";
async function getEventAttendees(app) {
  app.addHook("onRequest", async (request, reply) => {
    const apiKey = request.headers["x-api-key"];
    if (apiKey !== process.env.API_KEY) {
      reply.status(403).send({ error: "Acesso n\xE3o autorizado" });
    }
  }).withTypeProvider().get("/events/:eventId/attendees", {
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
          ),
          total: z.number()
        })
      }
    }
  }, async (request, reply) => {
    const { eventId } = request.params;
    const { pageIndex, query } = request.query;
    const [attendees, total] = await Promise.all([
      prisma.attendee.findMany({
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
      }),
      prisma.attendee.count({
        where: query ? {
          eventId,
          name: {
            contains: query
          }
        } : { eventId }
      })
    ]);
    return reply.status(200).send({
      attendees: attendees.map((attendee) => {
        return {
          id: attendee.id,
          email: attendee.email,
          name: attendee.name,
          createAt: attendee.createAt,
          checkInAt: attendee.checkIn?.createdAt ?? null
        };
      }),
      total
    });
  });
}

export {
  getEventAttendees
};
