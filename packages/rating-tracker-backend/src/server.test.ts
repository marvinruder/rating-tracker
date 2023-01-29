import { jest } from "@jest/globals";
import { sortableAttributeArray } from "rating-tracker-commons";
import supertest, { CallbackHandler, Test } from "supertest";
import { Stock } from "./models/stock";
import { initSessionRepository } from "./redis/repositories/session/__mocks__/sessionRepositoryBase";
import { initStockRepository } from "./redis/repositories/stock/__mocks__/stockRepositoryBase";
import { initUserRepository } from "./redis/repositories/user/__mocks__/userRepositoryBase";

jest.unstable_mockModule(
  "./lib/logger",
  async () => await import("./lib/__mocks__/logger")
);

jest.unstable_mockModule(
  "./redis/repositories/resource/resourceRepositoryBase",
  async () =>
    await import(
      "./redis/repositories/resource/__mocks__/resourceRepositoryBase"
    )
);
jest.unstable_mockModule(
  "./redis/repositories/session/sessionRepositoryBase",
  async () =>
    await import("./redis/repositories/session/__mocks__/sessionRepositoryBase")
);
jest.unstable_mockModule(
  "./redis/repositories/stock/stockRepositoryBase",
  async () =>
    await import("./redis/repositories/stock/__mocks__/stockRepositoryBase")
);
jest.unstable_mockModule(
  "./redis/repositories/user/userRepositoryBase",
  async () =>
    await import("./redis/repositories/user/__mocks__/userRepositoryBase")
);

const { listener, server } = await import("./server");

const requestWithSupertest = supertest(server.app);

beforeAll((done) => {
  done();
});

beforeEach((done) => {
  initStockRepository();
  initSessionRepository();
  initUserRepository();
  done();
});

afterAll((done) => {
  listener.close();
  done();
});

const expectStockListLengthToBe = async (length: number) => {
  const res = await requestWithSupertest
    .get("/api/stock/list")
    .set("Cookie", ["authToken=exampleSessionID"]);
  expect(res.status).toBe(200);
  expect(res.body.count).toBe(length);
  expect(res.body.stocks).toHaveLength(length);
  return res;
};

const expectRouteToBePrivate = async (
  route: string,
  method?: (url: string, callback?: CallbackHandler) => Test
) => {
  method = method ?? requestWithSupertest.get;
  const res = await method(route);
  expect(res.status).toBe(401);
  expect(res.body.message).toMatch(
    "This endpoint is available to authenticated clients only. Please sign in."
  );
};

describe("Session Validation", () => {
  it("renews cookie when token is valid", async () => {
    const res = await requestWithSupertest
      .head("/api/session")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    expect(res.header["set-cookie"][0]).toMatch("authToken=exampleSessionID;");
    expect(res.header["set-cookie"][0]).toMatch(
      "HttpOnly; Secure; SameSite=Strict"
    );
  });

  it("clears cookie when token is invalid", async () => {
    const res = await requestWithSupertest
      .head("/api/session")
      .set("Cookie", ["authToken=invalidSessionID"]);
    expect(res.status).toBe(401);
    expect(res.header["set-cookie"][0]).toMatch("authToken=;");
  });
});

