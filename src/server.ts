import 'dotenv/config'
import fastify from "fastify"
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform, ZodTypeProvider } from "fastify-type-provider-zod";
import { createEvent } from "./routes/create-event";
import { registerForEvent } from "./routes/register-for-event";
import { getEvent } from "./routes/get-event";
import { getAttendeeBagde } from "./routes/get-attendee.badge";
import { checkIn } from "./routes/check-in";
import { getEventAttendees } from "./routes/get-event-attendees";
import { errorHandler } from "./error-handler";
import { fastifyCors } from "@fastify/cors";

import fastifyExpress from '@fastify/express';

const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

async function buildServer() {
  // Registra o plugin Express
  await app.register(fastifyExpress);

  // Configura as rotas usando Fastify
  app.get('/', async (request, reply) => {
    return { hello: 'world' };
  });

  // Retorna o servidor Express
  return app;
}

export default async function handler(req: any, res: any) {
  const fastifyServer = await buildServer();
  await fastifyServer.ready();
  fastifyServer.express( req, res);
}

app.register(fastifyCors, {
  origin: "*",
})

app.register(fastifySwagger, {
  swagger: {
    info: {
      title: "API Para Gestão de Eventos",
      description: "Essa é uma API para gestão de eventos, que pode ser utilizada para criar eventos, registrar participantes, fazer check-in e gerar crachás.",
      version: "0.1.0",
    },
    consumes: ["application/json"],
    produces: ["application/json"],
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: "/",
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createEvent)
app.register(registerForEvent)
app.register(getEvent)
app.register(getAttendeeBagde)
app.register(checkIn)
app.register(getEventAttendees)

app.setErrorHandler(errorHandler)