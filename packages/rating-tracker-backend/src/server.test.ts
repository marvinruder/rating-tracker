import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "./redis/repositories/stockRepositoryBase",
  async () => await import("./redis/repositories/__mocks__/stockRepositoryBase")
);

const { listener, server } = await import("./server");
import supertest from "supertest";
import { Stock } from "./models/stock";
import { initMockRepository } from "./redis/repositories/__mocks__/stockRepositoryBase";
import { sortableAttributeArray } from "./types";

const requestWithSupertest = supertest(server.app);

beforeAll((done) => {
  done();
});

beforeEach((done) => {
  initMockRepository();
  done();
});

afterAll((done) => {
  listener.close();
  done();
});

const expectStockListLengthToBe = async (length: number) => {
  const res = await requestWithSupertest.get("/api/stock/list");
  expect(res.status).toBe(200);
  expect(res.body.count).toBe(length);
  expect(res.body.stocks).toHaveLength(length);
  return res;
};

describe("Stock API", () => {
  it("returns a list of stocks", async () => {
    const res = await requestWithSupertest.get("/api/stock/list");
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
    let res = await requestWithSupertest.get(
      "/api/stock/list?size=Large&style=Growth&sortBy=name&sortDesc=true"
    );
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
    expect(res.body.stocks).toHaveLength(3);
    expect(res.body.stocks[0].name).toMatch("Novo Nordisk");
    expect(res.body.stocks[1].name).toMatch("MercadoLibre");
    expect(res.body.stocks[2].name).toMatch("Apple");

    res = await requestWithSupertest.get(
      "/api/stock/list?country=US&sortBy=size"
    );
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.stocks).toHaveLength(2);
    expect(res.body.stocks[0].name).toMatch("Newmont");
    expect(res.body.stocks[1].name).toMatch("Apple");

    res = await requestWithSupertest.get(
      "/api/stock/list?country=US&sortBy=style&sortDesc=true"
    );
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.stocks).toHaveLength(2);
    expect(res.body.stocks[0].name).toMatch("Apple");
    expect(res.body.stocks[1].name).toMatch("Newmont");

    res = await requestWithSupertest.get(
      "/api/stock/list?industry=Semiconductors&name=Semiconductor"
    );
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.stocks).toHaveLength(1);
    expect(res.body.stocks[0].ticker).toMatch("TSM");

    sortableAttributeArray.forEach(async (sortCriterion) => {
      res = await requestWithSupertest.get(
        `/api/stock/list?sortBy=${sortCriterion}`
      );
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
    const resAllStocks = await requestWithSupertest.get("/api/stock/list");
    expect(resAllStocks.status).toBe(200);
    expect(resAllStocks.body.count).toBe(11);
    expect(resAllStocks.body.stocks).toHaveLength(11);
    const resPagination = await requestWithSupertest.get(
      "/api/stock/list?offset=5&count=5"
    );
    expect(resPagination.body.stocks[0].name).toBe(
      resAllStocks.body.stocks[5].name
    );
    expect(resPagination.body.stocks[4].name).toBe(
      resAllStocks.body.stocks[9].name
    );
    expect(resPagination.body.stocks).toHaveLength(5);
  });

  it("creates example stocks", async () => {
    let res = await requestWithSupertest.delete("/api/stock/exampleAAPL");
    expect(res.status).toBe(204);
    await expectStockListLengthToBe(10);
    res = await requestWithSupertest.put("/api/stock/fillWithExampleData");
    expect(res.status).toBe(201);
    await expectStockListLengthToBe(11);
  });

  it("deletes a stock", async () => {
    let res = await requestWithSupertest.delete("/api/stock/exampleAAPL");
    expect(res.status).toBe(204);
    res = await expectStockListLengthToBe(10);
    expect(
      (res.body.stocks as Stock[]).find(
        (stock) => stock.ticker === "exampleAAPL"
      )
    ).toBeUndefined();

    // attempting to delete a non-existent stock returns an error
    res = await requestWithSupertest.delete("/api/stock/exampleAAPL");
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
