import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import MainRouter from "./routers/Router";
import SwaggerUI from "swagger-ui-express";
import swaggerDocument from "src/openapi.json";
import * as OpenApiValidator from "express-openapi-validator";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

dotenv.config({
  path: ".env.local",
});

const PORT = process.env.PORT || 3000;

class Server {
  public app = express();
  public router = MainRouter;
}

const server = new Server();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
server.app.use((req, res, next) => {
  console.log(
    new Date().toISOString(),
    req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    req.headers.host,
    req.method,
    req.url,
    req.params
  );
  next();
});

server.app.use("/api-docs", SwaggerUI.serve, SwaggerUI.setup(swaggerDocument));
server.app.get("/api-spec/v3", (req, res) => res.json(swaggerDocument));

server.app.use(
  OpenApiValidator.middleware({
    apiSpec: swaggerDocument as unknown as OpenAPIV3.Document,
    validateRequests: true,
    validateResponses: true,
  })
);

server.app.use("/api", cors(), server.router);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
server.app.use((err, req, res, next) => {
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

server.app.listen(PORT, () => console.log(`> Listening on port ${PORT}`));
