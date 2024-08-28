import type { WatchlistSummary } from "@rating-tracker/commons";
import { baseURL, stocksAPIPath, watchlistsAPIPath } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { expectRouteToBePrivate } from "../../test/liveTestHelpers";
import { app } from "../server";

export const suiteName = "Watchlists API";

export const tests: LiveTestSuite = [];

const getWatchlistID = async (name: string): Promise<number> => {
  // Get the ID of the watchlist from the summary
  const res = await app.request(`${baseURL}${watchlistsAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
  const body = await res.json();
  expect(res.status).toBe(200);
  const { id } = body.find((watchlistSummary: WatchlistSummary) => watchlistSummary.name === name);
  return id;
};

tests.push({
  testName: "reads a summary of all watchlists",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${watchlistsAPIPath}`);
    const res = await app.request(`${baseURL}${watchlistsAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.length).toBe(2);
    expect(body[0].name).toBe("Favorites");
    expect(body[1].name).toBe("Fævørites");
    expect(body[0].subscribed).toBeTruthy();
    expect(body[1].subscribed).toBeFalsy();

    // The summary does not contain the full stock objects
    expect(body[0].stocks[0].ticker).toBe("AAPL");
    expect(Object.entries(body[0].stocks[0])).toHaveLength(1);
  },
});

tests.push({
  testName: "reads a watchlist",
  testFunction: async () => {
    // Get the ID of the watchlist from the summary
    const id = await getWatchlistID("Fævørites");

    await expectRouteToBePrivate(`${baseURL}${watchlistsAPIPath}/${id}`);
    let res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}`, { headers: { Cookie: "id=exampleSessionID" } });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe("Fævørites");
    expect(body.stocks.length).toBe(2);
    expect(body.stocks[0].name).toBe("Novo Nordisk A/S");
    expect(body.stocks[1].name).toBe("Ørsted A/S");

    // Attempting to read a watchlist of a different user returns an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}`, {
      headers: { Cookie: "id=anotherExampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(403);
    expect(body.message).toMatch("does not belong to user with email address john.doe");
  },
});

tests.push({
  testName: "[unsafe] creates a watchlist",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${watchlistsAPIPath}`, "PUT");

    // Attempting to create another Favorites watchlist returns an error
    let res = await app.request(`${baseURL}${watchlistsAPIPath}`, {
      method: "PUT",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ name: "Favorites" }),
    });
    let body = await res.json();
    expect(res.status).toBe(400);
    expect(body.message).toMatch("The name “Favorites” is reserved.");

    res = await app.request(`${baseURL}${watchlistsAPIPath}`, {
      method: "PUT",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ name: "Favȏrïtès" }),
    });
    body = await res.json();
    expect(res.status).toBe(201);
    const { id } = body;

    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}`, { headers: { Cookie: "id=exampleSessionID" } });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe("Favȏrïtès");
    expect(body.subscribed).toBeFalsy();
    expect(body.stocks.length).toBe(0);
  },
});

tests.push({
  testName: "[unsafe] updates a watchlist",
  testFunction: async () => {
    // Get the ID of the watchlist from the summary
    let res = await app.request(`${baseURL}${watchlistsAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    let body = await res.json();
    expect(res.status).toBe(200);
    const { id, subscribed } = body.find((watchlistSummary: WatchlistSummary) => watchlistSummary.name === "Fævørites");
    const favoritesID = body.find((watchlistSummary: WatchlistSummary) => watchlistSummary.name === "Favorites").id;
    expect(subscribed).toBeFalsy();

    await expectRouteToBePrivate(`${baseURL}${watchlistsAPIPath}/${id}`, "PATCH");
    // Update the watchlist
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ name: "Favoriten", subscribed: true }),
    });
    expect(res.status).toBe(204);

    // Updating the watchlist again does not return an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ name: "Favoriten", subscribed: true }),
    });
    expect(res.status).toBe(204);

    // Not sending any update information is meaningless but valid
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(204);

    // Check that the watchlist has been updated
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}`, { headers: { Cookie: "id=exampleSessionID" } });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe("Favoriten");
    expect(body.subscribed).toBeTruthy();

    // Attempting to update a watchlist of a different user returns an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=anotherExampleSessionID" },
      body: JSON.stringify({ name: "This should not work" }),
    });
    body = await res.json();
    expect(res.status).toBe(403);
    expect(body.message).toMatch("does not belong to user with email address john.doe");

    // Attempting to update a non-existent watchlist returns an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/999`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ name: "This should not work" }),
    });
    body = await res.json();
    expect(res.status).toBe(404);
    expect(body.message).toMatch("Watchlist 999 not found.");

    // Attempting to use the reserved name “Favorites” returns an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ name: "Favorites" }),
    });
    body = await res.json();
    expect(res.status).toBe(400);
    expect(body.message).toMatch("The name “Favorites” is reserved.");

    // Attempting to rename the “Favorites” watchlist returns an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${favoritesID}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ name: "This should not work" }),
    });
    body = await res.json();
    expect(res.status).toBe(400);
    expect(body.message).toMatch("The name “Favorites” must not be changed.");
  },
});

