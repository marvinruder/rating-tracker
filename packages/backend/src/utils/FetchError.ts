/**
 * This class is used to throw errors while fetching.
 */
export default class FetchError extends Error {
  /**
   * Creates a new instance of the {@link FetchError} class.
   *
   * @param {string} message A descriptive message for the error.
   * @param {ErrorOptions} options Additional options for the error.
   */
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);

    // Set the prototype explicitly.
    FetchError.prototype.name = "FetchError";
    Object.setPrototypeOf(this, FetchError.prototype);
  }
}
