import type { PortfolioSummary, Stock } from "@rating-tracker/commons";
import { baseURL, stocksEndpointPath, portfoliosEndpointPath } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { supertest } from "../../test/liveTestHelpers";

export const suiteName = "Portfolios API";

export const tests: LiveTestSuite = [];

const getPortfolioID = async (name: string): Promise<number> => {
  // Get the ID of the portfolio from the summary
  const res = await supertest.get(`${baseURL}${portfoliosEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
  expect(res.status).toBe(200);
  const { id } = res.body.find((portfolioSummary: PortfolioSummary) => portfolioSummary.name === name);
  return id;
};

tests.push({
  testName: "reads a summary of all portfolios",
  testFunction: async () => {
    const res = await supertest
      .get(`${baseURL}${portfoliosEndpointPath}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].name).toBe("My Portfolio");
    expect(res.body[1].name).toBe("Min portefølje");
    expect(res.body[0].currency).toBe("USD");
    expect(res.body[1].currency).toBe("DKK");

    // The summary does not contain the full stock objects
    expect(res.body[0].stocks[0].ticker).toBe("exampleAAPL");
    expect(res.body[0].stocks[0].amount).toEqual(120);
    expect(Object.entries(res.body[0].stocks[0])).toHaveLength(2);
  },
});

