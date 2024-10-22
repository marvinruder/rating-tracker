import type { PortfolioSummary, Stock } from "@rating-tracker/commons";
import { basePath, stocksAPIPath, portfoliosAPIPath } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { expectRouteToBePrivate } from "../../test/liveTestHelpers";
import { app } from "../server";

export const suiteName = "Portfolios API";

export const tests: LiveTestSuite = [];

const getPortfolioID = async (name: string): Promise<number> => {
  // Get the ID of the portfolio from the summary
  const res = await app.request(`${basePath}${portfoliosAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
  const body = await res.json();
  expect(res.status).toBe(200);
  const { id } = body.find((portfolioSummary: PortfolioSummary) => portfolioSummary.name === name);
  return id;
};

tests.push({
  testName: "reads a summary of all portfolios",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${portfoliosAPIPath}`);
    const res = await app.request(`${basePath}${portfoliosAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.length).toBe(2);
    expect(body[0].name).toBe("My Portfolio");
    expect(body[1].name).toBe("Min portefølje");
    expect(body[0].currency).toBe("USD");
    expect(body[1].currency).toBe("DKK");

    // The summary does not contain the full stock objects
    expect(body[0].stocks[0].ticker).toBe("AAPL");
    expect(body[0].stocks[0].amount).toEqual(120);
    expect(Object.entries(body[0].stocks[0])).toHaveLength(2);
  },
});

tests.push({
  testName: "reads a portfolio",
  testFunction: async () => {
    // Get the ID of the portfolio from the summary
    const id = await getPortfolioID("Min portefølje");

    await expectRouteToBePrivate(`${basePath}${portfoliosAPIPath}/${id}`);
    let res = await app.request(`${basePath}${portfoliosAPIPath}/${id}`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe("Min portefølje");
    expect(body.stocks.length).toBe(2);
    expect(body.stocks[0].name).toBe("Novo Nordisk A/S");
    expect(body.stocks[1].name).toBe("Ørsted A/S");

    // The unnecessary portfolio ID on every stock is not leaked here
    expect(body.stocks[0].portfolioID).toBeUndefined();

    // Attempting to read a list of a different user returns an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}`, {
      headers: { Cookie: "id=anotherExampleSessionID" },
    });
    expect(res.status).toBe(403);
    body = await res.json();
    expect(body.message).toMatch("does not belong to user with email address john.doe");
  },
});

tests.push({
  testName: "[unsafe] creates a portfolio",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${portfoliosAPIPath}`, "PUT");
    // We cannot create a portfolio without a currency
    let res = await app.request(`${basePath}${portfoliosAPIPath}`, {
      method: "PUT",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ name: "Mon Portefeuille" }),
    });
    expect(res.status).toBe(400);

    res = await app.request(`${basePath}${portfoliosAPIPath}`, {
      method: "PUT",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ name: "Mon Portefeuille", currency: "EUR" }),
    });
    expect(res.status).toBe(201);
    const { id } = await res.json();

    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe("Mon Portefeuille");
    expect(body.currency).toBe("EUR");
    expect(body.stocks.length).toBe(0);
  },
});

tests.push({
  testName: "[unsafe] updates a portfolio",
  testFunction: async () => {
    // Get the ID of the portfolio from the summary
    let res = await app.request(`${basePath}${portfoliosAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    expect(res.status).toBe(200);
    const { id, subscribed } = (await res.json()).find(
      (portfolioSummary: PortfolioSummary) => portfolioSummary.name === "Min portefølje",
    );
    expect(subscribed).toBeFalsy();

    await expectRouteToBePrivate(`${basePath}${portfoliosAPIPath}/${id}`, "PATCH");
    // Update the portfolio
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ name: "Mein Portfolio", currency: "EUR" }),
    });
    expect(res.status).toBe(204);

    // Updating the portfolio again does not return an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ name: "Mein Portfolio", currency: "EUR" }),
    });
    expect(res.status).toBe(204);

    // Not sending any update information is meaningless but valid
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(204);

    // Check that the portfolio has been updated
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}`, { headers: { Cookie: "id=exampleSessionID" } });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe("Mein Portfolio");
    expect(body.currency).toBe("EUR");

    // Attempting to update a list of a different user returns an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=anotherExampleSessionID" },
      body: JSON.stringify({ name: "This should not work" }),
    });
    body = await res.json();
    expect(res.status).toBe(403);
    expect(body.message).toMatch("does not belong to user with email address john.doe");

    // Attempting to update a non-existent list returns an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/999`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ name: "This should not work" }),
    });
    body = await res.json();
    expect(res.status).toBe(404);
    expect(body.message).toMatch("Portfolio 999 not found.");
  },
});

