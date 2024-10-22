import type { Stock, WatchlistSummary, PortfolioSummary } from "@rating-tracker/commons";
import {
  basePath,
  msciESGRatingArray,
  sizeArray,
  sortableAttributeArray,
  stocksAPIPath,
  stockLogoEndpointSuffix,
  styleArray,
  watchlistsAPIPath,
  portfoliosAPIPath,
  analystRatingArray,
} from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import {
  expectRouteToBePrivate,
  expectSpecialAccessRightsToBeRequired,
  expectStockListLengthToBe,
} from "../../test/liveTestHelpers";
import DBService from "../db/db.service";
import { app } from "../server";
import { signalMessages } from "../utils/__mocks__/fetchRequest";

export const suiteName = "Stocks API";

export const tests: LiveTestSuite = [];

const dbService: DBService = new DBService();

/**
 * Checks a response for the presence of stocks of the given name in the specified order.
 * @param res The response to check.
 * @param stockNames The names of the stocks to check for.
 */
const expectStocksToBePresent = async (res: Response, stockNames: string[]) => {
  const body = await res.json();
  expect(res.status).toBe(200);
  expect(body.count).toBe(stockNames.length);
  expect(body.stocks).toHaveLength(stockNames.length);
  stockNames.forEach((stockName, index) => {
    expect(body.stocks[index].name).toMatch(stockName);
  });
};

tests.push({
  testName: "returns a list of stocks",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${stocksAPIPath}`);
    const res = await app.request(`${basePath}${stocksAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.count).toBe(11);
    expect(body.stocks).toHaveLength(11);
    expect(body.stocks.find((stock: Stock) => stock.ticker === "AAPL")?.name).toMatch("Apple");
  },
});

