import { formatDistance } from "date-fns";
import { Request, Response } from "express";
import { Builder, By, Capabilities } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import APIError from "../apiError.js";
import { Stock } from "../models/stock.js";
import {
  indexStockRepository,
  readAllStocks,
  readStock,
  updateStockWithoutReindexing,
} from "../redis/repositories/stockRepository.js";
import chalk from "chalk";
import {
  Industry,
  isIndustry,
  isSize,
  isStyle,
  Size,
  Style,
} from "../types.js";

class FetchController {
  getDriver() {
    const url = process.env.SELENIUM_URL || "http://selenium:4444";

    const capabilities = new Capabilities();
    capabilities.setBrowserName("chrome");
    capabilities.setPageLoadStrategy("eager");

    return new Builder()
      .usingServer(url)
      .withCapabilities(capabilities)
      .setChromeOptions(new Options().headless())
      .build();
  }

  async fetchMorningstarData(req: Request, res: Response) {
    let stocks: Stock[];

    if (req.query.ticker) {
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stocks = [await readStock(ticker)];
        if (!stocks[0].morningstarId) {
          throw new APIError(
            404,
            `Stock ${ticker} does not have a Morningstar ID.`
          );
        }
      }
    } else {
      stocks = (await readAllStocks()).map(
        (stockEntity) => new Stock(stockEntity)
      );
    }

    stocks = stocks
      .filter((stock) => stock.morningstarId)
      .sort(
        (a, b) =>
          (a.morningstarLastFetch ?? new Date(0)).getTime() -
          (b.morningstarLastFetch ?? new Date(0)).getTime()
      );
    if (stocks.length === 0) {
      return res.status(204).end();
    }
    if (req.query.detach) {
      res.sendStatus(202);
    }

    const updatedStocks: Stock[] = [];
    const driver = this.getDriver();
    for await (const stock of stocks) {
      if (
        !req.query.noSkip &&
        stock.morningstarLastFetch &&
        new Date().getTime() - stock.morningstarLastFetch.getTime() <
          1000 * 60 * 60 * 12
      ) {
        console.warn(
          chalk.yellowBright(
            `Stock ${
              stock.ticker
            }: Skipping since last successful fetch was ${formatDistance(
              stock.morningstarLastFetch.getTime(),
              new Date().getTime(),
              { addSuffix: true }
            )}`
          )
        );
        continue;
      }
      let industry: Industry;
      let size: Size;
      let style: Style;
      let starRating: number;
      let dividendYieldPercent: number;
      let priceEarningRatio: number;

      try {
        await driver.get(
          `https://tools.morningstar.co.uk/uk/stockreport/default.aspx?Site=us&id=${stock.morningstarId}&LanguageId=en-US&SecurityToken=${stock.morningstarId}]3]0]E0WWE$$ALL`
        );

        let fetchSuccessful = true;
        try {
          const industryString = (
            await driver
              .findElement(
                By.xpath(
                  "//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Industry')]/.."
                )
              )
              .getText()
          )
            .replace("Industry\n", "")
            .replaceAll(/[^a-zA-Z0-9]/g, "");
          if (isIndustry(industryString)) {
            industry = industryString;
          } else {
            throw TypeError(
              `Extracted industry “${industryString}” is no valid industry.`
            );
          }
        } catch (e) {
          fetchSuccessful = false;
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract industry: ${e.message}`
            )
          );
        }

        try {
          const sizeAndStyle = (
            await driver
              .findElement(
                By.xpath(
                  "//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Stock Style')]/.."
                )
              )
              .getText()
          )
            .replace("Stock Style\n", "")
            .split("-");
          if (isSize(sizeAndStyle[0])) {
            size = sizeAndStyle[0];
          } else {
            throw TypeError(
              `Extracted size “${sizeAndStyle[0]}” is no valid size.`
            );
          }
          if (isStyle(sizeAndStyle[1])) {
            style = sizeAndStyle[1];
          } else {
            throw TypeError(
              `Extracted style “${sizeAndStyle[1]}” is no valid style.`
            );
          }
        } catch (e) {
          fetchSuccessful = false;
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract size and style: ${e.message}`
            )
          );
        }

        try {
          starRating = +(
            await driver
              .findElement(By.xpath("//*/img[@class='starsImg']"))
              .getAttribute("alt")
          ).replaceAll(/\D/g, "");
          if (isNaN(starRating)) {
            starRating = 0;
          }
        } catch (e) {
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract star rating: ${e.message}`
            )
          );
        }

        try {
          dividendYieldPercent = +(await driver
            .findElement(By.id("Col0Yield"))
            .getText());
          if (isNaN(dividendYieldPercent)) {
            dividendYieldPercent = 0;
          }
        } catch (e) {
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract dividend yield: ${e.message}`
            )
          );
        }

        try {
          priceEarningRatio = +(await driver
            .findElement(By.id("Col0PE"))
            .getText());
          if (isNaN(priceEarningRatio)) {
            priceEarningRatio = 0;
          }
        } catch (e) {
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract price earning ratio: ${e.message}`
            )
          );
        }

        await updateStockWithoutReindexing(stock.ticker, {
          industry: industry,
          size: size,
          style: style,
          morningstarLastFetch: fetchSuccessful ? new Date() : undefined,
          starRating: starRating,
          dividendYieldPercent: dividendYieldPercent,
          priceEarningRatio: priceEarningRatio,
        });
        updatedStocks.push(await readStock(stock.ticker));
      } catch (e) {
        if (req.query.ticker) {
          throw new APIError(
            502,
            `Stock ${stock.ticker}: Unable to fetch Morningstar information: ${e.message}`
          );
        }
        console.warn(
          chalk.yellowBright(
            `Stock ${stock.ticker}: Unable to fetch Morningstar information: ${e.message}`
          )
        );
      }
    }
    await driver.quit();
    if (updatedStocks.length === 0) {
      return res.status(204).end();
    } else {
      indexStockRepository();
      return res.status(200).json(updatedStocks);
    }
  }
}

export default new FetchController();
