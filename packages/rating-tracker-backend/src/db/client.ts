// This import works both in dev (with ts-node) and in prod (with precompiled JavaScript and node)
import Prisma, * as PrismaScope from "../../prisma/client/index.js";
const PrismaClient = Prisma?.PrismaClient || PrismaScope?.PrismaClient;

/**
 * The Prisma Client. Used for connecting to the database.
 */
const client = new PrismaClient();

export default client;