tests.push({
  testName: "[unsafe] computes correct scores",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${stocksAPIPath}`, "PATCH");

    // Write incorrect score directly into the database
    await dbService.stock.update({ where: { ticker: "AAPL" }, data: { totalScore: 0 } });

    let res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, { headers: { Cookie: "id=exampleSessionID" } });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.totalScore).toBe(0);

    // Fix the incorrect score by recomputing
    res = await app.request(`${basePath}${stocksAPIPath}`, {
      headers: { Cookie: "id=exampleSessionID" },
      method: "PATCH",
    });
    expect(res.status).toBe(204);

    // Now the score does not hold an incorrect value
    res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, { headers: { Cookie: "id=exampleSessionID" } });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.totalScore).not.toBe(0);
  },
});

tests.push({
  testName: "filters and sorts stock list – example 1",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(`${basePath}${stocksAPIPath}?size=Large&style=Growth&sortBy=name&sortOrder=desc`, {
        headers: { Cookie: "id=exampleSessionID" },
      }),
      ["Ørsted A/S", "Taiwan Semiconductor Manufacturing Co Ltd", "Novo Nordisk", "MercadoLibre", "Apple"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 2",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(`${basePath}${stocksAPIPath}?countries=US&sortBy=size`, {
        headers: { Cookie: "id=exampleSessionID" },
      }),
      ["Newmont", "Apple"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 3",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(`${basePath}${stocksAPIPath}?countries=US&sortBy=style&sortOrder=desc`, {
        headers: { Cookie: "id=exampleSessionID" },
      }),
      ["Apple", "Newmont"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 4",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(`${basePath}${stocksAPIPath}?industries=Semiconductors&q=Semiconductor`, {
        headers: { Cookie: "id=exampleSessionID" },
      }),
      ["Taiwan Semiconductor Manufacturing Co Ltd"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 5",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(`${basePath}${stocksAPIPath}?starRatingMin=3&starRatingMax=4&sortBy=name`, {
        headers: { Cookie: "id=exampleSessionID" },
      }),
      ["Allianz", "Danone", "Iberdrola", "MercadoLibre"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 6",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(
        `${basePath}${stocksAPIPath}?dividendYieldPercentMin=1.5&dividendYieldPercentMax=5&sortBy=name`,
        { headers: { Cookie: "id=exampleSessionID" } },
      ),
      ["Danone", "Iberdrola", "Newmont", "Taiwan Semiconductor Manufacturing Co Ltd", "Ørsted A/S"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 7",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(`${basePath}${stocksAPIPath}?priceEarningRatioMin=10&priceEarningRatioMax=20&sortBy=name`, {
        headers: { Cookie: "id=exampleSessionID" },
      }),
      ["Allianz", "Iberdrola", "Taiwan Semiconductor Manufacturing Co Ltd", "Ørsted A/S"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 8",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(
        `${basePath}${stocksAPIPath}?morningstarFairValueDiffMin=-30&morningstarFairValueDiffMax=10&sortBy=name`,
        {
          headers: { Cookie: "id=exampleSessionID" },
        },
      ),
      ["Allianz", "Apple", "Danone", "Iberdrola", "MercadoLibre", "Newmont", "Ørsted A/S"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 9",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(
        `${basePath}${stocksAPIPath}?analystConsensusMin=Outperform&analystConsensusMax=Outperform` +
          "&analystCountMin=25&analystCountMax=40&sortBy=name",
        { headers: { Cookie: "id=exampleSessionID" } },
      ),
      ["Novo Nordisk"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 10",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(`${basePath}${stocksAPIPath}?analystTargetDiffMin=-20&analystTargetDiffMax=10&sortBy=name`, {
        headers: { Cookie: "id=exampleSessionID" },
      }),
      ["Allianz", "Danone", "Iberdrola", "Newmont", "Novo Nordisk"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 11",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(`${basePath}${stocksAPIPath}?msciESGRatingMin=AA&msciESGRatingMax=A&sortBy=name`, {
        headers: { Cookie: "id=exampleSessionID" },
      }),
      ["Allianz", "MercadoLibre", "Newmont"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 12",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(
        `${basePath}${stocksAPIPath}` +
          "?msciESGRatingMax=AAA&msciTemperatureMin=1.5&msciTemperatureMax=1.8&sortBy=name",
        { headers: { Cookie: "id=exampleSessionID" } },
      ),
      ["Iberdrola", "Taiwan Semiconductor Manufacturing Co Ltd", "Ørsted A/S"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 13",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(
        `${basePath}${stocksAPIPath}?lsegESGScoreMin=70&lsegESGScoreMax=80&` +
          "lsegEmissionsMin=80&lsegEmissionsMax=90&sortBy=name",
        { headers: { Cookie: "id=exampleSessionID" } },
      ),
      ["Ørsted A/S"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 14",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(
        `${basePath}${stocksAPIPath}?spESGScoreMin=50&spESGScoreMax=85` +
          "&sustainalyticsESGRiskMin=15&sustainalyticsESGRiskMax=25&sortBy=name",
        { headers: { Cookie: "id=exampleSessionID" } },
      ),
      ["Newmont", "Novo Nordisk"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 15",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(
        `${basePath}${stocksAPIPath}?financialScoreMin=0&financialScoreMax=0.5&esgScoreMin=0.4&esgScoreMax=0.6` +
          "&sortBy=name",
        { headers: { Cookie: "id=exampleSessionID" } },
      ),
      ["Danone", "Newmont"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 16",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(`${basePath}${stocksAPIPath}?totalScoreMin=0.3&totalScoreMax=0.6&sortBy=name`, {
        headers: { Cookie: "id=exampleSessionID" },
      }),
      ["Allianz", "Danone", "Kion", "Newmont", "Ørsted"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 17",
  testFunction: async () => {
    await expectStocksToBePresent(
      await app.request(`${basePath}${stocksAPIPath}?q=US0378331005`, { headers: { Cookie: "id=exampleSessionID" } }),
      ["Apple"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – stocks in watchlist",
  testFunction: async () => {
    // Get the ID of the watchlist from the summary
    let res = await app.request(`${basePath}${watchlistsAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    let body = await res.json();
    expect(res.status).toBe(200);
    const { id } = body.find((watchlistSummary: WatchlistSummary) => watchlistSummary.name === "Fævørites");

    await expectStocksToBePresent(
      await app.request(`${basePath}${stocksAPIPath}?watchlist=${id}&sortBy=name`, {
        headers: { Cookie: "id=exampleSessionID" },
      }),
      ["Novo Nordisk A/S", "Ørsted A/S"],
    );

    // Attempting to read a watchlist of a different user returns an error
    res = await app.request(`${basePath}${stocksAPIPath}?watchlist=${id}`, {
      headers: { Cookie: "id=anotherExampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(403);
    expect(body.message).toMatch("does not belong to user with email address john.doe");
  },
});

tests.push({
  testName: "filters and sorts stock list – stocks in portfolio",
  testFunction: async () => {
    // Get the ID of the portfolio from the summary
    let res = await app.request(`${basePath}${portfoliosAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    let body = await res.json();
    expect(res.status).toBe(200);
    const { id } = body.find((portfolioSummary: PortfolioSummary) => portfolioSummary.name === "My Portfolio");

    await expectStocksToBePresent(
      await app.request(`${basePath}${stocksAPIPath}?portfolio=${id}&sortBy=amount&sortOrder=desc`, {
        headers: { Cookie: "id=exampleSessionID" },
      }),
      ["Apple Inc", "Taiwan Semiconductor Manufacturing Co Ltd"],
    );

    // Attempting to sort by amount without specifying a portfolio returns an error
    res = await app.request(`${basePath}${stocksAPIPath}?sortBy=amount`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(400);
    expect(body.message).toMatch("Cannot sort by amount without specifying a portfolio");

    // Attempting to read a portfolio of a different user returns an error
    res = await app.request(`${basePath}${stocksAPIPath}?portfolio=${id}`, {
      headers: { Cookie: "id=anotherExampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(403);
    expect(body.message).toMatch("does not belong to user with email address john.doe");
  },
});

(["asc", "desc"] as const).forEach((sortOrder) =>
  sortableAttributeArray.forEach(
    (sortCriterion) =>
      sortCriterion !== "amount" &&
      tests.push({
        testName: `filters and sorts stock list by ${sortCriterion} ${sortOrder}ending`,
        testFunction: async () => {
          const res = await app.request(`${basePath}${stocksAPIPath}?sortBy=${sortCriterion}&sortOrder=${sortOrder}`, {
            headers: { Cookie: "id=exampleSessionID" },
          });
          const body = await res.json();
          expect(res.status).toBe(200);
          let sortCriterionArray: readonly string[] | undefined;
          switch (sortCriterion) {
            case "size":
              sortCriterionArray = sizeArray;
              break;
            case "style":
              sortCriterionArray = styleArray;
              break;
            case "analystConsensus":
              sortCriterionArray = analystRatingArray;
              break;
            case "msciESGRating":
              sortCriterionArray = msciESGRatingArray;
              break;
            default:
              break;
          }
          const toBeSortedInTheCorrectOrder = sortOrder === "desc" ? "toBeGreaterThanOrEqual" : "toBeLessThanOrEqual";
          for (let i = 0; i < body.count - 1; i++) {
            // We do not test the sorting order of null values
            if (body.stocks[i][sortCriterion] && body.stocks[i + 1][sortCriterion]) {
              if (
                typeof body.stocks[i][sortCriterion] === "number" &&
                typeof body.stocks[i + 1][sortCriterion] === "number"
              ) {
                // Stocks should be ordered by the numeric value of the sort criterion
                expect(body.stocks[i][sortCriterion])[toBeSortedInTheCorrectOrder](body.stocks[i + 1][sortCriterion]);
              } else if (
                typeof body.stocks[i][sortCriterion] === "string" &&
                typeof body.stocks[i + 1][sortCriterion] === "string" &&
                sortCriterionArray
              ) {
                // Stocks should be ordered by the index of the enum value of the sort criterion
                expect(sortCriterionArray.indexOf(body.stocks[i][sortCriterion]))[toBeSortedInTheCorrectOrder](
                  sortCriterionArray.indexOf(body.stocks[i + 1][sortCriterion]),
                );
              } else {
                if (
                  String.prototype
                    .concat(body.stocks[i][sortCriterion], body.stocks[i + 1][sortCriterion])
                    .split("")
                    .some((c) => c.charCodeAt(0) > 127 || c.charCodeAt(0) === 95)
                ) {
                  // If one value contains a special character or underscore, we skip sorting validation
                  continue;
                }
                // Stocks should be ordered alphabetically
                expect(body.stocks[i][sortCriterion].localeCompare(body.stocks[i + 1][sortCriterion]))[
                  toBeSortedInTheCorrectOrder
                ](0);
              }
            }
          }
        },
      }),
  ),
);

tests.push({
  testName: "supports pagination",
  testFunction: async () => {
    const resAllStocks = await app.request(`${basePath}${stocksAPIPath}?sortBy=name`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    const bodyAllStocks = await resAllStocks.json();
    expect(resAllStocks.status).toBe(200);
    expect(bodyAllStocks.count).toBe(11);
    expect(bodyAllStocks.stocks).toHaveLength(11);
    const resPagination = await app.request(`${basePath}${stocksAPIPath}?sortBy=name&offset=5&count=5`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    const bodyPagination = await resPagination.json();
    expect(bodyPagination.stocks[0].name).toBe(bodyAllStocks.stocks[5].name);
    expect(bodyPagination.stocks[4].name).toBe(bodyAllStocks.stocks[9].name);
    expect(bodyPagination.stocks).toHaveLength(5);
  },
});

tests.push({
  testName: "[unsafe] provides stock logos",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${stocksAPIPath}/AAPL${stockLogoEndpointSuffix}?variant=light`);
    let res = await app.request(`${basePath}${stocksAPIPath}/AAPL${stockLogoEndpointSuffix}?variant=light`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    let body = await res.text();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch("image/svg+xml");
    // Check max-age header, should be approximately 1 month
    expect(res.headers.get("cache-control")).toMatch(/max-age=\d+/);
    expect(Number(res.headers.get("cache-control")!.replace(/max-age=(\d+)/, "$1"))).toBeCloseTo(2592000, -1);
    expect(body).toMatch(
      '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">',
    );
    expect(body).toMatch('<circle cx="20" cy="20" r="15" fill="#2971D6"/>');
    expect(body).toMatch("</svg>");

    // This stock’s logo response is mocked to not include a Cache-Control header
    res = await app.request(`${basePath}${stocksAPIPath}/TSM${stockLogoEndpointSuffix}?variant=light`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    body = await res.text();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch("image/svg+xml");
    // Check max-age header, should be approximately 1 week
    expect(res.headers.get("cache-control")).toMatch(/max-age=\d+/);
    expect(Number(res.headers.get("cache-control")!.replace(/max-age=(\d+)/, "$1"))).toBeCloseTo(604800, -1);
    expect(body).toMatch(
      '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">',
    );
    expect(body).toMatch('<circle cx="20" cy="20" r="15" fill="#2971D6"/>');
    expect(body).toMatch("</svg>");

    // attempting to read the logo of a stock for which no logo exists returns an empty SVG file
    res = await app.request(`${basePath}${stocksAPIPath}/_NULL${stockLogoEndpointSuffix}?variant=dark`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    body = await res.text();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch("image/svg+xml");
    // Check max-age header, should be close to 1 hour
    expect(res.headers.get("cache-control")).toMatch(/max-age=\d+/);
    expect(res.headers.get("cache-control")!.replace(/max-age=(\d+)/, "$1")).toBeCloseTo(3600, -1);
    expect(body).toMatch(
      '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>',
    );

    // attempting to read a non-existent stock’s logo results in an error
    res = await app.request(`${basePath}${stocksAPIPath}/DOESNOTEXIST${stockLogoEndpointSuffix}?variant=light`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] creates a stock",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${stocksAPIPath}/NEWSTOCK`, "PUT");
    await expectSpecialAccessRightsToBeRequired(`${basePath}${stocksAPIPath}/NEWSTOCK`, "PUT");
    let res = await app.request(`${basePath}${stocksAPIPath}/NEWSTOCK`, {
      method: "PUT",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ name: "New Stock", country: "GB", isin: "GB0987654321" }),
    });
    expect(res.status).toBe(201);
    await expectStockListLengthToBe(12);
    res = await app.request(`${basePath}${stocksAPIPath}?q=${encodeURIComponent("New Stock")}`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    const body = await res.json();
    expect(body.stocks).toHaveLength(1);
    expect(body.stocks[0].ticker).toBe("NEWSTOCK");
    expect(body.stocks[0].name).toBe("New Stock");
    expect(body.stocks[0].country).toBe("GB");

    // attempting to create the same stock again results in an error
    res = await app.request(`${basePath}${stocksAPIPath}/NEWSTOCK`, {
      method: "PUT",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ name: "New Stock", country: "GB", isin: "GB0987654321" }),
    });
    expect(res.status).toBe(409);
    await expectStockListLengthToBe(12);
  },
});

tests.push({
  testName: "reads a stock",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${stocksAPIPath}/AAPL`);
    let res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toEqual("Apple Inc");

    // If a previous ETag is referenced in the If-None-Match header that matches the previous response, we should
    // receive a Not Modified response indicating that the response is identical to the one cached by the client.
    const eTag = res.headers.get("etag")!;
    res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, {
      headers: { Cookie: "id=exampleSessionID", "If-None-Match": eTag },
    });
    expect(res.status).toBe(304);

    // attempting to read a non-existent stock results in an error
    res = await app.request(`${basePath}${stocksAPIPath}/DOESNOTEXIST`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] updates a stock",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${stocksAPIPath}/AAPL`, "PATCH");
    await expectSpecialAccessRightsToBeRequired(`${basePath}${stocksAPIPath}/AAPL`, "PATCH");
    let res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ morningstarID: "0P01234567", name: "Apple Inc" }),
    });
    expect(res.status).toBe(204);
    res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, { headers: { Cookie: "id=exampleSessionID" } });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toEqual("Apple Inc");
    expect(body.morningstarID).toEqual("0P01234567");

    // sending an update with the same information results in no changes
    res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ morningstarID: "0P01234567" }),
    });
    expect(res.status).toBe(204);
    res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, { headers: { Cookie: "id=exampleSessionID" } });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toEqual("Apple Inc");
    expect(body.morningstarID).toEqual("0P01234567");

    // sending an update without anything results in no changes
    res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(204);
    res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, { headers: { Cookie: "id=exampleSessionID" } });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toEqual("Apple Inc");
    expect(body.morningstarID).toEqual("0P01234567");

    // attempting to update a non-existent stock results in an error
    res = await app.request(`${basePath}${stocksAPIPath}/DOESNOTEXIST`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ morningstarID: "0P01234567" }),
    });
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] updates a stock’s ticker",
  testFunction: async () => {
    let res = await app.request(`${basePath}${stocksAPIPath}/ALV.DE`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ ticker: "ALV2.DE" }),
    });
    expect(res.status).toBe(204);
    res = await app.request(`${basePath}${stocksAPIPath}/ALV2.DE`, { headers: { Cookie: "id=exampleSessionID" } });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ticker).toEqual("ALV2.DE");
    expect(body.name).toEqual("Allianz SE");

    // Now we indicate with an underscore prefix that no price information is available:
    res = await app.request(`${basePath}${stocksAPIPath}/ALV2.DE`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ ticker: "_ALV2.DE" }),
    });
    expect(res.status).toBe(204);
    res = await app.request(`${basePath}${stocksAPIPath}/_ALV2.DE`, { headers: { Cookie: "id=exampleSessionID" } });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ticker).toEqual("_ALV2.DE");
    expect(body.name).toEqual("Allianz SE");
    expect(body.currency).toBeNull();
    expect(body.lastClose).toBeNull();
    expect(body.low52w).toBeNull();
    expect(body.high52w).toBeNull();
    expect(body.prices1y).toHaveLength(0);
    expect(body.prices1mo).toHaveLength(0);
  },
});

