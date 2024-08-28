import { baseURL, favoritesAPIPath, watchlistsAPIPath } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { expectRouteToBePrivate } from "../../test/liveTestHelpers";
import { app } from "../server";

export const suiteName = "Favorites API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "[unsafe] returns all favorites",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${favoritesAPIPath}`);
    const res = await app.request(`${baseURL}${favoritesAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe("Favorites");
    expect(body.stocks.length).toBe(2);
    expect(body.stocks[0].name).toBe("Apple Inc");
    expect(body.stocks[1].name).toBe("Taiwan Semiconductor Manufacturing Co Ltd");
  },
});

tests.push({
  testName: "[unsafe] creates a new empty Favorites list for a user that does not have one",
  testFunction: async () => {
    // Check that there are no watchlists for the user
    let res = await app.request(`${baseURL}${watchlistsAPIPath}`, {
      headers: { Cookie: "id=anotherExampleSessionID" },
    });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.length).toBe(0);

    // Read the Favorites list (since there is one, a new and empty one will be created)
    res = await app.request(`${baseURL}${favoritesAPIPath}`, { headers: { Cookie: "id=anotherExampleSessionID" } });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe("Favorites");
    expect(body.stocks.length).toBe(0);

    // Check that the Favorites list is still around
    res = await app.request(`${baseURL}${watchlistsAPIPath}`, {
      headers: { Cookie: "id=anotherExampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.length).toBe(1);
    expect(body[0].name).toBe("Favorites");
  },
});

tests.push({
  testName: "[unsafe] adds a stock to the Favorites list",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${favoritesAPIPath}/MELI`, "PUT");
    let res = await app.request(`${baseURL}${favoritesAPIPath}/MELI`, {
      method: "PUT",
      headers: { Cookie: "id=anotherExampleSessionID" },
    });
    expect(res.status).toBe(201);

    res = await app.request(`${baseURL}${favoritesAPIPath}`, { headers: { Cookie: "id=anotherExampleSessionID" } });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe("Favorites");
    expect(body.stocks.length).toBe(1);
    expect(body.stocks[0].name).toBe("MercadoLibre Inc");

    // attempting to add a stock to the list that has already been added does not return an error
    res = await app.request(`${baseURL}${favoritesAPIPath}/MELI`, {
      method: "PUT",
      headers: { Cookie: "id=anotherExampleSessionID" },
    });
    expect(res.status).toBe(201);

    res = await app.request(`${baseURL}${favoritesAPIPath}`, { headers: { Cookie: "id=anotherExampleSessionID" } });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe("Favorites");
    expect(body.stocks.length).toBe(1);
    expect(body.stocks[0].name).toBe("MercadoLibre Inc");

    // attempting to add a non-existent stock to the list returns an error
    res = await app.request(`${baseURL}${favoritesAPIPath}/DOESNOTEXIST`, {
      method: "PUT",
      headers: { Cookie: "id=anotherExampleSessionID" },
    });
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] removes a stock from the Favorites list",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${favoritesAPIPath}/AAPL`, "DELETE");
    let res = await app.request(`${baseURL}${favoritesAPIPath}/AAPL`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    res = await app.request(`${baseURL}${favoritesAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe("Favorites");
    expect(body.stocks.length).toBe(1);
    expect(body.stocks[0].name).toBe("Taiwan Semiconductor Manufacturing Co Ltd");

    // attempting to delete a stock from the list that has already been removed does not return an error
    res = await app.request(`${baseURL}${favoritesAPIPath}/AAPL`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    res = await app.request(`${baseURL}${favoritesAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe("Favorites");
    expect(body.stocks.length).toBe(1);
    expect(body.stocks[0].name).toBe("Taiwan Semiconductor Manufacturing Co Ltd");

    // attempting to delete a non-existent stock from the list returns an error
    res = await app.request(`${baseURL}${favoritesAPIPath}/DOESNOTEXIST`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(404);
  },
});
