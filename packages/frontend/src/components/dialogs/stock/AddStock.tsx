import AddBoxIcon from "@mui/icons-material/AddBox";
import AddLinkIcon from "@mui/icons-material/AddLink";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import LinkIcon from "@mui/icons-material/Link";
import LoadingButton from "@mui/lab/LoadingButton";
import type { AlertColor } from "@mui/material";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import type { Country, FetchError, OmitDynamicAttributesStock, Stock } from "@rating-tracker/commons";
import {
  fetchMarketScreenerEndpointSuffix,
  fetchMorningstarEndpointSuffix,
  fetchMSCIEndpointSuffix,
  fetchLSEGEndpointSuffix,
  fetchSPEndpointSuffix,
  fetchSustainalyticsEndpointSuffix,
  isCountry,
  optionalStockValuesNull,
  SP_PREMIUM_STOCK_ERROR_MESSAGE,
  stocksAPIPath,
  fetchAPIPath,
} from "@rating-tracker/commons";
import { useState } from "react";

import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";
import CountryAutocomplete from "../../autocomplete/CountryAutocomplete";
import YahooStockStubAutocomplete from "../../autocomplete/YahooStockStubAutocomplete";
import { StockDetails } from "../../stock/layouts/StockDetails";

/**
 * A dialog to add a new stock to the backend.
 * @param props The properties of the component.
 * @returns The component.
 */
