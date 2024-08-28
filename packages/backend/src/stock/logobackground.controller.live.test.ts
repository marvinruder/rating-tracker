import { baseURL, logoBackgroundAPIPath } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { app } from "../server";

export const suiteName = "Logo Background API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "[unsafe] provides stock logos for background",
  testFunction: async () => {
    let res = await app.request(`${baseURL}${logoBackgroundAPIPath}?count=50&variant=light`);
    let body = await res.json();
    expect(res.status).toBe(200);
    // Check max-age header, should be close to 1 day
    expect(res.headers.get("cache-control")).toMatch(/max-age=\d+/);
    expect(res.headers.get("cache-control")!.replace(/max-age=(\d+)/, "$1")).toBeCloseTo(604800, -1);
    // 50 logos are returned
    expect(body).toHaveLength(50);
    body.forEach((logo: string) => {
      expect(logo).toMatch(
        // Each logo is an SVG file
        '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">',
      );
    });

    // We can request a different number of logos
    res = await app.request(`${baseURL}${logoBackgroundAPIPath}?count=10&variant=light`);
    body = await res.json();
    expect(res.status).toBe(200);
    // 10 logos are returned
    expect(body).toHaveLength(10);
    body.forEach((logo: string) => {
      expect(logo).toMatch(
        // Each logo is an SVG file
        '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">',
      );
    });

    // We cannot request a very large number of logos
    res = await app.request(`${baseURL}${logoBackgroundAPIPath}?count=1000&variant=light`);
    expect(res.status).toBe(400);
  },
});
