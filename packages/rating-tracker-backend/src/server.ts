import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import MainRouter from "./routers/Router.js";
import SwaggerUI from "swagger-ui-express";
import openapiDocument from "./openapi.js";
import * as OpenApiValidator from "express-openapi-validator";
import chalk from "chalk";
import responseTime from "response-time";
import { STATUS_CODES } from "http";

dotenv.config({
  path: ".env.local",
});

const PORT = process.env.PORT || 3000;

class Server {
  public app = express();
  public router = MainRouter;
}

const server = new Server();

const highlightMethod = (method: string) => {
  switch (method) {
    case "GET":
      return chalk.whiteBright.bgBlue(method);

    case "POST":
      return chalk.whiteBright.bgGreen(method);

    case "PUT":
      return chalk.black.bgYellow(method);

    case "DELETE":
      return chalk.whiteBright.bgRed(method);

    default:
      return method;
  }
};

const statusCodeDescription = (statusCode: number) => {
  const statusCodeString = `${statusCode} ${STATUS_CODES[statusCode]}`;
  switch (Math.floor(statusCode / 100)) {
    case 2:
      return chalk.whiteBright.bgGreen(statusCodeString);

    case 1:
    case 3:
      return chalk.black.bgYellow(statusCodeString);

    case 4:
    case 5:
      return chalk.whiteBright.bgRed(statusCodeString);
  }
  return statusCodeString;
};

server.app.use(
  responseTime((req: Request, res: Response, time) => {
    console.log(
      new Date().toISOString(),
      req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      req.headers.host,
      highlightMethod(req.method),
      req.path,
      JSON.stringify(req.query),
      " – ",
      statusCodeDescription(res.statusCode),
      `after ${Math.round(time)} ms`
    );
  })
);

server.app.use("/api-docs", SwaggerUI.serve, SwaggerUI.setup(openapiDocument));
server.app.get("/api-spec/v3", (req, res) => res.json(openapiDocument));

server.app.use(
  OpenApiValidator.middleware({
    apiSpec: openapiDocument,
    validateRequests: true,
    validateResponses: true,
  })
);

server.app.use("/api", cors(), server.router);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
server.app.use((err, req, res, next) => {
  console.error(
    chalk.redBright(`Terminating with error code ${err.status}: ${err.message}`)
  );
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

server.app.listen(PORT, () =>
  console.log(chalk.green(`> Listening on port ${PORT}`))
);
