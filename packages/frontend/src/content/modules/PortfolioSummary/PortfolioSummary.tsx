import { Box, Container, Grid, Typography } from "@mui/material";
import type { PortfolioSummary } from "@rating-tracker/commons";
import { portfoliosEndpointPath } from "@rating-tracker/commons";
import { useEffect, useState } from "react";

import { Footer } from "../../../components/etc/Footer";
import { HeaderWrapper } from "../../../components/etc/HeaderWrapper";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

import PortfolioCard from "./PortfolioCard";
import { PortfolioSummaryHeader } from "./PortfolioSummaryHeader";

/**
 * A module that displays an overview of the user’s portfolios.
 * @returns The component.
 */
const PortfolioSummaryModule = (): JSX.Element => {
  const [portfolioSummaries, setPortfolioSummaries] = useState<PortfolioSummary[]>([]);
  const [portfolioSummariesFinal, setPortfolioSummariesFinal] = useState<boolean>(false);
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  useEffect(() => getPortfolios(), []);

  /**
   * Get the portfolios from the backend.
   */
  const getPortfolios = () => {
    api
      .get(portfoliosEndpointPath)
      .then((res) => setPortfolioSummaries(res.data))
      .catch((e) => {
        setErrorNotificationOrClearSession(e, "fetching portfolios");
        setPortfolioSummaries([]);
      })
      .finally(() => setPortfolioSummariesFinal(true));
  };

  return (
    <>
      <HeaderWrapper maxWidth={false}>
        <PortfolioSummaryHeader refetchPortfolios={getPortfolios} />
      </HeaderWrapper>
      <Container maxWidth={false}>
        <Grid container spacing={2}>
          {portfolioSummariesFinal ? (
            portfolioSummaries.length ? (
              portfolioSummaries.map((portfolioSummary) => (
                <Grid item xs={12} sm={6} md={4} key={portfolioSummary.id}>
                  <PortfolioCard portfolio={portfolioSummary} getPortfolios={getPortfolios} />
                </Grid>
              ))
            ) : (
              <Box mx="auto" my={4}>
                <Typography variant="subtitle1">No Portfolios</Typography>
              </Box>
            )
          ) : (
            [...Array(3)].map(
              (
                _,
                key, // Render skeleton cards
              ) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <PortfolioCard />
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

export default PortfolioSummaryModule;
