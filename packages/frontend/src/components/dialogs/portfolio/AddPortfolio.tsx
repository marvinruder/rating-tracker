import AddBoxIcon from "@mui/icons-material/AddBox";
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
  Box,
} from "@mui/material";
import type { Currency } from "@rating-tracker/commons";
import {
  currencyArray,
  currencyName,
  currencyNameWithFlag,
  isCurrency,
  portfoliosEndpointPath,
} from "@rating-tracker/commons";
import { useState } from "react";

import { useNotification } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

/**
 * A dialog to add a new portfolio in the backend.
 *
 * @param {AddPortfolioProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const AddPortfolio = (props: AddPortfolioProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>();
  // The value of the text field in the currency autocomplete.
  const [currencyInputValue, setCurrencyInputValue] = useState<string>("");
  const [nameError, setNameError] = useState<boolean>(false); // Error in the name text field.
  const [currencyError, setCurrencyError] = useState<boolean>(false); // Error in the currency input field.
  const { setErrorNotificationOrClearSession: setErrorNotification } = useNotification();

  /**
   * Checks for errors in the input fields.
   *
   * @returns {boolean} Whether the input fields are valid.
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
      .put(portfoliosEndpointPath + `/new`, undefined, {
        params: { name: name.trim(), currency },
      })
      .then(() => {
        props.onClose();
      })
      .catch((e) => setErrorNotification(e, "creating new portfolio"))
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
              getOptionLabel={(option) => `${currencyNameWithFlag[option]} (${option})`}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  {`${currencyNameWithFlag[option]} (${option})`}
                </Box>
              )}
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
                    currencyName[option].toUpperCase().startsWith(currencyInputValue.trim().toUpperCase()) &&
                    option != currentInputValue,
                );
                // If the text input is a valid currency, we show it as the first option.
                isCurrency(currentInputValue) && filteredOptions.unshift(currentInputValue);
                return filteredOptions;
              }}
              disableClearable
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
          onClick={putPortfolio}
          onMouseOver={validate} // Validate input fields on hover
          disabled={nameError}
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
}
