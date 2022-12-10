/* istanbul ignore file */
import { formatDistance } from "date-fns";
import { Request, Response } from "express";
import { Builder, By, Capabilities } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import APIError from "../lib/apiError.js";
import { Stock } from "../models/stock.js";
import chalk from "chalk";
import {
  Currency,
  Industry,
  isCurrency,
  isIndustry,
  isSize,
  isStyle,
  MSCIESGRating,
  Size,
  Style,
} from "rating-tracker-commons";
import {
  indexStockRepository,
  readAllStocks,
  readStock,
  updateStockWithoutReindexing,
} from "../redis/repositories/stock/stockRepository.js";
import { sendMessage } from "../signal/signal.js";

class FetchController {
  getDriver(pageLoadStrategy: "normal" | "eager" | "none" = "eager") {
    const url = process.env.SELENIUM_URL;

    const capabilities = new Capabilities();
    capabilities.setBrowserName("chrome");
    capabilities.setPageLoadStrategy(pageLoadStrategy);

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
          1000 * 60 * 60 * 12 // 12 hours
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
      let currency: Currency;
      let lastClose: number;
      let morningstarFairValue: number;
      let marketCap: number;
      let low52w: number;
      let high52w: number;

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
          sendMessage(
            `Stock ${stock.ticker}: Unable to extract industry: ${e.message}`
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
          sendMessage(
            `Stock ${stock.ticker}: Unable to extract size and style: ${e.message}`
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
          fetchSuccessful = false;
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract dividend yield: ${e.message}`
            )
          );
          sendMessage(
            `Stock ${stock.ticker}: Unable to extract dividend yield: ${e.message}`
          );
        }

        try {
          priceEarningRatio = +(
            await driver.findElement(By.id("Col0PE")).getText()
          ).replaceAll(",", "");
          if (isNaN(priceEarningRatio)) {
            priceEarningRatio = 0;
          }
        } catch (e) {
          fetchSuccessful = false;
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract price earning ratio: ${e.message}`
            )
          );
          sendMessage(
            `Stock ${stock.ticker}: Unable to extract price earning ratio: ${e.message}`
          );
        }

