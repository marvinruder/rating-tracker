import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import dotenv from "dotenv";

vi.mock("./utils/logger");
vi.mock("./redis/repositories/resource/resourceRepositoryBase");
vi.mock("./redis/repositories/session/sessionRepositoryBase");

dotenv.config({
  path: ".testenv",
});

import { sortableAttributeArray, Stock, User } from "rating-tracker-commons";
import supertest, { CallbackHandler, Test } from "supertest";
import { initResourceRepository } from "./redis/repositories/resource/__mocks__/resourceRepositoryBase";
import { initSessionRepository } from "./redis/repositories/session/__mocks__/sessionRepositoryBase";
import { applyStockSeed } from "../seeds/testStockSeeds";
import { applyUserSeed } from "../seeds/testUserSeeds";

const { listener, server } = await import("./server");

const requestWithSupertest = supertest(server.app);

beforeAll(() => {
  delete process.env.DATABASE_URL;
});

beforeEach(async () => {
  await applyStockSeed();
  await applyUserSeed();
  initResourceRepository();
  initSessionRepository();
});

afterAll(() => {
  listener.close();
});

const expectStockListLengthToBe = async (length: number) => {
  const res = await requestWithSupertest.get("/api/stock/list").set("Cookie", ["authToken=exampleSessionID"]);
  expect(res.status).toBe(200);
  expect(res.body.count).toBe(length);
  expect(res.body.stocks).toHaveLength(length);
  return res;
};

const expectRouteToBePrivate = async (route: string, method?: (url: string, callback?: CallbackHandler) => Test) => {
  method = method ?? requestWithSupertest.get;
  const res = await method(route);
  expect(res.status).toBe(401);
  expect(res.body.message).toMatch("This endpoint is available to authenticated clients only. Please sign in.");
};

const expectSpecialAccessRightsToBeRequired = async (
  route: string,
  method?: (url: string, callback?: CallbackHandler) => Test
) => {
  method = method ?? requestWithSupertest.get;
  const res = await method(route).set("Cookie", ["authToken=anotherExampleSessionID"]);
  expect(res.status).toBe(403);
  expect(res.body.message).toMatch("This user account does not have the necessary access rights");
};

describe("Session API", () => {
  it("renews cookie when token is valid", async () => {
    const res = await requestWithSupertest.head("/api/session").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    expect(res.header["set-cookie"][0]).toMatch("authToken=exampleSessionID;");
    expect(res.header["set-cookie"][0]).toMatch("HttpOnly; Secure; SameSite=Strict");
  });

  it("clears cookie when token is invalid", async () => {
    const res = await requestWithSupertest.head("/api/session").set("Cookie", ["authToken=invalidSessionID"]);
    expect(res.status).toBe(401);
    expect(res.header["set-cookie"][0]).toMatch("authToken=;");
  });

  it("deletes session when signing out", async () => {
    let res = await requestWithSupertest.delete("/api/session").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    expect(res.header["set-cookie"][1]).toMatch("authToken=;");

    // Check whether we can still access the current user
    res = await requestWithSupertest.get("/api/user").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(401);
  });
});

