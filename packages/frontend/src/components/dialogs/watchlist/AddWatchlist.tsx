import AddBoxIcon from "@mui/icons-material/AddBox";
import { DialogTitle, Typography, DialogContent, Grid, TextField, DialogActions, Button } from "@mui/material";
import { handleResponse } from "@rating-tracker/commons";
import { useRef, useState } from "react";

import watchlistClient from "../../../api/watchlist";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";

/**
 * A dialog to add a new watchlist in the backend.
 * @param props The properties of the component.
 * @returns The component.
 */
export const AddWatchlist = (props: AddWatchlistProps): React.JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [nameError, setNameError] = useState<string>(""); // Error message for the name text field.
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const nameInputRef = useRef<HTMLInputElement>(null);

  /**
   * Checks for errors in the input fields.
   * @returns Whether the input fields are valid.
   */
  const validate = (): boolean => {
    const isNameValid = nameInputRef.current?.checkValidity() ?? false;
    return isNameValid;
  };

  /**
   * Transmits the watchlist to the server.
   */
  const putWatchlist = () => {
    if (!validate()) return;
    setRequestInProgress(true);
    watchlistClient.index
      .$put({ json: { name: name.trim() } })
      .then(handleResponse)
      .then(() => (props.onAdd(), props.onClose()))
      .catch((e) => setErrorNotificationOrClearSession(e, "creating new watchlist"))
      .finally(() => setRequestInProgress(false));
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Create a new Watchlist</Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{ mt: 1, maxWidth: 600, alignItems: "center" }}>
          <Grid size={12}>
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
        <Button
          loading={requestInProgress}
          variant="contained"
          onClick={putWatchlist}
          disabled={!!nameError}
          startIcon={<AddBoxIcon />}
        >
          Create Watchlist
        </Button>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the AddWatchlist component.
 */
interface AddWatchlistProps {
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
  /**
   * A method that is called after the watchlist was added successfully.
   */
  onAdd: () => void;
}
