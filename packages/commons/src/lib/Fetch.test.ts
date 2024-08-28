import { describe, expect, it } from "vitest";

import { FetchError, createURLSearchParams, handleResponse } from "..";

const mockedResponse: Pick<
  Response,
  | "status"
  | "statusText"
  | "headers"
  | "ok"
  | "redirected"
  | "type"
  | "url"
  | "body"
  | "bodyUsed"
  | "arrayBuffer"
  | "blob"
  | "formData"
  | "json"
  | "text"
> = {
  status: 200,
  statusText: "OK",
  headers: new Headers(),
  ok: true,
  redirected: false,
  type: "basic" as ResponseType,
  url: "http://localhost",
  body: null,
  bodyUsed: false,
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  blob: () => Promise.resolve(new Blob()),
  formData: () => Promise.resolve(new FormData()),
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(""),
};

describe.concurrent("URL Search Parameters", () => {
  it("creates a new URLSearchParams instance from the given parameter record", () => {
    const params = {
      string: "string with symbols?",
      number: 1,
      boolean: true,
    };
    const urlSearchParams = createURLSearchParams(params);
    expect(urlSearchParams.toString()).toBe("string=string+with+symbols%3F&number=1&boolean=true");
  });
});

describe.concurrent("Response handler", () => {
  it("parses JSON response", async () => {
    const response = {
      ...mockedResponse,
      json: () => Promise.resolve({ data: "response data" }),
      headers: new Headers({ "Content-Type": "application/json" }),
      clone: () => ({ ...response }),
    };

    await expect(handleResponse(response)).resolves.toHaveProperty("data", { data: "response data" });
  });

  it("parses text response", async () => {
    const response = {
      ...mockedResponse,
      text: () => Promise.resolve("response data"),
      headers: new Headers({ "Content-Type": "text/plain" }),
      clone: () => ({ ...response }),
    };

    await expect(handleResponse(response)).resolves.toHaveProperty("data", "response data");
  });

  it("parses XML response as text", async () => {
    const response = {
      ...mockedResponse,
      text: () => Promise.resolve("<xml>response data</xml>"),
      headers: new Headers({ "Content-Type": "application/xml" }),
      clone: () => ({ ...response }),
    };

    await expect(handleResponse(response)).resolves.toHaveProperty("data", "<xml>response data</xml>");
  });

  it("does not parse response with no content", async () => {
    const response = {
      ...mockedResponse,
      clone: () => ({ ...response }),
    };

    await expect(handleResponse(response)).resolves.toHaveProperty("data", null);
  });

  it("throws FetchError for non-2XX status codes", async () => {
    const response = {
      ...mockedResponse,
      status: 404,
      statusText: "Not Found",
      ok: false,
      headers: new Headers({ "Content-Type": "text/plain" }),
      text: () => Promise.resolve("Not found"),
      clone: () => ({ ...response }),
    };

    await expect(handleResponse(response)).rejects.toThrowError(FetchError);
    try {
      await handleResponse(response);
    } catch (e) {
      expect(e).toBeInstanceOf(FetchError);
      expect(e).toHaveProperty("response", response);
      expect((e as FetchError).response.data).toBe("Not found"); // The response body was still parsed.
    }
  });
});
