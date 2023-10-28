import AddBoxIcon from "@mui/icons-material/AddBox";
import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, Grid, TextField, DialogActions, Button } from "@mui/material";
import { watchlistEndpointPath } from "@rating-tracker/commons";
import { useState } from "react";

import { useNotification } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

/**
 * A dialog to add a new watchlist in the backend.
 *
 * @param {AddWatchlistProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const AddWatchlist = (props: AddWatchlistProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [nameError, setNameError] = useState<boolean>(false); // Error in the name text field.
  const { setErrorNotificationOrClearSession: setErrorNotification } = useNotification();

  /**
   * Checks for errors in the input fields.
   */
  const validate = () => {
    // The following fields are required.
    setNameError(!name);
  };

  /**
   * Transmits the watchlist to the server.
   */
  const putWatchlist = () => {
    setRequestInProgress(true);
    api
      .put(watchlistEndpointPath + `/new`, undefined, {
        params: { name: name.trim() },
      })
      .then(() => {
        props.onClose();
      })
      .catch((e) => setErrorNotification(e, "creating new watchlist"))
      .finally(() => setRequestInProgress(false));
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Create a new Watchlist</Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} mt={0} maxWidth={600} alignItems="center">
          <Grid item xs={12}>
            <TextField
              onChange={(event) => {
                setName(event.target.value);
                setNameError(false);
              }}
              error={nameError}
              label="Watchlist name"
              value={name}
              placeholder="e.g. Noteworthy Stocks"
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={() => props.onClose()}>Cancel</Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={putWatchlist}
          onMouseOver={validate} // Validate input fields on hover
          disabled={nameError}
          startIcon={<AddBoxIcon />}
        >
          Create Watchlist
        </LoadingButton>
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
}
