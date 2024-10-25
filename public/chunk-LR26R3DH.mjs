import {
  generateSlug
} from "./chunk-2WNLK7IH.mjs";
import {
  BadRequest
} from "./chunk-JRO4E4TH.mjs";
import {
  prisma
} from "./chunk-5KVQPZKD.mjs";

// src/routes/create-event.ts
import { z } from "zod";
async function createEvent(app) {
  app.addHook("onRequest", async (request, reply) => {
    const apiKey = request.headers["x-api-key"];
    if (apiKey !== process.env.API_KEY) {
      reply.status(403).send({ error: "Acesso n\xE3o autorizado" });
    }
  }).withTypeProvider().post("/events", {
    schema: {
      summary: "Crie um evento",
      tags: ["Eventos"],
      body: z.object({
        title: z.string().min(4),
        details: z.string().nullable(),
        maximumAttendees: z.number().int().positive().nullable()
      }),
      response: {
        201: z.object({
          eventId: z.string().uuid()
        })
      }
    }
  }, async (request, reply) => {
    const {
      title,
      details,
      maximumAttendees
    } = request.body;
    const slug = generateSlug(title);
    const eventWithSameSlug = await prisma.event.findFirst({
      where: {
        slug
      }
    });
    if (eventWithSameSlug !== null) {
      throw new BadRequest("An event with the same title already exists");
    }
    const event = await prisma.event.create({
      data: {
        title,
        details,
        maximumAttendees,
        slug
      }
    });
    return reply.status(201).send({ eventId: event.id });
  });
}

export {
  createEvent
};