describe("Stock API", () => {
  it("returns a list of stocks", async () => {
    await expectRouteToBePrivate("/api/stock/list");
    const res = await requestWithSupertest.get("/api/stock/list").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(11);
    expect(res.body.stocks).toHaveLength(11);
    expect((res.body.stocks as Stock[]).find((stock) => stock.ticker === "exampleAAPL").name).toMatch("Apple");
  });

  it("filters and sorts stock list", async () => {
    let res = await requestWithSupertest
      .get("/api/stock/list?size=Large&style=Growth&sortBy=name&sortDesc=true")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(5);
    expect(res.body.stocks).toHaveLength(5);
    expect(res.body.stocks[0].name).toMatch("Taiwan Semiconductor Manufacturing Co Ltd");
    expect(res.body.stocks[1].name).toMatch("Ørsted A/S");
    expect(res.body.stocks[2].name).toMatch("Novo Nordisk");
    expect(res.body.stocks[3].name).toMatch("MercadoLibre");
    expect(res.body.stocks[4].name).toMatch("Apple");

    res = await requestWithSupertest
      .get("/api/stock/list?country=US&sortBy=size")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.stocks).toHaveLength(2);
    expect(res.body.stocks[0].name).toMatch("Newmont");
    expect(res.body.stocks[1].name).toMatch("Apple");

    res = await requestWithSupertest
      .get("/api/stock/list?country=US&sortBy=style&sortDesc=true")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.stocks).toHaveLength(2);
    expect(res.body.stocks[0].name).toMatch("Apple");
    expect(res.body.stocks[1].name).toMatch("Newmont");

    res = await requestWithSupertest
      .get("/api/stock/list?industry=Semiconductors&name=Semiconductor")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.stocks).toHaveLength(1);
    expect(res.body.stocks[0].ticker).toMatch("TSM");

    res = await requestWithSupertest
      .get("/api/stock/list?starRatingMin=3&starRatingMax=4&sortBy=name")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(5);
    expect(res.body.stocks).toHaveLength(5);
    expect(res.body.stocks[0].name).toMatch("Allianz");
    expect(res.body.stocks[1].name).toMatch("Apple");
    expect(res.body.stocks[2].name).toMatch("Danone");
    expect(res.body.stocks[3].name).toMatch("Iberdrola");
    expect(res.body.stocks[4].name).toMatch("MercadoLibre");

    res = await requestWithSupertest
      .get("/api/stock/list?dividendYieldPercentMin=1.5&dividendYieldPercentMax=5&sortBy=name")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(5);
    expect(res.body.stocks).toHaveLength(5);
    expect(res.body.stocks[0].name).toMatch("Danone");
    expect(res.body.stocks[1].name).toMatch("Iberdrola");
    expect(res.body.stocks[2].name).toMatch("Newmont");
    expect(res.body.stocks[3].name).toMatch("Ørsted");
    expect(res.body.stocks[4].name).toMatch("Taiwan Semiconductor");

    res = await requestWithSupertest
      .get("/api/stock/list?priceEarningRatioMin=10&priceEarningRatioMax=20&sortBy=name")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(4);
    expect(res.body.stocks).toHaveLength(4);
    expect(res.body.stocks[0].name).toMatch("Allianz");
    expect(res.body.stocks[1].name).toMatch("Iberdrola");
    expect(res.body.stocks[2].name).toMatch("Ørsted");
    expect(res.body.stocks[3].name).toMatch("Taiwan Semiconductor");

    res = await requestWithSupertest
      .get("/api/stock/list?morningstarFairValueDiffMin=-30&morningstarFairValueDiffMax=10&sortBy=name")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(7);
    expect(res.body.stocks).toHaveLength(7);
    expect(res.body.stocks[0].name).toMatch("Allianz");
    expect(res.body.stocks[1].name).toMatch("Apple");
    expect(res.body.stocks[2].name).toMatch("Danone");
    expect(res.body.stocks[3].name).toMatch("Iberdrola");
    expect(res.body.stocks[4].name).toMatch("MercadoLibre");
    expect(res.body.stocks[5].name).toMatch("Newmont");
    expect(res.body.stocks[6].name).toMatch("Ørsted");

    res = await requestWithSupertest
      .get(
        "/api/stock/list?analystConsensusMin=7&analystConsensusMax=8.5" +
          "&analystCountMin=20&analystCountMax=40&sortBy=name"
      )
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(4);
    expect(res.body.stocks).toHaveLength(4);
    expect(res.body.stocks[0].name).toMatch("Iberdrola");
    expect(res.body.stocks[1].name).toMatch("MercadoLibre");
    expect(res.body.stocks[2].name).toMatch("Novo Nordisk");
    expect(res.body.stocks[3].name).toMatch("Ørsted");

    res = await requestWithSupertest
      .get("/api/stock/list?analystTargetDiffMin=-20&analystTargetDiffMax=10&sortBy=name")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(5);
    expect(res.body.stocks).toHaveLength(5);
    expect(res.body.stocks[0].name).toMatch("Allianz");
    expect(res.body.stocks[1].name).toMatch("Danone");
    expect(res.body.stocks[2].name).toMatch("Iberdrola");
    expect(res.body.stocks[3].name).toMatch("Newmont");
    expect(res.body.stocks[4].name).toMatch("Novo Nordisk");

    res = await requestWithSupertest
      .get("/api/stock/list?msciESGRatingMin=AA&msciESGRatingMax=A&sortBy=name")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
    expect(res.body.stocks).toHaveLength(3);
    expect(res.body.stocks[0].name).toMatch("Allianz");
    expect(res.body.stocks[1].name).toMatch("MercadoLibre");
    expect(res.body.stocks[2].name).toMatch("Newmont");

    res = await requestWithSupertest
      .get("/api/stock/list?msciESGRatingMax=AAA&msciTemperatureMin=1.5&msciTemperatureMax=1.8&sortBy=name")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
    expect(res.body.stocks).toHaveLength(3);
    expect(res.body.stocks[0].name).toMatch("Iberdrola");
    expect(res.body.stocks[1].name).toMatch("Ørsted");
    expect(res.body.stocks[2].name).toMatch("Taiwan Semiconductor");

    res = await requestWithSupertest
      .get(
        "/api/stock/list?refinitivESGScoreMin=70&refinitivESGScoreMax=80&" +
          "refinitivEmissionsMin=80&refinitivEmissionsMax=90&sortBy=name"
      )
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.stocks).toHaveLength(1);
    expect(res.body.stocks[0].name).toMatch("Ørsted");

    res = await requestWithSupertest
      .get(
        "/api/stock/list?spESGScoreMin=50&spESGScoreMax=85" +
          "&sustainalyticsESGRiskMin=15&sustainalyticsESGRiskMax=25&sortBy=name"
      )
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.stocks).toHaveLength(2);
    expect(res.body.stocks[0].name).toMatch("Newmont");
    expect(res.body.stocks[1].name).toMatch("Novo Nordisk");

    res = await requestWithSupertest
      .get("/api/stock/list?financialScoreMin=0&financialScoreMax=50&esgScoreMin=40&esgScoreMax=60&sortBy=name")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.stocks).toHaveLength(2);
    expect(res.body.stocks[0].name).toMatch("Danone");
    expect(res.body.stocks[1].name).toMatch("Newmont");

    res = await requestWithSupertest
      .get("/api/stock/list?totalScoreMin=40&totalScoreMax=60&sortBy=name")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
    expect(res.body.stocks).toHaveLength(3);
    expect(res.body.stocks[0].name).toMatch("Allianz");
    expect(res.body.stocks[1].name).toMatch("Kion");
    expect(res.body.stocks[2].name).toMatch("Ørsted");

    for await (const sortCriterion of sortableAttributeArray) {
      res = await requestWithSupertest
        .get(`/api/stock/list?sortBy=${sortCriterion}`)
        .set("Cookie", ["authToken=exampleSessionID"]);
      expect(res.status).toBe(200);
      if (["morningstarFairValue", "analystTargetPrice"].includes(sortCriterion)) {
        for (let i = 0; i < res.body.count - 1; i++) {
          if (
            res.body.stocks[i][sortCriterion] &&
            res.body.stocks[i + 1][sortCriterion] &&
            typeof res.body.stocks[i][sortCriterion] == "number" &&
            typeof res.body.stocks[i + 1][sortCriterion] == "number" &&
            res.body.stocks[i].lastClose &&
            res.body.stocks[i + 1].lastClose &&
            typeof res.body.stocks[i].lastClose == "number" &&
            typeof res.body.stocks[i + 1].lastClose == "number"
          ) {
            // Stocks should be ordered by the ratio of the target price to the last close price (premium or discount)
            expect(res.body.stocks[i].lastClose / res.body.stocks[i][sortCriterion]).toBeLessThanOrEqual(
              res.body.stocks[i + 1].lastClose / res.body.stocks[i + 1][sortCriterion]
            );
          }
        }
      } else if (sortCriterion === "52w") {
        for (let i = 0; i < res.body.count - 1; i++) {
          if (
            res.body.stocks[i].low52w &&
            res.body.stocks[i + 1].low52w &&
            typeof res.body.stocks[i].low52w == "number" &&
            typeof res.body.stocks[i + 1].low52w == "number" &&
            res.body.stocks[i].high52w &&
            res.body.stocks[i + 1].high52w &&
            typeof res.body.stocks[i].high52w == "number" &&
            typeof res.body.stocks[i + 1].high52w == "number" &&
            res.body.stocks[i].lastClose &&
            res.body.stocks[i + 1].lastClose &&
            typeof res.body.stocks[i].lastClose == "number" &&
            typeof res.body.stocks[i + 1].lastClose == "number"
          ) {
            // Stocks should be ordered by the relative position of the last close price within the 52 week range
            expect(
              (res.body.stocks[i].lastClose - res.body.stocks[i].low52w) /
                (res.body.stocks[i].high52w - res.body.stocks[i].low52w)
            ).toBeLessThanOrEqual(
              (res.body.stocks[i + 1].lastClose - res.body.stocks[i + 1].low52w) /
                (res.body.stocks[i + 1].high52w - res.body.stocks[i + 1].low52w)
            );
          }
        }
      } else {
        for (let i = 0; i < res.body.count - 1; i++) {
          if (
            res.body.stocks[i][sortCriterion] &&
            res.body.stocks[i + 1][sortCriterion] &&
            typeof res.body.stocks[i][sortCriterion] == "number" &&
            typeof res.body.stocks[i + 1][sortCriterion] == "number"
          ) {
            // Stocks should be ordered by the sort criterion
            expect(res.body.stocks[i][sortCriterion]).toBeLessThanOrEqual(res.body.stocks[i + 1][sortCriterion]);
          }
        }
      }
    }
  });

  it("supports pagination", async () => {
    const resAllStocks = await requestWithSupertest
      .get("/api/stock/list")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(resAllStocks.status).toBe(200);
    expect(resAllStocks.body.count).toBe(11);
    expect(resAllStocks.body.stocks).toHaveLength(11);
    const resPagination = await requestWithSupertest
      .get("/api/stock/list?offset=5&count=5")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(resPagination.body.stocks[0].name).toBe(resAllStocks.body.stocks[5].name);
    expect(resPagination.body.stocks[4].name).toBe(resAllStocks.body.stocks[9].name);
    expect(resPagination.body.stocks).toHaveLength(5);
  });

  it("provides stock logos", async () => {
    await expectRouteToBePrivate("/api/stock/logo/exampleAAPL");
    let res = await requestWithSupertest
      .get("/api/stock/logo/exampleAAPL")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch("image/svg+xml");
    expect(res.body.toString()).toMatch(
      `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">`
    );

    // attempting to read the logo of a stock for which no logo exists returns an empty SVG file
    res = await requestWithSupertest.get("/api/stock/logo/exampleNULL").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch("image/svg+xml");
    expect(res.body.toString()).toMatch(
      `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>`
    );

    // attempting to read a non-existent stock’s logo results in an error
    res = await requestWithSupertest.get("/api/stock/logo/doesNotExist").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  });

  it("creates a stock", async () => {
    await expectRouteToBePrivate(
      "/api/stock/NEWSTOCK?name=New%20Stock&country=GB&isin=GB0987654321",
      requestWithSupertest.put
    );
    await expectSpecialAccessRightsToBeRequired(
      "/api/stock/NEWSTOCK?name=New%20Stock&country=GB&isin=GB0987654321",
      requestWithSupertest.put
    );
    let res = await requestWithSupertest
      .put("/api/stock/NEWSTOCK?name=New%20Stock&country=GB&isin=GB0987654321")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(201);
    await expectStockListLengthToBe(12);
    res = await requestWithSupertest
      .get("/api/stock/list?name=New%20Stock")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.body.stocks).toHaveLength(1);
    expect(res.body.stocks[0].ticker).toBe("NEWSTOCK");
    expect(res.body.stocks[0].name).toBe("New Stock");
    expect(res.body.stocks[0].country).toBe("GB");

    // attempting to create the same stock again results in an error
    res = await requestWithSupertest
      .put("/api/stock/NEWSTOCK?name=New%20Stock&country=GB&isin=GB0987654321")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(409);
    await expectStockListLengthToBe(12);
  });

  it("reads a stock", async () => {
    await expectRouteToBePrivate("/api/stock/exampleAAPL");
    let res = await requestWithSupertest.get("/api/stock/exampleAAPL").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");

    // attempting to read a non-existent stock results in an error
    res = await requestWithSupertest.get("/api/stock/doesNotExist").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  });

  it("updates a stock", async () => {
    await expectRouteToBePrivate("/api/stock/exampleAAPL", requestWithSupertest.patch);
    await expectSpecialAccessRightsToBeRequired("/api/stock/exampleAAPL", requestWithSupertest.patch);
    let res = await requestWithSupertest
      .patch("/api/stock/exampleAAPL?morningstarID=0P012345678&name=Apple%20Inc")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await requestWithSupertest.get("/api/stock/exampleAAPL").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");
    expect((res.body as Stock).morningstarID).toEqual("0P012345678");

    // sending an update with the same information results in no changes
    res = await requestWithSupertest
      .patch("/api/stock/exampleAAPL?morningstarID=0P012345678")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await requestWithSupertest.get("/api/stock/exampleAAPL").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");
    expect((res.body as Stock).morningstarID).toEqual("0P012345678");

    // sending an update without anything results in no changes
    res = await requestWithSupertest.patch("/api/stock/exampleAAPL").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await requestWithSupertest.get("/api/stock/exampleAAPL").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");
    expect((res.body as Stock).morningstarID).toEqual("0P012345678");

    // attempting to update a non-existent stock results in an error
    res = await requestWithSupertest
      .patch("/api/stock/doesNotExist?morningstarID=0P123456789")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  });

  it("deletes a stock", async () => {
    await expectRouteToBePrivate("/api/stock/exampleAAPL", requestWithSupertest.delete);
    await expectSpecialAccessRightsToBeRequired("/api/stock/exampleAAPL", requestWithSupertest.delete);
    let res = await requestWithSupertest.delete("/api/stock/exampleAAPL").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await expectStockListLengthToBe(10);
    expect((res.body.stocks as Stock[]).find((stock) => stock.ticker === "exampleAAPL")).toBeUndefined();

    // attempting to delete a non-existent stock returns an error
    res = await requestWithSupertest.delete("/api/stock/exampleAAPL").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("Stock exampleAAPL not found.");
  });
});