tests.push({
  testName: "[unsafe] updates a stock’s Morningstar ID to `null`",
  testFunction: async () => {
    let res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ morningstarID: null }),
    });
    expect(res.status).toBe(204);
    res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toEqual("Apple Inc");
    expect(body.morningstarID).toBeNull();
    // Removing a data provider’s ID removes attribute values related to it as well
    expect(body.industry).toBeNull();
    expect(body.size).toBeNull();
    expect(body.style).toBeNull();
    expect(body.starRating).toBeNull();
    expect(body.dividendYieldPercent).toBeNull();
    expect(body.priceEarningRatio).toBeNull();
    expect(body.morningstarFairValue).toBeNull();
    expect(body.morningstarFairValuePercentageToLastClose).toBeNull();
    expect(body.marketCap).toBeNull();
    expect(body.description).toBeNull();

    // Losing information is always bad:
    expect(signalMessages[0].message).toMatch("🔴");
    expect(signalMessages[0].message).not.toMatch("🟢");
  },
});

tests.push({
  testName: "[unsafe] updates a stock’s Market Screener ID to `null`",
  testFunction: async () => {
    let res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ marketScreenerID: null }),
    });
    expect(res.status).toBe(204);
    res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toEqual("Apple Inc");
    expect(body.marketScreenerID).toBeNull();
    // Removing a data provider’s ID removes attribute values related to it as well
    expect(body.analystConsensus).toBeNull();
    expect(body.analystRatings).toBeNull();
    expect(body.analystCount).toBeNull();
    expect(body.analystTargetPrice).toBeNull();

    // Losing information is always bad:
    expect(signalMessages[0].message).toMatch("🔴");
    expect(signalMessages[0].message).not.toMatch("🟢");
  },
});

