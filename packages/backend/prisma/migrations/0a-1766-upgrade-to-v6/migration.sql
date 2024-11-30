-- DropForeignKey
ALTER TABLE "OIDCUser" DROP CONSTRAINT "OIDCUser_email_fkey";

-- DropForeignKey
ALTER TABLE "Portfolio" DROP CONSTRAINT "Portfolio_email_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_email_fkey";

-- DropForeignKey
ALTER TABLE "StocksInPortfolios" DROP CONSTRAINT "StocksInPortfolios_ticker_fkey";

-- DropForeignKey
ALTER TABLE "Watchlist" DROP CONSTRAINT "Watchlist_email_fkey";

-- DropForeignKey
ALTER TABLE "WebAuthnCredential" DROP CONSTRAINT "WebAuthnCredential_email_fkey";

-- DropForeignKey
ALTER TABLE "_StockToWatchlist" DROP CONSTRAINT "_StockToWatchlist_A_fkey";

-- AlterTable
ALTER TABLE "OIDCUser" ALTER COLUMN "email" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Portfolio" ALTER COLUMN "email" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Resource" ALTER COLUMN "contentType" SET DATA TYPE TEXT,
ALTER COLUMN "lastModifiedAt" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_pkey",
ALTER COLUMN "ticker" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "isin" SET DATA TYPE TEXT,
ALTER COLUMN "morningstarID" SET DATA TYPE TEXT,
ALTER COLUMN "morningstarLastFetch" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "marketScreenerID" SET DATA TYPE TEXT,
ALTER COLUMN "marketScreenerLastFetch" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "msciID" SET DATA TYPE TEXT,
ALTER COLUMN "msciLastFetch" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "ric" SET DATA TYPE TEXT,
ALTER COLUMN "lsegLastFetch" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "spLastFetch" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "sustainalyticsID" SET DATA TYPE TEXT,
ALTER COLUMN "yahooLastFetch" SET DATA TYPE TIMESTAMPTZ,
ADD CONSTRAINT "Stock_pkey" PRIMARY KEY ("ticker");

-- AlterTable
ALTER TABLE "StocksInPortfolios" DROP CONSTRAINT "StocksInPortfolios_pkey",
ALTER COLUMN "ticker" SET DATA TYPE TEXT,
ADD CONSTRAINT "StocksInPortfolios_pkey" PRIMARY KEY ("portfolioID", "ticker");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("email");

-- AlterTable
ALTER TABLE "Watchlist" ALTER COLUMN "email" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "WebAuthnCredential" ALTER COLUMN "email" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_StockToWatchlist" ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_StockToWatchlist_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_StockToWatchlist_AB_unique";

-- AddForeignKey
ALTER TABLE "WebAuthnCredential" ADD CONSTRAINT "WebAuthnCredential_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OIDCUser" ADD CONSTRAINT "OIDCUser_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StocksInPortfolios" ADD CONSTRAINT "StocksInPortfolios_ticker_fkey" FOREIGN KEY ("ticker") REFERENCES "Stock"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StockToWatchlist" ADD CONSTRAINT "_StockToWatchlist_A_fkey" FOREIGN KEY ("A") REFERENCES "Stock"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;


