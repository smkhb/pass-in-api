import {
  registerForEvent
} from "./chunk-742MKAZU.mjs";
import {
  errorHandler
} from "./chunk-AT4G47H6.mjs";
import {
  checkIn
} from "./chunk-TVPPNWJD.mjs";
import {
  createEvent
} from "./chunk-QAKUUNFW.mjs";
import "./chunk-2WNLK7IH.mjs";
import {
  getAttendeeBagde
} from "./chunk-P5FLML4O.mjs";
import {
  getEventAttendees
} from "./chunk-3PV4ETUD.mjs";
import {
  getEvent
} from "./chunk-JAAOKJEF.mjs";
import "./chunk-JRO4E4TH.mjs";
import "./chunk-5KVQPZKD.mjs";

// src/server.ts
import "dotenv/config";
import fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";
import { fastifyCors } from "@fastify/cors";
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.DATABASE_URL;
var supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseKey || !supabaseUrl) {
  throw new Error("Missing SUPABASE_KEY or DATABASE_URL env variables");
}
var supabase = createClient(supabaseUrl, supabaseKey);
var app = fastify().withTypeProvider();
app.register(fastifyCors, {
  origin: "*"
});
app.register(fastifySwagger, {
  swagger: {
    info: {
      title: "API Para Gest\xE3o de Eventos",
      description: "Essa \xE9 uma API para gest\xE3o de eventos, que pode ser utilizada para criar eventos, registrar participantes, fazer check-in e gerar crach\xE1s.",
      version: "0.1.0"
    },
    consumes: ["application/json"],
    produces: ["application/json"]
  },
  transform: jsonSchemaTransform
});
app.register(fastifySwaggerUI, {
  routePrefix: "/"
});
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(createEvent);
app.register(registerForEvent);
app.register(getEvent);
app.register(getAttendeeBagde);
app.register(checkIn);
app.register(getEventAttendees);
app.setErrorHandler(errorHandler);
app.listen({ port: 3333, host: "0.0.0.0" }).then(() => console.log("Server is running on port 3333"));
export {
  app
};
