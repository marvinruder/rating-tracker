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
  Resource,
  Size,
  Style,
} from "rating-tracker-commons";
import {
  readAllStocks,
  readStock,
  updateStock,
} from "../redis/repositories/stock/stockRepository.js";
import * as signal from "../signal/signal.js";
import logger, { PREFIX_CHROME } from "../lib/logger.js";
import {
  createResource,
  readResource,
} from "../redis/repositories/resource/resourceRepository.js";
import axios from "axios";

const XPATH_INDUSTRY =
  "//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Industry')]/.." as const;
const XPATH_SIZE_STYLE =
  "//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Stock Style')]/.." as const;
const XPATH_STAR_RATING = "//*/img[@class='starsImg']" as const;
const XPATH_MORNINGSTAR_FAIR_VALUE =
  "//*/datapoint[@id='FairValueEstimate']" as const;

const XPATH_CONSENSUS_DIV =
  "//*/div[@class='tabTitleLeftWhite']/b[contains(text(), 'Consensus')]/../../../.." as const;
const XPATH_CONSENSUS_NOTE =
  "//div/table/tbody/tr/td/div/div[starts-with(@title, 'Note : ')]" as const;
const XPATH_ANALYST_COUNT =
  "//div/table/tbody/tr/td[contains(text(), 'Number of Analysts')]/following-sibling::td" as const;
const XPATH_SPREAD_AVERAGE_TARGET =
  "//div/table/tbody/tr/td[contains(text(), 'Spread / Average Target')]/following-sibling::td" as const;

