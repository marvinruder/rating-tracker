import { PrismaClient } from "../../prisma/client";

/**
 * The Prisma Client. Used for connecting to the database.
 */
const client = new PrismaClient();

export default client;
