import type { FetchRequestWithBodyOptions, FetchResponse } from "@rating-tracker/commons";
import { createURLSearchParams, handleResponse } from "@rating-tracker/commons";

/**
 * Performs a request using the NodeJS’s `fetch` API.
 * @param url The URL of the request.
 * @param config The configuration options of the request.
 * @returns A {@link Promise} that resolves to the response of the request.
 * @throws a {@link FetchError} if the response status code is not in the 2XX range.
 */
export const performFetchRequest = (url: string, config?: FetchRequestWithBodyOptions): Promise<FetchResponse> => {
  const { body, params, ...init } = config ?? {};

  const urlSearchParams = createURLSearchParams(params);

  let bodyInit: BodyInit | undefined = undefined;

  /* c8 ignore start */ // Bodys are only sent to data providers, which are not tested
  if (body) {
    if (typeof body === "string" || body instanceof Uint8Array) {
      bodyInit = body;
    } else {
      init.headers = { "Content-Type": "application/json", ...init.headers };
      bodyInit = JSON.stringify(body);
    }
  }
  /* c8 ignore stop */

  return fetch(url + (params ? "?" + urlSearchParams : ""), {
    ...init,
    body: bodyInit,
  })
    .then(handleResponse)
    .catch((e) => {
      throw e;
    });
};
