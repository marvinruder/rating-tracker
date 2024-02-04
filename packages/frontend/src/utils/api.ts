import type { FetchRequestOptions, FetchRequestWithBodyOptions, FetchResponse } from "@rating-tracker/commons";
import { baseURL, createURLSearchParams, handleResponse } from "@rating-tracker/commons";

/**
 * Performs a request using the browser’s `fetch` API.
 *
 * @param {string} path The relative API path. The base URL is automatically prepended to this path.
 * @param {FetchRequestWithBodyOptions} config The configuration options of the request.
 * @returns {Promise<FetchResponse>} A promise that resolves to the response of the request.
 * @throws {FetchError} If the response status code is not in the 2XX range.
 */
const performFetchRequest = (path: string, config: FetchRequestWithBodyOptions): Promise<FetchResponse> => {
  const { body, params, ...init } = config;

  const urlSearchParams = createURLSearchParams(params);

  let bodyInit: BodyInit | undefined = undefined;

  if (body) {
    if (typeof body === "string" || body instanceof Uint8Array) {
      bodyInit = body;
    } else {
      init.headers = { "Content-Type": "application/json", ...init.headers };
      bodyInit = JSON.stringify(body);
    }
  }

  // Our backend considers + as a reserved character, so we need to encode spaces as %20.
  return fetch(baseURL + path + (params ? "?" + urlSearchParams.toString().replaceAll("+", "%20") : ""), {
    ...init,
    body: bodyInit,
    credentials: "same-origin", // Send cookies with the request.
  })
    .then(handleResponse)
    .catch((e) => {
      throw e;
    });
};

/**
 * A collection of functions that perform API requests using the browser’s `fetch` API.
 */
const fetchAPI = {
  /**
   * Performs a GET request using the browser’s `fetch` API.
   *
   * @param {string} path The relative API path. The base URL is automatically prepended to this path.
   * @param {FetchRequestOptions} config The configuration options of the request.
   * @returns {Promise<FetchResponse>} A promise that resolves to the response of the request.
   */
  get: (path: string, config?: FetchRequestOptions): Promise<FetchResponse> =>
    performFetchRequest(path, { ...config, method: "GET" }),
  /**
   * Performs a HEAD request using the browser’s `fetch` API.
   *
   * @param {string} path The relative API path. The base URL is automatically prepended to this path.
   * @param {FetchRequestOptions} config The configuration options of the request.
   * @returns {Promise<FetchResponse>} A promise that resolves to the response of the request.
   */
  head: (path: string, config?: FetchRequestOptions): Promise<FetchResponse> =>
    performFetchRequest(path, { ...config, method: "HEAD" }),
  /**
   * Performs a POST request using the browser’s `fetch` API.
   *
   * @param {string} path The relative API path. The base URL is automatically prepended to this path.
   * @param {FetchRequestOptions} config The configuration options of the request.
   * @returns {Promise<FetchResponse>} A promise that resolves to the response of the request.
   */
  post: (path: string, config?: FetchRequestWithBodyOptions): Promise<FetchResponse> =>
    performFetchRequest(path, { ...config, method: "POST" }),
  /**
   * Performs a PUT request using the browser’s `fetch` API.
   *
   * @param {string} path The relative API path. The base URL is automatically prepended to this path.
   * @param {FetchRequestOptions} config The configuration options of the request.
   * @returns {Promise<FetchResponse>} A promise that resolves to the response of the request.
   */
  put: (path: string, config?: FetchRequestWithBodyOptions): Promise<FetchResponse> =>
    performFetchRequest(path, { ...config, method: "PUT" }),
  /**
   * Performs a PATCH request using the browser’s `fetch` API.
   *
   * @param {string} path The relative API path. The base URL is automatically prepended to this path.
   * @param {FetchRequestOptions} config The configuration options of the request.
   * @returns {Promise<FetchResponse>} A promise that resolves to the response of the request.
   */
  patch: (path: string, config?: FetchRequestWithBodyOptions): Promise<FetchResponse> =>
    performFetchRequest(path, { ...config, method: "PATCH" }),
  /**
   * Performs a DELETE request using the browser’s `fetch` API.
   *
   * @param {string} path The relative API path. The base URL is automatically prepended to this path.
   * @param {FetchRequestOptions} config The configuration options of the request.
   * @returns {Promise<FetchResponse>} A promise that resolves to the response of the request.
   */
  delete: (path: string, config?: FetchRequestOptions): Promise<FetchResponse> =>
    performFetchRequest(path, { ...config, method: "DELETE" }),
};

export default fetchAPI;
