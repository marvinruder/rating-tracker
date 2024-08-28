import type { Context } from "hono";
import type { ConnInfo } from "hono/conninfo";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getConnInfo = (c: Context): ConnInfo => ({
  remote: {
    address: "::1",
    addressType: "IPv6",
    port: process.env.PORT,
  },
});

export { getConnInfo };
