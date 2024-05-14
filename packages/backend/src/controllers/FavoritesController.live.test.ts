import { baseURL, favoritesAPIPath, watchlistsAPIPath } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { supertest } from "../../test/liveTestHelpers";

export const suiteName = "Favorites API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "[unsafe] returns all favorites",
  testFunction: async () => {
    const res = await supertest.get(`${baseURL}${favoritesAPIPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Favorites");
    expect(res.body.stocks.length).toBe(2);
    expect(res.body.stocks[0].name).toBe("Apple Inc");
    expect(res.body.stocks[1].name).toBe("Taiwan Semiconductor Manufacturing Co Ltd");
  },
});

tests.push({
  testName: "[unsafe] creates a new empty Favorites list for a user that does not have one",
  testFunction: async () => {
    // Check that there are no watchlists for the user
    let res = await supertest
      .get(`${baseURL}${watchlistsAPIPath}`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);

    // Read the Favorites list (since there is one, a new and empty one will be created)
    res = await supertest.get(`${baseURL}${favoritesAPIPath}`).set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Favorites");
    expect(res.body.stocks.length).toBe(0);

    // Check that the Favorites list is still around
    res = await supertest.get(`${baseURL}${watchlistsAPIPath}`).set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Favorites");
  },
});

tests.push({
  testName: "[unsafe] adds a stock to the Favorites list",
  testFunction: async () => {
    let res = await supertest
      .put(`${baseURL}${favoritesAPIPath}/exampleMELI`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(201);

    res = await supertest.get(`${baseURL}${favoritesAPIPath}`).set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Favorites");
    expect(res.body.stocks.length).toBe(1);
    expect(res.body.stocks[0].name).toBe("MercadoLibre Inc");

    // attempting to add a stock to the list that has already been added does not return an error
    res = await supertest
      .put(`${baseURL}${favoritesAPIPath}/exampleMELI`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(201);

    res = await supertest.get(`${baseURL}${favoritesAPIPath}`).set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Favorites");
    expect(res.body.stocks.length).toBe(1);
    expect(res.body.stocks[0].name).toBe("MercadoLibre Inc");

    // attempting to add a non-existent stock to the list returns an error
    res = await supertest
      .put(`${baseURL}${favoritesAPIPath}/doesNotExist`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] removes a stock from the Favorites list",
  testFunction: async () => {
    let res = await supertest
      .delete(`${baseURL}${favoritesAPIPath}/exampleAAPL`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    res = await supertest.get(`${baseURL}${favoritesAPIPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Favorites");
    expect(res.body.stocks.length).toBe(1);
    expect(res.body.stocks[0].name).toBe("Taiwan Semiconductor Manufacturing Co Ltd");

    // attempting to delete a stock from the list that has already been removed does not return an error
    res = await supertest
      .delete(`${baseURL}${favoritesAPIPath}/exampleAAPL`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    res = await supertest.get(`${baseURL}${favoritesAPIPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Favorites");
    expect(res.body.stocks.length).toBe(1);
    expect(res.body.stocks[0].name).toBe("Taiwan Semiconductor Manufacturing Co Ltd");

    // attempting to delete a non-existent stock from the list returns an error
    res = await supertest
      .delete(`${baseURL}${favoritesAPIPath}/doesNotExist`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  },
});
