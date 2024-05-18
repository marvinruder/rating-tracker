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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import type { Country, FetchError, Stock } from "@rating-tracker/commons";
import {
  isCountry,
  stocksAPIPath,
  fetchMarketScreenerEndpointSuffix,
  fetchMSCIEndpointSuffix,
  fetchLSEGEndpointSuffix,
  fetchSPEndpointSuffix,
  fetchSustainalyticsEndpointSuffix,
  fetchMorningstarEndpointSuffix,
  SP_PREMIUM_STOCK_ERROR_MESSAGE,
  fetchAPIPath,
} from "@rating-tracker/commons";
import { useRef, useState } from "react";

import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";
import CountryAutocomplete from "../../autocomplete/CountryAutocomplete";

/**
 * A dialog to edit a new stock in the backend.
 * @param props The properties of the component.
 * @returns The component.
 */
export const EditStock = (props: EditStockProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [unsafeRequestSent, setUnsafeRequestSent] = useState<boolean>(false); // Whether an unsafe request was sent.
  const [name, setName] = useState<string>(props.stock.name);
  const [nameError, setNameError] = useState<string>(""); // Error message for the name text field.
  const [ticker, setTicker] = useState<string>(props.stock.ticker);
  const [tickerError, setTickerError] = useState<string>(""); // Error message for the ticker text field.
  const [isin, setISIN] = useState<string>(props.stock.isin);
  const [isinError, setISINError] = useState<string>(""); // Error message for the ISIN text field.
  const [country, setCountry] = useState<Country>(props.stock.country);
  const [countryError, setCountryError] = useState<string>(""); // Error message for the country input field.
  // Whether to clear information related to the data provider before fetching
  const [clear, setClear] = useState<boolean>(false);
  const [morningstarID, setMorningstarID] = useState<string>(props.stock.morningstarID ?? "");
  const [morningstarIDRequestInProgress, setMorningstarIDRequestInProgress] = useState<boolean>(false);
  const [marketScreenerID, setMarketScreenerID] = useState<string>(props.stock.marketScreenerID ?? "");
  const [marketScreenerIDRequestInProgress, setMarketScreenerIDRequestInProgress] = useState<boolean>(false);
  const [msciID, setMSCIID] = useState<string>(props.stock.msciID ?? "");
  const [msciIDRequestInProgress, setMSCIIDRequestInProgress] = useState<boolean>(false);
  const [ric, setRIC] = useState<string>(props.stock.ric ?? "");
  const [ricRequestInProgress, setRICRequestInProgress] = useState<boolean>(false);
  const [spID, setSPID] = useState<number | null>(props.stock.spID);
  const [spIDRequestInProgress, setSPIDRequestInProgress] = useState<boolean>(false);
  const [sustainalyticsID, setSustainalyticsID] = useState<string>(props.stock.sustainalyticsID ?? "");
  const [sustainalyticsIDRequestInProgress, setSustainalyticsIDRequestInProgress] = useState<boolean>(false);
  const { setNotification, setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const nameInputRef = useRef<HTMLInputElement>(null);
  const tickerInputRef = useRef<HTMLInputElement>(null);
  const isinInputRef = useRef<HTMLInputElement>(null);
  const countryInputRef = useRef<HTMLInputElement>(null);

  /**
   * Checks for errors in the input fields.
   * @returns Whether the input fields are valid.
   */
  const validate = (): boolean => {
    const isNameValid = nameInputRef.current?.checkValidity();
    const isTickerValid = tickerInputRef.current?.checkValidity();
    const isISINValid = isinInputRef.current?.checkValidity();
    const isCountryValid = countryInputRef.current?.checkValidity();
    return isNameValid && isTickerValid && isISINValid && isCountryValid;
  };

  /**
   * Updates the stock in the backend.
   */
  const updateStock = () => {
    if (!validate()) return;
    setRequestInProgress(true);
    setUnsafeRequestSent(true);
    api
      .patch(stocksAPIPath + `/${props.stock.ticker}`, {
        params: {
          // Only send the parameters that have changed.
          ticker: ticker.trim() !== props.stock.ticker ? ticker.trim() : undefined,
          name: name.trim() !== props.stock.name ? name.trim() : undefined,
          isin: isin.trim() !== props.stock.isin ? isin.trim() : undefined,
          country: country.trim() !== props.stock.country ? country : undefined,
          morningstarID: morningstarID.trim() !== (props.stock.morningstarID ?? "") ? morningstarID.trim() : undefined,
          marketScreenerID:
            marketScreenerID.trim() !== (props.stock.marketScreenerID ?? "") ? marketScreenerID.trim() : undefined,
          msciID: msciID.trim() !== (props.stock.msciID ?? "") ? msciID.trim() : undefined,
          ric: ric.trim() !== (props.stock.ric ?? "") ? ric.trim() : undefined,
          spID: spID !== props.stock.spID ? (spID === null ? "" : spID) : undefined,
          sustainalyticsID:
            sustainalyticsID.trim() !== (props.stock.sustainalyticsID ?? "") ? sustainalyticsID.trim() : undefined,
        },
      })
      .then(
        () => (
          props.onCloseAfterEdit(ticker.trim() !== props.stock.ticker ? ticker.trim() : undefined), props.onClose()
        ),
      ) // Update the stocks in the parent component.
      .catch((e) => setErrorNotificationOrClearSession(e, "updating stock"))
      .finally(() => setRequestInProgress(false));
  };

  /**
   * Transmits the Morningstar ID to the server.
   */
  const patchStockMorningstarID = () => {
    setMorningstarIDRequestInProgress(true);
    setUnsafeRequestSent(true);
    api
      .patch(stocksAPIPath + `/${props.stock.ticker}`, {
        params: { morningstarID: morningstarID.trim() },
      })
      .then(() => {
        if (morningstarID) {
          // If a Morningstar ID was set, we fetch data from Morningstar using the new ID.
          api
            .post(fetchAPIPath + fetchMorningstarEndpointSuffix, {
              params: { ticker: props.stock.ticker, noSkip: true, clear },
            })
            .catch((e) => setErrorNotificationOrClearSession(e, "fetching information from Morningstar"))
            .finally(() => setMorningstarIDRequestInProgress(false));
        } else {
          setMorningstarIDRequestInProgress(false);
        }
      })
      .catch((e) => {
        setMorningstarIDRequestInProgress(false);
        setErrorNotificationOrClearSession(e, "setting Morningstar ID");
      });
  };

  /**
   * Transmits the Market Screener ID to the server.
   */
  const patchStockMarketScreenerID = () => {
    setMarketScreenerIDRequestInProgress(true);
    setUnsafeRequestSent(true);
    api
      .patch(stocksAPIPath + `/${props.stock.ticker}`, {
        params: { marketScreenerID: marketScreenerID.trim() },
      })
      .then(() => {
        if (marketScreenerID) {
          // If a Market Screener ID was set, we fetch data from Market Screener using the new ID.
          api
            .post(fetchAPIPath + fetchMarketScreenerEndpointSuffix, {
              params: { ticker: props.stock.ticker, noSkip: true, clear },
            })
            .catch((e) => setErrorNotificationOrClearSession(e, "fetching information from Market Screener"))
            .finally(() => setMarketScreenerIDRequestInProgress(false));
        } else {
          setMarketScreenerIDRequestInProgress(false);
        }
      })
      .catch((e) => {
        setMarketScreenerIDRequestInProgress(false);
        setErrorNotificationOrClearSession(e, "setting Market Screener ID");
      });
  };

  /**
   * Transmits the MSCI ID to the server.
   */
  const patchStockMSCIID = () => {
    setMSCIIDRequestInProgress(true);
    setUnsafeRequestSent(true);
    api
      .patch(stocksAPIPath + `/${props.stock.ticker}`, {
        params: { msciID: msciID.trim() },
      })
      .then(() => {
        if (msciID) {
          // If an MSCI ID was set, we fetch data from MSCI using the new ID.
          api
            .post(fetchAPIPath + fetchMSCIEndpointSuffix, {
              params: { ticker: props.stock.ticker, noSkip: true, clear },
            })
            .catch((e) => setErrorNotificationOrClearSession(e, "fetching information from MSCI"))
            .finally(() => setMSCIIDRequestInProgress(false));
        } else {
          setMSCIIDRequestInProgress(false);
        }
      })
      .catch((e) => {
        setMSCIIDRequestInProgress(false);
        setErrorNotificationOrClearSession(e, "setting MSCI ID");
      });
  };

  /**
   * Transmits the Reuters IDentifier Code (RIC) to the server.
   */
  const patchStockRIC = () => {
    setRICRequestInProgress(true);
    setUnsafeRequestSent(true);
    api
      .patch(stocksAPIPath + `/${props.stock.ticker}`, {
        params: { ric: ric.trim() },
      })
      .then(() => {
        if (ric) {
          // If a RIC was set, we fetch data from LSEG Data & Analytics using the new RIC.
          api
            .post(fetchAPIPath + fetchLSEGEndpointSuffix, {
              params: { ticker: props.stock.ticker, noSkip: true, clear },
            })
            .catch((e) => setErrorNotificationOrClearSession(e, "fetching information from LSEG"))
            .finally(() => setRICRequestInProgress(false));
        } else {
          setRICRequestInProgress(false);
        }
      })
      .catch((e) => {
        setRICRequestInProgress(false);
        setErrorNotificationOrClearSession(e, "setting RIC");
      });
  };

  /**
   * Transmits the S&P ID to the server.
   */
  const patchStockSPID = () => {
    setSPIDRequestInProgress(true);
    setUnsafeRequestSent(true);
    api
      .patch(stocksAPIPath + `/${props.stock.ticker}`, {
        params: { spID: spID === null ? "" : spID },
      })
      .then(() => {
        if (spID !== null) {
          // If an S&P ID was set, we fetch data from S&P using the new ID.
          api
            .post(fetchAPIPath + fetchSPEndpointSuffix, { params: { ticker: props.stock.ticker, noSkip: true, clear } })
            .catch((e: FetchError<{ message: string }>) => {
              if (e.response?.data?.message?.includes(SP_PREMIUM_STOCK_ERROR_MESSAGE)) {
                setNotification({
                  severity: "warning",
                  title: `Unable to fetch S&P Information for stock “${props.stock.name}” (${props.stock.ticker})`,
                  message: SP_PREMIUM_STOCK_ERROR_MESSAGE,
                });
              } else {
                setErrorNotificationOrClearSession(e, "fetching information from S&P");
              }
            })
            .finally(() => setSPIDRequestInProgress(false));
        } else {
          setSPIDRequestInProgress(false);
        }
      })
      .catch((e) => {
        setSPIDRequestInProgress(false);
        setErrorNotificationOrClearSession(e, "setting S&P ID");
      });
  };

  /**
   * Transmits the Sustainalytics ID to the server.
   */
  const patchStockSustainalyticsID = () => {
    setSustainalyticsIDRequestInProgress(true);
    setUnsafeRequestSent(true);
    api
      .patch(stocksAPIPath + `/${props.stock.ticker}`, {
        params: { sustainalyticsID: sustainalyticsID.trim() },
      })
      .then(() => {
        if (sustainalyticsID) {
          // If a Sustainalytics ID was set, we fetch data from Sustainalytics using the new ID.
          api
            .post(fetchAPIPath + fetchSustainalyticsEndpointSuffix, { params: { ticker: props.stock.ticker, clear } })
            .catch((e) => setErrorNotificationOrClearSession(e, "fetching information from Sustainalytics"))
            .finally(() => setSustainalyticsIDRequestInProgress(false));
        } else {
          setSustainalyticsIDRequestInProgress(false);
        }
      })
      .catch((e) => {
        setSustainalyticsIDRequestInProgress(false);
        setErrorNotificationOrClearSession(e, "setting Sustainalytics ID");
      });
  };
  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Edit Stock “{props.stock.name}”</Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} mt={0} maxWidth={600} alignItems="top">
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
              label="Stock name"
              value={name}
              placeholder="e.g. Apple Inc."
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              onChange={(event) => {
                setTicker(event.target.value);
                // If in error state, check whether error is resolved. If so, clear the error.
                if (tickerError && event.target.checkValidity()) setTickerError("");
              }}
              onInvalid={(event) => setTickerError((event.target as HTMLInputElement).validationMessage)}
              error={!!tickerError}
              helperText={tickerError}
              inputRef={tickerInputRef}
              required
              label="Ticker"
              value={ticker}
              placeholder="e.g. AAPL"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              inputProps={{ pattern: "[A-Z]{2}[A-Z0-9]{10}" }}
              onChange={(event) => {
                setISIN(event.target.value);
                // If in error state, check whether error is resolved. If so, clear the error.
                if (isinError && event.target.checkValidity()) setISINError("");
              }}
              onInvalid={(event) => setISINError((event.target as HTMLInputElement).validationMessage)}
              error={!!isinError}
              helperText={isinError}
              inputRef={isinInputRef}
              required
              label="ISIN"
              value={isin}
              placeholder="e.g. US0378331005"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <CountryAutocomplete
              value={country}
              onChange={(_, value) => {
                if (isCountry(value)) {
                  setCountry(value);
                  // If in error state, check whether error is resolved. If so, clear the error.
                  if (countryError && countryInputRef.current?.checkValidity()) setCountryError("");
                }
              }}
              onInvalid={(event) => setCountryError((event.target as HTMLInputElement).validationMessage)}
              error={!!countryError}
              helperText={countryError}
              inputRef={countryInputRef}
              required
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
                onChange={(event) => setMorningstarID(event.target.value)}
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
                onChange={(event) => setMarketScreenerID(event.target.value)}
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
                onChange={(event) => setMSCIID(event.target.value)}
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
                onChange={(event) => setRIC(event.target.value)}
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
                onChange={(event) => setSustainalyticsID(event.target.value)}
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
        <Button
          onClick={() => {
            if (unsafeRequestSent) props.onCloseAfterEdit();
            props.onClose();
          }}
          sx={{ mr: "auto" }}
        >
          Cancel
        </Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={updateStock}
          disabled={!!nameError || !!tickerError || !!isinError || !!countryError}
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
   * A method to update the stock list after the stock was edited. If the ticker of the stock was changed, the new
   * ticker is passed as an argument, allowing to navigate to the stock’s new URL.
   */
  onCloseAfterEdit: (newTicker?: string) => void;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}