describe("Status API", () => {
  it("returns status “operational”", async () => {
    const res = await requestWithSupertest.get("/api/status");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("operational");
  });
});

describe("Swagger API", () => {
  it("provides documentation", async () => {
    const res = await requestWithSupertest.get("/api-spec/v3");
    expect(res.status).toBe(200);
  });
});

describe("Authentication API", () => {
  it("provides a registration challenge", async () => {
    const res = await requestWithSupertest.get("/api/auth/register?email=jim.doe%40example.com&name=Jim%20Doe");
    expect(res.status).toBe(200);
    expect(typeof res.body.challenge).toBe("string");
    expect(typeof res.body.timeout).toBe("number");
    expect(res.body.rp.id).toBe(`${process.env.DOMAIN}`);
    expect(res.body.rp.name).toMatch("Rating Tracker");
    expect(res.body.user.id).toBe("jim.doe@example.com");
    expect(res.body.user.name).toBe("Jim Doe");
    expect(res.body.attestation).toBe("none");
    expect(res.body.excludeCredentials).toHaveLength(0);
    expect(res.body.authenticatorSelection.userVerification).toBe("required");
    expect(res.body.authenticatorSelection.residentKey).toBe("required");
    expect(res.body.authenticatorSelection.requireResidentKey).toBeTruthy();
  });

  it("rejects a registration challenge request from an existing user", async () => {
    const res = await requestWithSupertest.get("/api/auth/register?email=jane.doe%40example.com&name=Jane%20Doe");
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch("This email address is already registered. Please sign in.");
  });

  it("rejects a registration challenge request from an unknown user", async () => {
    const res = await requestWithSupertest.get("/api/auth/register?email=notAnEmailAddress&name=John%20Doe");
    expect(res.status).toBe(400);
  });

  it("rejects a registration challenge request from an invalid user", async () => {
    const res = await requestWithSupertest.get("/api/auth/register");
    expect(res.status).toBe(400);
  });

  it("provides a authentication challenge", async () => {
    const res = await requestWithSupertest.get("/api/auth/signIn");
    expect(res.status).toBe(200);
    expect(typeof res.body.challenge).toBe("string");
    expect(typeof res.body.timeout).toBe("number");
    expect(res.body.rpId).toBe(`${process.env.DOMAIN}`);
    expect(res.body.userVerification).toBe("required");
  });

  it("does not provide too many authentication challenges", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of [...Array(60)]) {
      // Request 60 authentication challenges
      await requestWithSupertest.get("/api/auth/signIn");
    }
    // Those were too many. The rate limiter should now refuse to provide more.
    const res = await requestWithSupertest.get("/api/auth/signIn");
    expect(res.status).toBe(429);
  });
});

