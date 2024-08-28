import type { Stock } from "@rating-tracker/commons";

import Singleton from "../../utils/Singleton";
import type { FetcherWorkspace } from "../fetch.service";

export default abstract class BulkFetcher extends Singleton {
  /**
   * A function fetching information from a data provider in bulk.
   * @param stocks The stocks to extract data for
   * @param options Options for the fetch
   * @param options.isStandalone Whether the fetch is for a single stock
   * @param options.clear If set, the fetcher will clear the data of the stock before fetching
   * @returns a Promise that resolves after the fetch is completed successfully
   * @throws a {@link DataProviderError} in case of a severe error
   */
  abstract fetch(
    stocks: FetcherWorkspace<Stock>,
    options: Partial<{ isStandalone: boolean; clear: boolean }>,
  ): Promise<void>;
}