tests.push({
  testName: "[unsafe] updates a stock’s MSCI ID to `null`",
  testFunction: async () => {
    let res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ msciID: null }),
    });
    expect(res.status).toBe(204);
    res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toEqual("Apple Inc");
    expect(body.msciID).toBeNull();
    // Removing a data provider’s ID removes attribute values related to it as well
    expect(body.msciESGRating).toBeNull();
    expect(body.msciTemperature).toBeNull();

    // Losing information is always bad:
    expect(signalMessages[0].message).toMatch("🔴");
    expect(signalMessages[0].message).not.toMatch("🟢");
  },
});

tests.push({
  testName: "[unsafe] updates a stock’s RIC to `null`",
  testFunction: async () => {
    let res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ ric: null }),
    });
    expect(res.status).toBe(204);
    res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toEqual("Apple Inc");
    expect(body.ric).toBeNull();
    // Removing a data provider’s ID removes attribute values related to it as well
    expect(body.lsegESGScore).toBeNull();
    expect(body.lsegEmissions).toBeNull();

    // Losing information is always bad:
    expect(signalMessages[0].message).toMatch("🔴");
    expect(signalMessages[0].message).not.toMatch("🟢");
  },
});

tests.push({
  testName: "[unsafe] updates a stock’s S&P ID to `null`",
  testFunction: async () => {
    let res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ spID: null }),
    });
    expect(res.status).toBe(204);
    res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toEqual("Apple Inc");
    expect(body.spID).toBeNull();
    // Removing a data provider’s ID removes attribute values related to it as well
    expect(body.spESGScore).toBeNull();

    // Losing information is always bad:
    expect(signalMessages[0].message).toMatch("🔴");
    expect(signalMessages[0].message).not.toMatch("🟢");
  },
});

tests.push({
  testName: "[unsafe] updates a stock’s Sustainalytics ID to `null`",
  testFunction: async () => {
    let res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ sustainalyticsID: null }),
    });
    expect(res.status).toBe(204);
    res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toEqual("Apple Inc");
    expect(body.sustainalyticsID).toBeNull();
    // Removing a data provider’s ID removes attribute values related to it as well
    expect(body.sustainalyticsESGRisk).toBeNull();

    // Losing information is always bad:
    expect(signalMessages[0].message).toMatch("🔴");
    expect(signalMessages[0].message).not.toMatch("🟢");
  },
});

tests.push({
  testName: "[unsafe] deletes a stock",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${stocksAPIPath}/AAPL`, "DELETE");
    await expectSpecialAccessRightsToBeRequired(`${basePath}${stocksAPIPath}/AAPL`, "DELETE");

    // Delete the stock
    let res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);
    const stocks = await expectStockListLengthToBe(10);
    expect(stocks.find((stock) => stock.ticker === "AAPL")).toBeUndefined();

    // Deleting the same stock again does not return an error
    res = await app.request(`${basePath}${stocksAPIPath}/AAPL`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);
  },
});
