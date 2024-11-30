import type { SMTPServerSession } from "smtp-server";
import { SMTPServer } from "smtp-server";
import type { MockInstance } from "vitest";

import DBService from "../src/db/db.service";
import EmailService from "../src/email/email.service";
import FavoriteService from "../src/favorite/favorite.service";
import PortfolioService from "../src/portfolio/portfolio.service";
import ResourceService from "../src/resource/resource.service";
import { server } from "../src/server";
import SessionService from "../src/session/session.service";
import SignalService from "../src/signal/signal.service";
import StockService from "../src/stock/stock.service";
import UserService from "../src/user/user.service";
import { signalMessages } from "../src/utils/__mocks__/fetchRequest";
import Logger from "../src/utils/logger";
import WatchlistService from "../src/watchlist/watchlist.service";

import type { LiveTestSuite } from "./liveTestHelpers";
import applyPostgresSeeds from "./seeds/postgres";

export const emailMessages: { session: SMTPServerSession; data: string }[] = [];
new SMTPServer({
  onAuth(auth, _, callback) {
    if (auth.username !== "ratingtracker" || auth.password !== "ratingtracker")
      return callback(new Error("Invalid username or password"));
    callback(null, { user: process.env.SMTP_USER });
  },
  onData(stream, session, callback) {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => callback(err));
    stream.on("end", () => {
      emailMessages.push({ session: structuredClone(session), data: Buffer.concat(chunks).toString("utf8") });
      callback();
    });
  },
}).listen(587);

vi.mock("@hono/node-server/conninfo", async () => await import("./moduleMocks/@hono/node-server/conninfo"));
vi.mock("@simplewebauthn/server", async () => await import("./moduleMocks/@simplewebauthn/server"));
vi.mock("oauth4webapi", async () => await import("./moduleMocks/oauth4webapi"));
vi.mock("../src/utils/fetchRequest");
vi.spyOn(Logger, "fatal").mockImplementation(() => {});
vi.spyOn(Logger, "error").mockImplementation(() => {});
vi.spyOn(Logger, "warn").mockImplementation(() => {});
vi.spyOn(Logger, "info").mockImplementation(() => {});
vi.spyOn(Logger, "debug").mockImplementation(() => {});
vi.spyOn(Logger, "trace").mockImplementation(() => {});

/**
 * An array of spy functions on methods that alter the state of PostgreSQL, or send Signal messages. Must only
 * be called in tests explicitly marked as unsafe.
 */
const unsafeSpies: MockInstance[] = [];

unsafeSpies.push(vi.spyOn(EmailService.prototype, "sendEmail"));
unsafeSpies.push(vi.spyOn(FavoriteService.prototype, "add"));
unsafeSpies.push(vi.spyOn(FavoriteService.prototype, "read"));
unsafeSpies.push(vi.spyOn(FavoriteService.prototype, "remove"));
unsafeSpies.push(vi.spyOn(PortfolioService.prototype, "create"));
unsafeSpies.push(vi.spyOn(PortfolioService.prototype, "update"));
unsafeSpies.push(vi.spyOn(PortfolioService.prototype, "addStock"));
unsafeSpies.push(vi.spyOn(PortfolioService.prototype, "updateStock"));
unsafeSpies.push(vi.spyOn(PortfolioService.prototype, "removeStock"));
unsafeSpies.push(vi.spyOn(PortfolioService.prototype, "delete"));
unsafeSpies.push(vi.spyOn(ResourceService.prototype, "create"));
unsafeSpies.push(vi.spyOn(SessionService.prototype, "create"));
unsafeSpies.push(vi.spyOn(SessionService.prototype, "delete"));
unsafeSpies.push(vi.spyOn(SignalService.prototype, "sendMessage"));
unsafeSpies.push(vi.spyOn(StockService.prototype, "create"));
unsafeSpies.push(vi.spyOn(StockService.prototype, "update"));
unsafeSpies.push(vi.spyOn(StockService.prototype, "delete"));
unsafeSpies.push(vi.spyOn(UserService.prototype, "create"));
unsafeSpies.push(vi.spyOn(UserService.prototype, "update"));
unsafeSpies.push(vi.spyOn(UserService.prototype, "addOIDCIdentity"));
unsafeSpies.push(vi.spyOn(UserService.prototype, "removeOIDCIdentity"));
unsafeSpies.push(vi.spyOn(UserService.prototype, "delete"));
unsafeSpies.push(vi.spyOn(WatchlistService.prototype, "create"));
unsafeSpies.push(vi.spyOn(WatchlistService.prototype, "update"));
unsafeSpies.push(vi.spyOn(WatchlistService.prototype, "addStock"));
unsafeSpies.push(vi.spyOn(WatchlistService.prototype, "removeStock"));
unsafeSpies.push(vi.spyOn(WatchlistService.prototype, "delete"));

