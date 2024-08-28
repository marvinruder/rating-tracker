import type { Stock } from "@rating-tracker/commons";

import Singleton from "../../utils/Singleton";

export default abstract class IndividualFetcher extends Singleton {
  /**
   * A function fetching information from a data provider for a single stock.
   * @param stock The stock to fetch information for
   * @param options Options for the fetch
   * @param options.isStandalone Whether the fetch is for a single stock
   * @returns a Promise that resolves after the fetch is completed successfully
   * @throws a {@link DataProviderError} in case of a severe error
   */
  abstract fetch(stock: Stock, options: { isStandalone: boolean }): Promise<void>;
}
