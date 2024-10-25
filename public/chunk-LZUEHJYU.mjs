import {
  BadRequest
} from "./chunk-JRO4E4TH.mjs";
import {
  prisma
} from "./chunk-5KVQPZKD.mjs";

// src/routes/get-attendee.badge.ts
import z from "zod";
async function getAttendeeBagde(app) {
  app.addHook("onRequest", async (request, reply) => {
    const apiKey = request.headers["x-api-key"];
    if (apiKey !== process.env.API_KEY) {
      reply.status(403).send({ error: "Acesso n\xE3o autorizado" });
    }
  }).withTypeProvider().get("/attendee/:attendeeId/bagde", {
    schema: {
      summary: "Acesse o crach\xE1 de um participante",
      tags: ["Participantes"],
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
  }, async (request, reply) => {
    const { attendeeId } = request.params;
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
    });
    if (attendee === null) {
      throw new BadRequest("Attendee not found");
    }
    const baseURL = `${request.protocol}://${request.hostname}:${request.port}`;
    const checkInURL = new URL(`/attendees/${attendeeId}/check-in`, baseURL);
    return reply.send({
      badge: {
        name: attendee.name,
        email: attendee.email,
        eventTitle: attendee.event.title,
        eventDetails: attendee.event.details,
        checkInURL: checkInURL.toString()
      }
    });
  });
}

export {
  getAttendeeBagde
};