tests.push({
  testName: "[unsafe] adds a stock to a portfolio",
  testFunction: async () => {
    // Get the ID of the portfolio from the summary
    const id = await getPortfolioID("Min portefølje");

    await expectRouteToBePrivate(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/ALV.DE`, "PUT");
    // Stocks in portfolios must have an amount
    let res = await app.request(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/ALV.DE`, {
      method: "PUT",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(400);

    // Add a stock to the portfolio
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/ALV.DE`, {
      method: "PUT",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ amount: 2000 }),
    });
    expect(res.status).toBe(204);

    // Adding the same stock again results in a conflict
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/ALV.DE`, {
      method: "PUT",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ amount: 2000 }),
    });
    expect(res.status).toBe(409);

    // Check that the stock has been added
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.stocks.length).toBe(3);
    expect(body.stocks[0].name).toBe("Allianz SE");
    expect(body.stocks[1].name).toBe("Novo Nordisk A/S");
    expect(body.stocks[2].name).toBe("Ørsted A/S");

    // Attempting to update a list of a different user returns an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/ALV.DE`, {
      method: "PUT",
      headers: { "content-type": "application/json", Cookie: "id=anotherExampleSessionID" },
      body: JSON.stringify({ amount: 2000 }),
    });
    body = await res.json();
    expect(res.status).toBe(403);
    expect(body.message).toMatch("does not belong to user with email address john.doe");

    // Attempting to add a stock to a non-existent list returns an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/999${stocksAPIPath}/ALV.DE`, {
      method: "PUT",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ amount: 2000 }),
    });
    body = await res.json();
    expect(res.status).toBe(404);
    expect(body.message).toMatch("Portfolio 999 not found.");

    // Attempting to add a non-existent stock returns an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/DOESNOTEXIST`, {
      method: "PUT",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ amount: 2000 }),
    });
    body = await res.json();
    expect(res.status).toBe(404);
    expect(body.message).toMatch("Stock DOESNOTEXIST not found.");
  },
});

tests.push({
  testName: "[unsafe] updates a stock in a portfolio",
  testFunction: async () => {
    // Get the ID of the portfolio from the summary
    const id = await getPortfolioID("My Portfolio");

    await expectRouteToBePrivate(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/TSM`, "PATCH");
    // Update a stock in the portfolio
    let res = await app.request(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/TSM`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ amount: 180 }),
    });
    expect(res.status).toBe(204);

    // Updating the stock in the portfolio again does not return an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/TSM`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ amount: 180 }),
    });
    expect(res.status).toBe(204);

    // Not sending any update information is meaningless but valid
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/TSM`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(204);

    // Check that the stock in the portfolio has been updated
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}`, { headers: { Cookie: "id=exampleSessionID" } });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.stocks.find((stock: Stock) => stock.ticker === "TSM").amount).toBe(180);

    // Attempting to update a portfolio of a different user returns an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/TSM`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=anotherExampleSessionID" },
      body: JSON.stringify({ amount: 180 }),
    });
    body = await res.json();
    expect(res.status).toBe(403);
    expect(body.message).toMatch("does not belong to user with email address john.doe");

    // Attempting to update a stock in a non-existent portfolio returns an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/999${stocksAPIPath}/TSM`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ amount: 180 }),
    });
    body = await res.json();
    expect(res.status).toBe(404);
    expect(body.message).toMatch("Portfolio 999 not found.");

    // Attempting to update an existing stock that is not in the portfolio returns an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/MELI`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ amount: 180 }),
    });
    body = await res.json();
    expect(res.status).toBe(404);
    expect(body.message).toMatch("Stock MELI is not in portfolio My Portfolio.");

    // Attempting to update a non-existent stock returns an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/DOESNOTEXIST`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ amount: 180 }),
    });
    body = await res.json();
    expect(res.status).toBe(404);
    expect(body.message).toMatch("Stock DOESNOTEXIST not found.");
  },
});

tests.push({
  testName: "[unsafe] removes a stock from a portfolio",
  testFunction: async () => {
    // Get the ID of the portfolio from the summary
    const id = await getPortfolioID("Min portefølje");

    await expectRouteToBePrivate(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/NOVO-B.CO`, "DELETE");
    // Remove a stock from the portfolio
    let res = await app.request(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/NOVO-B.CO`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    // Removing the same stock again does not return an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/NOVO-B.CO`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    // Check that the stock has been removed
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}`, { headers: { Cookie: "id=exampleSessionID" } });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.stocks.length).toBe(1);
    expect(body.stocks[0].name).toBe("Ørsted A/S");

    // Attempting to update a list of a different user returns an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/NOVO-B.CO`, {
      method: "DELETE",
      headers: { Cookie: "id=anotherExampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(403);
    expect(body.message).toMatch("does not belong to user with email address john.doe");

    // Attempting to remove a stock from a non-existent list returns an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/999${stocksAPIPath}/NOVO-B.CO`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(404);
    expect(body.message).toMatch("Portfolio 999 not found.");

    // Attempting to remove a non-existent stock returns an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}${stocksAPIPath}/DOESNOTEXIST`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(404);
    expect(body.message).toMatch("Stock DOESNOTEXIST not found.");
  },
});

tests.push({
  testName: "[unsafe] deletes a portfolio",
  testFunction: async () => {
    // Get the ID of the portfolio from the summary
    const id = await getPortfolioID("Min portefølje");

    await expectRouteToBePrivate(`${basePath}${portfoliosAPIPath}/${id}`, "DELETE");
    // Attempting to delete a portfolio of a different user returns an error
    let res = await app.request(`${basePath}${portfoliosAPIPath}/${id}`, {
      method: "DELETE",
      headers: { Cookie: "id=anotherExampleSessionID" },
    });
    expect(res.status).toBe(403);

    // Delete the portfolio
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    // Deleting the same portfolio again does not return an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    // Attempting to read the deleted portfolio returns an error
    res = await app.request(`${basePath}${portfoliosAPIPath}/${id}`, { headers: { Cookie: "id=exampleSessionID" } });
    expect(res.status).toBe(404);

    // A portfolio witht that name is no longer in the summary
    res = await app.request(`${basePath}${portfoliosAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    expect(res.status).toBe(200);
    expect(
      (await res.json()).find((portfolioSummary: PortfolioSummary) => portfolioSummary.name === "Min portefølje"),
    ).toBeUndefined();
  },
});
