import type { Stock, WatchlistSummary, PortfolioSummary } from "@rating-tracker/commons";
import {
  baseURL,
  msciESGRatingArray,
  sizeArray,
  sortableAttributeArray,
  stocksAPIPath,
  logoBackgroundAPIPath,
  stockLogoEndpointSuffix,
  styleArray,
  watchlistsAPIPath,
  portfoliosAPIPath,
  analystRatingArray,
} from "@rating-tracker/commons";
import type { Response } from "supertest";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import {
  expectRouteToBePrivate,
  expectSpecialAccessRightsToBeRequired,
  expectStockListLengthToBe,
  supertest,
} from "../../test/liveTestHelpers";
import client from "../db/client";
import { sentMessages } from "../signal/__mocks__/signalBase";

export const suiteName = "Stocks API";

export const tests: LiveTestSuite = [];

/**
 * Checks a response for the presence of stocks of the given name in the specified order.
 * @param res The response to check.
 * @param stockNames The names of the stocks to check for.
 */
const expectStocksToBePresent = (res: Response, stockNames: string[]) => {
  expect(res.status).toBe(200);
  expect(res.body.count).toBe(stockNames.length);
  expect(res.body.stocks).toHaveLength(stockNames.length);
  stockNames.forEach((stockName, index) => {
    expect(res.body.stocks[index].name).toMatch(stockName);
  });
};

tests.push({
  testName: "returns a list of stocks",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${stocksAPIPath}`);
    const res = await supertest.get(`${baseURL}${stocksAPIPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(11);
    expect(res.body.stocks).toHaveLength(11);
    expect((res.body.stocks as Stock[]).find((stock) => stock.ticker === "exampleAAPL").name).toMatch("Apple");
  },
});

tests.push({
  testName: "[unsafe] computes correct scores",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${stocksAPIPath}`, supertest.patch);

    // Write incorrect score directly into the database
    await client.stock.update({ where: { ticker: "exampleAAPL" }, data: { totalScore: 0 } });

    let res = await supertest
      .get(`${baseURL}${stocksAPIPath}/exampleAAPL`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).totalScore).toBe(0);

    // Fix the incorrect score by recomputing
    res = await supertest.patch(`${baseURL}${stocksAPIPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Now the score does not hold an incorrect value
    res = await supertest.get(`${baseURL}${stocksAPIPath}/exampleAAPL`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).totalScore).not.toBe(0);
  },
});

