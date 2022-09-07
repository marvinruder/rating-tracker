import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import MainRouter from "./routers/Router";
import SwaggerUI from "swagger-ui-express";
import swaggerDocument from "../docs/openapi.json";
import * as OpenApiValidator from "express-openapi-validator";

dotenv.config({
  path: ".env.local",
});

const PORT = process.env.PORT || 3000;

class Server {
  public app = express();
  public router = MainRouter;
}

const server = new Server();

server.app.use("/api-docs", SwaggerUI.serve, SwaggerUI.setup(swaggerDocument));
server.app.get("/api-spec/v3", (req, res) => res.json(swaggerDocument));

server.app.use(
  OpenApiValidator.middleware({
    apiSpec: "docs/openapi.json",
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