tests.push({
  testName: "reads a portfolio",
  testFunction: async () => {
    // Get the ID of the portfolio from the summary
    const id = await getPortfolioID("Min portefølje");

    let res = await supertest
      .get(`${baseURL}${portfoliosEndpointPath}/${id}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Min portefølje");
    expect(res.body.stocks.length).toBe(2);
    expect(res.body.stocks[0].name).toBe("Novo Nordisk A/S");
    expect(res.body.stocks[1].name).toBe("Ørsted A/S");

    // The unnecessary portfolio ID on every stock is not leaked here
    expect(res.body.stocks[0].portfolioID).toBeUndefined();

    // Attempting to read a list of a different user returns an error
    res = await supertest
      .get(`${baseURL}${portfoliosEndpointPath}/${id}`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch("does not belong to user with email address john.doe");
  },
});

tests.push({
  testName: "[unsafe] creates a portfolio",
  testFunction: async () => {
    // We cannot create a portfolio without a currency
    let res = await supertest
      .put(`${baseURL}${portfoliosEndpointPath}?name=${encodeURIComponent("Mon Portefeuille")}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);

    res = await supertest
      .put(`${baseURL}${portfoliosEndpointPath}?name=${encodeURIComponent("Mon Portefeuille")}&currency=EUR`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(201);
    const { id } = res.body;

    res = await supertest
      .get(`${baseURL}${portfoliosEndpointPath}/${id}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Mon Portefeuille");
    expect(res.body.currency).toBe("EUR");
    expect(res.body.stocks.length).toBe(0);
  },
});

tests.push({
  testName: "[unsafe] updates a portfolio",
  testFunction: async () => {
    // Get the ID of the portfolio from the summary
    let res = await supertest.get(`${baseURL}${portfoliosEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    const { id, subscribed } = res.body.find(
      (portfolioSummary: PortfolioSummary) => portfolioSummary.name === "Min portefølje",
    );
    expect(subscribed).toBeFalsy();

    // Update the portfolio
    res = await supertest
      .patch(`${baseURL}${portfoliosEndpointPath}/${id}?name=Mein%20Portfolio&currency=EUR`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Updating the portfolio again does not return an error
    res = await supertest
      .patch(`${baseURL}${portfoliosEndpointPath}/${id}?name=Mein%20Portfolio&currency=EUR`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Not sending any update information is meaningless but valid
    res = await supertest
      .patch(`${baseURL}${portfoliosEndpointPath}/${id}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Check that the portfolio has been updated
    res = await supertest
      .get(`${baseURL}${portfoliosEndpointPath}/${id}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Mein Portfolio");
    expect(res.body.currency).toBe("EUR");

    // Attempting to update a list of a different user returns an error
    res = await supertest
      .patch(`${baseURL}${portfoliosEndpointPath}/${id}?name=This%20should%20not%20work`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch("does not belong to user with email address john.doe");

    // Attempting to update a non-existent list returns an error
    res = await supertest
      .patch(`${baseURL}${portfoliosEndpointPath}/-1?name=This%20should%20not%20work`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("Portfolio -1 not found.");
  },
});

tests.push({
  testName: "[unsafe] adds a stock to a portfolio",
  testFunction: async () => {
    // Get the ID of the portfolio from the summary
    const id = await getPortfolioID("Min portefølje");

    // Stocks in portfolios must have an amount
    let res = await supertest
      .put(`${baseURL}${portfoliosEndpointPath}/${id}${stocksEndpointPath}/exampleALV`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);

    // Add a stock to the portfolio
    res = await supertest
      .put(`${baseURL}${portfoliosEndpointPath}/${id}${stocksEndpointPath}/exampleALV?amount=2000`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Adding the same stock again results in a conflict
    res = await supertest
      .put(`${baseURL}${portfoliosEndpointPath}/${id}${stocksEndpointPath}/exampleALV?amount=2000`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(409);

    // Check that the stock has been added
    res = await supertest
      .get(`${baseURL}${portfoliosEndpointPath}/${id}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.stocks.length).toBe(3);
    expect(res.body.stocks[0].name).toBe("Allianz SE");
    expect(res.body.stocks[1].name).toBe("Novo Nordisk A/S");
    expect(res.body.stocks[2].name).toBe("Ørsted A/S");

    // Attempting to update a list of a different user returns an error
    res = await supertest
      .put(`${baseURL}${portfoliosEndpointPath}/${id}${stocksEndpointPath}/exampleALV?amount=2000`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch("does not belong to user with email address john.doe");

    // Attempting to add a stock to a non-existent list returns an error
    res = await supertest
      .put(`${baseURL}${portfoliosEndpointPath}/-1${stocksEndpointPath}/exampleALV?amount=2000`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("Portfolio -1 not found.");

    // Attempting to add a non-existent stock returns an error
    res = await supertest
      .put(`${baseURL}${portfoliosEndpointPath}/${id}${stocksEndpointPath}/doesNotExist?amount=1234`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("Stock doesNotExist not found.");
  },
});

tests.push({
  testName: "[unsafe] updates a stock in a portfolio",
  testFunction: async () => {
    // Get the ID of the portfolio from the summary
    const id = await getPortfolioID("My Portfolio");

    // Update a stock in the portfolio
    let res = await supertest
      .patch(`${baseURL}${portfoliosEndpointPath}/${id}${stocksEndpointPath}/exampleTSM?amount=180`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Updating the stock in the portfolio again does not return an error
    res = await supertest
      .patch(`${baseURL}${portfoliosEndpointPath}/${id}${stocksEndpointPath}/exampleTSM?amount=180`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Not sending any update information is meaningless but valid
    res = await supertest
      .patch(`${baseURL}${portfoliosEndpointPath}/${id}${stocksEndpointPath}/exampleTSM`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Check that the stock in the portfolio has been updated
    res = await supertest
      .get(`${baseURL}${portfoliosEndpointPath}/${id}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.stocks.find((stock: Stock) => stock.ticker === "exampleTSM").amount).toBe(180);

    // Attempting to update a portfolio of a different user returns an error
    res = await supertest
      .patch(`${baseURL}${portfoliosEndpointPath}/${id}${stocksEndpointPath}/exampleTSM?amount=180`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch("does not belong to user with email address john.doe");

    // Attempting to update a stock in a non-existent portfolio returns an error
    res = await supertest
      .patch(`${baseURL}${portfoliosEndpointPath}/-1${stocksEndpointPath}/exampleTSM?amount=180`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("Portfolio -1 not found.");

    // Attempting to update an existing stock that is not in the portfolio returns an error
    res = await supertest
      .patch(`${baseURL}${portfoliosEndpointPath}/${id}${stocksEndpointPath}/exampleMELI?amount=1200`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("Stock exampleMELI is not in portfolio My Portfolio.");

    // Attempting to update a non-existent stock returns an error
    res = await supertest
      .patch(`${baseURL}${portfoliosEndpointPath}/${id}${stocksEndpointPath}/doesNotExist?amount=180`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("Stock doesNotExist not found.");
  },
});

tests.push({
  testName: "[unsafe] removes a stock from a portfolio",
  testFunction: async () => {
    // Get the ID of the portfolio from the summary
    const id = await getPortfolioID("Min portefølje");

    // Remove a stock from the portfolio
    let res = await supertest
      .delete(`${baseURL}${portfoliosEndpointPath}/${id}${stocksEndpointPath}/exampleNOVO%20B`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Removing the same stock again results in an error
    res = await supertest
      .delete(`${baseURL}${portfoliosEndpointPath}/${id}${stocksEndpointPath}/exampleNOVO%20B`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);

    // Check that the stock has been removed
    res = await supertest
      .get(`${baseURL}${portfoliosEndpointPath}/${id}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.stocks.length).toBe(1);
    expect(res.body.stocks[0].name).toBe("Ørsted A/S");

    // Attempting to update a list of a different user returns an error
    res = await supertest
      .delete(`${baseURL}${portfoliosEndpointPath}/${id}${stocksEndpointPath}/exampleNOVO%20B`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch("does not belong to user with email address john.doe");

    // Attempting to remove a stock from a non-existent list returns an error
    res = await supertest
      .delete(`${baseURL}${portfoliosEndpointPath}/-1${stocksEndpointPath}/exampleNOVO%20B`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("Portfolio -1 not found.");

    // Attempting to remove a non-existent stock returns an error
    res = await supertest
      .delete(`${baseURL}${portfoliosEndpointPath}/${id}${stocksEndpointPath}/doesNotExist`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("Stock doesNotExist is not in portfolio Min portefølje.");
  },
});

tests.push({
  testName: "[unsafe] deletes a portfolio",
  testFunction: async () => {
    // Get the ID of the portfolio from the summary
    const id = await getPortfolioID("Min portefølje");

    // Delete the portfolio
    let res = await supertest
      .delete(`${baseURL}${portfoliosEndpointPath}/${id}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Attempting to read the deleted portfolio returns an error
    res = await supertest
      .get(`${baseURL}${portfoliosEndpointPath}/${id}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);

    // A portfolio witht that name is no longer in the summary
    res = await supertest.get(`${baseURL}${portfoliosEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(
      res.body.find((portfolioSummary: PortfolioSummary) => portfolioSummary.name === "Min portefølje"),
    ).toBeUndefined();
  },
});
