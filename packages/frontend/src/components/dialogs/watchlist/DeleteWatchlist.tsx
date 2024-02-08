import DeleteIcon from "@mui/icons-material/Delete";
import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, DialogActions, Button } from "@mui/material";
import type { WatchlistSummary } from "@rating-tracker/commons";
import { watchlistsEndpointPath } from "@rating-tracker/commons";
import { useState } from "react";

import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

/**
 * A dialog to delete a watchlist from the backend.
 * @param props The properties of the component.
 * @returns The component.
 */
export const DeleteWatchlist = (props: DeleteWatchlistProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState(false);

  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  /**
   * Deletes the watchlist from the backend.
   */
  const deleteWatchlist = () => {
    setRequestInProgress(true);
    api
      .delete(watchlistsEndpointPath + `/${props.watchlist.id}`)
      .then(() => (props.onDelete(), props.onClose()))
      .catch((e) => setErrorNotificationOrClearSession(e, "deleting watchlist"))
      .finally(() => setRequestInProgress(false));
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Delete Watchlist “{props.watchlist.name}”</Typography>
      </DialogTitle>
      <DialogContent>
        Do you really want to delete the Watchlist “{props.watchlist.name}”? This action cannot be reversed.
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose}>Cancel</Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={deleteWatchlist}
          color="error"
          startIcon={<DeleteIcon />}
        >
          Delete Watchlist
        </LoadingButton>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the DeleteWatchlist component.
 */
interface DeleteWatchlistProps {
  /**
   * The watchlist to delete.
   */
  watchlist: WatchlistSummary;
  /**
   * A method that is called after the watchlist was deleted successfully.
   */
  onDelete: () => void;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}
