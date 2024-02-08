import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { Box, Grid, Typography, Dialog, IconButton, Skeleton, Tooltip, Divider } from "@mui/material";
import type { Watchlist } from "@rating-tracker/commons";
import { FAVORITES_NAME, watchlistsEndpointPath } from "@rating-tracker/commons";
import { useState } from "react";
import { useNavigate } from "react-router";

import { DeleteWatchlist } from "../../../components/dialogs/watchlist/DeleteWatchlist";
import { RenameWatchlist } from "../../../components/dialogs/watchlist/RenameWatchlist";
import type { StockTableFiltersProps } from "../../../components/stock/layouts/StockTableFilters";
import { StockTableFilters } from "../../../components/stock/layouts/StockTableFilters";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

/**
 * A header for the watchlist details page.
 * @param props The properties of the component.
 * @returns The component.
 */
export const WatchlistHeader = (props: WatchlistHeaderProps): JSX.Element => {
  const isFavorites = props.watchlist?.name === FAVORITES_NAME;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false);
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const navigate = useNavigate();

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item sx={{ display: "flex", alignItems: "center", maxWidth: "calc(100% - 147px)" }}>
          <Box>
            <Typography variant="h3" component="h3" gutterBottom>
              {props.watchlist ? props.watchlist.name : <Skeleton width={160} />}
            </Typography>
            <Typography variant="subtitle2">
              {props.watchlist ? (
                (props.watchlist.stocks.length || "No") + ` stock${props.watchlist.stocks.length !== 1 ? "s" : ""}`
              ) : (
                <Skeleton width="48px" />
              )}
            </Typography>
          </Box>
        </Grid>
        <Grid item ml="auto" height={40} display="inline-flex">
          {props.watchlist ? (
            <Tooltip
              arrow
              title={props.watchlist.subscribed ? "Unsubscribe from stock updates" : "Subscribe to stock updates"}
            >
              <Box display="inline-block" ml={1}>
                <IconButton
                  color={props.watchlist.subscribed ? "primary" : undefined}
                  onClick={() => {
                    api
                      .patch(watchlistsEndpointPath + `/${props.watchlist.id}`, {
                        params: { subscribed: !props.watchlist.subscribed },
                      })
                      .then(props.getWatchlist)
                      .catch((e) =>
                        setErrorNotificationOrClearSession(
                          e,
                          props.watchlist.subscribed
                            ? `unsubscribing from watchlist “${props.watchlist.name}”`
                            : `subscribing to watchlist “${props.watchlist.name}”`,
                        ),
                      );
                  }}
                >
                  {props.watchlist.subscribed ? <NotificationsIcon /> : <NotificationsNoneIcon />}
                </IconButton>
              </Box>
            </Tooltip>
          ) : (
            <Skeleton variant="rounded" width={40} height={40} sx={{ display: "inline-block", ml: 1 }} />
          )}
          {props.watchlist ? (
            <Tooltip arrow title={isFavorites ? "You cannot rename the Favorites watchlist" : "Rename watchlist"}>
              <Box display="inline-block" ml={1}>
                <IconButton color="primary" onClick={() => setRenameDialogOpen(true)} disabled={isFavorites}>
                  <EditIcon />
                </IconButton>
              </Box>
            </Tooltip>
          ) : (
            <Skeleton variant="rounded" width={40} height={40} sx={{ display: "inline-block", ml: 1 }} />
          )}
          {props.watchlist ? (
            <Tooltip arrow title={isFavorites ? "You cannot delete the Favorites watchlist" : "Delete watchlist"}>
              <Box display="inline-block" ml={1}>
                <IconButton color="error" onClick={() => setDeleteDialogOpen(true)} disabled={isFavorites}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Tooltip>
          ) : (
            <Skeleton variant="rounded" width={40} height={40} sx={{ display: "inline-block", ml: 1 }} />
          )}
          <Divider orientation="vertical" component="div" sx={{ display: "inline-block", ml: 1, height: 40 }} />
          <StockTableFilters {...props.stockTableFiltersProps} />
        </Grid>
      </Grid>
      {props.watchlist && (
        <>
          <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
            <RenameWatchlist
              watchlist={props.watchlist}
              onRename={props.getWatchlist}
              onClose={() => setRenameDialogOpen(false)}
            />
          </Dialog>
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DeleteWatchlist
              watchlist={props.watchlist}
              onClose={() => setDeleteDialogOpen(false)}
              onDelete={() => navigate(watchlistsEndpointPath)}
            />
          </Dialog>
        </>
      )}
    </>
  );
};

/**
 * The properties of the WatchlistHeader component.
 */
interface WatchlistHeaderProps {
  /**
   * The watchlist to display.
   */
  watchlist?: Watchlist;
  /**
   * A method to update the watchlist, e.g. after editing.
   */
  getWatchlist: () => void;
  /**
   * The properties of the stock table filters.
   */
  stockTableFiltersProps: StockTableFiltersProps;
}
