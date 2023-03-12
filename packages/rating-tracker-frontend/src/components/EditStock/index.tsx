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
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import { countryArray, countryNameWithFlag, isCountry, countryName, Country, Stock } from "rating-tracker-commons";
import axios from "axios";
import { useState } from "react";
import {
  baseUrl,
  stockAPI,
  fetchAPI,
  morningstarEndpoint,
  marketScreenerEndpoint,
  msciEndpoint,
  refinitivEndpoint,
  spEndpoint,
  sustainalyticsEndpoint,
} from "../../endpoints";
import { useNotification } from "../../contexts/NotificationContext";

/**
 * A dialog to edit a new stock in the backend.
 *
 * @param {EditStockProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const EditStock = (props: EditStockProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [name, setName] = useState<string>(props.stock?.name);
  const [nameError, setNameError] = useState<boolean>(false); // Error in the name text field.
  const [country, setCountry] = useState<Country>(props.stock?.country);
  const [countryError, setCountryError] = useState<boolean>(false); // Error in the country input field.
  // The value of the text field in the country autocomplete.
  const [countryInputValue, setCountryInputValue] = useState<string>(countryName[props.stock?.country]);
  const [morningstarID, setmorningstarID] = useState<string>(props.stock?.morningstarID);
  const [morningstarIDRequestInProgress, setmorningstarIDRequestInProgress] = useState<boolean>(false);
  const [marketScreenerID, setMarketScreenerId] = useState<string>(props.stock?.marketScreenerID);
  const [marketScreenerIDRequestInProgress, setMarketScreenerIdRequestInProgress] = useState<boolean>(false);
  const [msciID, setmsciID] = useState<string>(props.stock?.msciID);
  const [msciIDRequestInProgress, setmsciIDRequestInProgress] = useState<boolean>(false);
  const [ric, setRic] = useState<string>(props.stock?.ric);
  const [ricRequestInProgress, setRicRequestInProgress] = useState<boolean>(false);
  const [spID, setSpId] = useState<number>(props.stock?.spID);
  const [spIDRequestInProgress, setSpIdRequestInProgress] = useState<boolean>(false);
  const [sustainalyticsID, setSustainalyticsId] = useState<string>(props.stock?.sustainalyticsID);
  const [sustainalyticsIDRequestInProgress, setSustainalyticsIdRequestInProgress] = useState<boolean>(false);
  const { setNotification } = useNotification();

  /**
   * Checks for errors in the input fields.
   */
  const validate = () => {
    // The following fields are required.
    setNameError(!name);
    setCountryError(!country);
  };

  /**
   * Updates the stock in the backend.
   */
  const updateStock = () => {
    props.stock &&
      props.getStocks &&
      (setRequestInProgress(true),
      axios
        .patch(baseUrl + stockAPI + `/${props.stock.ticker}`, undefined, {
          params: {
            // Only send the parameters that have changed.
            name: name !== props.stock.name ? name : undefined,
            country: country !== props.stock.country ? country : undefined,
            morningstarID: morningstarID !== props.stock.morningstarID ? morningstarID : undefined,
            marketScreenerID: marketScreenerID !== props.stock.marketScreenerID ? marketScreenerID : undefined,
            msciID: msciID !== props.stock.msciID ? msciID : undefined,
            ric: ric !== props.stock.ric ? ric : undefined,
            spID: spID !== props.stock.spID ? spID : undefined,
            sustainalyticsID: sustainalyticsID !== props.stock.sustainalyticsID ? sustainalyticsID : undefined,
          },
        })
        .then(props.getStocks) // Update the stocks in the parent component.
        .catch((e) => {
          setNotification({
            severity: "error",
            title: "Error while updating stock",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        })
        .finally(() => (setRequestInProgress(false), props.onClose())));
  };

  /**
   * Transmits the Morningstar ID to the server.
   */
  const patchStockmorningstarID = () => {
    props.stock &&
      props.getStocks &&
      (setmorningstarIDRequestInProgress(true),
      axios
        .patch(baseUrl + stockAPI + `/${props.stock.ticker}`, undefined, {
          params: { morningstarID },
        })
        .then(() => {
          if (morningstarID) {
            // If a Morningstar ID was set, we fetch data from Morningstar using the new ID.
            axios
              .get(baseUrl + fetchAPI + morningstarEndpoint, {
                params: { ticker: props.stock.ticker, noSkip: true },
              })
              .then(() => {})
              .catch((e) => {
                setNotification({
                  severity: "error",
                  title: "Error while fetching information from Morningstar",
                  message:
                    e.response?.status && e.response?.data?.message
                      ? `${e.response.status}: ${e.response.data.message}`
                      : e.message ?? "No additional information available.",
                });
              })
              .finally(() => setmorningstarIDRequestInProgress(false));
          } else {
            setmorningstarIDRequestInProgress(false);
          }
        })
        .catch((e) => {
          setmorningstarIDRequestInProgress(false);
          setNotification({
            severity: "error",
            title: "Error while setting Morningstar ID",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        }));
  };

  /**
   * Transmits the Market Screener ID to the server.
   */
  const patchStockMarketScreenerId = () => {
    props.stock &&
      props.getStocks &&
      (setMarketScreenerIdRequestInProgress(true),
      axios
        .patch(baseUrl + stockAPI + `/${props.stock.ticker}`, undefined, {
          params: { marketScreenerID },
        })
        .then(() => {
          if (marketScreenerID) {
            // If a Market Screener ID was set, we fetch data from Market Screener using the new ID.
            axios
              .get(baseUrl + fetchAPI + marketScreenerEndpoint, {
                params: { ticker: props.stock.ticker, noSkip: true },
              })
              .then(() => {})
              .catch((e) => {
                setNotification({
                  severity: "error",
                  title: "Error while fetching information from Market Screener",
                  message:
                    e.response?.status && e.response?.data?.message
                      ? `${e.response.status}: ${e.response.data.message}`
                      : e.message ?? "No additional information available.",
                });
              })
              .finally(() => setMarketScreenerIdRequestInProgress(false));
          } else {
            setMarketScreenerIdRequestInProgress(false);
          }
        })
        .catch((e) => {
          setMarketScreenerIdRequestInProgress(false);
          setNotification({
            severity: "error",
            title: "Error while setting Market Screener ID",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        }));
  };

  /**
   * Transmits the MSCI ID to the server.
   */
  const patchStockmsciID = () => {
    props.stock &&
      props.getStocks &&
      (setmsciIDRequestInProgress(true),
      axios
        .patch(baseUrl + stockAPI + `/${props.stock.ticker}`, undefined, {
          params: { msciID },
        })
        .then(() => {
          if (msciID) {
            // If an MSCI ID was set, we fetch data from MSCI using the new ID.
            axios
              .get(baseUrl + fetchAPI + msciEndpoint, {
                params: { ticker: props.stock.ticker, noSkip: true },
              })
              .then(() => {})
              .catch((e) => {
                setNotification({
                  severity: "error",
                  title: "Error while fetching information from MSCI",
                  message:
                    e.response?.status && e.response?.data?.message
                      ? `${e.response.status}: ${e.response.data.message}`
                      : e.message ?? "No additional information available.",
                });
              })
              .finally(() => setmsciIDRequestInProgress(false));
          } else {
            setmsciIDRequestInProgress(false);
          }
        })
        .catch((e) => {
          setmsciIDRequestInProgress(false);
          setNotification({
            severity: "error",
            title: "Error while setting MSCI ID",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        }));
  };

  /**
   * Transmits the Reuters Identifier Code (RIC) to the server.
   */
  const patchStockRic = () => {
    props.stock &&
      props.getStocks &&
      (setRicRequestInProgress(true),
      axios
        .patch(baseUrl + stockAPI + `/${props.stock.ticker}`, undefined, {
          params: { ric },
        })
        .then(() => {
          if (ric) {
            // If a RIC was set, we fetch data from Refinitiv using the new RIC.
            axios
              .get(baseUrl + fetchAPI + refinitivEndpoint, {
                params: { ticker: props.stock.ticker, noSkip: true },
              })
              .then(() => {})
              .catch((e) => {
                setNotification({
                  severity: "error",
                  title: "Error while fetching information from Refinitiv",
                  message:
                    e.response?.status && e.response?.data?.message
                      ? `${e.response.status}: ${e.response.data.message}`
                      : e.message ?? "No additional information available.",
                });
              })
              .finally(() => setRicRequestInProgress(false));
          } else {
            setRicRequestInProgress(false);
          }
        })
        .catch((e) => {
          setRicRequestInProgress(false);
          setNotification({
            severity: "error",
            title: "Error while setting RIC",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        }));
  };

  /**
   * Transmits the S&P ID to the server.
   */
  const patchStockSpId = () => {
    props.stock &&
      props.getStocks &&
      (setSpIdRequestInProgress(true),
      axios
        .patch(baseUrl + stockAPI + `/${props.stock.ticker}`, undefined, {
          params: { spID },
        })
        .then(() => {
          if (spID) {
            // If an S&P ID was set, we fetch data from S&P using the new ID.
            axios
              .get(baseUrl + fetchAPI + spEndpoint, {
                params: { ticker: props.stock.ticker, noSkip: true },
              })
              .then(() => {})
              .catch((e) => {
                if (
                  (e.response?.data?.message as string | undefined)?.includes(
                    "This stock’s ESG Score is available for S&P Premium subscribers only"
                  )
                ) {
                  setNotification({
                    severity: "warning",
                    title: `Unable to fetch S&P Information for stock “${props.stock.name}” (${props.stock.ticker})`,
                    message: "This stock’s ESG Score is available for S&P Premium subscribers only",
                  });
                } else {
                  setNotification({
                    severity: "error",
                    title: "Error while fetching information from S&P",
                    message:
                      e.response?.status && e.response?.data?.message
                        ? `${e.response.status}: ${e.response.data.message}`
                        : e.message ?? "No additional information available.",
                  });
                }
              })
              .finally(() => setSpIdRequestInProgress(false));
          } else {
            setSpIdRequestInProgress(false);
          }
        })
        .catch((e) => {
          setSpIdRequestInProgress(false);
          setNotification({
            severity: "error",
            title: "Error while setting S&P ID",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        }));
  };

  /**
   * Transmits the Sustainalytics ID to the server.
   */
  const patchStockSustainalyticsId = () => {
    props.stock &&
      props.getStocks &&
      (setSustainalyticsIdRequestInProgress(true),
      axios
        .patch(baseUrl + stockAPI + `/${props.stock.ticker}`, undefined, {
          params: { sustainalyticsID },
        })
        .then(() => {
          if (sustainalyticsID) {
            // If a Sustainalytics ID was set, we fetch data from Sustainalytics using the new ID.
            axios
              .get(baseUrl + fetchAPI + sustainalyticsEndpoint, {
                params: { ticker: props.stock.ticker },
              })
              .then(() => {})
              .catch((e) => {
                setNotification({
                  severity: "error",
                  title: "Error while fetching information from Sustainalytics",
                  message:
                    e.response?.status && e.response?.data?.message
                      ? `${e.response.status}: ${e.response.data.message}`
                      : e.message ?? "No additional information available.",
                });
              })
              .finally(() => setSustainalyticsIdRequestInProgress(false));
          } else {
            setSustainalyticsIdRequestInProgress(false);
          }
        })
        .catch((e) => {
          setSustainalyticsIdRequestInProgress(false);
          setNotification({
            severity: "error",
            title: "Error while setting Sustainalytics ID",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
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
                    option != currentInputValue
                );
                // If the text input is a valid country code, we show it as the first option.
                isCountry(currentInputValue) && filteredOptions.unshift(currentInputValue);
                return filteredOptions;
              }}
              disableClearable
              renderInput={(params) => <TextField {...params} label="Country" error={countryError} />}
            />
          </Grid>
          <Grid item xs={12} container spacing={1} alignItems="center">
            <Grid item width={{ xs: "100%", sm: "calc(100% - 175px)" }}>
              <TextField
                onChange={(event) => {
                  setmorningstarID(event.target.value);
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
                onClick={patchStockmorningstarID}
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
                  setMarketScreenerId(event.target.value);
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
                onClick={patchStockMarketScreenerId}
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
                  setmsciID(event.target.value);
                }}
                label="MSCI ID"
                value={msciID}
                placeholder="e.g. apple-inc/IID000000002157615"
                fullWidth
              />
            </Grid>
            <Grid item ml="auto">
              <LoadingButton
                size="small"
                loading={msciIDRequestInProgress}
                onClick={patchStockmsciID}
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
                  setRic(event.target.value);
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
                onClick={patchStockRic}
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
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                onChange={(event) => {
                  if (!Number.isNaN(+event.target.value)) {
                    setSpId(+event.target.value);
                  }
                }}
                label="S&P ID"
                value={spID}
                placeholder="e.g. 4004205"
                fullWidth
              />
            </Grid>
            <Grid item ml="auto">
              <LoadingButton
                size="small"
                loading={spIDRequestInProgress}
                onClick={patchStockSpId}
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
                  setSustainalyticsId(event.target.value);
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
                onClick={patchStockSustainalyticsId}
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
      <DialogActions sx={{ p: 2.6666, pt: 0 }}>
        <Button onClick={() => (props.onClose(), props.getStocks && props.getStocks())}>Cancel</Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={updateStock}
          onMouseOver={validate} // Validate input fields on hover
          disabled={nameError || countryError}
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

export default EditStock;
