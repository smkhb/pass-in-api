// src/middlewares/verify-api-key.ts
async function verifyApiKey(request, reply) {
  const apiKey = request.headers["x-api-key"];
  if (apiKey !== process.env.API_KEY) {
    reply.status(403).send({ error: "Acesso n\xE3o autorizado" });
  }
}
export {
  verifyApiKey
};