describe("Resource API", () => {
  it("provides a resource", async () => {
    await expectRouteToBePrivate("/api/resource/image.png");
    const res = await requestWithSupertest.get("/api/resource/image.png").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.toString()).toMatch("Sample PNG image");
  });

  it("does not provide resources of unknown type", async () => {
    await expectRouteToBePrivate("/api/resource/odd.exe");
    const res = await requestWithSupertest.get("/api/resource/odd.exe").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(501);
    expect(res.body.message).toMatch("Resources of this type cannot be fetched using this API endpoint");
  });

  it("fails to provide not-existent resource", async () => {
    await expectRouteToBePrivate("/api/resource/doesNotExist.png");
    const res = await requestWithSupertest
      .get("/api/resource/doesNotExist.png")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("not found");
  });
});

describe("User API", () => {
  it("provides current user’s information", async () => {
    await expectRouteToBePrivate("/api/user");
    const res = await requestWithSupertest.get("/api/user").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("jane.doe@example.com");
    expect(res.body.name).toBe("Jane Doe");
    expect(res.body.avatar).toBe("data:image/jpeg;base64,U29tZSBmYW5jeSBhdmF0YXIgaW1hZ2U=");
    expect(res.body.phone).toBe("+123456789");
    // Authentication-related fields should not be exposed
    expect(res.body.credentialID).toBeUndefined();
    expect(res.body.credentialPublicKey).toBeUndefined();
    expect(res.body.counter).toBeUndefined();
  });

  it("validates the phone number", async () => {
    await expectRouteToBePrivate("/api/user", requestWithSupertest.patch);
    let res = await requestWithSupertest
      .patch("/api/user?phone=987654321")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);
    res = await requestWithSupertest
      .patch("/api/user?phone=+1%20234%20567%2D8900")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);

    // Check that no changes were applied
    res = await requestWithSupertest.get("/api/user").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.phone).toBe("+123456789");
  });

  it("updates current user’s information", async () => {
    await expectRouteToBePrivate("/api/user", requestWithSupertest.patch);
    let res = await requestWithSupertest
      .patch("/api/user?name=Jane%20Doe%20II%2E&phone=%2B987654321")
      .send({
        avatar: "data:image/jpeg;base64,QW5vdGhlciBmYW5jeSBhdmF0YXIgaW1hZ2U=",
      })
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Check that the changes were applied
    res = await requestWithSupertest.get("/api/user").set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("jane.doe@example.com");
    expect(res.body.name).toBe("Jane Doe II.");
    expect(res.body.avatar).toBe("data:image/jpeg;base64,QW5vdGhlciBmYW5jeSBhdmF0YXIgaW1hZ2U=");
    expect(res.body.phone).toBe("+987654321");
  });

  it("disallows changing own access rights", async () => {
    const res = await requestWithSupertest
      .patch("/api/user?accessRights=255")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);
  });

  it("deletes the current user", async () => {
    await expectRouteToBePrivate("/api/user", requestWithSupertest.delete);
    let res = await requestWithSupertest.delete("/api/user").set("Cookie", ["authToken=anotherExampleSessionID"]);

    // Check that the user was deleted
    res = await requestWithSupertest.head("/api/session").set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(401);
  });
});

