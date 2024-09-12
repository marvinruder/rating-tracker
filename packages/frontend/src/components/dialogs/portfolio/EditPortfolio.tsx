import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, Grid2 as Grid, TextField, DialogActions, Button } from "@mui/material";
import type { Currency, PortfolioSummary } from "@rating-tracker/commons";
import { handleResponse, isCurrency } from "@rating-tracker/commons";
import { useRef, useState } from "react";

import portfolioClient from "../../../api/portfolio";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import CurrencyAutocomplete from "../../autocomplete/CurrencyAutocomplete";

/**
 * A dialog to edit a portfolio in the backend.
 * @param props The properties of the component.
 * @returns The component.
 */
export const EditPortfolio = (props: EditPortfolioProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [name, setName] = useState<string>(props.portfolio?.name);
  const [currency, setCurrency] = useState<Currency>(props.portfolio?.currency);
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
   * Updates the portfolio in the backend.
   */
  const updatePortfolio = () => {
    if (!validate()) return;
    setRequestInProgress(true);
    portfolioClient[":id"]
      .$patch({
        param: { id: String(props.portfolio.id) },
        json: {
          // Only send the parameters that have changed.
          ...(name !== props.portfolio.name ? { name: name.trim() } : {}),
          ...(currency !== props.portfolio.currency ? { currency } : {}),
        },
      })
      .then(handleResponse)
      .then(() => (props.onEdit(), props.onClose())) // Update the portfolios in the parent component.
      .catch((e) => setErrorNotificationOrClearSession(e, "updating portfolio"))
      .finally(() => setRequestInProgress(false));
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Edit Portfolio “{props.portfolio.name}”</Typography>
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
        <Button onClick={() => props.onClose()} sx={{ mr: "auto" }}>
          Cancel
        </Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={updatePortfolio}
          disabled={!!nameError || !!currencyError}
          startIcon={<PublishedWithChangesIcon />}
        >
          Update Portfolio
        </LoadingButton>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the EditPortfolio component.
 */
interface EditPortfolioProps {
  /**
   * The portfolio to edit.
   */
  portfolio: PortfolioSummary;
  /**
   * A method that is called after the portfolio was edited successfully.
   */
  onEdit: () => void;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}
