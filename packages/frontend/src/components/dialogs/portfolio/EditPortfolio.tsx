import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  DialogTitle,
  Typography,
  DialogContent,
  Grid,
  TextField,
  DialogActions,
  Button,
  Autocomplete,
} from "@mui/material";
import type { Currency, PortfolioSummary } from "@rating-tracker/commons";
import {
  currencyArray,
  currencyName,
  currencyNameWithFlagAndCode,
  isCurrency,
  portfoliosEndpointPath,
} from "@rating-tracker/commons";
import { useState } from "react";

import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

/**
 * A dialog to edit a portfolio in the backend.
 * @param props The properties of the component.
 * @returns The component.
 */
export const EditPortfolio = (props: EditPortfolioProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [name, setName] = useState<string>(props.portfolio?.name);
  const [currency, setCurrency] = useState<Currency>(props.portfolio?.currency);
  // The value of the text field in the currency autocomplete.
  const [currencyInputValue, setCurrencyInputValue] = useState<string>("");
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
   * Updates the portfolio in the backend.
   */
  const updatePortfolio = () => {
    if (!validate()) return;
    setRequestInProgress(true);
    api
      .patch(portfoliosEndpointPath + `/${props.portfolio.id}`, {
        params: {
          // Only send the parameters that have changed.
          name: name !== props.portfolio.name ? name.trim() : undefined,
          currency: currency !== props.portfolio.currency ? currency : undefined,
        },
      })
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
        <Grid container spacing={1} mt={0} maxWidth={600} alignItems="center">
          <Grid item xs={12}>
            <TextField
              onChange={(event) => {
                setName(event.target.value);
                setNameError(false);
              }}
              error={nameError}
              label="Portfolio name"
              value={name}
              placeholder="e.g. Monthly Savings"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={currencyArray}
              autoHighlight
              getOptionLabel={(option) => currencyNameWithFlagAndCode[option]}
              inputValue={currencyInputValue}
              onInputChange={(_, value) => setCurrencyInputValue(value)}
              multiple={false}
              value={currency ?? null}
              onChange={(_, value) => isCurrency(value) && (setCurrency(value), setCurrencyError(false))}
              filterOptions={(options) => {
                const currentInputValue = currencyInputValue.trim().toUpperCase();
                // Filter the currency names by the input value.
                const filteredOptions = options.filter(
                  (option) =>
                    currencyName[option].toUpperCase().startsWith(currentInputValue) && option != currentInputValue,
                );
                // If the text input is a valid currency, we show it as the first option.
                isCurrency(currentInputValue) && filteredOptions.unshift(currentInputValue);
                // If the text input is identical to a complete option label (this happens when opening the dropdown for
                // the first time), we show it as the first option.
                currencyNameWithFlagAndCode[currency] === currencyInputValue.trim() &&
                  filteredOptions.unshift(currency);
                return filteredOptions;
              }}
              disableClearable
              selectOnFocus
              renderInput={(params) => <TextField {...params} label="Currency" error={currencyError} />}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={() => props.onClose()}>Cancel</Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={updatePortfolio}
          onMouseOver={validate} // Validate input fields on hover
          disabled={nameError}
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
