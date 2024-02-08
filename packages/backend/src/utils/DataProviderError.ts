/**
 * This class is used to throw errors while fetching from a data provider.
 */
export default class DataProviderError extends Error {
  /**
   * Creates a new instance of the {@link DataProviderError} class.
   * @param message A descriptive message for the error.
   * @param options Additional options for the error.
   */
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);

    // Set the prototype explicitly.
    DataProviderError.prototype.name = "DataProviderError";
    Object.setPrototypeOf(this, DataProviderError.prototype);
  }
}
