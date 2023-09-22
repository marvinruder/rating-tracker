import AddIcon from "@mui/icons-material/Add";
import { Box, Dialog, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { FC, useState } from "react";

import { AddWatchlist } from "../../../components/dialogs";

/**
 * A header for the watchlist summaries page.
 *
 * @param {WatchlistSummaryHeaderProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const WatchlistSummaryHeader: FC<WatchlistSummaryHeaderProps> = (
  props: WatchlistSummaryHeaderProps,
): JSX.Element => {
  const [addWatchlistOpen, setAddWatchlistOpen] = useState<boolean>(false);

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          Your Watchlists
        </Typography>
        <Typography variant="subtitle2">View and organize your favorite or otherwise noteworthy stocks.</Typography>
      </Grid>
      <Grid item ml="auto">
        <Tooltip arrow title="Create a new watchlist">
          <Box display="inline-block" ml={1} mt={1}>
            <IconButton color="primary" onClick={() => setAddWatchlistOpen(true)}>
              <AddIcon />
            </IconButton>
          </Box>
        </Tooltip>
        <Dialog maxWidth="lg" open={addWatchlistOpen} onClose={() => setAddWatchlistOpen(false)}>
          <AddWatchlist onClose={() => (setAddWatchlistOpen(false), props.getWatchlists())} />
        </Dialog>
      </Grid>
    </Grid>
  );
};

interface WatchlistSummaryHeaderProps {
  /**
   * A method to update the watchlist summaries, e.g. after a new watchlist was created.
   */
  getWatchlists: () => void;
}
