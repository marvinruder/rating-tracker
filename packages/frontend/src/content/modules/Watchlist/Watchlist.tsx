import { Card, Container } from "@mui/material";
import { StockListColumn, Watchlist, stockListColumnArray, watchlistEndpointPath } from "@rating-tracker/commons";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { Footer, PageHeaderWrapper } from "../../../components/etc/HeaderFooter";
import { StockTable } from "../../../components/etc/StockTable";
import { useNotification } from "../../../contexts/NotificationContext";
import { baseUrl } from "../../../router";
import { StockFilter } from "../../../types/StockFilter";

import { WatchlistHeader } from "./WatchlistHeader";

/**
 * A module that displays a watchlist.
 *
 * @returns {JSX.Element} The component.
 */
const WatchlistModule = (): JSX.Element => {
  const [watchlist, setWatchlist] = useState<Watchlist>();
  const [filter, setFilter] = useState<StockFilter>({});
  const [columnFilter, setColumnFilter] = useState<StockListColumn[]>([...stockListColumnArray]);
  const { setErrorNotificationOrClearSession: setErrorNotification } = useNotification();

  const [refetchTrigger, setRefetchTrigger] = useState<boolean>(false);

  const triggerRefetch = () => {
    setRefetchTrigger((prevRefetchTrigger) => !prevRefetchTrigger);
  };

  /**
   * Fetches the watchlist with the given ID.
   *
   * @param {number} id The ID of the watchlist to fetch.
   */
  const getWatchlist = (id: number) => {
    axios
      .get(baseUrl + watchlistEndpointPath + `/${id}`)
      .then((res) => setWatchlist(res.data))
      .catch((e) => setErrorNotification(e, "fetching watchlist"));
  };

  const { id } = useParams();

  useEffect(() => getWatchlist(Number(id)), [id]);
  // useEffect(() => triggerRefetch(), [watchlist]);

  return (
    <>
      <PageHeaderWrapper maxWidth={false}>
        <WatchlistHeader
          watchlist={watchlist}
          getWatchlist={() => getWatchlist(Number(id))}
          stockTableFiltersProps={{
            setFilter,
            columnFilter,
            setColumnFilter,
            triggerRefetch,
            filtersInUse:
              columnFilter.length < stockListColumnArray.length || // If not all columns are shown, or
              Object.values(filter).some(
                // If at least one filter is set, i.e., if at least one value
                (value) =>
                  typeof value !== "undefined" && // is different from undefined, and
                  (!Array.isArray(value) || // is not an array, or
                    value.length > 0), // is an array with at least one element
              ),
            disableTopMargin: true,
          }}
        />
      </PageHeaderWrapper>
      <Container maxWidth={false}>
        <Card>
          <StockTable
            filter={filter}
            triggerRefetch={refetchTrigger}
            loading={!watchlist}
            watchlist={watchlist}
            columns={columnFilter}
          />
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default WatchlistModule;
