import dotenv from "dotenv";

dotenv.config({
  path: "test/.env", // Load test environment variables before connecting to database
});

import applyPostgresSeeds from "./seeds/postgres";
import applyRedisSeeds from "./seeds/redis";
import glob from "glob";
import { LiveTestSuite } from "./liveTestHelpers";
import * as stockTable from "../src/db/tables/stockTable";
import * as userTable from "../src/db/tables/userTable";
import * as resourceRepository from "../src/redis/repositories/resourceRepository";
import * as sessionRepository from "../src/redis/repositories/sessionRepository";
import { SpyInstance } from "vitest";
import { listener } from "../src/server";

vi.mock("../src/utils/logger");
vi.mock("../src/signal/signalBase");
vi.mock("@simplewebauthn/server", async () => await import("./moduleMocks/@simplewebauthn/server"));

/**
 * An array of spy functions on methods that alter the state of PostgreSQL or Redis. Must only be called in tests
 * explicitly marked as unsafe.
 */
const unsafeSpies: SpyInstance[] = [];

unsafeSpies.push(vi.spyOn(stockTable, "createStock"));
unsafeSpies.push(vi.spyOn(stockTable, "updateStock"));
unsafeSpies.push(vi.spyOn(stockTable, "deleteStock"));
unsafeSpies.push(vi.spyOn(userTable, "createUser"));
unsafeSpies.push(vi.spyOn(userTable, "updateUserWithCredentials"));
unsafeSpies.push(vi.spyOn(userTable, "deleteUser"));
unsafeSpies.push(vi.spyOn(resourceRepository, "createResource"));
unsafeSpies.push(vi.spyOn(sessionRepository, "createSession"));
unsafeSpies.push(vi.spyOn(sessionRepository, "deleteSession"));

beforeAll(async () => {
  // Apply the seeds
  await Promise.all([applyPostgresSeeds(), applyRedisSeeds()]);
});

afterEach(async (context) => {
  if (context.meta.name.toLowerCase().includes("unsafe")) {
    // Apply the seeds if an unsafe test modified the content
    await Promise.all([applyPostgresSeeds(), applyRedisSeeds()]);
    // Check if a safe test has been marked as unsafe
    if (!context.meta.name.toLowerCase().includes("unsafe!")) {
      expect(unsafeSpies.some((spy) => spy.mock.calls.length)).toBeTruthy();
    }
  } else {
    // If a test is not marked as unsafe, it must not use an unsafe method
    unsafeSpies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
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
  const { tests, suiteName }: { tests: LiveTestSuite; suiteName: string } = await import(path);
  testSuites[suiteName] = [];
  unsafeTestSuites[suiteName] = [];
  tests.forEach((test) =>
    test.testName.toLowerCase().includes("unsafe")
      ? unsafeTestSuites[suiteName].push(test)
      : testSuites[suiteName].push(test)
  );
}

// Run tests concurrently
Object.entries(testSuites).forEach(
  ([suiteName, testSuite]) =>
    testSuite.length &&
    describe.concurrent(`${suiteName} – Concurrent Tests`, () =>
      testSuite.forEach((test) => it.concurrent(test.testName, test.testFunction))
    )
);

// Do not run unsafe tests concurrently
Object.entries(unsafeTestSuites).forEach(
  ([suiteName, testSuite]) =>
    testSuite.length &&
    describe(`${suiteName} – Unsafe Tests`, () => testSuite.forEach((test) => it(test.testName, test.testFunction)))
);
