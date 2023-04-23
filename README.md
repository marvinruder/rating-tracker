[![License](https://img.shields.io/github/license/marvinruder/rating-tracker)](https://github.com/marvinruder/rating-tracker/blob/main/LICENSE)
[![Codacy Quality Badge](https://app.codacy.com/project/badge/Grade/6a7a7b68631a42ef88fc478a709141ea)](https://www.codacy.com/gh/marvinruder/rating-tracker/dashboard)
[![Codacy Coverage Badge](https://app.codacy.com/project/badge/Coverage/6a7a7b68631a42ef88fc478a709141ea)](https://www.codacy.com/gh/marvinruder/rating-tracker/dashboard)
[![Jenkins Badge](https://jenkins.mruder.dev/buildStatus/icon?job=rating-tracker-multibranch%2Fmain)](https://jenkins.mruder.dev/job/rating-tracker-multibranch)

---

<img style="height:48px;"/>
<p align="center">
  <img src="https://raw.githubusercontent.com/marvinruder/rating-tracker/main/packages/rating-tracker-frontend/public/assets/images/favicon/favicon-192.png" alt="Rating Tracker Logo" style="height:96px; width:96px;"/>
</p>

# Rating Tracker

A web service fetching and providing financial and ESG ratings for stocks.

## Features

#### Stock List with sorting and filtering

Stocks and their information are presented in a paginated table which offers comprehensive and in-depth sorting and filtering by many of the available attributes.

#### Automatic and scheduled data fetching from several providers

By providing identifiers for stocks from [Morningstar](https://www.morningstar.it/it/), [MarketScreener](https://www.marketscreener.com), [MSCI](https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool), [Refinitiv](https://www.refinitiv.com/en/sustainable-finance/esg-scores), [Standard & Poor’s](https://www.spglobal.com/esg/solutions/data-intelligence-esg-scores) and [Sustainalytics](https://www.sustainalytics.com/esg-ratings) in the “Add Stock” dialog, Rating Tracker can automatically fetch financial data as well as financial and ESG ratings. Information is fetched by a [Selenium](https://www.selenium.dev)-automated Chrome browser. The identifiers to use can be found in the provider’s URL for the stock as shown in the following examples:

- Morningstar: `https://tools.morningstar.it/it/stockreport/default.aspx?Site=it&id=`**`0P000000GY`**`&LanguageId=it-IT&SecurityToken=`**`0P000000GY`**`]3]0]E0WWE$$ALL`
- MarketScreener: `https://www.marketscreener.com/quote/stock/`**`APPLE-INC-4849`**
- MSCI: `https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool/issuer/`**`apple-inc/IID000000002157615`**
- Refinitiv: `https://www.refinitiv.com/bin/esg/esgsearchresult?ricCode=`**`AAPL.O`** (see also [Refinitiv Identification Code](https://en.wikipedia.org/wiki/Refinitiv_Identification_Code))
- Standard & Poor’s: `https://www.spglobal.com/esg/scores/results?cid=`**`4004205`**
- Sustainalytics: `https://www.sustainalytics.com/esg-rating/`**`apple-inc/1007903183`**

The fetching can be scheduled by providing a Cron-like specifier in an environment variable. See below for details.

#### Stock Logos

When providing an ISIN for a stock, its logo is automatically fetched and cached from TradeRepublic.

#### Rating Scores

The fetched ratings of a stock are aggregated to both a financial and ESG score using the average values of all ratings, such that a score of 0 is assigned to an average stock and a score of 100 is assigned to a stock with perfect scores in all underlying ratings.

The financial and ESG score are used to compute a total score using the harmonic mean of both numbers, so that a stock has to perform well in both financial and ESG ratings to obtain a good total score.

#### User Management

The Rating Tracker supports multiple users, who can self-register via WebAuthn and access the application after being granted fine-grained access by an administrator, for whom a “User Management” web interface is provided.

#### Notification Messages via Signal

Based on their access rights, users can subscribe to updates of stock ratings, fetch error reports, or new user registrations by providing a phone number capable of receiving messages via the instant messenger [Signal](https://signal.org).

#### Error reports with screenshots

When fetching a stock fails, a screenshot of the page the fetch was attempted from is stored and a link to them is sent to stock maintainers who subscribed to error reports, so they can analyze and fix the issue.

#### …and more to come!

Planned features are documented [here](https://github.com/marvinruder/rating-tracker/issues?q=is%3Aopen+is%3Aissue+label%3Afeature). If you feel that something is missing, feel free to [request a feature](https://github.com/marvinruder/rating-tracker/issues/new?assignees=marvinruder&labels=feature&template=feature_request.md&title=)!

## Demo

An instance of the Rating Tracker is publicly available at https://ratingtracker.mruder.dev, for which access is granted at request.

## Deployment

### Prerequisites

### Example Setup using Docker Compose

## API References

## Development

### Create an environment for developing and testing

### Run tests

### Contribute

## Disclaimer

This software is provided under the conditions of the [MIT License](https://github.com/marvinruder/rating-tracker/blob/main/LICENSE). Use this tool at your own risk. Excessive data fetching from providers, publishing or selling the information obtained by fetching is not recommended. Your actions may have consequences… 🦋

## Authors

- [Marvin A. Ruder (he/him)](https://github.com/marvinruder)