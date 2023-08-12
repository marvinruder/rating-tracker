import applyPostgresSeeds from "./seeds/postgres";
import applyRedisSeeds from "./seeds/redis";
import { glob } from "glob";
import { LiveTestSuite } from "./liveTestHelpers";
import * as stockTable from "../src/db/tables/stockTable";
import * as userTable from "../src/db/tables/userTable";
import * as watchlistTable from "../src/db/tables/watchlistTable";
import * as resourceRepository from "../src/redis/repositories/resourceRepository";
import * as sessionRepository from "../src/redis/repositories/sessionRepository";
import { SpyInstance } from "vitest";
import { listener } from "../src/server";
import { sentMessages } from "../src/signal/__mocks__/signalBase";
import * as signal from "../src/signal/signal";

vi.mock("../src/utils/logger");
vi.mock("../src/signal/signalBase");
vi.mock("@simplewebauthn/server", async () => await import("./moduleMocks/@simplewebauthn/server"));

/**
 * An array of spy functions on methods that alter the state of PostgreSQL or Redis, or send Signal messages. Must only
 * be called in tests explicitly marked as unsafe.
 */
const unsafeSpies: SpyInstance[] = [];

unsafeSpies.push(vi.spyOn(stockTable, "createStock"));
unsafeSpies.push(vi.spyOn(stockTable, "updateStock"));
unsafeSpies.push(vi.spyOn(stockTable, "deleteStock"));
unsafeSpies.push(vi.spyOn(userTable, "createUser"));
unsafeSpies.push(vi.spyOn(userTable, "updateUserWithCredentials"));
unsafeSpies.push(vi.spyOn(userTable, "deleteUser"));
unsafeSpies.push(vi.spyOn(watchlistTable, "createWatchlist"));
unsafeSpies.push(vi.spyOn(watchlistTable, "updateWatchlist"));
unsafeSpies.push(vi.spyOn(watchlistTable, "deleteWatchlist"));
unsafeSpies.push(vi.spyOn(watchlistTable, "readFavorites"));
unsafeSpies.push(vi.spyOn(resourceRepository, "createResource"));
unsafeSpies.push(vi.spyOn(sessionRepository, "createSession"));
unsafeSpies.push(vi.spyOn(sessionRepository, "deleteSession"));
unsafeSpies.push(vi.spyOn(signal, "sendMessage"));

beforeAll(async () => {
  // Apply the seeds
  await Promise.all([applyPostgresSeeds(), applyRedisSeeds()]);
});

afterEach(async (context) => {
  if (context.meta.name.toLowerCase().includes("unsafe")) {
    // Clears Signal message array
    sentMessages.length = 0;
    // Apply the seeds if an unsafe test modified the content
    await Promise.all([applyPostgresSeeds(), applyRedisSeeds()]);
    // Check if a safe test has been marked as unsafe
    if (!context.meta.name.toLowerCase().includes("unsafe!")) {
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
for await (const path of await glob("../**/*.live.test.ts")) {
  const { tests, suiteName }: { tests: LiveTestSuite; suiteName: string } = await import("../" + path);
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
      testSuite.forEach((test) => it.concurrent(test.testName, test.testFunction)),
    ),
);

// Do not run unsafe tests concurrently
Object.entries(unsafeTestSuites).forEach(
  ([suiteName, testSuite]) =>
    testSuite.length &&
    describe(`${suiteName} – Unsafe Tests`, () => testSuite.forEach((test) => it(test.testName, test.testFunction))),
);
