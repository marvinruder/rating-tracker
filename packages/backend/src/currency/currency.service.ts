import type { Currency, Resource } from "@rating-tracker/commons";

import type ResourceService from "../resource/resource.service";
import NotFoundError from "../utils/error/api/NotFoundError";
import ServiceUnavailableError from "../utils/error/api/ServiceUnavailableError";
import { performFetchRequest } from "../utils/fetchRequest";

/**
 * This service provides methods to retrieve currency exchange rates.
 */
class CurrencyService {
  constructor(private resourceService: ResourceService) {}

  /**
   * The URL of the currency exchange API, returning the exchange rate for USD.
   */
  #currencyExchangeAPIURL = "https://latest.currency-api.pages.dev/v1/currencies/usd.json";

  /**
   *
   */
  async convert(from: Currency, to: Currency, amount: number): Promise<number> {
    if (from === to) return amount;

    let currencyResource: Resource;
    try {
      currencyResource = await this.resourceService.read(this.#currencyExchangeAPIURL);
    } catch (e) {
      // If the resource is not in the database, fetch it from the API and store it in the database.
      await performFetchRequest(this.#currencyExchangeAPIURL)
        .then(async (response) => {
          let ttl: number;
          try {
            // Expire on the next day at 02:00 UTC, when the next exchange rate is likely to have been published.
            ttl = 0.001 * (Date.parse(`${response.data.date}T02:00:00Z`) + 86400000 - Date.now());
            // If the date is in the past, set a default TTL of 1 hour.
            if (ttl < 0) ttl = 3600;
          } catch (e) {
            // If the date is not in the response, set a default TTL of 1 day.
            /* c8 ignore next 2 */ // The mock response always has a date.
            ttl = 86400;
          }
          // Derive exchange rate of Penny Sterling from the exchange rate of Pound Sterling.
          if (!("gbx" in response.data.usd) && "gbp" in response.data.usd)
            response.data.usd.gbx = response.data.usd.gbp * 100;
          await this.resourceService.create(
            {
              uri: this.#currencyExchangeAPIURL,
              lastModifiedAt: new Date(response.headers.get("Date") ?? new Date(0)),
              content: new TextEncoder().encode(JSON.stringify(response.data)),
              contentType: response.headers.get("content-type") || "application/json",
            },
            ttl,
          );
          currencyResource = await this.resourceService.read(this.#currencyExchangeAPIURL);
        })
        .catch((e) => {
          // If the resource is not available, throw an error.
          /* c8 ignore next */ // The mock response is always available and valid.
          throw new ServiceUnavailableError("No currency information available", e);
        });
    }

    const currencyData = JSON.parse(new TextDecoder().decode(currencyResource!.content)).usd;
    const fromRate = currencyData[from.toLowerCase()];
    const toRate = currencyData[to.toLowerCase()];
    if (!fromRate) throw new NotFoundError(`No exchange rate available for currency “${from}”`);
    if (!toRate) throw new NotFoundError(`No exchange rate available for currency “${to}”`);

    // Convert the amount to USD and then to the target currency.
    return (toRate / fromRate) * amount;
  }
}

export default CurrencyService;
