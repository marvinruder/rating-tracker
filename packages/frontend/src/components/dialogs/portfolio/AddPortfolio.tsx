import AddBoxIcon from "@mui/icons-material/AddBox";
import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, Grid, TextField, DialogActions, Button } from "@mui/material";
import type { Currency } from "@rating-tracker/commons";
import { isCurrency, portfoliosEndpointPath } from "@rating-tracker/commons";
import { useState } from "react";

import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";
import CurrencyAutocomplete from "../../autocomplete/CurrencyAutocomplete";

/**
 * A dialog to add a new portfolio in the backend.
 * @param props The properties of the component.
 * @returns The component.
 */
export const AddPortfolio = (props: AddPortfolioProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>();
  const [nameError, setNameError] = useState<boolean>(false); // Error in the name text field.
  const [currencyError, setCurrencyError] = useState<boolean>(false); // Error in the currency input field.
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  /**
   * Checks for errors in the input fields.
   * @returns Whether the input fields are valid.
   */
  const validate = (): boolean => {
    // The following fields are required.
    setNameError(!name);
    setCurrencyError(!currency);
    return !!name && !!currency;
  };

  /**
   * Transmits the portfolio to the server.
   */
  const putPortfolio = () => {
    if (!validate()) return;
    setRequestInProgress(true);
    api
      .put(portfoliosEndpointPath + `/new`, { params: { name: name.trim(), currency } })
      .then(() => (props.onAdd(), props.onClose()))
      .catch((e) => setErrorNotificationOrClearSession(e, "creating new portfolio"))
      .finally(() => setRequestInProgress(false));
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Create a new Portfolio</Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} mt={0} maxWidth={600} alignItems="center">
          <Grid item xs={12}>
            <TextField
              onChange={(event) => (setName(event.target.value), setNameError(false))}
              error={nameError}
              label="Portfolio name"
              value={name}
              placeholder="e.g. Monthly Savings"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <CurrencyAutocomplete
              value={currency ?? null}
              onChange={(_, value) => isCurrency(value) && (setCurrency(value), setCurrencyError(false))}
              error={currencyError}
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
          onClick={putPortfolio}
          onMouseOver={validate} // Validate input fields on hover
          disabled={nameError || currencyError}
          startIcon={<AddBoxIcon />}
        >
          Create Portfolio
        </LoadingButton>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the AddPortfolio component.
 */
interface AddPortfolioProps {
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
  /**
   * A method that is called after the portfolio was added successfully.
   */
  onAdd: () => void;
}
