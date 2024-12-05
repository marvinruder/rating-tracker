import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { Box, Dialog, Grid2 as Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { portfolioBuilderEndpointSuffix, portfoliosAPIPath } from "@rating-tracker/commons";
import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { AddPortfolio } from "../../../components/dialogs/portfolio/AddPortfolio";

/**
 * A header for the portfolio summaries page.
 * @param props The properties of the component.
 * @returns The component.
 */
export const PortfolioSummaryHeader: FC<PortfolioSummaryHeaderProps> = (
  props: PortfolioSummaryHeaderProps,
): React.JSX.Element => {
  const [addPortfolioOpen, setAddPortfolioOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <Grid container sx={{ justifyContent: "space-between", alignItems: "center", rowGap: 1 }}>
      <Grid>
        <Typography variant="h3" component="h3" gutterBottom>
          Your Portfolios
        </Typography>
        <Typography variant="subtitle2">Create and analyze your plan for a one-time or monthly investment.</Typography>
      </Grid>
      <Grid sx={{ ml: "auto" }}>
        <Tooltip arrow title="Create a new portfolio">
          <Box id="add-portfolio-label" sx={{ display: "inline-block", ml: 1 }}>
            <IconButton aria-labelledby="add-portfolio-label" color="primary" onClick={() => setAddPortfolioOpen(true)}>
              <AddIcon />
            </IconButton>
          </Box>
        </Tooltip>
        <Tooltip arrow title="Start Portfolio Builder">
          <Box id="start-portfolio-builder-label" sx={{ display: "inline-block", ml: 1 }}>
            <IconButton
              aria-labelledby="start-portfolio-builder-label"
              color="primary"
              onClick={() => navigate(portfoliosAPIPath + portfolioBuilderEndpointSuffix)}
            >
              <AutoFixHighIcon />
            </IconButton>
          </Box>
        </Tooltip>
        <Dialog maxWidth="lg" open={addPortfolioOpen} onClose={() => setAddPortfolioOpen(false)}>
          <AddPortfolio onClose={() => setAddPortfolioOpen(false)} onAdd={props.refetchPortfolios} />
        </Dialog>
      </Grid>
    </Grid>
  );
};

/**
 * Properties for the PortfolioSummaryHeader component.
 */
interface PortfolioSummaryHeaderProps {
  /**
   * A method to update the portfolio summaries, e.g. after a new portfolio was created.
   */
  refetchPortfolios: () => void;
}
