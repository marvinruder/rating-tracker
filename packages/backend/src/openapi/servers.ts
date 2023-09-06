import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

/**
 * The servers that the API is reachable at.
 */
export const servers: OpenAPIV3.ServerObject[] = [
  {
    url: `https://${process.env.SUBDOMAIN ? process.env.SUBDOMAIN + "." : ""}${process.env.DOMAIN}`,
    description: "via HTTPS",
  },
];

process.env.NODE_ENV === "development" &&
  /* c8 ignore next */ // Only available in development environment
  servers.push({ url: `http://localhost:${process.env.PORT}/`, description: "Local server" });
