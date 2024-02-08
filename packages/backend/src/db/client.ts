import { PrismaClient } from "../../prisma/client";

/**
 * The Prisma Client. Used for connecting to the database.
 */
const client = new PrismaClient();

/**
 * Checks if the database is reachable.
 * @returns A {@link Promise} that resolves when the database is reachable, or rejects with an error if it is not.
 */
export const prismaIsReady = (): Promise<void> =>
  client.$executeRaw`SELECT null`
    .then(() => Promise.resolve())
    .catch((e) => Promise.reject(new Error("Database is not reachable: " + e.message)));

export default client;