export const AddStock = (props: AddStockProps): JSX.Element => {
  const [activeStep, setActiveStep] = useState<number>(0); // The dialog step to show.
  const [stock, setStock] = useState<OmitDynamicAttributesStock>({
    ...optionalStockValuesNull,
    ticker: "",
    name: "",
    isin: "",
    country: undefined,
  });
  const [finalStock, setFinalStock] = useState<Stock>();
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [tickerError, setTickerError] = useState<boolean>(false); // Error in the ticker text field.
  const [nameError, setNameError] = useState<boolean>(false); // Error in the name text field.
  const [isinError, setIsinError] = useState<boolean>(false); // Error in the ISIN text field.
  const [countryError, setCountryError] = useState<boolean>(false); // Error in the country input field.
  const [morningstarIDRequestInProgress, setMorningstarIDRequestInProgress] = useState<boolean>(false);
  // Whether the Morningstar ID has been transmitted to the server.
  const [morningstarIDSet, setMorningstarIDSet] = useState<boolean>(false);
  const [marketScreenerIDRequestInProgress, setMarketScreenerIDRequestInProgress] = useState<boolean>(false);
  // Whether the Market Screener ID has been transmitted to the server.
  const [marketScreenerIDSet, setMarketScreenerIDSet] = useState<boolean>(false);
  const [msciIDRequestInProgress, setMSCIIDRequestInProgress] = useState<boolean>(false);
  const [msciIDSet, setMSCIIDSet] = useState<boolean>(false); // Whether the MSCI ID has been transmitted to the server.
  const [ricRequestInProgress, setRICRequestInProgress] = useState<boolean>(false);
  const [ricSet, setRICSet] = useState<boolean>(false); //
  const [spIDRequestInProgress, setSPIDRequestInProgress] = useState<boolean>(false);
  const [spIDSet, setSPIDSet] = useState<boolean>(false); // Whether the S&P ID has been transmitted to the server.
  const [sustainalyticsIDRequestInProgress, setSustainalyticsIDRequestInProgress] = useState<boolean>(false);
  // Whether the Sustainalytics ID has been transmitted to the server.
  const [sustainalyticsIDSet, setSustainalyticsIDSet] = useState<boolean>(false);

  const { setNotification, setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  /**
   * Checks for errors in the input fields.
   * @returns Whether the input fields are valid.
   */
  const validate = (): boolean => {
    // The following fields are required.
    setTickerError(!stock.ticker);
    setNameError(!stock.name);
    setIsinError(!stock.isin);
    setCountryError(!stock.country);
    return !!stock.ticker && !!stock.name && !!stock.isin && !!stock.country;
  };

  /**
   * Handles a click on the “Move to the next dialog step” button.
   */
  const handleNext = (): void => {
    activeStep === steps.length - 1
      ? (props.onClose(), props.onCloseAfterAdd()) // Close and update stock list if we are on the last step.
      : setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  /**
   * Handles a click on the “Go back to the previous dialog step” button.
   */
  const handleBack = (): void => {
    activeStep === 0
      ? props.onClose() // Close if we are on the first step.
      : setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  /**
   * Transmits the stock to the server.
   */
  const putStock = () => {
    if (!validate()) return;
    setRequestInProgress(true);
    const { name, isin, country } = stock;
    api
      .put(stocksAPIPath + `/${stock.ticker.trim()}`, {
        params: { name: name.trim(), isin: isin.trim(), country },
      })
      .then(handleNext)
      .catch((e) => setErrorNotificationOrClearSession(e, "creating new stock"))
      .finally(() => setRequestInProgress(false));
  };

  /**
   * Transmits the Morningstar ID to the server.
   */
  const patchStockMorningstarID = () => {
    setMorningstarIDRequestInProgress(true);
    api
      .patch(stocksAPIPath + `/${stock.ticker.trim()}`, {
        params: { morningstarID: (stock.morningstarID ?? "").trim() },
      })
      .then(() => {
        setMorningstarIDSet(!!stock.morningstarID); // Whether the Morningstar ID was empty
        if (stock.morningstarID) {
          // If a Morningstar ID was set, we fetch data from Morningstar using the new ID.
          api
            .post(fetchAPIPath + fetchMorningstarEndpointSuffix, {
              params: { ticker: stock.ticker.trim(), noSkip: true },
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
    api
      .patch(stocksAPIPath + `/${stock.ticker.trim()}`, {
        params: { marketScreenerID: (stock.marketScreenerID ?? "").trim() },
      })
      .then(() => {
        setMarketScreenerIDSet(!!stock.marketScreenerID); // Whether the Market Screener ID was empty
        if (stock.marketScreenerID) {
          // If a Market Screener ID was set, we fetch data from Market Screener using the new ID.
          api
            .post(fetchAPIPath + fetchMarketScreenerEndpointSuffix, {
              params: { ticker: stock.ticker.trim(), noSkip: true },
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
    api
      .patch(stocksAPIPath + `/${stock.ticker.trim()}`, {
        params: { msciID: (stock.msciID ?? "").trim() },
      })
      .then(() => {
        setMSCIIDSet(!!stock.msciID); // Whether the MSCI ID was empty
        if (stock.msciID) {
          // If an MSCI ID was set, we fetch data from MSCI using the new ID.
          api
            .post(fetchAPIPath + fetchMSCIEndpointSuffix, { params: { ticker: stock.ticker.trim(), noSkip: true } })
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
    api
      .patch(stocksAPIPath + `/${stock.ticker.trim()}`, { params: { ric: (stock.ric ?? "").trim() } })
      .then(() => {
        setRICSet(!!stock.ric); // Whether the RIC was empty
        if (stock.ric) {
          // If a RIC was set, we fetch data from LSEG Data & Analytics using the new RIC.
          api
            .post(fetchAPIPath + fetchLSEGEndpointSuffix, { params: { ticker: stock.ticker.trim(), noSkip: true } })
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
   * Transmits the Standard & Poor’s ID to the server.
   */
  const patchStockSPID = () => {
    setSPIDRequestInProgress(true);
    api
      .patch(stocksAPIPath + `/${stock.ticker.trim()}`, {
        params: { spID: stock.spID === null ? "" : stock.spID },
      })
      .then(() => {
        setSPIDSet(!!stock.spID); // Whether the S&P ID was empty
        if (stock.spID) {
          // If an S&P ID was set, we fetch data from S&P using the new ID.
          api
            .post(fetchAPIPath + fetchSPEndpointSuffix, { params: { ticker: stock.ticker.trim(), noSkip: true } })
            .catch((e: FetchError<{ message: string }>) => {
              if (e.response?.data?.message?.includes(SP_PREMIUM_STOCK_ERROR_MESSAGE)) {
                setNotification({
                  severity: "warning",
                  title: `Unable to fetch S&P Information for stock “${stock.name}” (${stock.ticker})`,
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
    api
      .patch(stocksAPIPath + `/${stock.ticker.trim()}`, {
        params: { sustainalyticsID: (stock.sustainalyticsID ?? "").trim() },
      })
      .then(() => {
        setSustainalyticsIDSet(!!stock.sustainalyticsID); // Whether the Sustainalytics ID was empty
        if (stock.sustainalyticsID) {
          // If a Sustainalytics ID was set, we fetch data from Sustainalytics using the new ID.
          api
            .post(fetchAPIPath + fetchSustainalyticsEndpointSuffix, { params: { ticker: stock.ticker.trim() } })
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

  /**
   * Fetches the newly created stock from the server and shows it.
   */
  const getAndShowStock = () => {
    setRequestInProgress(true);
    api
      .get(stocksAPIPath + `/${stock.ticker.trim()}`)
      .then((res) => {
        setStock(res.data);
        setFinalStock(res.data);
        handleNext();
      })
      .catch((e) => setErrorNotificationOrClearSession(e, "fetching the new stock"))
      .finally(() => setRequestInProgress(false));
  };

  /**
   * The different steps to show in the stepper.
   */
  const steps = [
    {
      // 0
      title: "Enter Stock information",
      content: (
        <>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Let’s start by adding some basic information:
          </Typography>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12}>
              <YahooStockStubAutocomplete
                onChange={(_, value) => {
                  const isin = value?.isin ?? "";
                  let country: Country;
                  if (isin) {
                    const countryPrefix = isin.substring(0, 2);
                    if (isCountry(countryPrefix)) country = countryPrefix;
                  }
                  if (value && value.ticker && value.name) {
                    setStock((prevStock) => ({
                      ...prevStock,
                      ticker: value.ticker,
                      name: value.name,
                      isin: isin,
                      country: country,
                    }));
                    setTickerError(false);
                    setNameError(false);
                    setIsinError(false);
                    setCountryError(false);
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                …or fill in the information manually:
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                onChange={(event) => {
                  setStock((prevStock) => ({ ...prevStock, name: event.target.value }));
                  setNameError(false);
                }}
                error={nameError}
                label="Stock name"
                value={stock.name}
                placeholder="e.g. Apple Inc."
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                onChange={(event) => {
                  setStock((prevStock) => ({ ...prevStock, ticker: event.target.value }));
                  setTickerError(false);
                }}
                error={tickerError}
                label="Ticker symbol"
                value={stock.ticker}
                placeholder="e.g. AAPL"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                onChange={(event) => {
                  setStock((prevStock) => ({ ...prevStock, isin: event.target.value }));
                  if (!stock.country && event.target.value.length >= 2) {
                    // Extract country from ISIN
                    const possibleCountry = event.target.value.substring(0, 2);
                    if (isCountry(possibleCountry)) {
                      // If the extracted country is valid, we set it as the stock’s country.
                      setStock((prevStock) => ({ ...prevStock, country: possibleCountry }));
                      setCountryError(false);
                    }
                  }
                  setIsinError(false);
                }}
                error={isinError}
                label="ISIN"
                value={stock.isin}
                placeholder="e.g. US0378331005"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <CountryAutocomplete
                value={stock.country ?? null}
                onChange={(_, value) =>
                  isCountry(value) &&
                  (setStock((prevStock) => ({ ...prevStock, country: value })), setCountryError(false))
                }
                error={countryError}
              />
            </Grid>
          </Grid>
        </>
      ),
      nextButton: (
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={putStock}
          onMouseOver={validate} // Validate input fields on hover
          disabled={tickerError || nameError || countryError}
          startIcon={<AddBoxIcon />}
        >
          Create Stock
        </LoadingButton>
      ),
    },
    {
      // 1
      title: "Connect Data Providers",
      content: (
        <>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Alright, now connect some data providers:
          </Typography>
          <Grid container spacing={1} alignItems="center">
            <Grid item width={{ xs: "100%", sm: `calc(100% - ${morningstarIDSet ? 112 : 91}px)` }}>
              <TextField
                onChange={(event) => setStock((prevStock) => ({ ...prevStock, morningstarID: event.target.value }))}
                label="Morningstar ID"
                value={stock.morningstarID ?? ""}
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
                startIcon={morningstarIDSet ? <LinkIcon /> : <AddLinkIcon />}
              >
                {morningstarIDSet ? "Update" : "Add"}
              </LoadingButton>
            </Grid>
          </Grid>
          <Grid container spacing={1} marginTop={0} alignItems="center">
            <Grid item width={{ xs: "100%", sm: `calc(100% - ${marketScreenerIDSet ? 112 : 91}px)` }}>
              <TextField
                onChange={(event) => setStock((prevStock) => ({ ...prevStock, marketScreenerID: event.target.value }))}
                label="Market Screener ID"
                value={stock.marketScreenerID ?? ""}
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
                startIcon={marketScreenerIDSet ? <LinkIcon /> : <AddLinkIcon />}
              >
                {marketScreenerIDSet ? "Update" : "Add"}
              </LoadingButton>
            </Grid>
          </Grid>
          <Grid container spacing={1} marginTop={0} alignItems="center">
            <Grid item width={{ xs: "100%", sm: `calc(100% - ${msciIDSet ? 112 : 91}px)` }}>
              <TextField
                onChange={(event) => setStock((prevStock) => ({ ...prevStock, msciID: event.target.value }))}
                label="MSCI ID"
                value={stock.msciID ?? ""}
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
                startIcon={msciIDSet ? <LinkIcon /> : <AddLinkIcon />}
              >
                {msciIDSet ? "Update" : "Add"}
              </LoadingButton>
            </Grid>
          </Grid>
          <Grid container spacing={1} marginTop={0} alignItems="center">
            <Grid item width={{ xs: "100%", sm: `calc(100% - ${ricSet ? 112 : 91}px)` }}>
              <TextField
                onChange={(event) => setStock((prevStock) => ({ ...prevStock, ric: event.target.value }))}
                label="RIC"
                value={stock.ric ?? ""}
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
                startIcon={ricSet ? <LinkIcon /> : <AddLinkIcon />}
              >
                {ricSet ? "Update" : "Add"}
              </LoadingButton>
            </Grid>
          </Grid>
          <Grid container spacing={1} marginTop={0} alignItems="center">
            <Grid item width={{ xs: "100%", sm: `calc(100% - ${spIDSet ? 112 : 91}px)` }}>
              <TextField
                inputProps={{ inputMode: "numeric", pattern: "\\d*" }}
                onChange={(event) => {
                  const value = event.target.value.replaceAll(/\D+/g, "");
                  setStock((prevStock) => ({ ...prevStock, spID: value ? +value : null }));
                }}
                label="S&P ID"
                value={stock.spID === null ? "" : stock.spID}
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
                startIcon={spIDSet ? <LinkIcon /> : <AddLinkIcon />}
              >
                {spIDSet ? "Update" : "Add"}
              </LoadingButton>
            </Grid>
          </Grid>
          <Grid container spacing={1} marginTop={0} alignItems="center">
            <Grid item width={{ xs: "100%", sm: `calc(100% - ${sustainalyticsIDSet ? 112 : 91}px)` }}>
              <TextField
                onChange={(event) => setStock((prevStock) => ({ ...prevStock, sustainalyticsID: event.target.value }))}
                label="Sustainalytics ID"
                value={stock.sustainalyticsID ?? ""}
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
                startIcon={sustainalyticsIDSet ? <LinkIcon /> : <AddLinkIcon />}
              >
                {sustainalyticsIDSet ? "Update" : "Add"}
              </LoadingButton>
            </Grid>
          </Grid>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You can always add more data providers later.
          </Typography>
        </>
      ),
      noStepBack: true,
      optional: true,
      nextButton: (
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={getAndShowStock}
          sx={{ ml: 1, float: "right" }}
          disabled={
            morningstarIDRequestInProgress ||
            marketScreenerIDRequestInProgress ||
            msciIDRequestInProgress ||
            ricRequestInProgress ||
            spIDRequestInProgress ||
            sustainalyticsIDRequestInProgress
          }
          startIcon={<AutoGraphIcon />}
        >
          Show Stock
        </LoadingButton>
      ),
    },
    {
      // 2
      title: "View Stock",
      content: (
        <>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Here’s all we could find about your new stock:
          </Typography>
          <Box sx={{ ml: "-24px", width: "calc(100% + 48px)", mr: "-32px" }}>
            <StockDetails stock={finalStock} maxColumns={2} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please check whether all expected fields are filled. If a field is not filled, an alert will not be raised
            when the information cannot be extracted at a later time.
          </Typography>
        </>
      ),
      buttonColor: "success",
    },
  ];

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Add a new Stock</Typography>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ p: 0, background: "none" }}>
          {steps.map((step) => {
            return (
              <Step key={step.title}>
                <StepLabel optional={step.optional && <Typography variant="caption">Optional</Typography>}>
                  {step.title}
                </StepLabel>
                <StepContent sx={{ pr: 0 }}>{step.content}</StepContent>
              </Step>
            );
          })}
        </Stepper>
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={handleBack} sx={{ mr: "auto", visibility: steps[activeStep].noStepBack && "hidden" }}>
          {activeStep === 0 ? "Cancel" : "Back"}
        </Button>
        {steps[activeStep].nextButton ?? (
          <LoadingButton
            variant="contained"
            onClick={handleNext}
            color={(steps[activeStep].buttonColor as AlertColor) ?? "primary"}
          >
            {activeStep === steps.length - 1 ? "Finish" : "Continue"}
          </LoadingButton>
        )}
      </DialogActions>
    </>
  );
};

/**
 * Properties for the AddStock component.
 */
interface AddStockProps {
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
  /**
   * A method that is called when the dialog is closed after the stock was added successfully.
   */
  onCloseAfterAdd: () => void;
}
