import {
  BadRequest
} from "./chunk-JRO4E4TH.mjs";
import {
  prisma
} from "./chunk-5KVQPZKD.mjs";

// src/routes/check-in.ts
import z from "zod";
async function checkIn(app) {
  app.addHook("onRequest", async (request, reply) => {
    const apiKey = request.headers["x-api-key"];
    if (apiKey !== process.env.API_KEY) {
      reply.status(403).send({ error: "Acesso n\xE3o autorizado" });
    }
  }).withTypeProvider().get("/attendee/:attendeeId/check-in", {
    schema: {
      summary: "Fa\xE7a o check-in de um participante",
      tags: ["Check-ins"],
      params: z.object({
        attendeeId: z.coerce.number().int()
      }),
      response: {
        201: z.null()
      }
    }
  }, async (request, reply) => {
    const { attendeeId } = request.params;
    const attendeeCheckIn = await prisma.checkIn.findUnique({
      where: {
        id: attendeeId
      }
    });
    if (attendeeCheckIn !== null) {
      throw new BadRequest("Attendee already checked in");
    }
    await prisma.checkIn.create({
      data: {
        attendeeId
      }
    });
    return reply.status(201).send();
  });
}

export {
  checkIn
};
