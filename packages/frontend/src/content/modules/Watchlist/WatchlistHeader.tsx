import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { Box, Grid2 as Grid, Typography, Dialog, IconButton, Skeleton, Tooltip, Divider } from "@mui/material";
import type { Watchlist } from "@rating-tracker/commons";
import { FAVORITES_NAME, handleResponse, pluralize, watchlistsAPIPath } from "@rating-tracker/commons";
import { useState } from "react";
import { useNavigate } from "react-router";

import watchlistClient from "../../../api/watchlist";
import PinnedDialog from "../../../components/dialogs/PinnedDialog";
import AddStockToCollection from "../../../components/dialogs/stock/AddStockToCollection";
import { DeleteWatchlist } from "../../../components/dialogs/watchlist/DeleteWatchlist";
import { RenameWatchlist } from "../../../components/dialogs/watchlist/RenameWatchlist";
import type { StockTableFiltersProps } from "../../../components/stock/layouts/StockTableFilters";
import { StockTableFilters } from "../../../components/stock/layouts/StockTableFilters";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";

/**
 * A header for the watchlist details page.
 * @param props The properties of the component.
 * @returns The component.
 */
export const WatchlistHeader = (props: WatchlistHeaderProps): JSX.Element => {
  const isFavorites = props.watchlist?.name === FAVORITES_NAME;
  const [addStockToCollectionDialogOpen, setAddStockToCollectionDialogOpen] = useState<boolean>(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const navigate = useNavigate();

  return (
    <>
      <Grid container sx={{ justifyContent: "space-between", alignItems: "center", rowGap: 1 }}>
        <Grid sx={{ display: "flex", alignItems: "center" }}>
          <Box>
            <Typography variant="h3" component="h3" gutterBottom>
              {props.watchlist ? props.watchlist.name : <Skeleton width={160} />}
            </Typography>
            <Typography variant="subtitle2">
              {props.watchlist ? (
                `${props.watchlist.stocks.length || "No"} stock${pluralize(props.watchlist.stocks.length)}`
              ) : (
                <Skeleton width="48px" />
              )}
            </Typography>
          </Box>
        </Grid>
        <Grid sx={{ ml: "auto", height: 40, display: "inline-flex" }}>
          {props.watchlist ? (
            <Tooltip
              arrow
              title={props.watchlist.subscribed ? "Unsubscribe from stock updates" : "Subscribe to stock updates"}
            >
              <Box id="subscribe-to-watchlist-label" sx={{ display: "inline-block", ml: 1 }}>
                <IconButton
                  aria-labelledby="subscribe-to-watchlist-label"
                  color={props.watchlist.subscribed ? "primary" : undefined}
                  onClick={() => {
                    watchlistClient[":id"]
                      .$patch({
                        param: { id: String(props.watchlist!.id) },
                        json: { subscribed: !props.watchlist!.subscribed },
                      })
                      .then(handleResponse)
                      .then(props.getWatchlist)
                      .catch((e) =>
                        setErrorNotificationOrClearSession(
                          e,
                          props.watchlist!.subscribed
                            ? `unsubscribing from watchlist “${props.watchlist!.name}”`
                            : `subscribing to watchlist “${props.watchlist!.name}”`,
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
            <Tooltip arrow title="Add stock">
              <Box id="add-stock-to-watchlist-label" sx={{ display: "inline-block", ml: 1 }}>
                <IconButton
                  aria-labelledby="add-stock-to-watchlist-label"
                  color="success"
                  onClick={() => setAddStockToCollectionDialogOpen(true)}
                >
                  <BookmarkAddIcon />
                </IconButton>
              </Box>
            </Tooltip>
          ) : (
            <Skeleton variant="rounded" width={40} height={40} sx={{ display: "inline-block", ml: 1 }} />
          )}
          {props.watchlist ? (
            <Tooltip arrow title={isFavorites ? "You cannot rename the Favorites watchlist" : "Rename watchlist"}>
              <Box id="rename-watchlist-label" sx={{ display: "inline-block", ml: 1 }}>
                <IconButton
                  aria-labelledby="rename-watchlist-label"
                  color="primary"
                  onClick={() => setRenameDialogOpen(true)}
                  disabled={isFavorites}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </Tooltip>
          ) : (
            <Skeleton variant="rounded" width={40} height={40} sx={{ display: "inline-block", ml: 1 }} />
          )}
          {props.watchlist ? (
            <Tooltip arrow title={isFavorites ? "You cannot delete the Favorites watchlist" : "Delete watchlist"}>
              <Box id="delete-watchlist-label" sx={{ display: "inline-block", ml: 1 }}>
                <IconButton
                  aria-labelledby="delete-watchlist-label"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isFavorites}
                >
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
          <PinnedDialog
            maxWidth="xs"
            fullWidth
            open={addStockToCollectionDialogOpen}
            onClose={() => setAddStockToCollectionDialogOpen(false)}
          >
            <AddStockToCollection
              collection={props.watchlist}
              onAdd={() => (props.getWatchlist(), props.refetchStocks())}
              onClose={() => setAddStockToCollectionDialogOpen(false)}
            />
          </PinnedDialog>
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
              onDelete={() => navigate(watchlistsAPIPath)}
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
   * A method to update the stock list, e.g. after a new stock was added to the watchlist.
   */
  refetchStocks: () => void;
  /**
   * The properties of the stock table filters.
   */
  stockTableFiltersProps: StockTableFiltersProps;
}
