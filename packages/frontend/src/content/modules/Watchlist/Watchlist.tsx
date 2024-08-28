import { Container } from "@mui/material";
import type { StockFilter, StockListColumn, Watchlist } from "@rating-tracker/commons";
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
const WatchlistModule = (): JSX.Element => {
  const [watchlist, setWatchlist] = useState<Watchlist>();
  const [filter, setFilter] = useState<StockFilter>({});
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
          stockTableFiltersProps={{
            setFilter,
            columnFilter,
            setColumnFilter,
            filtersInUse:
              columnFilter.length < stockListColumnArray.length || // If not all columns are shown, or
              Object.values(filter).some(
                // If at least one filter is set, i.e., if at least one value
                (value) =>
                  typeof value !== "undefined" && // is different from undefined, and
                  (!Array.isArray(value) || // is not an array, or
                    value.length > 0), // is an array with at least one element
              ),
          }}
        />
      </HeaderWrapper>
      <Container maxWidth={false}>
        <StockTable
          filter={filter}
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
