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
  Grid,
  IconButton,
  Link,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import type { WatchlistSummary } from "@rating-tracker/commons";
import { FAVORITES_NAME, watchlistsEndpointPath } from "@rating-tracker/commons";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import { DeleteWatchlist } from "../../../components/dialogs/watchlist/DeleteWatchlist";
import { RenameWatchlist } from "../../../components/dialogs/watchlist/RenameWatchlist";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

/**
 * This component displays information about a watchlist in a card used in the watchlist summary module.
 *
 * @param {WatchlistCardProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const WatchlistCard = (props: WatchlistCardProps): JSX.Element => {
  const isFavorites = props.watchlist?.name === FAVORITES_NAME;
  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  return (
    <Card>
      <CardActionArea>
        <Link
          to={`${watchlistsEndpointPath}/${props.watchlist?.id}`}
          component={NavLink}
          color="inherit"
          underline="none"
        >
          <CardContent>
            <Grid container justifyContent="space-between">
              <Grid item display="flex" alignItems="center" maxWidth={isFavorites ? "calc(100% - 36px)" : undefined}>
                <Box>
                  <Typography variant="h3">{props.watchlist?.name ?? <Skeleton width="160px" />}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {props.watchlist ? (
                      (props.watchlist.stocks.length || "No") +
                      ` stock${props.watchlist.stocks.length !== 1 ? "s" : ""}`
                    ) : (
                      <Skeleton width="48px" />
                    )}
                  </Typography>
                </Box>
              </Grid>
              {isFavorites && (
                <Grid item sx={{ fontSize: 28 }}>
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
            <Box display="inline-block" ml={1}>
              <IconButton
                color={props.watchlist.subscribed ? "primary" : undefined}
                onClick={() => {
                  api
                    .patch(watchlistsEndpointPath + `/${props.watchlist.id}`, {
                      params: { subscribed: !props.watchlist.subscribed },
                    })
                    .then(() => props.getWatchlists && props.getWatchlists())
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
      </CardActions>
    </Card>
  );
};

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
