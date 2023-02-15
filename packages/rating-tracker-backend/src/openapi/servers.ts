import dotenv from "dotenv";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

dotenv.config({
  path: ".env.local",
});

/**
 * The servers that the API is reachable at.
 */
const servers: OpenAPIV3.ServerObject[] = [
  {
    url: `https://${process.env.SUBDOMAIN ? process.env.SUBDOMAIN + "." : ""}${process.env.DOMAIN}`,
    description: "via HTTPS",
  },
];

/* istanbul ignore next -- @preserve */ // Only available in development environment
process.env.NODE_ENV === "development" &&
  servers.push({
    url: `http://localhost:${process.env.PORT}/`,
    description: "Local server",
  });

export { servers };
