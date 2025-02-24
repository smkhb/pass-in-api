import { ZodTypeProvider } from "fastify-type-provider-zod";
import { generateSlug } from "../utils/generate-slug";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";
import { BadRequest } from "./_errors/bad-request";

export async function createEvent(app: FastifyInstance){
  app
    .addHook('onRequest', async (request, reply) => {
      const apiKey = request.headers['x-api-key'];
      if (apiKey !== process.env.API_KEY) {
        reply.status(403).send({ error: 'Acesso não autorizado' });
      }
    })
    .withTypeProvider<ZodTypeProvider>()
    .post('/events', {
      schema: {
        summary: "Crie um evento",
        tags: ["Eventos"],
        body: z.object({
          title: z.string().min(4),
          details: z.string().nullable(),
          maximumAttendees: z.number().int().positive().nullable(),
        }),
        response: {
          201: z.object({
            eventId: z.string().uuid()
          })
        }
      },
    }, async (request, reply)=> {
      const {
        title,
        details,
        maximumAttendees 
      } = request.body

      const slug = generateSlug(title)

      const eventWithSameSlug = await prisma.event.findFirst({
        where:{
          slug
        }
      })

      if(eventWithSameSlug !== null){
        throw new BadRequest("An event with the same title already exists")
      }

      const event = await prisma.event.create({
        data: {
          title,
          details,
          maximumAttendees,
          slug
        }
      })

      return reply.status(201).send({ eventId: event.id }) 
    });
}
