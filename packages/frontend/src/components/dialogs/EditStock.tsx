import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  DialogTitle,
  Typography,
  DialogContent,
  Grid,
  TextField,
  Autocomplete,
  Box,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import {
  countryArray,
  countryNameWithFlag,
  isCountry,
  countryName,
  Country,
  Stock,
  stockEndpointPath,
  fetchMarketScreenerEndpointPath,
  fetchMSCIEndpointPath,
  fetchRefinitivEndpointPath,
  fetchSPEndpointPath,
  fetchSustainalyticsEndpointPath,
  fetchMorningstarEndpointPath,
  SP_PREMIUM_STOCK_ERROR_MESSAGE,
} from "@rating-tracker/commons";
import { AxiosError } from "axios";
import { useState } from "react";

import { useNotification } from "../../contexts/NotificationContext";
import api from "../../utils/api";

/**
 * A dialog to edit a new stock in the backend.
 *
 * @param {EditStockProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const EditStock = (props: EditStockProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [name, setName] = useState<string>(props.stock?.name);
  const [nameError, setNameError] = useState<boolean>(false); // Error in the name text field.
  const [isin, setIsin] = useState<string>(props.stock?.isin);
  const [isinError, setIsinError] = useState<boolean>(false); // Error in the ISIN text field.
  const [country, setCountry] = useState<Country>(props.stock?.country);
  const [countryError, setCountryError] = useState<boolean>(false); // Error in the country input field.
  // The value of the text field in the country autocomplete.
  const [countryInputValue, setCountryInputValue] = useState<string>(countryName[props.stock?.country]);
  // Whether to clear information related to the data provider before fetching
  const [clear, setClear] = useState<boolean>(false);
  const [morningstarID, setMorningstarID] = useState<string>(props.stock?.morningstarID);
  const [morningstarIDRequestInProgress, setMorningstarIDRequestInProgress] = useState<boolean>(false);
  const [marketScreenerID, setMarketScreenerID] = useState<string>(props.stock?.marketScreenerID);
  const [marketScreenerIDRequestInProgress, setMarketScreenerIDRequestInProgress] = useState<boolean>(false);
  const [msciID, setMSCIID] = useState<string>(props.stock?.msciID);
  const [msciIDRequestInProgress, setMSCIIDRequestInProgress] = useState<boolean>(false);
  const [ric, setRIC] = useState<string>(props.stock?.ric);
  const [ricRequestInProgress, setRICRequestInProgress] = useState<boolean>(false);
  const [spID, setSPID] = useState<number | null>(props.stock?.spID);
  const [spIDRequestInProgress, setSPIDRequestInProgress] = useState<boolean>(false);
  const [sustainalyticsID, setSustainalyticsID] = useState<string>(props.stock?.sustainalyticsID);
  const [sustainalyticsIDRequestInProgress, setSustainalyticsIDRequestInProgress] = useState<boolean>(false);
  const { setNotification, setErrorNotificationOrClearSession: setErrorNotification } = useNotification();

  /**
   * Checks for errors in the input fields.
   */
  const validate = () => {
    // The following fields are required.
    setNameError(!name);
    setIsinError(!isin);
    setCountryError(!country);
  };

  /**
   * Updates the stock in the backend.
   */
  const updateStock = () => {
    props.stock &&
      props.getStocks &&
      (setRequestInProgress(true),
      api
        .patch(stockEndpointPath + `/${props.stock.ticker}`, undefined, {
          params: {
            // Only send the parameters that have changed.
            name: name !== props.stock.name ? name.trim() : undefined,
            isin: isin !== props.stock.isin ? isin.trim() : undefined,
            country: country !== props.stock.country ? country : undefined,
            morningstarID: morningstarID !== props.stock.morningstarID ? morningstarID.trim() : undefined,
            marketScreenerID: marketScreenerID !== props.stock.marketScreenerID ? marketScreenerID.trim() : undefined,
            msciID: msciID !== props.stock.msciID ? msciID.trim() : undefined,
            ric: ric !== props.stock.ric ? ric.trim() : undefined,
            spID: spID !== props.stock.spID ? (spID === null ? "" : spID) : undefined,
            sustainalyticsID: sustainalyticsID !== props.stock.sustainalyticsID ? sustainalyticsID.trim() : undefined,
          },
        })
        .then(props.getStocks) // Update the stocks in the parent component.
        .catch((e) => setErrorNotification(e, "updating stock"))
        .finally(() => (setRequestInProgress(false), props.onClose())));
  };

  /**
   * Transmits the Morningstar ID to the server.
   */
  const patchStockMorningstarID = () => {
    props.stock &&
      props.getStocks &&
      (setMorningstarIDRequestInProgress(true),
      api
        .patch(stockEndpointPath + `/${props.stock.ticker}`, undefined, {
          params: { morningstarID: morningstarID.trim() },
        })
        .then(() => {
          if (morningstarID) {
            // If a Morningstar ID was set, we fetch data from Morningstar using the new ID.
            api
              .post(fetchMorningstarEndpointPath, undefined, {
                params: { ticker: props.stock.ticker, noSkip: true, clear },
              })
              .then(() => {})
              .catch((e) => setErrorNotification(e, "fetching information from Morningstar"))
              .finally(() => setMorningstarIDRequestInProgress(false));
          } else {
            setMorningstarIDRequestInProgress(false);
          }
        })
        .catch((e) => {
          setMorningstarIDRequestInProgress(false);
          setErrorNotification(e, "setting Morningstar ID");
        }));
  };

  /**
   * Transmits the Market Screener ID to the server.
   */
  const patchStockMarketScreenerID = () => {
    props.stock &&
      props.getStocks &&
      (setMarketScreenerIDRequestInProgress(true),
      api
        .patch(stockEndpointPath + `/${props.stock.ticker}`, undefined, {
          params: { marketScreenerID: marketScreenerID.trim() },
        })
        .then(() => {
          if (marketScreenerID) {
            // If a Market Screener ID was set, we fetch data from Market Screener using the new ID.
            api
              .post(fetchMarketScreenerEndpointPath, undefined, {
                params: { ticker: props.stock.ticker, noSkip: true, clear },
              })
              .then(() => {})
              .catch((e) => setErrorNotification(e, "fetching information from Market Screener"))
              .finally(() => setMarketScreenerIDRequestInProgress(false));
          } else {
            setMarketScreenerIDRequestInProgress(false);
          }
        })
        .catch((e) => {
          setMarketScreenerIDRequestInProgress(false);
          setErrorNotification(e, "setting Market Screener ID");
        }));
  };

  /**
   * Transmits the MSCI ID to the server.
   */
  const patchStockMSCIID = () => {
    props.stock &&
      props.getStocks &&
      (setMSCIIDRequestInProgress(true),
      api
        .patch(stockEndpointPath + `/${props.stock.ticker}`, undefined, {
          params: { msciID: msciID.trim() },
        })
        .then(() => {
          if (msciID) {
            // If an MSCI ID was set, we fetch data from MSCI using the new ID.
            api
              .post(fetchMSCIEndpointPath, undefined, {
                params: { ticker: props.stock.ticker, noSkip: true, clear },
              })
              .then(() => {})
              .catch((e) => setErrorNotification(e, "fetching information from MSCI"))
              .finally(() => setMSCIIDRequestInProgress(false));
          } else {
            setMSCIIDRequestInProgress(false);
          }
        })
        .catch((e) => {
          setMSCIIDRequestInProgress(false);
          setErrorNotification(e, "setting MSCI ID");
        }));
  };

  /**
   * Transmits the Reuters IDentifier Code (RIC) to the server.
   */
  const patchStockRIC = () => {
    props.stock &&
      props.getStocks &&
      (setRICRequestInProgress(true),
      api
        .patch(stockEndpointPath + `/${props.stock.ticker}`, undefined, {
          params: { ric: ric.trim() },
        })
        .then(() => {
          if (ric) {
            // If a RIC was set, we fetch data from Refinitiv using the new RIC.
            api
              .post(fetchRefinitivEndpointPath, undefined, {
                params: { ticker: props.stock.ticker, noSkip: true, clear },
              })
              .then(() => {})
              .catch((e) => setErrorNotification(e, "fetching information from Refinitiv"))
              .finally(() => setRICRequestInProgress(false));
          } else {
            setRICRequestInProgress(false);
          }
        })
        .catch((e) => {
          setRICRequestInProgress(false);
          setErrorNotification(e, "setting RIC");
        }));
  };

  /**
   * Transmits the S&P ID to the server.
   */
  const patchStockSPID = () => {
    props.stock &&
      props.getStocks &&
      (setSPIDRequestInProgress(true),
      api
        .patch(stockEndpointPath + `/${props.stock.ticker}`, undefined, {
          params: { spID: spID === null ? "" : spID },
        })
        .then(() => {
          if (spID !== null) {
            // If an S&P ID was set, we fetch data from S&P using the new ID.
            api
              .post(fetchSPEndpointPath, undefined, {
                params: { ticker: props.stock.ticker, noSkip: true, clear },
              })
              .then(() => {})
              .catch((e: AxiosError<{ message: string }>) => {
                if (e.response?.data?.message?.includes(SP_PREMIUM_STOCK_ERROR_MESSAGE)) {
                  setNotification({
                    severity: "warning",
                    title: `Unable to fetch S&P Information for stock “${props.stock.name}” (${props.stock.ticker})`,
                    message: SP_PREMIUM_STOCK_ERROR_MESSAGE,
                  });
                } else {
                  setErrorNotification(e, "fetching information from S&P");
                }
              })
              .finally(() => setSPIDRequestInProgress(false));
          } else {
            setSPIDRequestInProgress(false);
          }
        })
        .catch((e) => {
          setSPIDRequestInProgress(false);
          setErrorNotification(e, "setting S&P ID");
        }));
  };

  /**
   * Transmits the Sustainalytics ID to the server.
   */
  const patchStockSustainalyticsID = () => {
    props.stock &&
      props.getStocks &&
      (setSustainalyticsIDRequestInProgress(true),
      api
        .patch(stockEndpointPath + `/${props.stock.ticker}`, undefined, {
          params: { sustainalyticsID: sustainalyticsID.trim() },
        })
        .then(() => {
          if (sustainalyticsID) {
            // If a Sustainalytics ID was set, we fetch data from Sustainalytics using the new ID.
            api
              .post(fetchSustainalyticsEndpointPath, undefined, {
                params: { ticker: props.stock.ticker, clear },
              })
              .then(() => {})
              .catch((e) => setErrorNotification(e, "fetching information from Sustainalytics"))
              .finally(() => setSustainalyticsIDRequestInProgress(false));
          } else {
            setSustainalyticsIDRequestInProgress(false);
          }
        })
        .catch((e) => {
          setSustainalyticsIDRequestInProgress(false);
          setErrorNotification(e, "setting Sustainalytics ID");
        }));
  };
  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Edit Stock “{props.stock.name}”</Typography>
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
              label="Stock name"
              value={name}
              placeholder="e.g. Apple Inc."
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              onChange={(event) => {
                setIsin(event.target.value);
                setIsinError(false);
              }}
              error={isinError}
              label="ISIN"
              value={isin}
              placeholder="e.g. US0378331005"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={countryArray}
              autoHighlight
              getOptionLabel={(option) => countryNameWithFlag[option]}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  {countryNameWithFlag[option]}
                </Box>
              )}
              inputValue={countryInputValue}
              onInputChange={(_, value) => setCountryInputValue(value)}
              multiple={false}
              value={country ?? null}
              onChange={(_, value) => isCountry(value) && (setCountry(value), setCountryError(false))}
              filterOptions={(options) => {
                const currentInputValue = countryInputValue.trim().toUpperCase();
                // Filter the country names by the input value.
                const filteredOptions = options.filter(
                  (option) =>
                    countryName[option].toUpperCase().startsWith(countryInputValue.trim().toUpperCase()) &&
                    option != currentInputValue,
                );
                // If the text input is a valid country code, we show it as the first option.
                isCountry(currentInputValue) && filteredOptions.unshift(currentInputValue);
                return filteredOptions;
              }}
              disableClearable
              renderInput={(params) => <TextField {...params} label="Country" error={countryError} />}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 1, width: "100%" }} />
          </Grid>
          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                sx={{ pb: 2 }}
                control={<Checkbox checked={clear} onChange={() => setClear((prev) => !prev)} />}
                label={
                  <>
                    <Typography variant="body1" fontWeight="bold" color="text.primary">
                      Clear saved values
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      If an certain attribute value is no longer available, check this option before refetching to clear
                      all attribute values available from the selected data provider.
                    </Typography>
                  </>
                }
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} container spacing={1} alignItems="center">
            <Grid item width={{ xs: "100%", sm: "calc(100% - 175px)" }}>
              <TextField
                onChange={(event) => {
                  setMorningstarID(event.target.value);
                }}
                label="Morningstar ID"
                value={morningstarID}
                placeholder="e.g. 0P000000GY"
                fullWidth
              />
            </Grid>
            <Grid item ml="auto">
              <LoadingButton
                size="small"
                loading={morningstarIDRequestInProgress}
                onClick={patchStockMorningstarID}
                disabled={requestInProgress}
                variant="contained"
                startIcon={<PublishedWithChangesIcon />}
              >
                Update and fetch
              </LoadingButton>
            </Grid>
          </Grid>
          <Grid item xs={12} container spacing={1} alignItems="center">
            <Grid item width={{ xs: "100%", sm: "calc(100% - 175px)" }}>
              <TextField
                onChange={(event) => {
                  setMarketScreenerID(event.target.value);
                }}
                label="MarketScreener ID"
                value={marketScreenerID}
                placeholder="e.g. APPLE-INC-4849"
                fullWidth
              />
            </Grid>
            <Grid item ml="auto">
              <LoadingButton
                size="small"
                loading={marketScreenerIDRequestInProgress}
                onClick={patchStockMarketScreenerID}
                disabled={requestInProgress}
                variant="contained"
                startIcon={<PublishedWithChangesIcon />}
              >
                Update and fetch
              </LoadingButton>
            </Grid>
          </Grid>
          <Grid item xs={12} container spacing={1} alignItems="center">
            <Grid item width={{ xs: "100%", sm: "calc(100% - 175px)" }}>
              <TextField
                onChange={(event) => {
                  setMSCIID(event.target.value);
                }}
                label="MSCI ID"
                value={msciID}
                placeholder="e.g. IID000000002157615"
                fullWidth
              />
            </Grid>
            <Grid item ml="auto">
              <LoadingButton
                size="small"
                loading={msciIDRequestInProgress}
                onClick={patchStockMSCIID}
                disabled={requestInProgress}
                variant="contained"
                startIcon={<PublishedWithChangesIcon />}
              >
                Update and fetch
              </LoadingButton>
            </Grid>
          </Grid>
          <Grid item xs={12} container spacing={1} alignItems="center">
            <Grid item width={{ xs: "100%", sm: "calc(100% - 175px)" }}>
              <TextField
                onChange={(event) => {
                  setRIC(event.target.value);
                }}
                label="RIC"
                value={ric}
                placeholder="e.g. AAPL.O"
                fullWidth
              />
            </Grid>
            <Grid item ml="auto">
              <LoadingButton
                size="small"
                loading={ricRequestInProgress}
                onClick={patchStockRIC}
                disabled={requestInProgress}
                variant="contained"
                startIcon={<PublishedWithChangesIcon />}
              >
                Update and fetch
              </LoadingButton>
            </Grid>
          </Grid>
          <Grid item xs={12} container spacing={1} alignItems="center">
            <Grid item width={{ xs: "100%", sm: "calc(100% - 175px)" }}>
              <TextField
                inputProps={{ inputMode: "numeric", pattern: "\\d*" }}
                onChange={(event) => {
                  const value = event.target.value.replaceAll(/\D+/g, "");
                  setSPID(value ? +value : null);
                }}
                label="S&P ID"
                value={spID === null ? "" : spID}
                placeholder="e.g. 4004205"
                fullWidth
              />
            </Grid>
            <Grid item ml="auto">
              <LoadingButton
                size="small"
                loading={spIDRequestInProgress}
                onClick={patchStockSPID}
                disabled={requestInProgress}
                variant="contained"
                startIcon={<PublishedWithChangesIcon />}
              >
                Update and fetch
              </LoadingButton>
            </Grid>
          </Grid>
          <Grid item xs={12} container spacing={1} alignItems="center">
            <Grid item width={{ xs: "100%", sm: "calc(100% - 175px)" }}>
              <TextField
                onChange={(event) => {
                  setSustainalyticsID(event.target.value);
                }}
                label="Sustainalytics ID"
                value={sustainalyticsID}
                placeholder="e.g. apple-inc/1007903183"
                fullWidth
              />
            </Grid>
            <Grid item ml="auto">
              <LoadingButton
                size="small"
                loading={sustainalyticsIDRequestInProgress}
                onClick={patchStockSustainalyticsID}
                disabled={requestInProgress}
                variant="contained"
                startIcon={<PublishedWithChangesIcon />}
              >
                Update and fetch
              </LoadingButton>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={() => (props.onClose(), props.getStocks && props.getStocks())}>Cancel</Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={updateStock}
          onMouseOver={validate} // Validate input fields on hover
          disabled={nameError || isinError || countryError}
          startIcon={<PublishedWithChangesIcon />}
        >
          Update Stock
        </LoadingButton>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the EditStock component.
 */
interface EditStockProps {
  /**
   * The stock to edit.
   */
  stock: Stock;
  /**
   * A method to update the stock list after the stock was edited.
   */
  getStocks?: () => void;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}