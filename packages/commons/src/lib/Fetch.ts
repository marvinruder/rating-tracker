/**
 * This class is used to throw an error when a fetch response has a status code that is not in the 2XX range.
 */
export class FetchError<D = any> extends Error {
  response: FetchResponse<D>;

  /**
   * Creates a new instance of the {@link FetchError} class.
   *
   * @param {FetchResponse} response The response from the fetch request.
   */
  constructor(response: FetchResponse<D>) {
    super(response.statusText);
    this.response = response;

    // Set the prototype explicitly.
    FetchError.prototype.name = "FetchError";
    Object.setPrototypeOf(this, FetchError.prototype);
  }
}

/**
 * The options of a fetch request. May be used with the GET, HEAD or DELETE methods.
 */
export type FetchRequestOptions = Omit<RequestInit, "body"> & {
  /**
   * The URL parameter to be appended to the path.
   */
  params?: Record<string, string | number | boolean>;
};

/**
 * The options of a fetch request that includes a body. May only be used with the POST, PUT or PATCH methods.
 */
export type FetchRequestWithBodyOptions = FetchRequestOptions & {
  /**
   * The body of the request. May be an arbitrary object, which will be serialized to JSON, or a string or `Uint8Array`.
   */
  body?: object | string | Uint8Array;
};

/**
 * The response of a fetch request. It includes the parsed response data as well. The data may be `null` if the response
 * does not contain any data, e.g. for a 204 No Content response.
 */
export type FetchResponse<D = any> = Response & {
  /**
   * The parsed response data.
   */
  data: D extends object ? D : D | string | null;
};

/**
 * Creates a new `URLSearchParams` instance from the given parameter record.
 *
 * @param {FetchRequestOptions["params"]} params The parameters to be added to the URL.
 * @returns {URLSearchParams} The URL search parameters.
 */
export const createURLSearchParams = (params: FetchRequestOptions["params"]): URLSearchParams => {
  const urlSearchParams = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      // `URLSearchParams` does not accept numbers or booleans, so we need to convert them to strings.
      urlSearchParams.set(key, params[key].toString());
    }
  }
  return urlSearchParams;
};

/**
 * Parses the response data and adds it to the response object. Throws a {@link FetchError} if the response status code
 * is not in the 2XX range.
 *
 * @param {Response} res The response from the fetch request.
 * @returns {Promise<FetchResponse>} The response with the parsed data.
 */
export const handleResponse = async (res: Response): Promise<FetchResponse> => {
  // Parse the response data and add it to the response object.
  const contentType = res.headers.get("Content-Type")?.split(";")[0];
  let data: unknown;
  switch (true) {
    case contentType?.match(/(\/|\+)json$/)?.length > 0:
      data = await res.json();
      break;
    case contentType?.match(/^text\//)?.length > 0:
    case contentType?.match(/(\/|\+)xml$/)?.length > 0:
      data = await res.text();
      break;
    default:
      data = null;
      break;
  }

  const resWithData: FetchResponse = res as FetchResponse;
  resWithData.data = data;

  // Throw an error if the response status code is not in the 2XX range.
  if (!res.ok) throw new FetchError(resWithData);

  return resWithData;
};
