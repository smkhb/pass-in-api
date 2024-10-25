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
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey || !supabaseUrl) {
  throw new Error("Missing SUPABASE_KEY or DATABASE_URL env variables");
}
const supabase = createClient(supabaseUrl, supabaseKey);

export const app = fastify().withTypeProvider<ZodTypeProvider>();

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

app
  .listen({port : 3333, host: "0.0.0.0"})
  .then(()=> console.log("Server is running on port 3333"))