import {
  BadRequest
} from "./chunk-JRO4E4TH.mjs";
import {
  prisma
} from "./chunk-5KVQPZKD.mjs";

// src/routes/get-event.ts
import z from "zod";
async function getEvent(app) {
  app.withTypeProvider().get("/events/:eventId/", {
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
  }, async (request, reply) => {
    const { eventId } = request.params;
    const event = await prisma.event.findUnique({
      select: {
        title: true,
        details: true,
        _count: {
          select: {
            attendees: true
          }
        }
      },
      where: {
        id: eventId
      }
    });
    if (event === null) {
      throw new BadRequest("Event not found");
    }
    return reply.send({
      event: {
        title: event.title,
        details: event.details,
        attendees: event._count.attendees
      }
    });
  });
}

export {
  getEvent
};
