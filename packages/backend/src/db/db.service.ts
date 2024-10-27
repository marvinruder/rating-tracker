import { exec } from "node:child_process";
import { promisify } from "node:util";

import type { AnalystRating } from "@rating-tracker/commons";

import { PrismaClient } from "../../prisma/client";
import Logger from "../utils/logger";
import Singleton from "../utils/Singleton";

declare global {
  namespace PrismaJSON {
    type AnalystRatings = Record<AnalystRating, number>;
  }
}

class DBService extends Singleton {
  constructor() {
    super();
    if (DBService.#client) return;

    DBService.#client = new PrismaClient();
  }

  /**
   * Whether database migrations were applied.
   */
  static #isMigrated = false;

  /**
   * The Prisma client. Used for connecting to the database.
   */
  static #client: PrismaClient;

  /**
   * Provides access to the Portfolio table.
   * @returns The Portfolio table.
   */
  get portfolio() {
    return DBService.#client.portfolio;
  }

  /**
   * Provides access to the Resource table.
   * @returns The Resource table.
   */
  get resource() {
    return DBService.#client.resource;
  }

  /**
   * Provides access to the Session table.
   * @returns The Session table.
   */
  get session() {
    return DBService.#client.session;
  }

  /**
   * Provides access to the Stock table.
   * @returns The Stock table.
   */
  get stock() {
    return DBService.#client.stock;
  }

  /**
   * Provides access to the User table.
   * @returns The User table.
   */
  get user() {
    return DBService.#client.user;
  }

  /**
   * Provides access to the Watchlist table.
   * @returns The Watchlist table.
   */
  get watchlist() {
    return DBService.#client.watchlist;
  }

  /**
   * Provides access to the WebAuthnCredential table.
   * @returns The WebAuthnCredential table.
   */
  get webAuthnCredential() {
    return DBService.#client.webAuthnCredential;
  }

  /**
   * Provides access to the `$queryRaw` method.
   * @returns The `$queryRaw` method.
   */
  get $queryRaw() {
    return DBService.#client.$queryRaw.bind(DBService.#client);
  }

  /**
   * Provides access to the `$transaction` method.
   * @returns The `$transaction` method.
   */
  get $transaction() {
    return DBService.#client.$transaction.bind(DBService.#client);
  }

  /**
   * Applies migrations to the database.
   */
  async migrate() {
    if (DBService.#isMigrated) return;
    if (["test", "production"].includes(process.env.NODE_ENV) && !process.env.EXIT_AFTER_READY)
      await promisify(exec)("prisma migrate deploy")
        .then(({ stdout, stderr }) => {
          if (stdout) Logger.info({ component: "postgres" }, `\n\n${stdout}`);
          if (stderr) Logger.warn({ component: "postgres" }, `\n\n${stderr}`);
          DBService.#isMigrated = true;
        })
        .catch(({ error, stdout, stderr }) => {
          /* c8 ignore start */ // Migration must succeed for tests to work properly
          if (stdout) Logger.info({ component: "postgres" }, `\n\n${stdout}`);
          if (stderr) Logger.warn({ component: "postgres" }, `\n\n${stderr}`);
          if (error) {
            Logger.error({ component: "postgres", err: error }, "Failed to migrate database");
            throw error;
          }
          /* c8 ignore stop */
        });
  }

  /**
   * Checks if the database is reachable.
   * @returns A {@link Promise} that resolves when the database is reachable, or rejects with an error if it is not.
   */
  getStatus(): Promise<string> {
    return DBService.#client.$executeRaw`SELECT null`
      .then(() => Promise.resolve("Connected"))
      .catch((e) => Promise.reject(new Error(`Database is not reachable: ${e.message}`)));
  }
}

export default DBService;