tests.push({
  testName: "filters and sorts stock list – example 1",
  testFunction: async () => {
    expectStocksToBePresent(
      await supertest
        .get(`${baseURL}${stocksAPIPath}?size=Large&style=Growth&sortBy=name&sortDesc=true`)
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Ørsted A/S", "Taiwan Semiconductor Manufacturing Co Ltd", "Novo Nordisk", "MercadoLibre", "Apple"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 2",
  testFunction: async () => {
    expectStocksToBePresent(
      await supertest
        .get(`${baseURL}${stocksAPIPath}?country=US&sortBy=size`)
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Newmont", "Apple"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 3",
  testFunction: async () => {
    expectStocksToBePresent(
      await supertest
        .get(`${baseURL}${stocksAPIPath}?country=US&sortBy=style&sortDesc=true`)
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Apple", "Newmont"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 4",
  testFunction: async () => {
    expectStocksToBePresent(
      await supertest
        .get(`${baseURL}${stocksAPIPath}?industry=Semiconductors&name=Semiconductor`)
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Taiwan Semiconductor Manufacturing Co Ltd"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 5",
  testFunction: async () => {
    expectStocksToBePresent(
      await supertest
        .get(`${baseURL}${stocksAPIPath}?starRatingMin=3&starRatingMax=4&sortBy=name`)
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Allianz", "Danone", "Iberdrola", "MercadoLibre"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 6",
  testFunction: async () => {
    expectStocksToBePresent(
      await supertest
        .get(`${baseURL}${stocksAPIPath}?dividendYieldPercentMin=1.5&dividendYieldPercentMax=5&sortBy=name`)
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Danone", "Iberdrola", "Newmont", "Taiwan Semiconductor Manufacturing Co Ltd", "Ørsted A/S"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 7",
  testFunction: async () => {
    expectStocksToBePresent(
      await supertest
        .get(`${baseURL}${stocksAPIPath}?priceEarningRatioMin=10&priceEarningRatioMax=20&sortBy=name`)
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Allianz", "Iberdrola", "Taiwan Semiconductor Manufacturing Co Ltd", "Ørsted A/S"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 8",
  testFunction: async () => {
    expectStocksToBePresent(
      await supertest
        .get(
          `${baseURL}${stocksAPIPath}` + "?morningstarFairValueDiffMin=-30&morningstarFairValueDiffMax=10&sortBy=name",
        )
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Allianz", "Apple", "Danone", "Iberdrola", "MercadoLibre", "Newmont", "Ørsted A/S"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 9",
  testFunction: async () => {
    expectStocksToBePresent(
      await supertest
        .get(
          `${baseURL}${stocksAPIPath}?analystConsensusMin=Outperform&analystConsensusMax=Outperform` +
            "&analystCountMin=25&analystCountMax=40&sortBy=name",
        )
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Novo Nordisk"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 10",
  testFunction: async () => {
    expectStocksToBePresent(
      await supertest
        .get(`${baseURL}${stocksAPIPath}?analystTargetDiffMin=-20&analystTargetDiffMax=10&sortBy=name`)
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Allianz", "Danone", "Iberdrola", "Newmont", "Novo Nordisk"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 11",
  testFunction: async () => {
    expectStocksToBePresent(
      await supertest
        .get(`${baseURL}${stocksAPIPath}?msciESGRatingMin=AA&msciESGRatingMax=A&sortBy=name`)
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Allianz", "MercadoLibre", "Newmont"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 12",
  testFunction: async () => {
    expectStocksToBePresent(
      await supertest
        .get(
          `${baseURL}${stocksAPIPath}` +
            "?msciESGRatingMax=AAA&msciTemperatureMin=1.5&msciTemperatureMax=1.8&sortBy=name",
        )
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Iberdrola", "Taiwan Semiconductor Manufacturing Co Ltd", "Ørsted A/S"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 13",
  testFunction: async () => {
    expectStocksToBePresent(
      await supertest
        .get(
          `${baseURL}${stocksAPIPath}?lsegESGScoreMin=70&lsegESGScoreMax=80&` +
            "lsegEmissionsMin=80&lsegEmissionsMax=90&sortBy=name",
        )
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Ørsted A/S"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 14",
  testFunction: async () => {
    expectStocksToBePresent(
      await supertest
        .get(
          `${baseURL}${stocksAPIPath}?spESGScoreMin=50&spESGScoreMax=85` +
            "&sustainalyticsESGRiskMin=15&sustainalyticsESGRiskMax=25&sortBy=name",
        )
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Newmont", "Novo Nordisk"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 15",
  testFunction: async () => {
    expectStocksToBePresent(
      await supertest
        .get(
          `${baseURL}${stocksAPIPath}?financialScoreMin=0&financialScoreMax=50&esgScoreMin=40&esgScoreMax=60` +
            "&sortBy=name",
        )
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Danone", "Newmont"],
    );
  },
});

tests.push({
  testName: "filters and sorts stock list – example 16",
  testFunction: async () => {
    const res = await supertest
      .get(`${baseURL}${stocksAPIPath}?totalScoreMin=30&totalScoreMax=60&sortBy=name`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(5);
    expect(res.body.stocks).toHaveLength(5);
    expect(res.body.stocks[0].name).toMatch("Allianz");
    expect(res.body.stocks[1].name).toMatch("Danone");
    expect(res.body.stocks[2].name).toMatch("Kion");
    expect(res.body.stocks[3].name).toMatch("Newmont");
    expect(res.body.stocks[4].name).toMatch("Ørsted");
  },
});

tests.push({
  testName: "filters and sorts stock list – example 17",
  testFunction: async () => {
    const res = await supertest
      .get(`${baseURL}${stocksAPIPath}?name=US0378331005`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.stocks).toHaveLength(1);
    expect(res.body.stocks[0].name).toMatch("Apple");
  },
});

tests.push({
  testName: "filters and sorts stock list – example 18",
  testFunction: async () => {
    const res = await supertest
      .get(`${baseURL}${stocksAPIPath}?isin=US0378331005`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.stocks).toHaveLength(1);
    expect(res.body.stocks[0].name).toMatch("Apple");
  },
});

tests.push({
  testName: "filters and sorts stock list – stocks in watchlist",
  testFunction: async () => {
    // Get the ID of the watchlist from the summary
    let res = await supertest.get(`${baseURL}${watchlistsAPIPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    const { id } = res.body.find((watchlistSummary: WatchlistSummary) => watchlistSummary.name === "Fævørites");

    expectStocksToBePresent(
      await supertest
        .get(`${baseURL}${stocksAPIPath}?watchlist=${id}&sortBy=name`)
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Novo Nordisk A/S", "Ørsted A/S"],
    );

    // Attempting to read a watchlist of a different user returns an error
    res = await supertest
      .get(`${baseURL}${stocksAPIPath}?watchlist=${id}`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch("does not belong to user with email address john.doe");
  },
});

tests.push({
  testName: "filters and sorts stock list – stocks in portfolio",
  testFunction: async () => {
    // Get the ID of the portfolio from the summary
    let res = await supertest.get(`${baseURL}${portfoliosAPIPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    const { id } = res.body.find((portfolioSummary: PortfolioSummary) => portfolioSummary.name === "My Portfolio");

    expectStocksToBePresent(
      await supertest
        .get(`${baseURL}${stocksAPIPath}?portfolio=${id}&sortBy=amount&sortDesc=true`)
        .set("Cookie", ["authToken=exampleSessionID"]),
      ["Apple Inc", "Taiwan Semiconductor Manufacturing Co Ltd"],
    );

    // Attempting to sort by amount without specifying a portfolio returns an error
    res = await supertest.get(`${baseURL}${stocksAPIPath}?sortBy=amount`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch("Cannot sort by amount without specifying a portfolio");

    // Attempting to read a portfolio of a different user returns an error
    res = await supertest
      .get(`${baseURL}${stocksAPIPath}?portfolio=${id}`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch("does not belong to user with email address john.doe");
  },
});

[false, true].forEach((sortDesc) =>
  sortableAttributeArray.forEach(
    (sortCriterion) =>
      sortCriterion !== "amount" &&
      tests.push({
        testName: `filters and sorts stock list by ${sortCriterion} ${sortDesc ? "descending" : "ascending"}`,
        testFunction: async () => {
          const res = await supertest
            .get(`${baseURL}${stocksAPIPath}?sortBy=${sortCriterion}&sortDesc=${sortDesc}`)
            .set("Cookie", ["authToken=exampleSessionID"]);
          expect(res.status).toBe(200);
          let sortCriterionArray: readonly string[];
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
          const toBeSortedInTheCorrectOrder = sortDesc ? "toBeGreaterThanOrEqual" : "toBeLessThanOrEqual";
          for (let i = 0; i < res.body.count - 1; i++) {
            // We do not test the sorting order of null values
            if (res.body.stocks[i][sortCriterion] && res.body.stocks[i + 1][sortCriterion]) {
              if (
                typeof res.body.stocks[i][sortCriterion] === "number" &&
                typeof res.body.stocks[i + 1][sortCriterion] === "number"
              ) {
                // Stocks should be ordered by the numeric value of the sort criterion
                expect(res.body.stocks[i][sortCriterion])[toBeSortedInTheCorrectOrder](
                  res.body.stocks[i + 1][sortCriterion],
                );
              } else if (
                typeof res.body.stocks[i][sortCriterion] === "string" &&
                typeof res.body.stocks[i + 1][sortCriterion] === "string" &&
                sortCriterionArray
              ) {
                // Stocks should be ordered by the index of the enum value of the sort criterion
                expect(sortCriterionArray.indexOf(res.body.stocks[i][sortCriterion]))[toBeSortedInTheCorrectOrder](
                  sortCriterionArray.indexOf(res.body.stocks[i + 1][sortCriterion]),
                );
              } else {
                if (
                  String.prototype
                    .concat(res.body.stocks[i][sortCriterion], res.body.stocks[i + 1][sortCriterion])
                    .split("")
                    .some((c) => c.charCodeAt(0) > 127)
                ) {
                  // If one value contains a special character, we skip sorting validation
                  continue;
                }
                // Stocks should be ordered alphabetically
                expect(res.body.stocks[i][sortCriterion].localeCompare(res.body.stocks[i + 1][sortCriterion]))[
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
    const resAllStocks = await supertest
      .get(`${baseURL}${stocksAPIPath}?sortBy=name`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(resAllStocks.status).toBe(200);
    expect(resAllStocks.body.count).toBe(11);
    expect(resAllStocks.body.stocks).toHaveLength(11);
    const resPagination = await supertest
      .get(`${baseURL}${stocksAPIPath}?sortBy=name&offset=5&count=5`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(resPagination.body.stocks[0].name).toBe(resAllStocks.body.stocks[5].name);
    expect(resPagination.body.stocks[4].name).toBe(resAllStocks.body.stocks[9].name);
    expect(resPagination.body.stocks).toHaveLength(5);
  },
});

tests.push({
  testName: "[unsafe] provides stock logos",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${stocksAPIPath}/exampleAAPL${stockLogoEndpointSuffix}`);
    let res = await supertest
      .get(`${baseURL}${stocksAPIPath}/exampleAAPL${stockLogoEndpointSuffix}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch("image/svg+xml");
    // Check max-age header, should be smaller than 1 day
    expect(res.headers["cache-control"]).toMatch(/max-age=\d+/);
    expect(Number(res.headers["cache-control"].replace(/max-age=(\d+)/, "$1"))).toBeLessThanOrEqual(86400);
    expect(res.body.toString()).toMatch(
      '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">',
    );
    expect(res.body.toString()).toMatch('<circle cx="20" cy="20" r="15" fill="#2971D6"/>');
    expect(res.body.toString()).toMatch("</svg>");

    // This stock’s logo response is mocked to not include a Cache-Control header
    res = await supertest
      .get(`${baseURL}${stocksAPIPath}/exampleTSM${stockLogoEndpointSuffix}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch("image/svg+xml");
    // Check max-age header, should be exactly 1 day
    expect(res.headers["cache-control"]).toMatch(/max-age=\d+/);
    expect(Number(res.headers["cache-control"].replace(/max-age=(\d+)/, "$1"))).toEqual(86400);
    expect(res.body.toString()).toMatch(
      '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">',
    );
    expect(res.body.toString()).toMatch('<circle cx="20" cy="20" r="15" fill="#2971D6"/>');
    expect(res.body.toString()).toMatch("</svg>");

    // attempting to read the logo of a stock for which no logo exists returns an empty SVG file
    res = await supertest
      .get(`${baseURL}${stocksAPIPath}/exampleNULL${stockLogoEndpointSuffix}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch("image/svg+xml");
    // Check max-age header, should be close to 1 hour
    expect(res.headers["cache-control"]).toMatch(/max-age=\d+/);
    expect(res.headers["cache-control"].replace(/max-age=(\d+)/, "$1")).toBeCloseTo(3600, -1);
    expect(res.body.toString()).toMatch(
      '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>',
    );

    // attempting to read a non-existent stock’s logo results in an error
    res = await supertest
      .get(`${baseURL}${stocksAPIPath}/doesNotExist${stockLogoEndpointSuffix}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] provides stock logos for background",
  testFunction: async () => {
    let res = await supertest.get(`${baseURL}${logoBackgroundAPIPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    // Check max-age header, should be close to 1 day
    expect(res.headers["cache-control"]).toMatch(/max-age=\d+/);
    expect(res.headers["cache-control"].replace(/max-age=(\d+)/, "$1")).toBeCloseTo(604800, -1);
    // 50 logos are returned
    expect(res.body).toHaveLength(50);
    res.body.forEach((logo: string) => {
      expect(logo).toMatch(
        // Each logo is an SVG file
        '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">',
      );
    });

    // We can request a different number of logos
    res = await supertest
      .get(`${baseURL}${logoBackgroundAPIPath}?count=10`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    // 10 logos are returned
    expect(res.body).toHaveLength(10);
    res.body.forEach((logo: string) => {
      expect(logo).toMatch(
        // Each logo is an SVG file
        '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">',
      );
    });
  },
});

tests.push({
  testName: "[unsafe] creates a stock",
  testFunction: async () => {
    await expectRouteToBePrivate(
      `${baseURL}${stocksAPIPath}/NEWSTOCK?name=New%20Stock&country=GB&isin=GB0987654321`,
      supertest.put,
    );
    await expectSpecialAccessRightsToBeRequired(
      `${baseURL}${stocksAPIPath}/NEWSTOCK?name=New%20Stock&country=GB&isin=GB0987654321`,
      supertest.put,
    );
    let res = await supertest
      .put(`${baseURL}${stocksAPIPath}/NEWSTOCK?name=New%20Stock&country=GB&isin=GB0987654321`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(201);
    await expectStockListLengthToBe(12);
    res = await supertest
      .get(`${baseURL}${stocksAPIPath}?name=New%20Stock`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.body.stocks).toHaveLength(1);
    expect(res.body.stocks[0].ticker).toBe("NEWSTOCK");
    expect(res.body.stocks[0].name).toBe("New Stock");
    expect(res.body.stocks[0].country).toBe("GB");

    // attempting to create the same stock again results in an error
    res = await supertest
      .put(`${baseURL}${stocksAPIPath}/NEWSTOCK?name=New%20Stock&country=GB&isin=GB0987654321`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(409);
    await expectStockListLengthToBe(12);
  },
});

tests.push({
  testName: "reads a stock",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${stocksAPIPath}/exampleAAPL`);
    let res = await supertest
      .get(`${baseURL}${stocksAPIPath}/exampleAAPL`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");

    // If a previous ETag is referenced in the If-None-Match header that matches the previous response, we should
    // receive a Not Modified response indicating that the response is identical to the one cached by the client.
    const eTag = res.header.etag;
    res = await supertest
      .get(`${baseURL}${stocksAPIPath}/exampleAAPL`)
      .set("Cookie", ["authToken=exampleSessionID"])
      .set("If-None-Match", eTag);
    expect(res.status).toBe(304);

    // attempting to read a non-existent stock results in an error
    res = await supertest.get(`${baseURL}${stocksAPIPath}/doesNotExist`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] updates a stock",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${stocksAPIPath}/exampleAAPL`, supertest.patch);
    await expectSpecialAccessRightsToBeRequired(`${baseURL}${stocksAPIPath}/exampleAAPL`, supertest.patch);
    let res = await supertest
      .patch(`${baseURL}${stocksAPIPath}/exampleAAPL?morningstarID=0P012345678&name=Apple%20Inc`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await supertest.get(`${baseURL}${stocksAPIPath}/exampleAAPL`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");
    expect((res.body as Stock).morningstarID).toEqual("0P012345678");

    // sending an update with the same information results in no changes
    res = await supertest
      .patch(`${baseURL}${stocksAPIPath}/exampleAAPL?morningstarID=0P012345678`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await supertest.get(`${baseURL}${stocksAPIPath}/exampleAAPL`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");
    expect((res.body as Stock).morningstarID).toEqual("0P012345678");

    // sending an update without anything results in no changes
    res = await supertest.patch(`${baseURL}${stocksAPIPath}/exampleAAPL`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await supertest.get(`${baseURL}${stocksAPIPath}/exampleAAPL`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");
    expect((res.body as Stock).morningstarID).toEqual("0P012345678");

    // attempting to update a non-existent stock results in an error
    res = await supertest
      .patch(`${baseURL}${stocksAPIPath}/doesNotExist?morningstarID=0P123456789`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] updates a stock’s ticker",
  testFunction: async () => {
    let res = await supertest
      .patch(`${baseURL}${stocksAPIPath}/exampleALV?ticker=exampleALV.DE`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await supertest.get(`${baseURL}${stocksAPIPath}/exampleALV.DE`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).ticker).toEqual("exampleALV.DE");
    expect((res.body as Stock).name).toEqual("Allianz SE");

    // Now we indicate with an underscore prefix that no price information is available:
    res = await supertest
      .patch(`${baseURL}${stocksAPIPath}/exampleALV.DE?ticker=_exampleALV.DE`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await supertest
      .get(`${baseURL}${stocksAPIPath}/_exampleALV.DE`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).ticker).toEqual("_exampleALV.DE");
    expect((res.body as Stock).name).toEqual("Allianz SE");
    expect((res.body as Stock).currency).toBeNull();
    expect((res.body as Stock).lastClose).toBeNull();
    expect((res.body as Stock).low52w).toBeNull();
    expect((res.body as Stock).high52w).toBeNull();
    expect((res.body as Stock).prices1y).toHaveLength(0);
    expect((res.body as Stock).prices1mo).toHaveLength(0);
  },
});

tests.push({
  testName: "[unsafe] updates a stock’s Morningstar ID to an empty string",
  testFunction: async () => {
    let res = await supertest
      .patch(`${baseURL}${stocksAPIPath}/exampleAAPL?morningstarID=`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await supertest.get(`${baseURL}${stocksAPIPath}/exampleAAPL`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");
    expect((res.body as Stock).morningstarID).toBeNull();
    // Removing a data provider’s ID removes attribute values related to it as well
    expect((res.body as Stock).industry).toBeNull();
    expect((res.body as Stock).size).toBeNull();
    expect((res.body as Stock).style).toBeNull();
    expect((res.body as Stock).starRating).toBeNull();
    expect((res.body as Stock).dividendYieldPercent).toBeNull();
    expect((res.body as Stock).priceEarningRatio).toBeNull();
    expect((res.body as Stock).morningstarFairValue).toBeNull();
    expect((res.body as Stock).morningstarFairValuePercentageToLastClose).toBeNull();
    expect((res.body as Stock).marketCap).toBeNull();
    expect((res.body as Stock).description).toBeNull();

    // Losing information is always bad:
    expect(sentMessages[0].message).toMatch("🔴");
    expect(sentMessages[0].message).not.toMatch("🟢");
  },
});

tests.push({
  testName: "[unsafe] updates a stock’s Market Screener ID to an empty string",
  testFunction: async () => {
    let res = await supertest
      .patch(`${baseURL}${stocksAPIPath}/exampleAAPL?marketScreenerID=`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await supertest.get(`${baseURL}${stocksAPIPath}/exampleAAPL`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");
    expect((res.body as Stock).marketScreenerID).toBeNull();
    // Removing a data provider’s ID removes attribute values related to it as well
    expect((res.body as Stock).analystConsensus).toBeNull();
    expect((res.body as Stock).analystRatings).toBeNull();
    expect((res.body as Stock).analystCount).toBeNull();
    expect((res.body as Stock).analystTargetPrice).toBeNull();

    // Losing information is always bad:
    expect(sentMessages[0].message).toMatch("🔴");
    expect(sentMessages[0].message).not.toMatch("🟢");
  },
});

tests.push({
  testName: "[unsafe] updates a stock’s MSCI ID to an empty string",
  testFunction: async () => {
    let res = await supertest
      .patch(`${baseURL}${stocksAPIPath}/exampleAAPL?msciID=`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await supertest.get(`${baseURL}${stocksAPIPath}/exampleAAPL`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");
    expect((res.body as Stock).msciID).toBeNull();
    // Removing a data provider’s ID removes attribute values related to it as well
    expect((res.body as Stock).msciESGRating).toBeNull();
    expect((res.body as Stock).msciTemperature).toBeNull();

    // Losing information is always bad:
    expect(sentMessages[0].message).toMatch("🔴");
    expect(sentMessages[0].message).not.toMatch("🟢");
  },
});

tests.push({
  testName: "[unsafe] updates a stock’s RIC to an empty string",
  testFunction: async () => {
    let res = await supertest
      .patch(`${baseURL}${stocksAPIPath}/exampleAAPL?ric=`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await supertest.get(`${baseURL}${stocksAPIPath}/exampleAAPL`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");
    expect((res.body as Stock).ric).toBeNull();
    // Removing a data provider’s ID removes attribute values related to it as well
    expect((res.body as Stock).lsegESGScore).toBeNull();
    expect((res.body as Stock).lsegEmissions).toBeNull();

    // Losing information is always bad:
    expect(sentMessages[0].message).toMatch("🔴");
    expect(sentMessages[0].message).not.toMatch("🟢");
  },
});

tests.push({
  testName: "[unsafe] updates a stock’s S&P ID to an empty string",
  testFunction: async () => {
    let res = await supertest
      .patch(`${baseURL}${stocksAPIPath}/exampleAAPL?spID=`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await supertest.get(`${baseURL}${stocksAPIPath}/exampleAAPL`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");
    expect((res.body as Stock).spID).toBeNull();
    // Removing a data provider’s ID removes attribute values related to it as well
    expect((res.body as Stock).spESGScore).toBeNull();

    // Losing information is always bad:
    expect(sentMessages[0].message).toMatch("🔴");
    expect(sentMessages[0].message).not.toMatch("🟢");
  },
});

tests.push({
  testName: "[unsafe] updates a stock’s Sustainalytics ID to an empty string",
  testFunction: async () => {
    let res = await supertest
      .patch(`${baseURL}${stocksAPIPath}/exampleAAPL?sustainalyticsID=`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    res = await supertest.get(`${baseURL}${stocksAPIPath}/exampleAAPL`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect((res.body as Stock).name).toEqual("Apple Inc");
    expect((res.body as Stock).sustainalyticsID).toBeNull();
    // Removing a data provider’s ID removes attribute values related to it as well
    expect((res.body as Stock).sustainalyticsESGRisk).toBeNull();

    // Losing information is always bad:
    expect(sentMessages[0].message).toMatch("🔴");
    expect(sentMessages[0].message).not.toMatch("🟢");
  },
});

tests.push({
  testName: "[unsafe] deletes a stock",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${stocksAPIPath}/exampleAAPL`, supertest.delete);
    await expectSpecialAccessRightsToBeRequired(`${baseURL}${stocksAPIPath}/exampleAAPL`, supertest.delete);
    let res = await supertest
      .delete(`${baseURL}${stocksAPIPath}/exampleAAPL`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    const stocks = await expectStockListLengthToBe(10);
    expect(stocks.find((stock) => stock.ticker === "exampleAAPL")).toBeUndefined();

    // attempting to delete a non-existent stock returns an error
    res = await supertest
      .delete(`${baseURL}${stocksAPIPath}/exampleAAPL`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("Stock exampleAAPL not found.");
  },
});
