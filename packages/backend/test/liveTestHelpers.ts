import initSupertest, { CallbackHandler, Test } from "supertest";
import { Stock, UNAUTHORIZED_ERROR_MESSAGE, stockListEndpointPath } from "@rating-tracker/commons";
import { TestFunction } from "vitest";

/**
 * A supertest instance. Used to direct requests to the server running on the port specified in the test environment.
 */
export const supertest = initSupertest(`http://localhost:${process.env.PORT}`);

/**
 * Requests the full list of stocks from the server and tests that it has the expected length.
 *
 * @param {number} length The expected length of the stock list.
 * @returns {Promise<Stock[]>} The list of stocks returned by the server.
 */
export const expectStockListLengthToBe = async (length: number): Promise<Stock[]> => {
  const res = await supertest.get(`/api${stockListEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
  expect(res.status).toBe(200);
  expect(res.body.count).toBe(length);
  expect(res.body.stocks).toHaveLength(length);
  return res.body.stocks;
};

/**
 * Tests that the given route is only available to authenticated clients.
 *
 * @param {string} route The route to test.
 * @param {Function} method The HTTP request method to use.
 */
export const expectRouteToBePrivate = async (
  route: string,
  method?: (url: string, callback?: CallbackHandler) => Test,
): Promise<void> => {
  method = method ?? supertest.get;
  const res = await method(route);
  expect(res.status).toBe(401);
  expect(res.body.message).toMatch(UNAUTHORIZED_ERROR_MESSAGE);
};

/**
 * Tests that the given route is only available to users having special access rights.
 *
 * @param {string} route The route to test.
 * @param {Function} method The HTTP request method to use.
 */
export const expectSpecialAccessRightsToBeRequired = async (
  route: string,
  method?: (url: string, callback?: CallbackHandler) => Test,
): Promise<void> => {
  method = method ?? supertest.get;
  const res = await method(route).set("Cookie", ["authToken=anotherExampleSessionID"]);
  expect(res.status).toBe(403);
  expect(res.body.message).toMatch(
    "The authenticated user account does not have the rights necessary to access this endpoint",
  );
};

/**
 * An array of tests requiring the presence of a PostgreSQL and/or Redis instance.
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
