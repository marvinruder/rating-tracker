import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

/**
 * The servers that the API is reachable at.
 */
export const servers: OpenAPIV3.ServerObject[] = [
  {
    url: `https://${process.env.SUBDOMAIN ? process.env.SUBDOMAIN + "." : ""}${process.env.DOMAIN}`,
    description: "via HTTPS",
  },
];
