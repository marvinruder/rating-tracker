import AddIcon from "@mui/icons-material/Add";
import { Box, Dialog, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { FC, useState } from "react";

import { AddPortfolio } from "../../../components/dialogs/portfolio/AddPortfolio";

/**
 * A header for the portfolio summaries page.
 *
 * @param {PortfolioSummaryHeaderProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const PortfolioSummaryHeader: FC<PortfolioSummaryHeaderProps> = (
  props: PortfolioSummaryHeaderProps,
): JSX.Element => {
  const [addPortfolioOpen, setAddPortfolioOpen] = useState<boolean>(false);

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          Your Portfolios
        </Typography>
        <Typography variant="subtitle2">Create and analyze your plan for a one-time or monthly investment.</Typography>
      </Grid>
      <Grid item ml="auto">
        <Tooltip arrow title="Create a new portfolio">
          <Box display="inline-block" ml={1} mt={1}>
            <IconButton color="primary" onClick={() => setAddPortfolioOpen(true)}>
              <AddIcon />
            </IconButton>
          </Box>
        </Tooltip>
        <Dialog maxWidth="lg" open={addPortfolioOpen} onClose={() => setAddPortfolioOpen(false)}>
          <AddPortfolio onClose={() => (setAddPortfolioOpen(false), props.getPortfolios())} />
        </Dialog>
      </Grid>
    </Grid>
  );
};

interface PortfolioSummaryHeaderProps {
  /**
   * A method to update the portfolio summaries, e.g. after a new portfolio was created.
   */
  getPortfolios: () => void;
}