describe("Stock API", () => {
  it("returns a list of stocks", async () => {
    await expectRouteToBePrivate("/api/stock/list");
    const res = await requestWithSupertest
      .get("/api/stock/list")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(11);
    expect(res.body.stocks).toHaveLength(11);
    expect(
      (res.body.stocks as Stock[]).find(
        (stock) => stock.ticker === "exampleAAPL"
      ).name
    ).toMatch("Apple");
  });

  it("filters and sorts stock list", async () => {
    let res = await requestWithSupertest
      .get("/api/stock/list?size=Large&style=Growth&sortBy=name&sortDesc=true")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(5);
    expect(res.body.stocks).toHaveLength(5);
    expect(res.body.stocks[0].name).toMatch(
      "Taiwan Semiconductor Manufacturing Co Ltd"
    );
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
      .get(
        "/api/stock/list?dividendYieldPercentMin=1.5&dividendYieldPercentMax=5&sortBy=name"
      )
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
      .get(
        "/api/stock/list?priceEarningRatioMin=10&priceEarningRatioMax=20&sortBy=name"
      )
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(4);
    expect(res.body.stocks).toHaveLength(4);
    expect(res.body.stocks[0].name).toMatch("Allianz");
    expect(res.body.stocks[1].name).toMatch("Iberdrola");
    expect(res.body.stocks[2].name).toMatch("Ørsted");
    expect(res.body.stocks[3].name).toMatch("Taiwan Semiconductor");

    res = await requestWithSupertest
      .get(
        "/api/stock/list?morningstarFairValueDiffMin=-30&morningstarFairValueDiffMax=10&sortBy=name"
      )
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
      .get(
        "/api/stock/list?analystTargetDiffMin=-20&analystTargetDiffMax=10&sortBy=name"
      )
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
      .get(
        "/api/stock/list?msciESGRatingMax=AAA&msciTemperatureMin=1.5&msciTemperatureMax=1.8&sortBy=name"
      )
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
      .get(
        "/api/stock/list?financialScoreMin=0&financialScoreMax=50&esgScoreMin=40&esgScoreMax=60&sortBy=name"
      )
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

    sortableAttributeArray.forEach(async (sortCriterion) => {
      res = await requestWithSupertest
        .get(`/api/stock/list?sortBy=${sortCriterion}`)
        .set("Cookie", ["authToken=exampleSessionID"]);
      expect(res.status).toBe(200);
      if (
        ["morningstarFairValue", "analystTargetPrice"].includes(sortCriterion)
      ) {
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
            expect(
              res.body.stocks[i].lastClose / res.body.stocks[i][sortCriterion]
            ).toBeLessThanOrEqual(
              res.body.stocks[i + 1].lastClose /
                res.body.stocks[i + 1][sortCriterion]
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
              (res.body.stocks[i + 1].lastClose -
                res.body.stocks[i + 1].low52w) /
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
            expect(res.body.stocks[i][sortCriterion]).toBeLessThanOrEqual(
              res.body.stocks[i + 1][sortCriterion]
            );
          }
        }
      }
    });
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
    expect(resPagination.body.stocks[0].name).toBe(
      resAllStocks.body.stocks[5].name
    );
    expect(resPagination.body.stocks[4].name).toBe(
      resAllStocks.body.stocks[9].name
    );
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
    res = await requestWithSupertest
      .get("/api/stock/logo/exampleNULL")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch("image/svg+xml");
    expect(res.body.toString()).toMatch(
      `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>`
    );

    // attempting to read a non-existent stock’s logo results in an error
    res = await requestWithSupertest
      .get("/api/stock/logo/doesNotExist")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  });

  it("creates a stock", async () => {
    await expectRouteToBePrivate(
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
    let res = await requestWithSupertest
      .get("/api/stock/exampleAAPL")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");

    // attempting to read a non-existent stock results in an error
    res = await requestWithSupertest
      .get("/api/stock/doesNotExist")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  });

  it("updates a stock", async () => {
    await expectRouteToBePrivate(
      "/api/stock/exampleAAPL",
      requestWithSupertest.patch
    );
    let res = await requestWithSupertest
      .patch(
        "/api/stock/exampleAAPL?morningstarId=US012345678&name=Apple%20Inc"
      )
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await requestWithSupertest
      .get("/api/stock/exampleAAPL")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");
    expect((res.body as Stock).morningstarId).toEqual("US012345678");

    // sending an update with the same information results in no changes
    res = await requestWithSupertest
      .patch("/api/stock/exampleAAPL?morningstarId=US012345678")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await requestWithSupertest
      .get("/api/stock/exampleAAPL")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");
    expect((res.body as Stock).morningstarId).toEqual("US012345678");

    // sending an update without anything results in no changes
    res = await requestWithSupertest
      .patch("/api/stock/exampleAAPL")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await requestWithSupertest
      .get("/api/stock/exampleAAPL")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");
    expect((res.body as Stock).morningstarId).toEqual("US012345678");

    // attempting to update a non-existent stock results in an error
    res = await requestWithSupertest
      .patch("/api/stock/doesNotExist?morningstarId=CA012345678")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  });

  it("deletes a stock", async () => {
    await expectRouteToBePrivate(
      "/api/stock/exampleAAPL",
      requestWithSupertest.delete
    );
    let res = await requestWithSupertest
      .delete("/api/stock/exampleAAPL")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await expectStockListLengthToBe(10);
    expect(
      (res.body.stocks as Stock[]).find(
        (stock) => stock.ticker === "exampleAAPL"
      )
    ).toBeUndefined();

    // attempting to delete a non-existent stock returns an error
    res = await requestWithSupertest
      .delete("/api/stock/exampleAAPL")
      .set("Cookie", ["authToken=exampleSessionID"]);
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
    const res = await requestWithSupertest.get(
      "/api/auth/register?email=jim.doe%40example.com&name=Jim%20Doe"
    );
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
    const res = await requestWithSupertest.get(
      "/api/auth/register?email=jane.doe%40example.com&name=Jane%20Doe"
    );
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(
      "This email address is already registered. Please sign in."
    );
  });

  it("rejects a registration challenge request from an unknown user", async () => {
    const res = await requestWithSupertest.get(
      "/api/auth/register?email=notAnEmailAddress&name=John%20Doe"
    );
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
  it("does not provide resources of unknown type", async () => {
    await expectRouteToBePrivate("/api/resource/odd.exe");
    const res = await requestWithSupertest
      .get("/api/resource/odd.exe")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(501);
    expect(res.body.message).toMatch(
      "Resources of this type cannot be fetched using this API endpoint"
    );
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
    const res = await requestWithSupertest
      .get("/api/user")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("jane.doe@example.com");
    expect(res.body.name).toBe("Jane Doe");
    expect(res.body.avatar).toBe("U29tZSBmYW5jeSBhdmF0YXIgaW1hZ2U=");
    expect(res.body.phone).toBe("123456789");
    // Authentication-related fields should not be exposed
    expect(res.body.credentialID).toBeUndefined();
    expect(res.body.credentialPublicKey).toBeUndefined();
    expect(res.body.counter).toBeUndefined();
  });

  it("updates current user’s information", async () => {
    await expectRouteToBePrivate("/api/user", requestWithSupertest.patch);
    let res = await requestWithSupertest
      .patch(
        "/api/user?name=Jane%20Doe%20II%2E&avatar=QW5vdGhlciBmYW5jeSBhdmF0YXIgaW1hZ2U=&phone=987654321"
      )
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Check that the changes were applied
    res = await requestWithSupertest
      .get("/api/user")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("jane.doe@example.com");
    expect(res.body.name).toBe("Jane Doe II.");
    expect(res.body.avatar).toBe("QW5vdGhlciBmYW5jeSBhdmF0YXIgaW1hZ2U=");
    expect(res.body.phone).toBe("987654321");
  });

  it("disallows changing own access rights", async () => {
    const res = await requestWithSupertest
      .patch("/api/user?accessRights=255")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);
  });

  it("deletes the current user", async () => {
    await expectRouteToBePrivate("/api/user", requestWithSupertest.delete);
    let res = await requestWithSupertest
      .delete("/api/user")
      .set("Cookie", ["authToken=anotherExampleSessionID"]);

    // Check that the user was deleted
    res = await requestWithSupertest
      .head("/api/session")
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(401);
  });
});
