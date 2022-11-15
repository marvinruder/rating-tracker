import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "./redis/repositories/stock/stockRepositoryBase",
  async () =>
    await import("./redis/repositories/stock/__mocks__/stockRepositoryBase")
);
jest.unstable_mockModule(
  "./redis/repositories/session/sessionRepositoryBase",
  async () =>
    await import("./redis/repositories/session/__mocks__/sessionRepositoryBase")
);
jest.unstable_mockModule(
  "./redis/repositories/user/userRepositoryBase",
  async () =>
    await import("./redis/repositories/user/__mocks__/userRepositoryBase")
);

const { listener, server } = await import("./server");
import supertest, { CallbackHandler, Test } from "supertest";
import { Stock } from "./models/stock";
import { initStockRepository } from "./redis/repositories/stock/__mocks__/stockRepositoryBase";
import { initSessionRepository } from "./redis/repositories/session/__mocks__/sessionRepositoryBase";
import { initUserRepository } from "./redis/repositories/user/__mocks__/userRepositoryBase";
import { sortableAttributeArray } from "./types";

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
    expect(res.body.count).toBe(3);
    expect(res.body.stocks).toHaveLength(3);
    expect(res.body.stocks[0].name).toMatch("Novo Nordisk");
    expect(res.body.stocks[1].name).toMatch("MercadoLibre");
    expect(res.body.stocks[2].name).toMatch("Apple");

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

    sortableAttributeArray.forEach(async (sortCriterion) => {
      res = await requestWithSupertest
        .get(`/api/stock/list?sortBy=${sortCriterion}`)
        .set("Cookie", ["authToken=exampleSessionID"]);
      expect(res.status).toBe(200);
      for (let i = 0; i < res.body.count - 1; i++) {
        if (
          res.body.stocks[i][sortCriterion] &&
          res.body.stocks[i + 1][sortCriterion] &&
          typeof res.body.stocks[i][sortCriterion] == "number" &&
          typeof res.body.stocks[i + 1][sortCriterion] == "number"
        ) {
          expect(res.body.stocks[i][sortCriterion]).toBeLessThanOrEqual(
            res.body.stocks[i + 1][sortCriterion]
          );
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

  it("creates example stocks", async () => {
    let res = await requestWithSupertest
      .delete("/api/stock/exampleAAPL")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    await expectStockListLengthToBe(10);
    await expectRouteToBePrivate(
      "/api/stock/fillWithExampleData",
      requestWithSupertest.put
    );
    res = await requestWithSupertest
      .put("/api/stock/fillWithExampleData")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(201);
    await expectStockListLengthToBe(11);
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
      "/api/auth/register?email=john.doe%40example.com&name=John%20Doe"
    );
    expect(res.status).toBe(200);
    expect(typeof res.body.challenge).toBe("string");
    expect(typeof res.body.timeout).toBe("number");
    expect(res.body.rp.id).toBe(`${process.env.DOMAIN}`);
    expect(res.body.rp.name).toMatch("Rating Tracker");
    expect(res.body.user.id).toBe("john.doe@example.com");
    expect(res.body.user.name).toBe("John Doe");
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
      await requestWithSupertest.get("/api/auth/signIn");
    }
    const res = await requestWithSupertest.get("/api/auth/signIn");
    expect(res.status).toBe(429);
  });
});
