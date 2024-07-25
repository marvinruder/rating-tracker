import fs from "node:fs";

import type { MockInstance } from "vitest";

import client from "../src/db/client";
import * as portfolioTable from "../src/db/tables/portfolioTable";
import * as resourceTable from "../src/db/tables/resourceTable";
import * as sessionTable from "../src/db/tables/sessionTable";
import * as stockTable from "../src/db/tables/stockTable";
import * as userTable from "../src/db/tables/userTable";
import * as watchlistTable from "../src/db/tables/watchlistTable";
import { listener } from "../src/server";
import { sentMessages } from "../src/signal/__mocks__/signalBase";
import * as signal from "../src/signal/signal";

import type { LiveTestSuite } from "./liveTestHelpers";
import applyPostgresSeeds from "./seeds/postgres";

vi.mock("@simplewebauthn/server", async () => await import("./moduleMocks/@simplewebauthn/server"));
vi.mock("../src/signal/signalBase");
vi.mock("../src/utils/fetchRequest");
vi.mock("../src/utils/logger");

/**
 * An array of spy functions on methods that alter the state of PostgreSQL, or send Signal messages. Must only
 * be called in tests explicitly marked as unsafe.
 */
const unsafeSpies: MockInstance[] = [];

unsafeSpies.push(vi.spyOn(portfolioTable, "createPortfolio"));
unsafeSpies.push(vi.spyOn(portfolioTable, "updatePortfolio"));
unsafeSpies.push(vi.spyOn(portfolioTable, "addStockToPortfolio"));
unsafeSpies.push(vi.spyOn(portfolioTable, "updateStockInPortfolio"));
unsafeSpies.push(vi.spyOn(portfolioTable, "removeStockFromPortfolio"));
unsafeSpies.push(vi.spyOn(portfolioTable, "deletePortfolio"));
unsafeSpies.push(vi.spyOn(stockTable, "createStock"));
unsafeSpies.push(vi.spyOn(stockTable, "updateStock"));
unsafeSpies.push(vi.spyOn(stockTable, "deleteStock"));
unsafeSpies.push(vi.spyOn(userTable, "createUser"));
unsafeSpies.push(vi.spyOn(userTable, "updateUser"));
unsafeSpies.push(vi.spyOn(userTable, "setCredentialCounter"));
unsafeSpies.push(vi.spyOn(userTable, "deleteUser"));
unsafeSpies.push(vi.spyOn(watchlistTable, "createWatchlist"));
unsafeSpies.push(vi.spyOn(watchlistTable, "updateWatchlist"));
unsafeSpies.push(vi.spyOn(watchlistTable, "addStockToWatchlist"));
unsafeSpies.push(vi.spyOn(watchlistTable, "removeStockFromWatchlist"));
unsafeSpies.push(vi.spyOn(watchlistTable, "deleteWatchlist"));
unsafeSpies.push(vi.spyOn(watchlistTable, "readFavorites"));
unsafeSpies.push(vi.spyOn(resourceTable, "createResource"));
unsafeSpies.push(vi.spyOn(sessionTable, "createSession"));
unsafeSpies.push(vi.spyOn(sessionTable, "deleteSession"));
unsafeSpies.push(vi.spyOn(signal, "sendMessage"));

beforeAll(async () => {
  // Make all tables unlogged
  await client.$queryRaw`ALTER TABLE "_StockToWatchlist" SET UNLOGGED`;
  await client.$queryRaw`ALTER TABLE "StocksInPortfolios" SET UNLOGGED`;
  await client.$queryRaw`ALTER TABLE "Portfolio" SET UNLOGGED`;
  await client.$queryRaw`ALTER TABLE "Watchlist" SET UNLOGGED`;
  await client.$queryRaw`ALTER TABLE "Stock" SET UNLOGGED`;
  await client.$queryRaw`ALTER TABLE "WebAuthnCredential" SET UNLOGGED`;
  await client.$queryRaw`ALTER TABLE "User" SET UNLOGGED`;
  // Apply the seeds
  await Promise.all([applyPostgresSeeds()]);
});

afterEach(async (context) => {
  if (context.task.name.toLowerCase().includes("unsafe")) {
    // Clears Signal message array
    sentMessages.length = 0;
    // Apply the seeds if an unsafe test modified the content
    await Promise.all([applyPostgresSeeds()]);
    // Check if a safe test has been marked as unsafe
    if (!context.task.name.toLowerCase().includes("unsafe!")) {
      expect(unsafeSpies.some((spy) => spy.mock.calls.length)).toBeTruthy();
    }
  } else {
    // If a test is not marked as unsafe, it must not use an unsafe method or send Signal messages
    unsafeSpies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
    expect(sentMessages).toHaveLength(0);
  }
});

afterAll(() => {
  listener.close();
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
// Expect error until `@types/node` provides types for Node.js 22:
// @ts-expect-error
for await (const path of await fs.promises.glob("../**/*.live.test.ts")) {
  const { tests, suiteName }: { tests: LiveTestSuite; suiteName: string } = await import(
    /* @vite-ignore */ "../" + path
  );
  testSuites[suiteName] = [];
  unsafeTestSuites[suiteName] = [];
  tests.forEach((test) =>
    test.testName.toLowerCase().includes("unsafe")
      ? unsafeTestSuites[suiteName].push(test)
      : testSuites[suiteName].push(test),
  );
}

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
