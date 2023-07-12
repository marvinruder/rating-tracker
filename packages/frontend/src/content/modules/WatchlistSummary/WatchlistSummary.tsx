import { WatchlistSummaryHeader } from "./WatchlistSummaryHeader";
import { Container, Grid } from "@mui/material";
import { Footer, PageHeaderWrapper } from "../../../components/etc/HeaderFooter";
import { WatchlistSummary, watchlistSummaryEndpointPath } from "@rating-tracker/commons";
import { useEffect, useState } from "react";
import { baseUrl } from "../../../router";
import axios from "axios";
import { useNotification } from "../../../contexts/NotificationContext";
import WatchlistCard from "./WatchlistCard";

/**
 * A module that displays an overview of the user’s watchlists.
 *
 * @returns {JSX.Element} The component.
 */
const WatchlistSummaryModule = (): JSX.Element => {
  const [watchlistSummaries, setWatchlistSummaries] = useState<WatchlistSummary[]>([]);
  const [watchlistSummariesFinal, setWatchlistSummariesFinal] = useState<boolean>(false);
  const { setErrorNotificationOrClearSession: setErrorNotification } = useNotification();

  useEffect(() => getWatchlists(), []);

  /**
   * Get the watchlists from the backend.
   */
  const getWatchlists = () => {
    axios
      .get(baseUrl + watchlistSummaryEndpointPath)
      .then((res) => setWatchlistSummaries(res.data))
      .catch((e) => {
        setErrorNotification(e, "fetching watchlists");
        setWatchlistSummaries([]);
      })
      .finally(() => setWatchlistSummariesFinal(true));
  };

  return (
    <>
      <PageHeaderWrapper maxWidth={false}>
        <WatchlistSummaryHeader getWatchlists={getWatchlists} />
      </PageHeaderWrapper>
      <Container maxWidth={false}>
        <Grid container spacing={2}>
          {watchlistSummariesFinal
            ? watchlistSummaries.map((watchlistSummary) => (
                <Grid item xs={12} sm={6} md={4} key={watchlistSummary.id}>
                  <WatchlistCard watchlist={watchlistSummary} getWatchlists={getWatchlists} />
                </Grid>
              ))
            : [...Array(3)].map(
                (
                  _,
                  key, // Render skeleton cards
                ) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <WatchlistCard />
                  </Grid>
                ),
              )}
        </Grid>
      </Container>
      <Footer />
    </>
  );
};

export default WatchlistSummaryModule;
