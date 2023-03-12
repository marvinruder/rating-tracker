import { PrismaClient } from "../../prisma/client/index.js";

/**
 * The Prisma Client. Used for connecting to the database.
 */
const client = new PrismaClient();

export default client;
