import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, Grid, TextField, DialogActions, Button } from "@mui/material";
import type { WatchlistSummary } from "@rating-tracker/commons";
import { watchlistsAPIPath } from "@rating-tracker/commons";
import { useRef, useState } from "react";

import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

/**
 * A dialog to rename a watchlist in the backend.
 * @param props The properties of the component.
 * @returns The component.
 */
export const RenameWatchlist = (props: RenameWatchlistProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [name, setName] = useState<string>(props.watchlist?.name);
  const [nameError, setNameError] = useState<string>(""); // Error message for the name text field.
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const nameInputRef = useRef<HTMLInputElement>(null);

  /**
   * Checks for errors in the input fields.
   * @returns Whether the input fields are valid.
   */
  const validate = (): boolean => {
    const isNameValid = nameInputRef.current?.checkValidity();
    return isNameValid;
  };

  /**
   * Updates the watchlist in the backend.
   */
  const updateWatchlist = () => {
    if (!validate()) return;
    setRequestInProgress(true);
    api
      .patch(watchlistsAPIPath + `/${props.watchlist.id}`, {
        // Only send the parameters that have changed.
        params: { name: name !== props.watchlist.name ? name.trim() : undefined },
      })
      .then(() => (props.onRename(), props.onClose())) // Update the watchlists in the parent component.
      .catch((e) => setErrorNotificationOrClearSession(e, "updating watchlist"))
      .finally(() => setRequestInProgress(false));
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Rename Watchlist “{props.watchlist.name}”</Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} mt={0} maxWidth={600} alignItems="center">
          <Grid item xs={12}>
            <TextField
              onChange={(event) => {
                setName(event.target.value);
                // If in error state, check whether error is resolved. If so, clear the error.
                if (nameError && event.target.checkValidity()) setNameError("");
              }}
              onInvalid={(event) => setNameError((event.target as HTMLInputElement).validationMessage)}
              error={!!nameError}
              helperText={nameError}
              inputRef={nameInputRef}
              required
              label="Watchlist name"
              value={name}
              placeholder="e.g. Noteworthy Stocks"
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose} sx={{ mr: "auto" }}>
          Cancel
        </Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={updateWatchlist}
          disabled={!!nameError}
          startIcon={<PublishedWithChangesIcon />}
        >
          Update Watchlist
        </LoadingButton>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the RenameWatchlist component.
 */
interface RenameWatchlistProps {
  /**
   * The watchlist to rename.
   */
  watchlist: WatchlistSummary;
  /**
   * A method that is called after the watchlist was renamed successfully.
   */
  onRename: () => void;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}
