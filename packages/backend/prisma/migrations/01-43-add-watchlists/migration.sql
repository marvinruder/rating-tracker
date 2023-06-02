-- CreateTable
CREATE TABLE "Watchlist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subscribed" BOOLEAN NOT NULL DEFAULT false,
    "email" VARCHAR(255) NOT NULL,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StockToWatchlist" (
    "A" VARCHAR(20) NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_StockToWatchlist_AB_unique" ON "_StockToWatchlist"("A", "B");

-- CreateIndex
CREATE INDEX "_StockToWatchlist_B_index" ON "_StockToWatchlist"("B");

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StockToWatchlist" ADD CONSTRAINT "_StockToWatchlist_A_fkey" FOREIGN KEY ("A") REFERENCES "Stock"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StockToWatchlist" ADD CONSTRAINT "_StockToWatchlist_B_fkey" FOREIGN KEY ("B") REFERENCES "Watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

