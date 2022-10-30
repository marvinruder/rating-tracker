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

/* istanbul ignore next */
const PORT = process.env.PORT || 3000;

class Server {
  public app = express();
  public router = MainRouter;
}

export const server = new Server();

/* istanbul ignore next */
const highlightMethod = (method: string) => {
  switch (method) {
    case "GET":
      return chalk.whiteBright.bgBlue(` ${method} `) + chalk.blue.bgGrey("");

    case "POST":
      return chalk.whiteBright.bgGreen(` ${method} `) + chalk.green.bgGrey("");

    case "PUT":
      return chalk.black.bgYellow(` ${method} `) + chalk.yellow.bgGrey("");

    case "DELETE":
      return chalk.whiteBright.bgRed(` ${method} `) + chalk.red.bgGrey("");

    default:
      return method;
  }
};

/* istanbul ignore next */
const statusCodeDescription = (statusCode: number) => {
  const statusCodeString = ` ${statusCode}  ${STATUS_CODES[statusCode]} `;
  switch (Math.floor(statusCode / 100)) {
    case 2:
      return chalk.whiteBright.bgGreen(statusCodeString) + chalk.green("");

    case 1:
    case 3:
      return chalk.black.bgYellow(statusCodeString) + chalk.yellow("");

    case 4:
    case 5:
      return chalk.whiteBright.bgRed(statusCodeString) + chalk.red("");
  }
  return statusCodeString;
};

server.app.use(
  responseTime((req: Request, res: Response, time) => {
    console.log(
      chalk.whiteBright.bgRed(" \ue76d ") + chalk.red(""),
      new Date().toISOString(),
      req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      req.headers.host,
      "\n",
      "├─",
      highlightMethod(req.method) +
        chalk.bgGrey(
          ` ${req.originalUrl
            .slice(
              1,
              req.originalUrl.indexOf("?") == -1
                ? undefined
                : req.originalUrl.indexOf("?")
            )
            .replaceAll("/", "  ")} `
        ) +
        chalk.grey(""),
      JSON.stringify(req.query),
      "\n",
      "╰─",
      statusCodeDescription(res.statusCode),
      `after ${Math.round(time)} ms`,
      "\n"
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
  console.error(chalk.redBright(err.message));
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

export const listener = server.app.listen(PORT, () =>
  console.log(
    chalk.whiteBright.bgRed(" \ue76d ") +
      chalk.red.bgGrey("") +
      chalk.whiteBright.bgGrey(` \uf6ff ${PORT} `) +
      chalk.grey("") +
      chalk.green(" Listening…") +
      "\n"
  )
);