        try {
          let currencyString = await driver
            .findElement(By.id("Col0PriceTime"))
            .getText();
          currencyString = currencyString.match(/\s+\|\s+([A-Z]{3})\s+/)[1];
          if (isCurrency(currencyString)) {
            currency = currencyString;
          } else {
            throw TypeError(
              `Extracted currency code “${currencyString}” is no valid currency code.`
            );
          }
        } catch (e) {
          fetchSuccessful = false;
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract currency: ${e.message}`
            )
          );
          sendMessage(
            `Stock ${stock.ticker}: Unable to extract currency: ${e.message}`
          );
        }

        try {
          lastClose = +(
            await driver.findElement(By.id("Col0LastClose")).getText()
          ).replaceAll(",", "");
          if (isNaN(lastClose)) {
            lastClose = 0;
          }
        } catch (e) {
          fetchSuccessful = false;
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract last close: ${e.message}`
            )
          );
          sendMessage(
            `Stock ${stock.ticker}: Unable to extract last close: ${e.message}`
          );
        }

        try {
          morningstarFairValue = +(
            await driver
              .findElement(By.xpath("//*/datapoint[@id='FairValueEstimate']"))
              .getText()
          )
            .split(/\s+/)[0]
            .replaceAll(",", "");
          if (isNaN(morningstarFairValue)) {
            morningstarFairValue = 0;
          }
        } catch (e) {
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract Morningstar Fair Value: ${e.message}`
            )
          );
          sendMessage(
            `Stock ${stock.ticker}: Unable to extract Morningstar Fair Value: ${e.message}`
          );
        }

        try {
          const marketCapText = (
            await driver.findElement(By.id("Col0MCap")).getText()
          ).replaceAll(",", "");
          if (marketCapText.includes("Bil")) {
            marketCap = Math.round(
              1e9 * +marketCapText.substring(0, marketCapText.indexOf("Bil"))
            );
          } else if (marketCapText.includes("Mil")) {
            marketCap = Math.round(
              1e6 * +marketCapText.substring(0, marketCapText.indexOf("Mil"))
            );
          } else {
            marketCap = +marketCapText;
          }
          if (isNaN(marketCap)) {
            marketCap = 0;
          }
        } catch (e) {
          fetchSuccessful = false;
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract Market Capitalization: ${e.message}`
            )
          );
          sendMessage(
            `Stock ${stock.ticker}: Unable to extract Market Capitalization: ${e.message}`
          );
        }

        try {
          const range52wTexts = (
            await driver.findElement(By.id("Col0WeekRange")).getText()
          )
            .replaceAll(",", "")
            .split(" - ");
          low52w = +range52wTexts[0];
          if (isNaN(low52w)) {
            low52w = 0;
          }
          high52w = +range52wTexts[1];
          if (isNaN(high52w)) {
            high52w = 0;
          }
        } catch (e) {
          fetchSuccessful = false;
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract 52 week price range: ${e.message}`
            )
          );
          sendMessage(
            `Stock ${stock.ticker}: Unable to extract 52 week price range: ${e.message}`
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
          currency: currency,
          lastClose: lastClose,
          morningstarFairValue: morningstarFairValue,
          marketCap: marketCap,
          low52w: low52w,
          high52w: high52w,
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
        sendMessage(
          `Stock ${stock.ticker}: Unable to fetch Morningstar information: ${e.message}`
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

  async fetchMSCIData(req: Request, res: Response) {
    let stocks: Stock[];

    if (req.query.ticker) {
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stocks = [await readStock(ticker)];
        if (!stocks[0].msciId) {
          throw new APIError(404, `Stock ${ticker} does not have a MSCI ID.`);
        }
      }
    } else {
      stocks = (await readAllStocks()).map(
        (stockEntity) => new Stock(stockEntity)
      );
    }

    stocks = stocks
      .filter((stock) => stock.msciId)
      .sort(
        (a, b) =>
          (a.msciLastFetch ?? new Date(0)).getTime() -
          (b.msciLastFetch ?? new Date(0)).getTime()
      );
    if (stocks.length === 0) {
      return res.status(204).end();
    }
    if (req.query.detach) {
      res.sendStatus(202);
    }

    const updatedStocks: Stock[] = [];
    const driver = this.getDriver("normal");
    for await (const stock of stocks) {
      if (
        !req.query.noSkip &&
        stock.msciLastFetch &&
        new Date().getTime() - stock.msciLastFetch.getTime() <
          1000 * 60 * 60 * 24 * 7 // 7 days
      ) {
        console.warn(
          chalk.yellowBright(
            `Stock ${
              stock.ticker
            }: Skipping since last successful fetch was ${formatDistance(
              stock.msciLastFetch.getTime(),
              new Date().getTime(),
              { addSuffix: true }
            )}`
          )
        );
        continue;
      }
      let msciESGRating: MSCIESGRating;
      let msciTemperature: number;

      try {
        await driver.manage().deleteAllCookies();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await driver.get(
          `https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool/issuer/${stock.msciId}`
        );

        let fetchSuccessful = true;
        try {
          const esgClassName = await driver
            .findElement(By.className("ratingdata-company-rating"))
            .getAttribute("class");
          msciESGRating = esgClassName
            .substring(esgClassName.lastIndexOf("-") + 1)
            .toUpperCase() as MSCIESGRating;
        } catch (e) {
          fetchSuccessful = false;
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract MSCI ESG Rating: ${e.message}`
            )
          );
          sendMessage(
            `Stock ${stock.ticker}: Unable to extract MSCI ESG Rating: ${e.message}`
          );
        }

        try {
          const temperatureText = await driver
            .findElement(By.className("implied-temp-rise-value"))
            .getAttribute("outerText");
          msciTemperature = +temperatureText.match(/(\d+(\.\d+)?)/g)[0];
        } catch (e) {
          fetchSuccessful = false;
          console.warn(
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract MSCI Implied Temperature Rise: ${e.message}`
            )
          );
          sendMessage(
            `Stock ${stock.ticker}: Unable to extract MSCI Implied Temperature Rise: ${e.message}`
          );
        }

        await updateStockWithoutReindexing(stock.ticker, {
          msciLastFetch: fetchSuccessful ? new Date() : undefined,
          msciESGRating: msciESGRating,
          msciTemperature: msciTemperature,
        });
        updatedStocks.push(await readStock(stock.ticker));
      } catch (e) {
        if (req.query.ticker) {
          throw new APIError(
            502,
            `Stock ${stock.ticker}: Unable to fetch MSCI information: ${e.message}`
          );
        }
        console.warn(
          chalk.yellowBright(
            `Stock ${stock.ticker}: Unable to fetch MSCI information: ${e.message}`
          )
        );
        sendMessage(
          `Stock ${stock.ticker}: Unable to fetch MSCI information: ${e.message}`
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
