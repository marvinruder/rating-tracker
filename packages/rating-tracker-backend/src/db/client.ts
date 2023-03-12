// This import works both in dev (with ts-node) and in prod (with precompiled JavaScript and node)
import * as PrismaScope from "../../prisma/client/index.js";
console.log(JSON.stringify(PrismaScope));
const PrismaClient = PrismaScope.PrismaClient;

/**
 * The Prisma Client. Used for connecting to the database.
 */
const client = new PrismaClient();

export default client;
