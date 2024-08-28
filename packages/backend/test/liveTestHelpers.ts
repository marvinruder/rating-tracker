import assert from "node:assert";

import type { Stock } from "@rating-tracker/commons";
import { FORBIDDEN_ERROR_MESSAGE, UNAUTHORIZED_ERROR_MESSAGE, baseURL, stocksAPIPath } from "@rating-tracker/commons";
import type { TestFunction } from "vitest";

import { app } from "../src/server";

/**
 * Requests the full list of stocks from the server and tests that it has the expected length.
 * @param length The expected length of the stock list.
 * @returns The list of stocks returned by the server.
 */
export const expectStockListLengthToBe = async (length: number): Promise<Stock[]> => {
  const res = await app.request(`${baseURL}${stocksAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
  const body = await res.json();
  expect(res.status).toBe(200);
  assert(!("message" in body));
  expect(body.count).toBe(length);
  expect(body.stocks).toHaveLength(length);
  return body.stocks;
};

/**
 * Tests that the given route is only available to authenticated clients.
 * @param route The route to test.
 * @param method The HTTP request method to use.
 */
export const expectRouteToBePrivate = async (
  route: string,
  method?: "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE",
): Promise<void> => {
  const res = await app.request(route, { method: method ?? "GET" });
  expect(res.status).toBe(401);
  expect((await res.json()).message).toMatch(UNAUTHORIZED_ERROR_MESSAGE);
};

/**
 * Tests that the given route is only available to users having special access rights.
 * @param route The route to test.
 * @param method The HTTP request method to use.
 */
export const expectSpecialAccessRightsToBeRequired = async (
  route: string,
  method?: "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE",
): Promise<void> => {
  const res = await app.request(route, { method: method ?? "get", headers: { Cookie: "id=anotherExampleSessionID" } });
  expect(res.status).toBe(403);
  expect((await res.json()).message).toMatch(FORBIDDEN_ERROR_MESSAGE);
};

/**
 * An array of tests requiring the presence of a PostgreSQL instance.
 */
export type LiveTestSuite = {
  /**
   * A descriptive name of the test. If marked with `[unsafe]`, it is not run concurrently.
   */
  testName: string;
  /**
   * The test function to run.
   */
  testFunction: TestFunction;
}[];
