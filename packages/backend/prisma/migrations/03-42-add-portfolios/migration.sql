-- CreateTable
CREATE TABLE "Portfolio" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "email" VARCHAR(255) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StocksInPortfolios" (
    "portfolioID" INTEGER NOT NULL,
    "ticker" VARCHAR(20) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StocksInPortfolios_pkey" PRIMARY KEY ("portfolioID","ticker")
);

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StocksInPortfolios" ADD CONSTRAINT "StocksInPortfolios_portfolioID_fkey" FOREIGN KEY ("portfolioID") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StocksInPortfolios" ADD CONSTRAINT "StocksInPortfolios_ticker_fkey" FOREIGN KEY ("ticker") REFERENCES "Stock"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;