beforeAll(async () => {
  const dbService: DBService = new DBService();
  await dbService.migrate();

  // Make all tables unlogged
  await dbService.$queryRaw`ALTER TABLE "stocks_in_watchlists" SET UNLOGGED`;
  await dbService.$queryRaw`ALTER TABLE "stocks_in_portfolios" SET UNLOGGED`;
  await dbService.$queryRaw`ALTER TABLE "portfolios" SET UNLOGGED`;
  await dbService.$queryRaw`ALTER TABLE "watchlists" SET UNLOGGED`;
  await dbService.$queryRaw`ALTER TABLE "stocks" SET UNLOGGED`;
  await dbService.$queryRaw`ALTER TABLE "webauthn_credentials" SET UNLOGGED`;
  await dbService.$queryRaw`ALTER TABLE "oidc_users" SET UNLOGGED`;
  await dbService.$queryRaw`ALTER TABLE "users" SET UNLOGGED`;
  // Apply the seeds
  await Promise.all([applyPostgresSeeds()]);
});

afterEach(async (context) => {
  if (context.task.name.toLowerCase().includes("unsafe")) {
    // Clear message arrays
    emailMessages.length = 0;
    signalMessages.length = 0;
    // Apply the seeds if an unsafe test modified the content
    await Promise.all([applyPostgresSeeds()]);
    // Check if a safe test has been marked as unsafe
    if (!context.task.name.toLowerCase().includes("unsafe!")) {
      expect(unsafeSpies.some((spy) => spy.mock.calls.length)).toBeTruthy();
    }
  } else {
    // If a test is not marked as unsafe, it must not use an unsafe method or send messages
    unsafeSpies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
    expect(emailMessages).toHaveLength(0);
    expect(signalMessages).toHaveLength(0);
  }
});

afterAll(() => {
  server.close();
});

/**
 * An object containing test suites, the tests of which may be run concurrently.
 */
const testSuites: { [key: string]: LiveTestSuite } = {};

/**
 * An object containing test suites, the tests of which are unsafe and must not be run concurrently.
 */
const unsafeTestSuites: { [key: string]: LiveTestSuite } = {};

// Get all test suites
await Promise.all(
  Object.values(import.meta.glob<{ tests: LiveTestSuite; suiteName: string }>("../**/*.live.test.ts")).map(
    async (testModule) => {
      const { tests, suiteName } = await testModule();
      testSuites[suiteName] = [];
      unsafeTestSuites[suiteName] = [];
      tests.forEach((test) =>
        test.testName.toLowerCase().includes("unsafe")
          ? unsafeTestSuites[suiteName].push(test)
          : testSuites[suiteName].push(test),
      );
    },
  ),
);

// Run tests concurrently
Object.entries(testSuites).forEach(
  ([suiteName, testSuite]) =>
    testSuite.length &&
    describe.concurrent(`${suiteName} – Concurrent Tests`, () =>
      testSuite.forEach((test) => it(test.testName, test.testFunction)),
    ),
);

// Do not run unsafe tests concurrently
Object.entries(unsafeTestSuites).forEach(
  ([suiteName, testSuite]) =>
    testSuite.length &&
    describe(`${suiteName} – Unsafe Tests`, () => testSuite.forEach((test) => it(test.testName, test.testFunction))),
);
