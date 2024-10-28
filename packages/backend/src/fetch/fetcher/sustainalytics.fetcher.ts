import { dataProviderProperties, dataProviderTTL, type Resource, type Stock } from "@rating-tracker/commons";

import type ResourceService from "../../resource/resource.service";
import SignalService from "../../signal/signal.service";
import type StockService from "../../stock/stock.service";
import type UserService from "../../user/user.service";
import BadGatewayError from "../../utils/error/api/BadGatewayError";
import NotFoundError from "../../utils/error/api/NotFoundError";
import ErrorHelper from "../../utils/error/errorHelper";
import { performFetchRequest } from "../../utils/fetchRequest";
import Logger from "../../utils/logger";
import type { FetcherWorkspace } from "../fetch.service";

import BulkFetcher from "./BulkFetcher";

/**
 * This fetcher fetches data from Morningstar Sustainalytics.
 */
class SustainalyticsFetcher extends BulkFetcher {
  constructor(
    private resourceService: ResourceService,
    private signalService: SignalService,
    private stockService: StockService,
    private userService: UserService,
  ) {
    super();
  }

  #sustainalyticsURL = "https://www.sustainalytics.com/sustapi/companyratings/getcompanyratings" as const;

  /**
   * Fetches data from Morningstar Sustainalytics.
   * @param stocks The stocks to extract data for
   * @param options Options for the fetch
   * @param options.isStandalone Whether the fetch is for a single stock
   * @param options.clear If set, the fetcher will clear the data of the stock before fetching
   * @throws a {@link DataProviderError} in case of a severe error
   */
  async fetch(stocks: FetcherWorkspace<Stock>, options: { isStandalone: boolean; clear: boolean }): Promise<void> {
    let sustainalyticsXMLResource: Resource;
    try {
      try {
        // We try to read the cached Sustainalytics data first.
        sustainalyticsXMLResource = await this.resourceService.read(this.#sustainalyticsURL);
        Logger.info(
          {
            component: "fetch",
            dataProvider: "sustainalytics",
            lastFetchDate: sustainalyticsXMLResource.lastModifiedAt,
          },
          "Using cached data because of recent fetch",
        );
      } catch (e) {
        // If the cached data is not available, we fetch it freshly from the web.
        await performFetchRequest(this.#sustainalyticsURL, {
          // We use a large pageSize to fetch all at once.
          body: "page=1&pageSize=100000&resourcePackage=Sustainalytics",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          method: "POST",
        })
          .then(async (response) => {
            const sustainalyticsXMLLines: string[] = [];
            response.data.split("\n").forEach((line: string) => {
              // We only keep the lines that contain the data we need.
              if (line.includes('<a data-href="') || line.includes('<div class="col-2">')) {
                sustainalyticsXMLLines.push(line.trim());
              }
            });
            // We cache the data for 7 days.
            await this.resourceService.create(
              {
                uri: this.#sustainalyticsURL,
                lastModifiedAt: new Date(response.headers.get("Date") || 0),
                content: Buffer.from(sustainalyticsXMLLines.join("\n")),
                contentType: "text/xml; charset=utf-8",
              },
              dataProviderTTL["sustainalytics"],
            );
            sustainalyticsXMLResource = await this.resourceService.read(this.#sustainalyticsURL);
          })
          .catch((e) => {
            throw e;
          });
      }
    } catch (e) {
      throw new BadGatewayError("Unable to fetch Sustainalytics information", e instanceof Error ? e : undefined);
    }

    const sustainalyticsXMLLines = sustainalyticsXMLResource!.content.toString().split("\n");

    // Work while stocks are in the queue
    while (stocks.queued.length) {
      // Get the first stock in the queue
      let stock = stocks.queued.shift()!;

      if (options.clear) {
        await this.stockService.update(
          stock.ticker,
          dataProviderProperties["sustainalytics"].reduce((obj, key) => ({ ...obj, [key]: null }), {}),
          undefined,
          true,
        );
        stock = await this.stockService.read(stock.ticker);
      }

      let sustainalyticsESGRisk: number | undefined;

      try {
        // Look for the Sustainalytics ID in the XML lines.
        const sustainalyticsIDIndex = sustainalyticsXMLLines.findIndex(
          (line, index) =>
            line.startsWith(`<a data-href="/${stock.sustainalyticsID}`) &&
            sustainalyticsXMLLines[index + 1].startsWith('<div class="col-2">'),
        );
        // If the Sustainalytics ID is not found, we throw an error.
        if (sustainalyticsIDIndex === -1)
          throw new NotFoundError(`Cannot find Sustainalytics ID ${stock.sustainalyticsID} in XML.`);

        const sustainalyticsESGRiskLine = sustainalyticsXMLLines[sustainalyticsIDIndex + 1];
        const sustainalyticsESGRiskMatches = sustainalyticsESGRiskLine // Example: <div class="col-2">25.2</div>
          .substring(sustainalyticsESGRiskLine.indexOf(">") + 1)
          .match(/(\d+(\.\d+)?)/g);

        if (
          sustainalyticsESGRiskMatches === null ||
          sustainalyticsESGRiskMatches.length < 1 ||
          Number.isNaN(+sustainalyticsESGRiskMatches[0])
        )
          throw new TypeError("Extracted Sustainalytics ESG Risk is no valid number.");
        sustainalyticsESGRisk = +sustainalyticsESGRiskMatches[0];

        // Update the stock in the database.
        await this.stockService.update(stock.ticker, {
          sustainalyticsESGRisk,
        });
        stocks.successful.push(await this.stockService.read(stock.ticker));
      } catch (e) {
        if (options.isStandalone)
          // If this request was for a single stock, we throw an error.
          throw new BadGatewayError(
            `Stock ${stock.ticker}: Unable to extract Sustainalytics ESG Risk`,
            e instanceof Error ? e : undefined,
          );
        Logger.warn(
          {
            component: "fetch",
            stock: stock.ticker,
            dataProvider: "sustainalytics",
            attribute: "sustainalyticsESGRisk",
            reason: e?.toString(),
          },
          "Unable to extract attribute",
        );
        if (stock.sustainalyticsESGRisk !== null) {
          // If a Sustainalytics ESG Risk is already stored in the database, but we cannot extract it from the page, we
          // log this as an error and send a message.
          Logger.error(
            {
              component: "fetch",
              stock: stock.ticker,
              dataProvider: "sustainalytics",
              attribute: "sustainalyticsESGRisk",
              reason: e?.toString(),
            },
            "Extraction of attribute failed unexpectedly",
          );
          this.signalService.sendMessage(
            `${
              SignalService.ERROR_PREFIX
            }Stock ${stock.ticker}: Unable to extract Sustainalytics ESG Risk: ${ErrorHelper.getSummary(e)}`,
            await this.userService.readMessageRecipients("fetchError"),
          );
          stocks.failed.push(stock);
        } else {
          stocks.successful.push(await this.stockService.read(stock.ticker));
        }
      }
      if (stocks.failed.length >= 10) {
        // If we have 10 errors, we stop extracting data, since something is probably wrong.
        Logger.error(
          {
            component: "fetch",
            dataProvider: "sustainalytics",
            count: { success: stocks.successful.length, failed: stocks.failed.length },
          },
          "Aborting extracting information from data provider. Will continue next time.",
        );
        this.signalService.sendMessage(
          `${
            SignalService.ERROR_PREFIX
          }Aborting extracting information from Sustainalytics after ${stocks.successful.length} successful ` +
            `extractions and ${stocks.failed.length} failures. Will continue next time.`,
          await this.userService.readMessageRecipients("fetchError"),
        );
        break;
      }
    }
  }
}

export default SustainalyticsFetcher;
