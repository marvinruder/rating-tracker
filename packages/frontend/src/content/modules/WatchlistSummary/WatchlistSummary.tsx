import { Box, Container, Grid, Typography } from "@mui/material";
import type { WatchlistSummary } from "@rating-tracker/commons";
import { watchlistsAPIPath } from "@rating-tracker/commons";
import { useEffect, useState } from "react";

import { Footer } from "../../../components/etc/Footer";
import { HeaderWrapper } from "../../../components/etc/HeaderWrapper";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

import WatchlistCard from "./WatchlistCard";
import { WatchlistSummaryHeader } from "./WatchlistSummaryHeader";

/**
 * A module that displays an overview of the user’s watchlists.
 * @returns The component.
 */
const WatchlistSummaryModule = (): JSX.Element => {
  const [watchlistSummaries, setWatchlistSummaries] = useState<WatchlistSummary[]>([]);
  const [watchlistSummariesFinal, setWatchlistSummariesFinal] = useState<boolean>(false);
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  /**
   * Get the watchlists from the backend.
   */
  const getWatchlists = () => {
    api
      .get(watchlistsAPIPath)
      .then((res) => setWatchlistSummaries(res.data))
      .catch((e) => {
        setErrorNotificationOrClearSession(e, "fetching watchlists");
        setWatchlistSummaries([]);
      })
      .finally(() => setWatchlistSummariesFinal(true));
  };

  useEffect(getWatchlists, []);

  return (
    <>
      <HeaderWrapper maxWidth={false}>
        <WatchlistSummaryHeader refetchWatchlists={getWatchlists} />
      </HeaderWrapper>
      <Container maxWidth={false}>
        <Grid container spacing={2}>
          {watchlistSummariesFinal ? (
            watchlistSummaries.length ? (
              watchlistSummaries.map((watchlistSummary) => (
                <Grid item xs={12} sm={6} md={4} xl={3} key={watchlistSummary.id}>
                  <WatchlistCard watchlist={watchlistSummary} getWatchlists={getWatchlists} />
                </Grid>
              ))
            ) : (
              <Box mx="auto" my={4}>
                <Typography variant="subtitle1">No Watchlists</Typography>
              </Box>
            )
          ) : (
            [...Array(3)].map(
              (
                _,
                key, // Render skeleton cards
              ) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <WatchlistCard />
                </Grid>
              ),
            )
          )}
        </Grid>
      </Container>
      <Footer />
    </>
  );
};

export default WatchlistSummaryModule;
