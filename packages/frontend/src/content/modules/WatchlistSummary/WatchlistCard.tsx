import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import StarsIcon from "@mui/icons-material/Stars";
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Dialog,
  Grid2 as Grid,
  IconButton,
  Link,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import type { WatchlistSummary } from "@rating-tracker/commons";
import { FAVORITES_NAME, handleResponse, pluralize, watchlistsAPIPath } from "@rating-tracker/commons";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import watchlistClient from "../../../api/watchlist";
import PinnedDialog from "../../../components/dialogs/PinnedDialog";
import AddStockToCollection from "../../../components/dialogs/stock/AddStockToCollection";
import { DeleteWatchlist } from "../../../components/dialogs/watchlist/DeleteWatchlist";
import { RenameWatchlist } from "../../../components/dialogs/watchlist/RenameWatchlist";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";

/**
 * This component displays information about a watchlist in a card used in the watchlist summary module.
 * @param props The properties of the component.
 * @returns The component.
 */
const WatchlistCard = (props: WatchlistCardProps): JSX.Element => {
  const isFavorites = props.watchlist?.name === FAVORITES_NAME;
  const [addStockToCollectionDialogOpen, setAddStockToCollectionDialogOpen] = useState<boolean>(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  return (
    <Card>
      <CardActionArea>
        <Link to={`${watchlistsAPIPath}/${props.watchlist?.id}`} component={NavLink} sx={{ color: "inherit" }}>
          <CardContent>
            <Grid container sx={{ justifyContent: "space-between" }}>
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  ...(isFavorites ? { maxWidth: "calc(100% - 36px)" } : {}),
                }}
              >
                <Box>
                  <Typography variant="h3">{props.watchlist?.name ?? <Skeleton width="160px" />}</Typography>
                  <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
                    {props.watchlist ? (
                      `${props.watchlist.stocks.length || "No"} stock${pluralize(props.watchlist.stocks.length)}`
                    ) : (
                      <Skeleton width="48px" />
                    )}
                  </Typography>
                </Box>
              </Grid>
              {isFavorites && (
                <Grid sx={{ fontSize: 28 }}>
                  <Tooltip title="This is your Favorites watchlist." arrow>
                    <StarsIcon fontSize="inherit" color="warning" />
                  </Tooltip>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Link>
      </CardActionArea>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        {props.watchlist ? (
          <Tooltip
            arrow
            title={props.watchlist.subscribed ? "Unsubscribe from stock updates" : "Subscribe to stock updates"}
          >
            <Box sx={{ display: "inline-block", ml: 1 }}>
              <IconButton
                aria-label={`${
                  props.watchlist.subscribed ? "Unsubscribe from" : "Subscribe to"
                } stock updates for watchlist “${props.watchlist.name}”`}
                color={props.watchlist.subscribed ? "primary" : undefined}
                onClick={() => {
                  watchlistClient[":id"]
                    .$patch({
                      param: { id: String(props.watchlist!.id) },
                      json: { subscribed: !props.watchlist!.subscribed },
                    })
                    .then(handleResponse)
                    .then(() => props.getWatchlists && props.getWatchlists())
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
            <Box sx={{ display: "inline-block", ml: 1 }}>
              <IconButton
                aria-label={`Add stock to watchlist “${props.watchlist.name}”`}
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
            <Box sx={{ display: "inline-block", ml: 1 }}>
              <IconButton
                aria-label={`Rename watchlist “${props.watchlist.name}”`}
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
            <Box sx={{ display: "inline-block", ml: 1 }}>
              <IconButton
                aria-label={`Delete watchlist “${props.watchlist.name}”`}
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
        {props.watchlist && props.getWatchlists ? (
          <>
            {/* Add Stock to Collection Dialog */}
            <PinnedDialog
              maxWidth="xs"
              fullWidth
              open={addStockToCollectionDialogOpen}
              onClose={() => setAddStockToCollectionDialogOpen(false)}
            >
              <AddStockToCollection
                collection={props.watchlist}
                onAdd={props.getWatchlists}
                onClose={() => setAddStockToCollectionDialogOpen(false)}
              />
            </PinnedDialog>
            {/* Rename Dialog */}
            <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
              <RenameWatchlist
                watchlist={props.watchlist}
                onRename={props.getWatchlists}
                onClose={() => setRenameDialogOpen(false)}
              />
            </Dialog>
            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
              <DeleteWatchlist
                watchlist={props.watchlist}
                onClose={() => setDeleteDialogOpen(false)}
                onDelete={props.getWatchlists}
              />
            </Dialog>
          </>
        ) : (
          <></>
        )}
      </CardActions>
    </Card>
  );
};

/**
 * Properties for the WatchlistCard component.
 */
interface WatchlistCardProps {
  /**
   * The watchlist to display.
   */
  watchlist?: WatchlistSummary;
  /**
   * A method to update the watchlists, e.g. after a watchlist was modified or deleted.
   */
  getWatchlists?: () => void;
}

export default WatchlistCard;
