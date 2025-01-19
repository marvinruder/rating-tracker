import { Container } from "@mui/material";
import type { StockListColumn, Watchlist } from "@rating-tracker/commons";
import { handleResponse, parseStock, stockListColumnArray } from "@rating-tracker/commons";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

import watchlistClient from "../../../api/watchlist";
import { Footer } from "../../../components/etc/Footer";
import { HeaderWrapper } from "../../../components/etc/HeaderWrapper";
import { StockTable } from "../../../components/stock/layouts/StockTable";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";

import { WatchlistHeader } from "./WatchlistHeader";

/**
 * A module that displays a watchlist.
 * @returns The component.
 */
const WatchlistModule = (): React.JSX.Element => {
  const [watchlist, setWatchlist] = useState<Watchlist>();
  const [columnFilter, setColumnFilter] = useState<StockListColumn[]>([...stockListColumnArray]);
  const [refetchStocksTrigger, setRefetchStocksTrigger] = useState<boolean>(false);

  const refetchStocks = () => setRefetchStocksTrigger((prev) => !prev);

  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  /**
   * Fetches the watchlist with the given ID.
   * @param id The ID of the watchlist to fetch.
   */
  const getWatchlist = (id: number) => {
    watchlistClient[":id"]
      .$get({ param: { id: String(id) } })
      .then(handleResponse)
      .then((res) => ({ ...res, data: { ...res.data, stocks: res.data.stocks.map((stock) => parseStock(stock)) } }))
      .then((res) => setWatchlist(res.data))
      .catch((e) => setErrorNotificationOrClearSession(e, "fetching watchlist"));
  };

  const { id } = useParams();

  useEffect(() => getWatchlist(Number(id)), [id]);

  return (
    <>
      <HeaderWrapper maxWidth={false}>
        <WatchlistHeader
          watchlist={watchlist}
          getWatchlist={() => getWatchlist(Number(id))}
          refetchStocks={refetchStocks}
          stockTableFiltersProps={{ columnFilter, setColumnFilter }}
        />
      </HeaderWrapper>
      <Container maxWidth={false}>
        <StockTable
          refetchInitialStocksTrigger={refetchStocksTrigger}
          watchlist={watchlist}
          getWatchlist={() => getWatchlist(Number(id))}
          showSkeletons={!watchlist}
          columns={columnFilter}
        />
      </Container>
      <Footer />
    </>
  );
};

export default WatchlistModule;