const URL_SUSTAINALYTICS =
  "https://www.sustainalytics.com/sustapi/companyratings/getcompanyratings";

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
          1000 * 60 * 60 * 12
      ) {
        logger.info(
          PREFIX_CHROME +
            `Stock ${
              stock.ticker
            }: Skipping since last successful fetch was ${formatDistance(
              stock.morningstarLastFetch.getTime(),
              new Date().getTime(),
              { addSuffix: true }
            )}`
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

        let errorMessage = `Error while fetching Morningstar data for ${stock.name} (${stock.ticker}):`;

        try {
          const industryString = (
            await driver.findElement(By.xpath(XPATH_INDUSTRY)).getText()
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
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(
                `Stock ${stock.ticker}: Unable to extract industry: ${e.message}`
              )
          );
          if (stock.industry !== undefined) {
            errorMessage += `\n\tUnable to extract industry: ${e.message}`;
          }
        }

        try {
          const sizeAndStyle = (
            await driver.findElement(By.xpath(XPATH_SIZE_STYLE)).getText()
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
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(
                `Stock ${stock.ticker}: Unable to extract size and style: ${e.message}`
              )
          );
          if (stock.size !== undefined || stock.style !== undefined) {
            errorMessage += `\n\tUnable to extract size and style: ${e.message}`;
          }
        }

        try {
          const starRatingString = (
            await driver
              .findElement(By.xpath(XPATH_STAR_RATING))
              .getAttribute("alt")
          ).replaceAll(/\D/g, "");
          if (starRatingString.length === 0 || isNaN(+starRatingString)) {
            throw TypeError(`Extracted star rating is no valid number.`);
          }
          starRating = +starRatingString;
        } catch (e) {
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(
                `Stock ${stock.ticker}: Unable to extract star rating: ${e.message}`
              )
          );
          if (stock.starRating !== undefined) {
            errorMessage += `\n\tUnable to extract star rating: ${e.message}`;
          }
        }

        try {
          const dividendYieldPercentString = await driver
            .findElement(By.id("Col0Yield"))
            .getText();
          if (
            dividendYieldPercentString.length === 0 ||
            isNaN(+dividendYieldPercentString)
          ) {
            throw TypeError(`Extracted dividend yield is no valid number.`);
          }
          dividendYieldPercent = +dividendYieldPercentString;
        } catch (e) {
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(
                `Stock ${stock.ticker}: Unable to extract dividend yield: ${e.message}`
              )
          );
          if (stock.dividendYieldPercent !== undefined) {
            errorMessage += `\n\tUnable to extract dividend yield: ${e.message}`;
          }
        }

        try {
          const priceEarningRatioString = (
            await driver.findElement(By.id("Col0PE")).getText()
          ).replaceAll(",", "");
          if (
            priceEarningRatioString.length === 0 ||
            isNaN(+priceEarningRatioString)
          ) {
            throw TypeError(
              `Extracted price earning ratio is no valid number.`
            );
          }
          priceEarningRatio = +priceEarningRatioString;
        } catch (e) {
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(
                `Stock ${stock.ticker}: Unable to extract price earning ratio: ${e.message}`
              )
          );
          if (stock.priceEarningRatio !== undefined) {
            errorMessage += `\n\tUnable to extract price earning ratio: ${e.message}`;
          }
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
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(
                `Stock ${stock.ticker}: Unable to extract currency: ${e.message}`
              )
          );
          if (stock.currency !== undefined) {
            errorMessage += `\n\tUnable to extract currency: ${e.message}`;
          }
        }

        try {
          const lastCloseString = (
            await driver.findElement(By.id("Col0LastClose")).getText()
          ).replaceAll(",", "");
          if (lastCloseString.length === 0 || isNaN(+lastCloseString)) {
            throw TypeError(`Extracted last close is no valid number.`);
          }
          lastClose = +lastCloseString;
        } catch (e) {
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(
                `Stock ${stock.ticker}: Unable to extract last close: ${e.message}`
              )
          );
          if (stock.lastClose !== undefined) {
            errorMessage += `\n\tUnable to extract last close: ${e.message}`;
          }
        }

        try {
          const morningstarFairValueString = (
            await driver
              .findElement(By.xpath(XPATH_MORNINGSTAR_FAIR_VALUE))
              .getText()
          )
            .split(/\s+/)[0]
            .replaceAll(",", "");
          if (
            morningstarFairValueString.length === 0 ||
            isNaN(+morningstarFairValueString)
          ) {
            throw TypeError(
              `Extracted Morningstar Fair Value is no valid number.`
            );
          }
          morningstarFairValue = +morningstarFairValueString;
        } catch (e) {
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(
                `Stock ${stock.ticker}: Unable to extract Morningstar Fair Value: ${e.message}`
              )
          );
          if (stock.morningstarFairValue !== undefined) {
            errorMessage += `\n\tUnable to extract Morningstar Fair Value: ${e.message}`;
          }
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
          if (!marketCapText.match(/\d+/) || isNaN(marketCap)) {
            marketCap = undefined;
            throw TypeError(
              `Extracted market capitalization is no valid number.`
            );
          }
        } catch (e) {
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(
                `Stock ${stock.ticker}: Unable to extract Market Capitalization: ${e.message}`
              )
          );
          if (stock.marketCap !== undefined) {
            errorMessage += `\n\tUnable to extract Market Capitalization: ${e.message}`;
          }
        }

        try {
          const range52wStrings = (
            await driver.findElement(By.id("Col0WeekRange")).getText()
          )
            .replaceAll(",", "")
            .split(" - ");
          if (
            range52wStrings[0].length === 0 ||
            range52wStrings[1].length === 0 ||
            isNaN(+range52wStrings[0]) ||
            isNaN(+range52wStrings[1])
          ) {
            throw TypeError(
              `Extracted 52 week low or high is no valid number.`
            );
          }
          low52w = +range52wStrings[0];
          high52w = +range52wStrings[1];
        } catch (e) {
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(
                `Stock ${stock.ticker}: Unable to extract 52 week price range: ${e.message}`
              )
          );
          if (stock.low52w !== undefined || stock.high52w !== undefined) {
            errorMessage += `\n\tUnable to extract 52 week price range: ${e.message}`;
          }
        }

        if (errorMessage.includes("\n")) {
          signal.sendMessage(errorMessage);
        }
        await updateStock(stock.ticker, {
          industry,
          size,
          style,
          morningstarLastFetch: errorMessage.includes("\n")
            ? undefined
            : new Date(),
          starRating,
          dividendYieldPercent,
          priceEarningRatio,
          currency,
          lastClose,
          morningstarFairValue,
          marketCap,
          low52w,
          high52w,
        });
        updatedStocks.push(await readStock(stock.ticker));
      } catch (e) {
        if (req.query.ticker) {
          await driver.quit();
          throw new APIError(
            502,
            `Stock ${stock.ticker}: Unable to fetch Morningstar data: ${e.message}`
          );
        }
        logger.warn(
          PREFIX_CHROME +
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to fetch Morningstar data: ${e.message}`
            )
        );
        signal.sendMessage(
          `Stock ${stock.ticker}: Unable to fetch Morningstar data: ${e.message}`
        );
      }
    }
    await driver.quit();
    if (updatedStocks.length === 0) {
      return res.status(204).end();
    } else {
      return res.status(200).json(updatedStocks);
    }
  }

  async fetchMarketScreenerData(req: Request, res: Response) {
    let stocks: Stock[];

    if (req.query.ticker) {
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stocks = [await readStock(ticker)];
        if (!stocks[0].marketScreenerId) {
          throw new APIError(
            404,
            `Stock ${ticker} does not have a MarketScreener ID.`
          );
        }
      }
    } else {
      stocks = (await readAllStocks()).map(
        (stockEntity) => new Stock(stockEntity)
      );
    }

    stocks = stocks
      .filter((stock) => stock.marketScreenerId)
      .sort(
        (a, b) =>
          (a.marketScreenerLastFetch ?? new Date(0)).getTime() -
          (b.marketScreenerLastFetch ?? new Date(0)).getTime()
      );
    if (stocks.length === 0) {
      return res.status(204).end();
    }
    if (req.query.detach) {
      res.status(202);
    }

    const updatedStocks: Stock[] = [];
    const driver = this.getDriver();
    for await (const stock of stocks) {
      if (
        !req.query.noSkip &&
        stock.marketScreenerLastFetch &&
        new Date().getTime() - stock.marketScreenerLastFetch.getTime() <
          1000 * 60 * 60 * 12
      ) {
        logger.info(
          PREFIX_CHROME +
            `Stock ${
              stock.ticker
            }: Skipping MarketScreener fetch because last fetch was ${formatDistance(
              stock.marketScreenerLastFetch.getTime(),
              new Date().getTime(),
              { addSuffix: true }
            )}`
        );
        continue;
      }
      let analystConsensus: number;
      let analystCount: number;
      let analystTargetPrice: number;

      try {
        await driver.get(
          `https://www.marketscreener.com/quote/stock/${stock.marketScreenerId}/`
        );

        let errorMessage = `Error while fetching MarketScreener data for stock ${stock.ticker}:`;

        try {
          const consensusTableDiv = await driver.findElement(
            By.xpath(XPATH_CONSENSUS_DIV)
          );

          try {
            analystConsensus = +(
              await (
                await consensusTableDiv.findElement(
                  By.xpath(XPATH_CONSENSUS_NOTE)
                )
              ).getAttribute("title")
            ).match(/(\d+(\.\d+)?)/g)[0];
          } catch (e) {
            logger.warn(
              PREFIX_CHROME +
                chalk.yellowBright(
                  `Stock ${stock.ticker}: Unable to extract Analyst Consensus: ${e.message}`
                )
            );
            if (stock.analystConsensus !== undefined) {
              errorMessage += `\n\tUnable to extract Analyst Consensus: ${e.message}`;
            }
          }

          try {
            analystCount = +(await (
              await consensusTableDiv.findElement(By.xpath(XPATH_ANALYST_COUNT))
            ).getText());
          } catch (e) {
            logger.warn(
              PREFIX_CHROME +
                chalk.yellowBright(
                  `Stock ${stock.ticker}: Unable to extract Analyst Count: ${e.message}`
                )
            );
            if (stock.analystCount !== undefined) {
              errorMessage += `\n\tUnable to extract Analyst Count: ${e.message}`;
            }
          }

          try {
            if (!stock.lastClose) {
              throw new Error(
                "No Last Close price available to compare spread against."
              );
            }
            analystTargetPrice =
              stock.lastClose *
              (+(
                await (
                  await consensusTableDiv.findElement(
                    By.xpath(XPATH_SPREAD_AVERAGE_TARGET)
                  )
                ).getText()
              )
                .replaceAll(",", ".")
                .match(/(\-)?\d+(\.\d+)?/g)[0] /
                100 +
                1);
          } catch (e) {
            logger.warn(
              PREFIX_CHROME +
                chalk.yellowBright(
                  `Stock ${stock.ticker}: Unable to extract Analyst Target Price: ${e.message}`
                )
            );
            if (stock.analystTargetPrice !== undefined) {
              errorMessage += `\n\tUnable to extract Analyst Target Price: ${e.message}`;
            }
          }
        } catch (e) {
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(
                `Stock ${stock.ticker}: \n\tUnable to extract Analyst Information: ${e.message}`
              )
          );
          if (
            stock.analystConsensus !== undefined ||
            stock.analystCount !== undefined ||
            stock.analystTargetPrice !== undefined
          ) {
            errorMessage += `\n\tUnable to extract Analyst Information: ${e.message}`;
          }
        }

        if (errorMessage.includes("\n")) {
          signal.sendMessage(errorMessage);
        }
        await updateStock(stock.ticker, {
          marketScreenerLastFetch: errorMessage.includes("\n")
            ? undefined
            : new Date(),
          analystConsensus,
          analystCount,
          analystTargetPrice,
        });
        updatedStocks.push(await readStock(stock.ticker));
      } catch (e) {
        if (req.query.ticker) {
          await driver.quit();
          throw new APIError(
            502,
            `Stock ${stock.ticker}: Unable to fetch MarketScreener data: ${e.message}`
          );
        }
        logger.warn(
          PREFIX_CHROME +
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to fetch MarketScreener data: ${e.message}`
            )
        );
        signal.sendMessage(
          `Stock ${stock.ticker}: Unable to fetch MarketScreener data: ${e.message}`
        );
      }
    }
    await driver.quit();
    if (updatedStocks.length === 0) {
      return res.status(204).end();
    } else {
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
          1000 * 60 * 60 * 24 * 7
      ) {
        logger.info(
          PREFIX_CHROME +
            `Stock ${
              stock.ticker
            }: Skipping since last successful fetch was ${formatDistance(
              stock.msciLastFetch.getTime(),
              new Date().getTime(),
              { addSuffix: true }
            )}`
        );
        continue;
      }
      let msciESGRating: MSCIESGRating;
      let msciTemperature: number;

      try {
        await driver.manage().deleteAllCookies();
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await driver.get(
          `https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool/issuer/${stock.msciId}`
        );

        let errorMessage = `Error while fetching MSCI information for ${stock.name} (${stock.ticker}):`;

        try {
          const esgClassName = await driver
            .findElement(By.className("ratingdata-company-rating"))
            .getAttribute("class");
          msciESGRating = esgClassName
            .substring(esgClassName.lastIndexOf("-") + 1)
            .toUpperCase() as MSCIESGRating;
        } catch (e) {
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(
                `Stock ${stock.ticker}: Unable to extract MSCI ESG Rating: ${e.message}`
              )
          );
          if (stock.msciESGRating !== undefined) {
            errorMessage += `\n\tUnable to extract MSCI ESG Rating: ${e.message}`;
          }
        }

        try {
          msciTemperature = +(
            await driver
              .findElement(By.className("implied-temp-rise-value"))
              .getAttribute("outerText")
          ).match(/(\d+(\.\d+)?)/g)[0];
        } catch (e) {
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(
                `Stock ${stock.ticker}: Unable to extract MSCI Implied Temperature Rise: ${e.message}`
              )
          );
          if (stock.msciTemperature !== undefined) {
            errorMessage += `\n\tUnable to extract MSCI Implied Temperature Rise: ${e.message}`;
          }
        }

        if (
          errorMessage.includes("\n") &&
          (!stock.msciLastFetch ||
            new Date().getTime() - stock.msciLastFetch.getTime() >
              1000 * 60 * 60 * 24 * 10) // 7 days + 3 more tries
        ) {
          signal.sendMessage(errorMessage);
        }
        await updateStock(stock.ticker, {
          msciLastFetch: errorMessage.includes("\n") ? undefined : new Date(),
          msciESGRating,
          msciTemperature,
        });
        updatedStocks.push(await readStock(stock.ticker));
      } catch (e) {
        if (req.query.ticker) {
          await driver.quit();
          throw new APIError(
            502,
            `Stock ${stock.ticker}: Unable to fetch MSCI information: ${e.message}`
          );
        }
        logger.warn(
          PREFIX_CHROME +
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to fetch MSCI information: ${e.message}`
            )
        );
        signal.sendMessage(
          `Stock ${stock.ticker}: Unable to fetch MSCI information: ${e.message}`
        );
      }
    }
    await driver.quit();
    if (updatedStocks.length === 0) {
      return res.status(204).end();
    } else {
      return res.status(200).json(updatedStocks);
    }
  }

  async fetchRefinitivData(req: Request, res: Response) {
    let stocks: Stock[];

    if (req.query.ticker) {
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stocks = [await readStock(ticker)];
        if (!stocks[0].ric) {
          throw new APIError(404, `Stock ${ticker} does not have a RIC.`);
        }
      }
    } else {
      stocks = (await readAllStocks()).map(
        (stockEntity) => new Stock(stockEntity)
      );
    }

    stocks = stocks
      .filter((stock) => stock.ric)
      .sort(
        (a, b) =>
          (a.refinitivLastFetch ?? new Date(0)).getTime() -
          (b.refinitivLastFetch ?? new Date(0)).getTime()
      );
    if (stocks.length === 0) {
      return res.status(204).end();
    }
    if (req.query.detach) {
      res.status(202);
    }

    const updatedStocks: Stock[] = [];
    const driver = this.getDriver();
    for await (const stock of stocks) {
      if (
        !req.query.noSkip &&
        stock.refinitivLastFetch &&
        new Date().getTime() - stock.refinitivLastFetch.getTime() <
          1000 * 60 * 60 * 24 * 7
      ) {
        logger.info(
          PREFIX_CHROME +
            `Stock ${
              stock.ticker
            }: Skipping Refinitiv fetch because last fetch was ${formatDistance(
              stock.refinitivLastFetch.getTime(),
              new Date().getTime(),
              { addSuffix: true }
            )}`
        );
        continue;
      }
      let refinitivESGScore: number;
      let refinitivEmissions: number;

      try {
        await driver.get(
          `https://www.refinitiv.com/bin/esg/esgsearchresult?ricCode=${stock.ric}`
        );

        const refinitivJSON = JSON.parse(
          await (await driver.findElement(By.css("pre"))).getText()
        );

        let errorMessage = `Error while fetching Refinitiv information for stock ${stock.ticker}:`;

        try {
          refinitivESGScore = +refinitivJSON.esgScore["TR.TRESG"].score;
        } catch (e) {
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(
                `Stock ${stock.ticker}: Unable to extract Refinitiv ESG Score: ${e.message}`
              )
          );
          if (stock.refinitivESGScore !== undefined) {
            errorMessage += `\n\tUnable to extract Refinitiv ESG Score: ${e.message}`;
          }
        }

        try {
          refinitivEmissions =
            +refinitivJSON.esgScore["TR.TRESGEmissions"].score;
        } catch (e) {
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(
                `Stock ${stock.ticker}: Unable to extract Refinitiv Emissions: ${e.message}`
              )
          );
          if (stock.refinitivEmissions !== undefined) {
            errorMessage += `\n\tUnable to extract Refinitiv Emissions: ${e.message}`;
          }
        }

        if (errorMessage.includes("\n")) {
          signal.sendMessage(errorMessage);
        }
        await updateStock(stock.ticker, {
          refinitivLastFetch: errorMessage.includes("\n")
            ? undefined
            : new Date(),
          refinitivESGScore,
          refinitivEmissions,
        });
        updatedStocks.push(await readStock(stock.ticker));
      } catch (e) {
        if (req.query.ticker) {
          await driver.quit();
          throw new APIError(
            502,
            `Stock ${stock.ticker}: Unable to fetch Refinitiv information: ${e.message}`
          );
        }
        logger.warn(
          PREFIX_CHROME +
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to fetch Refinitiv information: ${e.message}`
            )
        );
        signal.sendMessage(
          `Stock ${stock.ticker}: Unable to fetch Refinitiv information: ${e.message}`
        );
      }
    }
    await driver.quit();
    if (updatedStocks.length === 0) {
      return res.status(204).end();
    } else {
      return res.status(200).json(updatedStocks);
    }
  }

  async fetchSPData(req: Request, res: Response) {
    let stocks: Stock[];

    if (req.query.ticker) {
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stocks = [await readStock(ticker)];
        if (!stocks[0].spId) {
          throw new APIError(404, `Stock ${ticker} does not have a S&P ID.`);
        }
      }
    } else {
      stocks = (await readAllStocks()).map(
        (stockEntity) => new Stock(stockEntity)
      );
    }

    stocks = stocks
      .filter((stock) => stock.spId)
      .sort(
        (a, b) =>
          (a.spLastFetch ?? new Date(0)).getTime() -
          (b.spLastFetch ?? new Date(0)).getTime()
      );
    if (stocks.length === 0) {
      return res.status(204).end();
    }
    if (req.query.detach) {
      res.status(202);
    }

    const updatedStocks: Stock[] = [];
    const driver = this.getDriver();
    for await (const stock of stocks) {
      if (
        !req.query.noSkip &&
        stock.spLastFetch &&
        new Date().getTime() - stock.spLastFetch.getTime() <
          1000 * 60 * 60 * 24 * 7
      ) {
        logger.info(
          PREFIX_CHROME +
            `Stock ${
              stock.ticker
            }: Skipping S&P fetch because last fetch was ${formatDistance(
              stock.spLastFetch.getTime(),
              new Date().getTime(),
              { addSuffix: true }
            )}`
        );
        continue;
      }
      let spESGScore: number;

      try {
        await driver.get(
          `https://www.spglobal.com/esg/scores/results?cid=${stock.spId}`
        );
        spESGScore = +(await (
          await driver.findElement(By.id("esg-score"))
        ).getText());

        await updateStock(stock.ticker, {
          spLastFetch: new Date(),
          spESGScore,
        });
        updatedStocks.push(await readStock(stock.ticker));
      } catch (e) {
        if (req.query.ticker) {
          await driver.quit();
          throw new APIError(
            502,
            `Stock ${stock.ticker}: Unable to fetch S&P ESG Score: ${e.message}`
          );
        }
        logger.warn(
          PREFIX_CHROME +
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to fetch S&P ESG Score: ${e.message}`
            )
        );
        if (stock.spESGScore !== undefined) {
          signal.sendMessage(
            `Stock ${stock.ticker}: Unable to fetch S&P ESG Score: ${e.message}`
          );
        }
      }
    }
    await driver.quit();
    if (updatedStocks.length === 0) {
      return res.status(204).end();
    } else {
      return res.status(200).json(updatedStocks);
    }
  }

  async fetchSustainalyticsData(req: Request, res: Response) {
    let stocks: Stock[];

    if (req.query.ticker) {
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stocks = [await readStock(ticker)];
        if (!stocks[0].sustainalyticsId) {
          throw new APIError(
            404,
            `Stock ${ticker} does not have a Sustainalytics ID.`
          );
        }
      }
    } else {
      stocks = (await readAllStocks()).map(
        (stockEntity) => new Stock(stockEntity)
      );
    }

    stocks = stocks.filter((stock) => stock.sustainalyticsId);
    if (stocks.length === 0) {
      return res.status(204).end();
    }
    if (req.query.detach) {
      res.status(202);
    }

    const updatedStocks: Stock[] = [];
    let sustainalyticsXMLResource: Resource;
    try {
      try {
        sustainalyticsXMLResource = await readResource(URL_SUSTAINALYTICS);
        logger.info(
          PREFIX_CHROME +
            `Using cached Sustainalytics data because last fetch was ${formatDistance(
              sustainalyticsXMLResource.fetchDate,
              new Date().getTime(),
              { addSuffix: true }
            )}.`
        );
      } catch (e) {
        await axios
          .post(
            URL_SUSTAINALYTICS,
            "page=1&pageSize=100000&resourcePackage=Sustainalytics",
            {
              headers: { "Accept-Encoding": "gzip,deflate,compress" },
            }
          )
          .then(async (response) => {
            const sustainalyticsXMLLines: string[] = [];
            response.data.split("\n").forEach((line) => {
              if (
                line.includes(`<a data-href="`) ||
                line.includes(`<div class="col-2">`)
              ) {
                sustainalyticsXMLLines.push(line.trim());
              }
            });
            await createResource(
              {
                url: URL_SUSTAINALYTICS,
                fetchDate: new Date(response.headers["date"]),
                content: sustainalyticsXMLLines.join("\n"),
              },
              60 * 60 * 24 * 7
            );
            sustainalyticsXMLResource = await readResource(URL_SUSTAINALYTICS);
          });
      }
    } catch (e) {
      throw new APIError(
        502,
        `Unable to fetch Sustainalytics information: ${e.message}`
      );
    }

    const sustainalyticsXMLLines =
      sustainalyticsXMLResource.content.split("\n");

    for await (const stock of stocks) {
      let sustainalyticsESGRisk: number;

      try {
        const sustainalyticsIdIndex = sustainalyticsXMLLines.findIndex(
          (line, index) =>
            line.startsWith(`<a data-href="/${stock.sustainalyticsId}`) &&
            sustainalyticsXMLLines[index + 1].startsWith(`<div class="col-2">`)
        );
        if (!sustainalyticsIdIndex) {
          throw new APIError(
            404,
            `Stock ${stock.ticker}: Cannot find Sustainalytics ID ${stock.sustainalyticsId} in XML.`
          );
        }
        const sustainalyticsESGRiskLine =
          sustainalyticsXMLLines[sustainalyticsIdIndex + 1];
        sustainalyticsESGRisk = +sustainalyticsESGRiskLine
          .substring(sustainalyticsESGRiskLine.indexOf(">") + 1)
          .match(/(\d+(\.\d+)?)/g)[0];

        await updateStock(stock.ticker, {
          sustainalyticsESGRisk,
        });
        updatedStocks.push(await readStock(stock.ticker));
      } catch (e) {
        if (req.query.ticker) {
          throw new APIError(
            500,
            `Stock ${stock.ticker}: Unable to extract Sustainalytics ESG Risk: ${e.message}`
          );
        }
        logger.warn(
          PREFIX_CHROME +
            chalk.yellowBright(
              `Stock ${stock.ticker}: Unable to extract Sustainalytics ESG Risk: ${e.message}`
            )
        );
        if (stock.sustainalyticsESGRisk !== undefined) {
          signal.sendMessage(
            `Stock ${stock.ticker}: Unable to extract Sustainalytics ESG Risk: ${e.message}`
          );
        }
      }
    }
    if (updatedStocks.length === 0) {
      return res.status(204).end();
    } else {
      return res.status(200).json(updatedStocks);
    }
  }
}

export default new FetchController();