-- Rename tables and columns and more
ALTER TABLE "Stock" RENAME TO "stocks";
ALTER TABLE "stocks" RENAME "financialScore" TO "financial_score";
ALTER TABLE "stocks" RENAME "esgScore" TO "esg_score";
ALTER TABLE "stocks" RENAME "totalScore" TO "total_score";
ALTER TABLE "stocks" RENAME "yahooLastFetch" TO "yahoo_last_fetch";
ALTER TABLE "stocks" RENAME "lastClose" TO "last_close";
ALTER TABLE "stocks" RENAME "morningstarID" TO "morningstar_id";
ALTER TABLE "stocks" RENAME "morningstarLastFetch" TO "morningstar_last_fetch";
ALTER TABLE "stocks" RENAME "starRating" TO "star_rating";
ALTER TABLE "stocks" RENAME "dividendYieldPercent" TO "dividend_yield_percent";
ALTER TABLE "stocks" RENAME "priceEarningRatio" TO "price_earning_ratio";
ALTER TABLE "stocks" RENAME "morningstarFairValue" TO "morningstar_fair_value";
ALTER TABLE "stocks" RENAME "morningstarFairValuePercentageToLastClose" TO "morningstar_fair_value_percentage_to_last_close";
ALTER TABLE "stocks" RENAME "positionIn52w" TO "position_in_52w";
ALTER TABLE "stocks" RENAME "marketScreenerID" TO "market_screener_id";
ALTER TABLE "stocks" RENAME "marketScreenerLastFetch" TO "market_screener_last_fetch";
ALTER TABLE "stocks" RENAME "analystConsensus" TO "analyst_consensus";
ALTER TABLE "stocks" RENAME "analystRatings" TO "analyst_ratings";
ALTER TABLE "stocks" RENAME "analystCount" TO "analyst_count";
ALTER TABLE "stocks" RENAME "analystTargetPrice" TO "analyst_target_price";
ALTER TABLE "stocks" RENAME "analystTargetPricePercentageToLastClose" TO "analyst_target_price_percentage_to_last_close";
ALTER TABLE "stocks" RENAME "msciID" TO "msci_id";
ALTER TABLE "stocks" RENAME "msciLastFetch" TO "msci_last_fetch";
ALTER TABLE "stocks" RENAME "msciESGRating" TO "msci_esg_rating";
ALTER TABLE "stocks" RENAME "msciTemperature" TO "msci_temperature";
ALTER TABLE "stocks" RENAME "lsegLastFetch" TO "lseg_last_fetch";
ALTER TABLE "stocks" RENAME "lsegESGScore" TO "lseg_esg_score";
ALTER TABLE "stocks" RENAME "lsegEmissions" TO "lseg_emissions";
ALTER TABLE "stocks" RENAME "spID" TO "sp_id";
ALTER TABLE "stocks" RENAME "spLastFetch" TO "sp_last_fetch";
ALTER TABLE "stocks" RENAME "spESGScore" TO "sp_esg_score";
ALTER TABLE "stocks" RENAME "sustainalyticsID" TO "sustainalytics_id";
ALTER TABLE "stocks" RENAME "sustainalyticsESGRisk" TO "sustainalytics_esg_risk";
ALTER TABLE "stocks" RENAME "marketCap" TO "market_cap";
ALTER TABLE "stocks" RENAME CONSTRAINT "Stock_pkey" TO "stocks_pkey";
ALTER INDEX "Stock_name_key" RENAME TO "stocks_name_key";
ALTER INDEX "Stock_isin_key" RENAME TO "stocks_isin_key";
ALTER INDEX "Stock_morningstarID_key" RENAME TO "stocks_morningstar_id_key";
ALTER INDEX "Stock_marketScreenerID_key" RENAME TO "stocks_market_screener_id_key";
ALTER INDEX "Stock_msciID_key" RENAME TO "stocks_msci_id_key";
ALTER INDEX "Stock_ric_key" RENAME TO "stocks_ric_key";
ALTER INDEX "Stock_spID_key" RENAME TO "stocks_sp_id_key";
ALTER INDEX "Stock_sustainalyticsID_key" RENAME TO "stocks_sustainalytics_id_key";

ALTER TABLE "User" RENAME TO "users";
ALTER TABLE "users" RENAME "accessRights" TO "access_rights";
ALTER TABLE "users" RENAME CONSTRAINT "User_pkey" TO "users_pkey";

ALTER TABLE "WebAuthnCredential" RENAME TO "webauthn_credentials";
ALTER TABLE "webauthn_credentials" RENAME "publicKey" TO "public_key";
ALTER TABLE "webauthn_credentials" RENAME CONSTRAINT "WebAuthnCredential_pkey" TO "webauthn_credentials_pkey";
ALTER TABLE "webauthn_credentials" RENAME CONSTRAINT "WebAuthnCredential_email_fkey" TO "webauthn_credentials_email_fkey";

ALTER TABLE "OIDCUser" RENAME TO "oidc_users";
ALTER TABLE "oidc_users" RENAME "preferredUsername" TO "preferred_username";
ALTER TABLE "oidc_users" RENAME CONSTRAINT "OIDCUser_pkey" TO "oidc_users_pkey";
ALTER TABLE "oidc_users" RENAME CONSTRAINT "OIDCUser_email_fkey" TO "oidc_users_email_fkey";
ALTER INDEX "OIDCUser_email_key" RENAME TO "oidc_users_email_key";

