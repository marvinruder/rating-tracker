import { WatchlistSummary, baseURL, watchlistsEndpointPath } from "@rating-tracker/commons";

import { LiveTestSuite, supertest } from "../../test/liveTestHelpers";

export const suiteName = "Watchlists API";

export const tests: LiveTestSuite = [];

const getWatchlistID = async (name: string): Promise<number> => {
  // Get the ID of the watchlist from the summary
  const res = await supertest.get(`${baseURL}${watchlistsEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
  expect(res.status).toBe(200);
  const { id } = res.body.find((watchlistSummary: WatchlistSummary) => watchlistSummary.name === name);
  return id;
};

tests.push({
  testName: "reads a summary of all watchlists",
  testFunction: async () => {
    const res = await supertest
      .get(`${baseURL}${watchlistsEndpointPath}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].name).toBe("Favorites");
    expect(res.body[1].name).toBe("Fævørites");
    expect(res.body[0].subscribed).toBeTruthy();
    expect(res.body[1].subscribed).toBeFalsy();

    // The summary does not contain the full stock objects
    expect(res.body[0].stocks[0].ticker).toBe("exampleAAPL");
    expect(Object.entries(res.body[0].stocks[0])).toHaveLength(1);
  },
});

tests.push({
  testName: "reads a watchlist",
  testFunction: async () => {
    // Get the ID of the watchlist from the summary
    const id = await getWatchlistID("Fævørites");

    let res = await supertest
      .get(`${baseURL}${watchlistsEndpointPath}/${id}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Fævørites");
    expect(res.body.stocks.length).toBe(2);
    expect(res.body.stocks[0].name).toBe("Novo Nordisk A/S");
    expect(res.body.stocks[1].name).toBe("Ørsted A/S");

    // Attempting to read a list of a different user returns an error
    res = await supertest
      .get(`${baseURL}${watchlistsEndpointPath}/${id}`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch("does not belong to user with email address john.doe");
  },
});

tests.push({
  testName: "[unsafe] creates a watchlist",
  testFunction: async () => {
    // Attempting to create another Favorites list returns an error
    let res = await supertest
      .put(`${baseURL}${watchlistsEndpointPath}/new?name=Favorites`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch("The name “Favorites” is reserved.");

    // Attempting to use a custom ID returns an error
    res = await supertest
      .put(`${baseURL}${watchlistsEndpointPath}/fancy?name=Fancy`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);

    res = await supertest
      .put(`${baseURL}${watchlistsEndpointPath}/new?name=${encodeURIComponent("Favȏrïtès")}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(201);
    const { id } = res.body;

    res = await supertest
      .get(`${baseURL}${watchlistsEndpointPath}/${id}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Favȏrïtès");
    expect(res.body.subscribed).toBeFalsy();
    expect(res.body.stocks.length).toBe(0);
  },
});

tests.push({
  testName: "[unsafe] updates a watchlist",
  testFunction: async () => {
    // Get the ID of the watchlist from the summary
    let res = await supertest.get(`${baseURL}${watchlistsEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    const { id, subscribed } = res.body.find(
      (watchlistSummary: WatchlistSummary) => watchlistSummary.name === "Fævørites",
    );
    const favoritesID = res.body.find((watchlistSummary: WatchlistSummary) => watchlistSummary.name === "Favorites").id;
    expect(subscribed).toBeFalsy();

    // Update the watchlist
    res = await supertest
      .patch(
        `${baseURL}${watchlistsEndpointPath}/${id}?stocksToAdd=exampleALV%2CexampleKGX` +
          "&stocksToRemove=exampleNOVO%20B%2CexampleORSTED&name=Favoriten&subscribed=true",
      )
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Updating the watchlist again does not return an error
    res = await supertest
      .patch(
        `${baseURL}${watchlistsEndpointPath}/${id}?stocksToAdd=exampleALV%2CexampleKGX` +
          "&stocksToRemove=exampleNOVO%20B%2CexampleORSTED&name=Favoriten&subscribed=true",
      )
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Not sending any update information is meaningless but does not return an error
    res = await supertest
      .patch(`${baseURL}${watchlistsEndpointPath}/${id}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Check that the watchlist has been updated
    res = await supertest
      .get(`${baseURL}${watchlistsEndpointPath}/${id}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.stocks.length).toBe(2);
    expect(res.body.stocks[0].name).toBe("Allianz SE");
    expect(res.body.stocks[1].name).toBe("Kion Group AG");
    expect(res.body.name).toBe("Favoriten");
    expect(res.body.subscribed).toBeTruthy();

    // Attempting to update a list of a different user returns an error
    res = await supertest
      .patch(`${baseURL}${watchlistsEndpointPath}/${id}?name=This%20should%20not%20work`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch("does not belong to user with email address john.doe");

    // Attempting to update a non-existent list returns an error
    res = await supertest
      .patch(`${baseURL}${watchlistsEndpointPath}/-1?name=This%20should%20not%20work`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("Watchlist -1 not found.");

    // Attempting to use the reserved name “Favorites” returns an error
    res = await supertest
      .patch(`${baseURL}${watchlistsEndpointPath}/${id}?name=Favorites`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch("The name “Favorites” is reserved.");

    // Attempting to rename the “Favorites” list returns an error
    res = await supertest
      .patch(`${baseURL}${watchlistsEndpointPath}/${favoritesID}?name=This%20should%20not%20work`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch("The name “Favorites” must not be changed.");
  },
});

tests.push({
  testName: "[unsafe] deletes a watchlist",
  testFunction: async () => {
    // Get the ID of the watchlist from the summary
    const id = await getWatchlistID("Fævørites");

    // Delete the watchlist
    let res = await supertest
      .delete(`${baseURL}${watchlistsEndpointPath}/${id}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Attempting to read the deleted watchlist returns an error
    res = await supertest
      .get(`${baseURL}${watchlistsEndpointPath}/${id}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);

    // A watchlist witht that name is no longer in the summary
    res = await supertest.get(`${baseURL}${watchlistsEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(
      res.body.find((watchlistSummary: WatchlistSummary) => watchlistSummary.name === "Fævørites"),
    ).toBeUndefined();
  },
});