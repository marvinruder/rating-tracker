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
  Grid2 as Grid,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import type { Country, FetchError, OmitDynamicAttributesStock, Stock } from "@rating-tracker/commons";
import {
  handleResponse,
  isCountry,
  optionalStockValuesNull,
  SP_PREMIUM_STOCK_ERROR_MESSAGE,
  parseStock,
} from "@rating-tracker/commons";
import { useRef, useState } from "react";

import fetchClient from "../../../api/fetch";
import stockClient from "../../../api/stock";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
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
    country: undefined as unknown as Country,
  });
  const [finalStock, setFinalStock] = useState<Stock>();
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string>(""); // Error message for the name text field.
  const [tickerError, setTickerError] = useState<string>(""); // Error message for the ticker text field.
  const [isinError, setISINError] = useState<string>(""); // Error message for the ISIN text field.
  const [countryError, setCountryError] = useState<string>(""); // Error message for the country input field.
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

  const nameInputRef = useRef<HTMLInputElement>(null);
  const tickerInputRef = useRef<HTMLInputElement>(null);
  const isinInputRef = useRef<HTMLInputElement>(null);
  const countryInputRef = useRef<HTMLInputElement>(null);

  /**
   * Checks for errors in the input fields.
   * @returns Whether the input fields are valid.
   */
  const validate = (): boolean => {
    const isNameValid = nameInputRef.current?.checkValidity() ?? false;
    const isTickerValid = tickerInputRef.current?.checkValidity() ?? false;
    const isISINValid = isinInputRef.current?.checkValidity() ?? false;
    const isCountryValid = countryInputRef.current?.checkValidity() ?? false;
    return isNameValid && isTickerValid && isISINValid && isCountryValid;
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
    stockClient[":ticker"]
      .$put({ param: { ticker: stock.ticker.trim() }, json: { name: name.trim(), isin: isin.trim(), country } })
      .then(handleResponse)
      .then(async () => {
        if (!stock.ticker.trim().startsWith("_"))
          await fetchClient.yahoo
            .$post({ query: { ticker: stock.ticker.trim() }, json: { noSkip: true } })
            .then(handleResponse)
            .catch((e) => setErrorNotificationOrClearSession(e, "fetching information from Yahoo"));
        handleNext();
      })
      .catch((e) => setErrorNotificationOrClearSession(e, "creating new stock"))
      .finally(() => setRequestInProgress(false));
  };

  /**
   * Transmits the Morningstar ID to the server and fetches data from Morningstar.
   */
  const patchStockMorningstarID = () => {
    setMorningstarIDRequestInProgress(true);
    stockClient[":ticker"]
      .$patch({ param: { ticker: stock.ticker.trim() }, json: { morningstarID: stock.morningstarID?.trim() || null } })
      .then(handleResponse)
      .then(() => {
        setMorningstarIDSet(!!stock.morningstarID); // Whether the Morningstar ID was empty
        if (stock.morningstarID) {
          // If a Morningstar ID was set, we fetch data from Morningstar using the new ID.
          fetchClient.morningstar
            .$post({ query: { ticker: stock.ticker.trim() }, json: { noSkip: true } })
            .then(handleResponse)
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
   * Transmits the Market Screener ID to the server and fetches data from Market Screener.
   */
  const patchStockMarketScreenerID = () => {
    setMarketScreenerIDRequestInProgress(true);
    stockClient[":ticker"]
      .$patch({
        param: { ticker: stock.ticker.trim() },
        json: { marketScreenerID: stock.marketScreenerID?.trim() || null },
      })
      .then(handleResponse)
      .then(() => {
        setMarketScreenerIDSet(!!stock.marketScreenerID); // Whether the Market Screener ID was empty
        if (stock.marketScreenerID) {
          // If a Market Screener ID was set, we fetch data from Market Screener using the new ID.
          fetchClient.marketscreener
            .$post({ query: { ticker: stock.ticker.trim() }, json: { noSkip: true } })
            .then(handleResponse)
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
   * Transmits the MSCI ID to the server and fetches data from MSCI.
   */
  const patchStockMSCIID = () => {
    setMSCIIDRequestInProgress(true);
    stockClient[":ticker"]
      .$patch({ param: { ticker: stock.ticker.trim() }, json: { msciID: stock.msciID?.trim() || null } })
      .then(handleResponse)
      .then(() => {
        setMSCIIDSet(!!stock.msciID); // Whether the MSCI ID was empty
        if (stock.msciID) {
          // If an MSCI ID was set, we fetch data from MSCI using the new ID.
          fetchClient.msci
            .$post({ query: { ticker: stock.ticker.trim() }, json: { noSkip: true } })
            .then(handleResponse)
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
   * Transmits the Reuters Identifier Code (RIC) to the server and fetches data from LSEG.
   */
  const patchStockRIC = () => {
    setRICRequestInProgress(true);
    stockClient[":ticker"]
      .$patch({ param: { ticker: stock.ticker.trim() }, json: { ric: stock.ric?.trim() || null } })
      .then(handleResponse)
      .then(() => {
        setRICSet(!!stock.ric); // Whether the RIC was empty
        if (stock.ric) {
          // If a RIC was set, we fetch data from LSEG Data & Analytics using the new RIC.
          fetchClient.lseg
            .$post({ query: { ticker: stock.ticker.trim() }, json: { noSkip: true } })
            .then(handleResponse)
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
   * Transmits the S&P ID to the server and fetches data from S&P.
   */
  const patchStockSPID = () => {
    setSPIDRequestInProgress(true);
    stockClient[":ticker"]
      .$patch({ param: { ticker: stock.ticker.trim() }, json: { spID: stock.spID } })
      .then(handleResponse)
      .then(() => {
        setSPIDSet(!!stock.spID); // Whether the S&P ID was empty
        if (stock.spID) {
          // If an S&P ID was set, we fetch data from S&P using the new ID.
          fetchClient.sp
            .$post({ query: { ticker: stock.ticker.trim() }, json: { noSkip: true } })
            .then(handleResponse)
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
   * Transmits the Sustainalytics ID to the server and fetches data from Sustainalytics.
   */
  const patchStockSustainalyticsID = () => {
    setSustainalyticsIDRequestInProgress(true);
    stockClient[":ticker"]
      .$patch({
        param: { ticker: stock.ticker.trim() },
        json: { sustainalyticsID: stock.sustainalyticsID?.trim() || null },
      })
      .then(handleResponse)
      .then(() => {
        setSustainalyticsIDSet(!!stock.sustainalyticsID); // Whether the Sustainalytics ID was empty
        if (stock.sustainalyticsID) {
          // If a Sustainalytics ID was set, we fetch data from Sustainalytics using the new ID.
          fetchClient.sustainalytics
            .$post({ query: { ticker: stock.ticker.trim() }, json: {} })
            .then(handleResponse)
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
    stockClient[":ticker"]
      .$get({ param: { ticker: stock.ticker.trim() } })
      .then(handleResponse)
      .then((res) => ({ ...res, data: parseStock(res.data) }))
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
          <Grid container spacing={1} sx={{ alignItems: "top" }}>
            <Grid size={12}>
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
                    setTickerError("");
                    setNameError("");
                    setISINError("");
                    setCountryError("");
                  }
                }}
              />
            </Grid>
            <Grid size={12}>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                …or fill in the information manually:
              </Typography>
            </Grid>
            <Grid size={12}>
              <TextField
                onChange={(event) => {
                  setStock((prevStock) => ({ ...prevStock, name: event.target.value }));
                  // If in error state, check whether error is resolved. If so, clear the error.
                  if (nameError && event.target.checkValidity()) setNameError("");
                }}
                onInvalid={(event) => setNameError((event.target as HTMLInputElement).validationMessage)}
                error={!!nameError}
                helperText={nameError}
                inputRef={nameInputRef}
                required
                label="Stock name"
                value={stock.name}
                placeholder="e.g. Apple Inc."
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                onChange={(event) => {
                  setStock((prevStock) => ({ ...prevStock, ticker: event.target.value }));
                  // If in error state, check whether error is resolved. If so, clear the error.
                  if (tickerError && event.target.checkValidity()) setTickerError("");
                }}
                onInvalid={(event) => setTickerError((event.target as HTMLInputElement).validationMessage)}
                error={!!tickerError}
                helperText={tickerError}
                inputRef={tickerInputRef}
                required
                label="Ticker symbol"
                value={stock.ticker}
                placeholder="e.g. AAPL"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                onChange={(event) => {
                  setStock((prevStock) => ({ ...prevStock, isin: event.target.value }));
                  if (!stock.country && event.target.value.length >= 2) {
                    // Extract country from ISIN
                    const possibleCountry = event.target.value.substring(0, 2);
                    if (isCountry(possibleCountry)) {
                      // If the extracted country is valid, we set it as the stock’s country.
                      setStock((prevStock) => ({ ...prevStock, country: possibleCountry }));
                      setCountryError("");
                    }
                  }
                  // If in error state, check whether error is resolved. If so, clear the error.
                  if (isinError && event.target.checkValidity()) setISINError("");
                }}
                onInvalid={(event) => setISINError((event.target as HTMLInputElement).validationMessage)}
                error={!!isinError}
                helperText={isinError}
                inputRef={isinInputRef}
                required
                label="ISIN"
                value={stock.isin}
                placeholder="e.g. US0378331005"
                fullWidth
                slotProps={{ htmlInput: { pattern: "[A-Z]{2}[A-Z0-9]{10}" } }}
              />
            </Grid>
            <Grid size={12}>
              <CountryAutocomplete
                value={stock.country ?? null}
                onChange={(_, value) => {
                  if (isCountry(value)) {
                    setStock((prevStock) => ({ ...prevStock, country: value }));
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
          </Grid>
        </>
      ),
      nextButton: (
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={putStock}
          disabled={!!nameError || !!tickerError || !!isinError || !!countryError}
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
          <Grid container spacing={1} sx={{ alignItems: "center" }}>
            <Grid sx={{ width: { xs: "100%", sm: morningstarIDSet ? `calc(100% - 112px)` : `calc(100% - 91px)` } }}>
              <TextField
                onChange={(event) => setStock((prevStock) => ({ ...prevStock, morningstarID: event.target.value }))}
                label="Morningstar ID"
                value={stock.morningstarID ?? ""}
                placeholder="e.g. 0P000000GY"
                fullWidth
              />
            </Grid>
            <Grid sx={{ ml: "auto" }}>
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
          <Grid container spacing={1} sx={{ mt: 1, alignItems: "center" }}>
            <Grid sx={{ width: { xs: "100%", sm: marketScreenerIDSet ? `calc(100% - 112px)` : `calc(100% - 91px)` } }}>
              <TextField
                onChange={(event) => setStock((prevStock) => ({ ...prevStock, marketScreenerID: event.target.value }))}
                label="Market Screener ID"
                value={stock.marketScreenerID ?? ""}
                placeholder="e.g. APPLE-INC-4849"
                fullWidth
              />
            </Grid>
            <Grid sx={{ ml: "auto" }}>
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
          <Grid container spacing={1} sx={{ mt: 1, alignItems: "center" }}>
            <Grid sx={{ width: { xs: "100%", sm: msciIDSet ? `calc(100% - 112px)` : `calc(100% - 91px)` } }}>
              <TextField
                onChange={(event) => setStock((prevStock) => ({ ...prevStock, msciID: event.target.value }))}
                label="MSCI ID"
                value={stock.msciID ?? ""}
                placeholder="e.g. IID000000002157615"
                fullWidth
              />
            </Grid>
            <Grid sx={{ ml: "auto" }}>
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
          <Grid container spacing={1} sx={{ mt: 1, alignItems: "center" }}>
            <Grid sx={{ width: { xs: "100%", sm: ricSet ? `calc(100% - 112px)` : `calc(100% - 91px)` } }}>
              <TextField
                onChange={(event) => setStock((prevStock) => ({ ...prevStock, ric: event.target.value }))}
                label="RIC"
                value={stock.ric ?? ""}
                placeholder="e.g. AAPL.O"
                fullWidth
              />
            </Grid>
            <Grid sx={{ ml: "auto" }}>
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
          <Grid container spacing={1} sx={{ mt: 1, alignItems: "center" }}>
            <Grid sx={{ width: { xs: "100%", sm: spIDSet ? `calc(100% - 112px)` : `calc(100% - 91px)` } }}>
              <TextField
                onChange={(event) => {
                  const value = event.target.value.replaceAll(/\D+/g, "");
                  setStock((prevStock) => ({ ...prevStock, spID: value ? +value : null }));
                }}
                label="S&P ID"
                value={stock.spID === null ? "" : stock.spID}
                placeholder="e.g. 4004205"
                fullWidth
                slotProps={{ htmlInput: { inputMode: "numeric", pattern: "\\d*" } }}
              />
            </Grid>
            <Grid sx={{ ml: "auto" }}>
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
          <Grid container spacing={1} sx={{ mt: 1, alignItems: "center" }}>
            <Grid sx={{ width: { xs: "100%", sm: sustainalyticsIDSet ? `calc(100% - 112px)` : `calc(100% - 91px)` } }}>
              <TextField
                onChange={(event) => setStock((prevStock) => ({ ...prevStock, sustainalyticsID: event.target.value }))}
                label="Sustainalytics ID"
                value={stock.sustainalyticsID ?? ""}
                placeholder="e.g. apple-inc/1007903183"
                fullWidth
              />
            </Grid>
            <Grid sx={{ ml: "auto" }}>
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
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
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
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
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
        <Button
          onClick={handleBack}
          sx={{ mr: "auto", visibility: steps[activeStep].noStepBack ? "hidden" : undefined }}
        >
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
