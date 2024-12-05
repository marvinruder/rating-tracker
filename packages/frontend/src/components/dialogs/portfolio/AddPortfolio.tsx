import AddBoxIcon from "@mui/icons-material/AddBox";
import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, Grid2 as Grid, TextField, DialogActions, Button } from "@mui/material";
import type { Currency } from "@rating-tracker/commons";
import { handleResponse, isCurrency } from "@rating-tracker/commons";
import { useRef, useState } from "react";

import portfolioClient from "../../../api/portfolio";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import CurrencyAutocomplete from "../../autocomplete/CurrencyAutocomplete";

/**
 * A dialog to add a new portfolio in the backend.
 * @param props The properties of the component.
 * @returns The component.
 */
export const AddPortfolio = (props: AddPortfolioProps): React.JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>();
  const [nameError, setNameError] = useState<string>(""); // Error message for the name text field.
  const [currencyError, setCurrencyError] = useState<string>(""); // Error message for the currency input field.
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const nameInputRef = useRef<HTMLInputElement>(null);
  const currencyInputRef = useRef<HTMLInputElement>(null);

  /**
   * Checks for errors in the input fields.
   * @returns Whether the input fields are valid.
   */
  const validate = (): boolean => {
    const isNameValid = nameInputRef.current?.checkValidity() ?? false;
    const isCurrencyValid = currencyInputRef.current?.checkValidity() ?? false;
    return isNameValid && isCurrencyValid;
  };

  /**
   * Transmits the portfolio to the server.
   */
  const putPortfolio = () => {
    if (!validate()) return;
    setRequestInProgress(true);
    portfolioClient.index
      .$put({ json: { name: name.trim(), currency: currency! } })
      .then(handleResponse)
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
              label="Portfolio name"
              value={name}
              placeholder="e.g. Monthly Savings"
              fullWidth
            />
          </Grid>
          <Grid size={12}>
            <CurrencyAutocomplete
              value={currency ?? null}
              onChange={(_, value) => {
                if (isCurrency(value)) {
                  setCurrency(value);
                  // If in error state, check whether error is resolved. If so, clear the error.
                  if (currencyError && currencyInputRef.current?.checkValidity()) setCurrencyError("");
                }
              }}
              onInvalid={(event) => setCurrencyError((event.target as HTMLInputElement).validationMessage)}
              error={!!currencyError}
              helperText={currencyError}
              inputRef={currencyInputRef}
              required
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
          disabled={!!nameError || !!currencyError}
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