ALTER TABLE "Watchlist" RENAME TO "watchlists";
ALTER TABLE "watchlists" RENAME CONSTRAINT "Watchlist_pkey" TO "watchlists_pkey";
ALTER TABLE "watchlists" RENAME CONSTRAINT "Watchlist_email_fkey" TO "watchlists_email_fkey";
ALTER SEQUENCE "Watchlist_id_seq" RENAME TO "watchlists_id_seq";

ALTER TABLE "_StockToWatchlist" RENAME TO "stocks_in_watchlists";
ALTER TABLE "stocks_in_watchlists" RENAME "A" TO "ticker";
ALTER TABLE "stocks_in_watchlists" RENAME "B" TO "watchlist_id";
DROP INDEX "_StockToWatchlist_B_index";
ALTER TABLE "stocks_in_watchlists" DROP CONSTRAINT "_StockToWatchlist_AB_pkey";
ALTER TABLE "stocks_in_watchlists" ADD CONSTRAINT "stocks_in_watchlists_pkey" PRIMARY KEY ("watchlist_id", "ticker");
ALTER TABLE "stocks_in_watchlists" RENAME CONSTRAINT "_StockToWatchlist_A_fkey" TO "stocks_in_watchlists_ticker_fkey";
ALTER TABLE "stocks_in_watchlists" RENAME CONSTRAINT "_StockToWatchlist_B_fkey" TO "stocks_in_watchlists_watchlist_id_fkey";

ALTER TABLE "Portfolio" RENAME TO "portfolios";
ALTER TABLE "portfolios" RENAME CONSTRAINT "Portfolio_pkey" TO "portfolios_pkey";
ALTER TABLE "portfolios" RENAME CONSTRAINT "Portfolio_email_fkey" TO "portfolios_email_fkey";
ALTER SEQUENCE "Portfolio_id_seq" RENAME TO "portfolios_id_seq";

ALTER TABLE "StocksInPortfolios" RENAME TO "stocks_in_portfolios";
ALTER TABLE "stocks_in_portfolios" RENAME "portfolioID" TO "portfolio_id";
ALTER TABLE "stocks_in_portfolios" RENAME CONSTRAINT "StocksInPortfolios_pkey" TO "stocks_in_portfolios_pkey";
ALTER TABLE "stocks_in_portfolios" RENAME CONSTRAINT "StocksInPortfolios_portfolioID_fkey" TO "stocks_in_portfolios_portfolio_id_fkey";
ALTER TABLE "stocks_in_portfolios" RENAME CONSTRAINT "StocksInPortfolios_ticker_fkey" TO "stocks_in_portfolios_ticker_fkey";

ALTER TABLE "Session" RENAME TO "sessions";
ALTER TABLE "sessions" RENAME "oidcIDToken" TO "oidc_id_token";
ALTER TABLE "sessions" RENAME "createdAt" TO "created_at";
ALTER TABLE "sessions" RENAME "expiresAt" TO "expires_at";
ALTER TABLE "sessions" RENAME CONSTRAINT "Session_pkey" TO "sessions_pkey";
ALTER TABLE "sessions" RENAME CONSTRAINT "Session_email_fkey" TO "sessions_email_fkey";

ALTER TABLE "Resource" RENAME TO "resources";
ALTER TABLE "resources" RENAME "contentType" TO "content_type";
ALTER TABLE "resources" RENAME "lastModifiedAt" TO "last_modified_at";
ALTER TABLE "resources" RENAME "expiresAt" TO "expires_at";
ALTER TABLE "resources" RENAME CONSTRAINT "Resource_pkey" TO "resources_pkey";

ALTER TYPE "Country" RENAME TO "country";
ALTER TYPE "Industry" RENAME TO "industry";
ALTER TYPE "Size" RENAME TO "size";
ALTER TYPE "Style" RENAME TO "style";
ALTER TYPE "Currency" RENAME TO "currency";
ALTER TYPE "MSCIESGRating" RENAME TO "msci_esg_rating";
ALTER TYPE "AnalystRating" RENAME TO "analyst_rating";
