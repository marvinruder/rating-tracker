import AddIcon from "@mui/icons-material/Add";
import { Box, Dialog, Grid2 as Grid, IconButton, Tooltip, Typography } from "@mui/material";
import type { FC } from "react";
import { useState } from "react";

import { AddWatchlist } from "../../../components/dialogs/watchlist/AddWatchlist";

/**
 * A header for the watchlist summaries page.
 * @param props The properties of the component.
 * @returns The component.
 */
export const WatchlistSummaryHeader: FC<WatchlistSummaryHeaderProps> = (
  props: WatchlistSummaryHeaderProps,
): JSX.Element => {
  const [addWatchlistOpen, setAddWatchlistOpen] = useState<boolean>(false);

  return (
    <Grid container sx={{ justifyContent: "space-between", alignItems: "center", rowGap: 1 }}>
      <Grid>
        <Typography variant="h3" component="h3" gutterBottom>
          Your Watchlists
        </Typography>
        <Typography variant="subtitle2">View and organize your favorite or otherwise noteworthy stocks.</Typography>
      </Grid>
      <Grid sx={{ ml: "auto" }}>
        <Tooltip arrow title="Create a new watchlist">
          <Box id="add-watchlist-label" sx={{ display: "inline-block", ml: 1 }}>
            <IconButton aria-labelledby="add-watchlist-label" color="primary" onClick={() => setAddWatchlistOpen(true)}>
              <AddIcon />
            </IconButton>
          </Box>
        </Tooltip>
        <Dialog maxWidth="lg" open={addWatchlistOpen} onClose={() => setAddWatchlistOpen(false)}>
          <AddWatchlist onClose={() => setAddWatchlistOpen(false)} onAdd={props.refetchWatchlists} />
        </Dialog>
      </Grid>
    </Grid>
  );
};

/**
 * Properties for the WatchlistSummaryHeader component.
 */
interface WatchlistSummaryHeaderProps {
  /**
   * A method to update the watchlist summaries, e.g. after a new watchlist was created.
   */
  refetchWatchlists: () => void;
}
