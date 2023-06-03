import { Box, Grid, Typography, Dialog, IconButton, Skeleton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DeleteWatchlist from "../../../components/dialogs/DeleteWatchlist";
import RenameWatchlist from "../../../components/dialogs/RenameWatchlist";
import { Watchlist, watchlistEndpointPath } from "@rating-tracker/commons";
import { useState } from "react";
import axios from "axios";
import { useNotification } from "../../../contexts/NotificationContext";
import { baseUrl } from "../../../router";

/**
 * A header for the watchlist details page.
 *
 * @param {PageHeaderProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const PageHeader = (props: PageHeaderProps): JSX.Element => {
  const isFavorites = props.watchlist?.name === "Favorites";
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false);
  const { setNotification } = useNotification();

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item sx={{ display: "flex", alignItems: "center", maxWidth: "calc(100% - 147px)" }}>
          <Typography variant="h3" component="h3" gutterBottom>
            {props.watchlist ? props.watchlist.name : <Skeleton width={160} />}
          </Typography>
        </Grid>
        <Grid item ml="auto" height={40}>
          {props.watchlist ? (
            <Tooltip
              arrow
              title={props.watchlist.subscribed ? "Unsubscribe from stock updates" : "Subscribe to stock updates"}
            >
              <Box display="inline-block" ml={1}>
                <IconButton
                  color={props.watchlist.subscribed ? "primary" : undefined}
                  onClick={() => {
                    axios
                      .patch(
                        baseUrl + watchlistEndpointPath + `/${props.watchlist.id}`,
                        {},
                        { params: { subscribed: !props.watchlist.subscribed } }
                      )
                      .then(() => props.getWatchlist && props.getWatchlist())
                      .catch((e) => {
                        setNotification({
                          severity: "error",
                          title: props.watchlist.subscribed
                            ? `Error while unsubscribing from watchlist “${props.watchlist.name}”`
                            : `Error while subscribing to watchlist “${props.watchlist.name}”`,
                          message:
                            e.response?.status && e.response?.data?.message
                              ? `${e.response.status}: ${e.response.data.message}`
                              : e.message ?? "No additional information available.",
                        });
                      });
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
        </Grid>
      </Grid>
      {props.watchlist && (
        <>
          <Dialog
            open={renameDialogOpen}
            onClose={() => (setRenameDialogOpen(false), props.getWatchlist && props.getWatchlist())}
          >
            <RenameWatchlist
              watchlist={props.watchlist}
              getWatchlists={props.getWatchlist}
              onClose={() => setRenameDialogOpen(false)}
            />
          </Dialog>
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DeleteWatchlist
              watchlist={props.watchlist}
              onClose={() => setDeleteDialogOpen(false)}
              navigateTo="/watchlist"
            />
          </Dialog>
        </>
      )}
    </>
  );
};

/**
 * The properties of the PageHeader component.
 */
interface PageHeaderProps {
  /**
   * The watchlist to display.
   */
  watchlist?: Watchlist;
  /**
   * A method to update the watchlist, e.g. after editing.
   */
  getWatchlist?: () => void;
}

export default PageHeader;
