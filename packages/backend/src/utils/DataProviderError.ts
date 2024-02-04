/**
 * This class is used to throw errors while fetching from a data provider.
 */
export default class DataProviderError extends Error {
  /**
   * Creates a new instance of the {@link DataProviderError} class.
   *
   * @param {string} message A descriptive message for the error.
   * @param {ErrorOptions} options Additional options for the error.
   */
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);

    // Set the prototype explicitly.
    DataProviderError.prototype.name = "FetchError";
    Object.setPrototypeOf(this, DataProviderError.prototype);
  }
}
