import fastify from "fastify"
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";
import { createEvent } from "./routes/create-event";
import { registerForEvent } from "./routes/register-for-event";
import { getEvent } from "./routes/get-event";
import { getAttendeeBagde } from "./routes/get-attendee.badge";
import { checkIn } from "./routes/check-in";
import { getEventAttendees } from "./routes/get-event-attendees";
import { errorHandler } from "./error-handler";

const app = fastify();

app.register(fastifySwagger, {
  swagger: {
    info: {
      title: "Event Management",
      description: "Event Management API",
      version: "0.1.0",
    },
    consumes: ["application/json"],
    produces: ["application/json"],
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: "/docs",
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
  .listen({port : 3333})
  .then(()=> console.log("Server is running on port 3333"))