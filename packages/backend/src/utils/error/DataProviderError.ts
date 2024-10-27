/**
 * This class is used to throw errors while fetching from a data provider.
 */
export default class DataProviderError extends Error {
  /**
   * Creates a new instance of the {@link DataProviderError} class.
   * @param message A descriptive message for the error.
   * @param options Additional options for the error.
   */
  constructor(
    message?: string,
    options?: ErrorOptions & {
      /**
       * A data source from which fetching failed. Can be an HTML document or a JSON object.
       */
      dataSources?: (Document | Object)[];
    },
  ) {
    super(message, typeof options === "object" && "cause" in options ? { cause: options.cause } : undefined);

    this.dataSources = options?.dataSources;
  }

  /**
   * A data source from which fetching failed. Can be an HTML document or a JSON object.
   */
  public dataSources?: (Document | Object)[];
}