tests.push({
  testName: "[unsafe] adds a stock to a watchlist",
  testFunction: async () => {
    // Get the ID of the watchlist from the summary
    const id = await getWatchlistID("Fævørites");

    await expectRouteToBePrivate(`${baseURL}${watchlistsAPIPath}/${id}${stocksAPIPath}/ALV.DE`, "PUT");
    // Add a stock to the watchlist
    let res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}${stocksAPIPath}/ALV.DE`, {
      method: "PUT",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    // Adding the same stock again does not return an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}${stocksAPIPath}/ALV.DE`, {
      method: "PUT",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    // Check that the stock has been added
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}`, { headers: { Cookie: "id=exampleSessionID" } });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.stocks.length).toBe(3);
    expect(body.stocks[0].name).toBe("Allianz SE");
    expect(body.stocks[1].name).toBe("Novo Nordisk A/S");
    expect(body.stocks[2].name).toBe("Ørsted A/S");

    // Attempting to update a watchlist of a different user returns an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}${stocksAPIPath}/ALV.DE`, {
      method: "PUT",
      headers: { Cookie: "id=anotherExampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(403);
    expect(body.message).toMatch("does not belong to user with email address john.doe");

    // Attempting to add a stock to a non-existent watchlist returns an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/999${stocksAPIPath}/ALV.DE`, {
      method: "PUT",
      headers: { Cookie: "id=exampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(404);
    expect(body.message).toMatch("Watchlist 999 not found.");

    // Attempting to add a non-existent stock returns an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}${stocksAPIPath}/DOESNOTEXIST`, {
      method: "PUT",
      headers: { Cookie: "id=exampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(404);
    expect(body.message).toMatch("Stock DOESNOTEXIST not found.");
  },
});

tests.push({
  testName: "[unsafe] removes a stock from a watchlist",
  testFunction: async () => {
    // Get the ID of the watchlist from the summary
    const id = await getWatchlistID("Fævørites");

    await expectRouteToBePrivate(`${baseURL}${watchlistsAPIPath}/${id}${stocksAPIPath}/NOVO-B.CO`, "DELETE");
    // Remove a stock from the watchlist
    let res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}${stocksAPIPath}/NOVO-B.CO`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    // Removing the same stock again does not return an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}${stocksAPIPath}/NOVO-B.CO`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    // Check that the stock has been removed
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}`, { headers: { Cookie: "id=exampleSessionID" } });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.stocks.length).toBe(1);
    expect(body.stocks[0].name).toBe("Ørsted A/S");

    // Attempting to update a watchlist of a different user returns an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}${stocksAPIPath}/NOVO-B.CO`, {
      method: "DELETE",
      headers: { Cookie: "id=anotherExampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(403);
    expect(body.message).toMatch("does not belong to user with email address john.doe");

    // Attempting to remove a stock from a non-existent watchlist returns an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/999${stocksAPIPath}/NOVO-B.CO`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(404);
    expect(body.message).toMatch("Watchlist 999 not found.");

    // Attempting to remove a non-existent stock returns an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}${stocksAPIPath}/DOESNOTEXIST`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(404);
    expect(body.message).toMatch("Stock DOESNOTEXIST not found.");
  },
});

tests.push({
  testName: "[unsafe] deletes a watchlist",
  testFunction: async () => {
    // Get the ID of the watchlist from the summary
    const id = await getWatchlistID("Fævørites");

    await expectRouteToBePrivate(`${baseURL}${watchlistsAPIPath}/${id}`, "DELETE");
    // Attempting to delete a watchlist of a different user returns an error
    let res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}`, {
      method: "DELETE",
      headers: { Cookie: "id=anotherExampleSessionID" },
    });
    expect(res.status).toBe(403);

    // Delete the watchlist
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    // Deleting the same watchlist again does not return an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    // Attempting to read the deleted watchlist returns an error
    res = await app.request(`${baseURL}${watchlistsAPIPath}/${id}`, { headers: { Cookie: "id=exampleSessionID" } });
    expect(res.status).toBe(404);

    // A watchlist with that name is no longer in the summary
    res = await app.request(`${baseURL}${watchlistsAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.find((watchlistSummary: WatchlistSummary) => watchlistSummary.name === "Fævørites")).toBeUndefined();
  },
});
