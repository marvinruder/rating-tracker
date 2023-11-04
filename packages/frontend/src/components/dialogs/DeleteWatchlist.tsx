import DeleteIcon from "@mui/icons-material/Delete";
import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, DialogActions, Button } from "@mui/material";
import { WatchlistSummary, watchlistEndpointPath } from "@rating-tracker/commons";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useNotification } from "../../contexts/NotificationContext";
import api from "../../utils/api";

/**
 * A dialog to delete a watchlist from the backend.
 *
 * @param {DeleteWatchlistProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const DeleteWatchlist = (props: DeleteWatchlistProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState(false);

  const { setErrorNotificationOrClearSession: setErrorNotification } = useNotification();
  const navigate = useNavigate();

  /**
   * Deletes the watchlist from the backend.
   */
  const deleteWatchlist = () => {
    props.watchlist &&
      (setRequestInProgress(true),
      api
        .delete(watchlistEndpointPath + `/${props.watchlist.id}`)
        // If the dialog is shown from the watchlist list, the list should be updated.
        .then(() => props.getWatchlists && props.getWatchlists())
        .catch((e) => setErrorNotification(e, "deleting watchlist"))
        .finally(() => {
          setRequestInProgress(false);
          // If the dialog is shown from e.g. a detail page, the user should be redirected to another page.
          props.navigateTo && navigate(props.navigateTo);
          props.onClose();
        }));
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
   * A method to update the watchlist summaries after the watchlist was deleted.
   */
  getWatchlists?: () => void;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
  /**
   * The path to navigate to after the watchlist was deleted.
   */
  navigateTo?: string;
}
