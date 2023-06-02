import { favoriteEndpointPath, favoriteListEndpointPath, watchlistSummaryEndpointPath } from "@rating-tracker/commons";
import { LiveTestSuite, supertest } from "../../test/liveTestHelpers";

export const suiteName = "Favorite API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "[unsafe] returns all favorites",
  testFunction: async () => {
    const res = await supertest.get(`/api${favoriteListEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
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
      .get(`/api${watchlistSummaryEndpointPath}`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);

    // Read the Favorites list (since there is one, a new and empty one will be created)
    res = await supertest.get(`/api${favoriteListEndpointPath}`).set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Favorites");
    expect(res.body.stocks.length).toBe(0);

    // Check that the Favorites list is still around
    res = await supertest
      .get(`/api${watchlistSummaryEndpointPath}`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Favorites");
  },
});

tests.push({
  testName: "[unsafe] adds a stock to the Favorites list",
  testFunction: async () => {
    let res = await supertest
      .put(`/api${favoriteEndpointPath}/exampleMELI`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(201);

    res = await supertest.get(`/api${favoriteListEndpointPath}`).set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Favorites");
    expect(res.body.stocks.length).toBe(1);
    expect(res.body.stocks[0].name).toBe("MercadoLibre Inc");

    // attempting to add a stock to the list that has already been added does not return an error
    res = await supertest
      .put(`/api${favoriteEndpointPath}/exampleMELI`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(201);

    res = await supertest.get(`/api${favoriteListEndpointPath}`).set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Favorites");
    expect(res.body.stocks.length).toBe(1);
    expect(res.body.stocks[0].name).toBe("MercadoLibre Inc");

    // attempting to add a non-existent stock to the list returns an error
    res = await supertest
      .put(`/api${favoriteEndpointPath}/doesNotExist`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] removes a stock from the Favorites list",
  testFunction: async () => {
    let res = await supertest
      .delete(`/api${favoriteEndpointPath}/exampleAAPL`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    res = await supertest.get(`/api${favoriteListEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Favorites");
    expect(res.body.stocks.length).toBe(1);
    expect(res.body.stocks[0].name).toBe("Taiwan Semiconductor Manufacturing Co Ltd");

    // attempting to delete a stock from the list that has already been removed does not return an error
    res = await supertest
      .delete(`/api${favoriteEndpointPath}/exampleAAPL`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    res = await supertest.get(`/api${favoriteListEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Favorites");
    expect(res.body.stocks.length).toBe(1);
    expect(res.body.stocks[0].name).toBe("Taiwan Semiconductor Manufacturing Co Ltd");

    // attempting to delete a non-existent stock from the list returns an error
    res = await supertest
      .delete(`/api${favoriteEndpointPath}/doesNotExist`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  },
});