describe("User Management API", () => {
  it("returns a list of users", async () => {
    await expectRouteToBePrivate("/api/userManagement/list");
    await expectSpecialAccessRightsToBeRequired("/api/userManagement/list");
    const res = await requestWithSupertest
      .get("/api/userManagement/list")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect((res.body as User[]).find((user) => user.email === "jane.doe@example.com").name).toMatch("Jane Doe");
  });

  it("reads a user", async () => {
    await expectRouteToBePrivate("/api/userManagement/john.doe%40example.com");
    await expectSpecialAccessRightsToBeRequired("/api/userManagement/john.doe%40example.com");
    let res = await requestWithSupertest
      .get("/api/userManagement/john.doe%40example.com")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as User).name).toEqual("John Doe");

    // attempting to read a non-existent user results in an error
    res = await requestWithSupertest
      .get("/api/userManagement/doesNotExist@example.com")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  });

  it("updates a user’s information", async () => {
    await expectRouteToBePrivate("/api/userManagement/john.doe%40example.com", requestWithSupertest.patch);
    await expectSpecialAccessRightsToBeRequired(
      "/api/userManagement/john.doe%40example.com",
      requestWithSupertest.patch
    );
    let res = await requestWithSupertest
      .patch(
        "/api/userManagement/john.doe%40example.com" +
          "?name=John%20Doe%20II%2E&phone=%2B987654321&accessRights=0&subscriptions=0"
      )
      .send({
        avatar: "data:image/jpeg;base64,QW5vdGhlciBmYW5jeSBhdmF0YXIgaW1hZ2U=",
      })
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Check that the changes were applied
    res = await requestWithSupertest
      .get("/api/userManagement/john.doe%40example.com")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("john.doe@example.com");
    expect(res.body.name).toBe("John Doe II.");
    expect(res.body.avatar).toBe("data:image/jpeg;base64,QW5vdGhlciBmYW5jeSBhdmF0YXIgaW1hZ2U=");
    expect(res.body.phone).toBe("+987654321");
  });

  it("deletes a user", async () => {
    await expectRouteToBePrivate("/api/userManagement/john.doe%40example.com", requestWithSupertest.delete);
    await expectSpecialAccessRightsToBeRequired(
      "/api/userManagement/john.doe%40example.com",
      requestWithSupertest.delete
    );
    let res = await requestWithSupertest
      .delete("/api/userManagement/john.doe%40example.com")
      .set("Cookie", ["authToken=exampleSessionID"]);

    // Check that the user was deleted
    res = await requestWithSupertest
      .get("/api/userManagement/john.doe%40example.com")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  });
});
