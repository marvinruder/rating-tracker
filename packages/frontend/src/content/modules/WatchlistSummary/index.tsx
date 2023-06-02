import PageHeader from "./PageHeader";
import PageTitleWrapper from "../../../components/PageTitleWrapper";
import { Container, Grid } from "@mui/material";
import Footer from "../../../components/Footer";
import { WatchlistSummary, watchlistSummaryEndpointPath } from "@rating-tracker/commons";
import { useEffect, useState } from "react";
import { baseUrl } from "../../../router";
import axios from "axios";
import { useNotification } from "../../../contexts/NotificationContext";
import WatchlistCard from "../../../components/WatchlistCard";

/**
 * A module that displays an overview of the user’s watchlists.
 *
 * @returns {JSX.Element} The component.
 */
const WatchlistSummaryModule = (): JSX.Element => {
  const [watchlistSummaries, setWatchlistSummaries] = useState<WatchlistSummary[]>([]);
  const [watchlistSummariesFinal, setWatchlistSummariesFinal] = useState<boolean>(false);
  const { setNotification } = useNotification();

  useEffect(() => {
    getWatchlists(); // Get stocks whenever pagination, sorting or filtering changes, or when explicitly requested.
  }, []);

  /**
   * Get the watchlists from the backend.
   */
  const getWatchlists = () => {
    axios
      .get(baseUrl + watchlistSummaryEndpointPath)
      .then((res) => setWatchlistSummaries(res.data))
      .catch((e) => {
        setNotification({
          severity: "error",
          title: "Error while fetching stock information",
          message:
            e.response?.status && e.response?.data?.message
              ? `${e.response.status}: ${e.response.data.message}`
              : e.message ?? "No additional information available.",
        });
        setWatchlistSummaries([]);
      })
      .finally(() => setWatchlistSummariesFinal(true));
  };

  return (
    <>
      <PageTitleWrapper maxWidth={false}>
        <PageHeader getWatchlists={getWatchlists} />
      </PageTitleWrapper>
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
                  key // Render skeleton cards
                ) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <WatchlistCard />
                  </Grid>
                )
              )}
        </Grid>
      </Container>
      <Footer />
    </>
  );
};

export default WatchlistSummaryModule;
