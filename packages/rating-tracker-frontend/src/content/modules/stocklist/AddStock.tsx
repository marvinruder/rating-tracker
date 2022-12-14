import LoadingButton from "@mui/lab/LoadingButton";
import {
  AlertColor,
  Autocomplete,
  Box,
  Button,
  DialogContent,
  DialogTitle,
  Grid,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableContainer,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AddLinkIcon from "@mui/icons-material/AddLink";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import LinkIcon from "@mui/icons-material/Link";
import axios from "axios";
import {
  baseUrl,
  fetchAPI,
  morningstarEndpoint,
  msciEndpoint,
  stockAPI,
} from "../../../endpoints";
import {
  countryArray,
  countryName,
  countryNameWithFlag,
  isCountry,
  Stock,
} from "rating-tracker-commons";
import { useState } from "react";
import StockRow from "./StockRow";
import useNotification from "../../../helpers/useNotification";

const AddStock = (props: AddStockProps) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [stock, setStock] = useState<Stock>({
    ticker: "",
    name: "",
    country: undefined,
    morningstarId: "",
    msciId: "",
  });
  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const [countryInputValue, setCountryInputValue] = useState<string>("");
  const [tickerError, setTickerError] = useState<boolean>(false);
  const [nameError, setNameError] = useState<boolean>(false);
  const [countryError, setCountryError] = useState<boolean>(false);
  const [morningstarIdRequestInProgress, setMorningstarIdRequestInProgress] =
    useState<boolean>(false);
  const [morningstarIdSet, setMorningstarIdSet] = useState<boolean>(false);
  const [msciIdRequestInProgress, setMsciIdRequestInProgress] =
    useState<boolean>(false);
  const [msciIdSet, setMsciIdSet] = useState<boolean>(false);
  const { setNotification } = useNotification();

  const validate = () => {
    setTickerError(!stock.ticker);
    setNameError(!stock.name);
    setCountryError(!stock.country);
  };

  const handleNext = () => {
    activeStep === steps.length - 1
      ? props.onClose()
      : setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    activeStep === 0
      ? props.onClose()
      : setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const putStock = () => {
    setRequestInProgress(true);
    axios
      .put(baseUrl + stockAPI + `/${stock.ticker}`, undefined, {
        params: { name: stock.name, country: stock.country },
      })
      .then(() => {
        handleNext();
      })
      .catch((e) => {
        setNotification({
          severity: "error",
          title: "Error while creating new stock",
          message:
            e.response?.status && e.response?.data?.message
              ? `${e.response.status}: ${e.response.data.message}`
              : e.message ?? "No additional information available.",
        });
      })
      .finally(() => setRequestInProgress(false));
  };

  const patchStockMorningstarId = () => {
    setMorningstarIdRequestInProgress(true);
    axios
      .patch(baseUrl + stockAPI + `/${stock.ticker}`, undefined, {
        params: { morningstarId: stock.morningstarId },
      })
      .then(() => {
        setMorningstarIdSet(!!stock.morningstarId);
        if (stock.morningstarId) {
          axios
            .get(baseUrl + fetchAPI + morningstarEndpoint, {
              params: { ticker: stock.ticker, noSkip: true },
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
            .finally(() => setMorningstarIdRequestInProgress(false));
        } else {
          setMorningstarIdRequestInProgress(false);
        }
      })
      .catch((e) => {
        setMorningstarIdRequestInProgress(false);
        setNotification({
          severity: "error",
          title: "Error while adding Morningstar ID",
          message:
            e.response?.status && e.response?.data?.message
              ? `${e.response.status}: ${e.response.data.message}`
              : e.message ?? "No additional information available.",
        });
      });
  };

  const patchStockMsciId = () => {
    setMsciIdRequestInProgress(true);
    axios
      .patch(baseUrl + stockAPI + `/${stock.ticker}`, undefined, {
        params: { msciId: stock.msciId },
      })
      .then(() => {
        setMsciIdSet(!!stock.msciId);
        if (stock.msciId) {
          axios
            .get(baseUrl + fetchAPI + msciEndpoint, {
              params: { ticker: stock.ticker, noSkip: true },
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
            .finally(() => setMsciIdRequestInProgress(false));
        } else {
          setMsciIdRequestInProgress(false);
        }
      })
      .catch((e) => {
        setMsciIdRequestInProgress(false);
        setNotification({
          severity: "error",
          title: "Error while adding MSCI ID",
          message:
            e.response?.status && e.response?.data?.message
              ? `${e.response.status}: ${e.response.data.message}`
              : e.message ?? "No additional information available.",
        });
      });
  };

  const getAndShowStock = () => {
    setRequestInProgress(true);
    axios
      .get(baseUrl + stockAPI + `/${stock.ticker}`)
      .then((res) => {
        setStock(res.data);
        handleNext();
      })
      .catch((e) => {
        setNotification({
          severity: "error",
          title: "Error while fetching the new stock",
          message:
            e.response?.status && e.response?.data?.message
              ? `${e.response.status}: ${e.response.data.message}`
              : e.message ?? "No additional information available.",
        });
      })
      .finally(() => setRequestInProgress(false));
  };

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
              <TextField
                onChange={(event) => {
                  setStock((prevStock) => {
                    return { ...prevStock, ticker: event.target.value };
                  });
                  setTickerError(false);
                }}
                error={tickerError}
                label="Ticker symbol"
                value={stock.ticker}
                placeholder={"e.g. AAPL"}
                sx={{ maxWidth: "300px" }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                onChange={(event) => {
                  setStock((prevStock) => {
                    return { ...prevStock, name: event.target.value };
                  });
                  setNameError(false);
                }}
                error={nameError}
                label="Stock name"
                value={stock.name}
                placeholder={"e.g. Apple Inc."}
                sx={{ maxWidth: "300px" }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                sx={{ maxWidth: "300px" }}
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
                value={stock.country ?? null}
                onChange={(_, value) =>
                  isCountry(value) &&
                  (setStock((prevStock) => {
                    return { ...prevStock, country: value };
                  }),
                  setCountryError(false))
                }
                filterOptions={(options) => {
                  const currentInputValue = countryInputValue
                    .trim()
                    .toUpperCase();
                  const filteredOptions = options.filter(
                    (option) =>
                      countryName[option]
                        .toUpperCase()
                        .startsWith(countryInputValue.trim().toUpperCase()) &&
                      option != currentInputValue
                  );
                  isCountry(currentInputValue) &&
                    filteredOptions.unshift(currentInputValue);
                  return filteredOptions;
                }}
                disableClearable
                renderInput={(params) => (
                  <TextField {...params} label="Country" error={countryError} />
                )}
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
          onMouseOver={validate}
          sx={{ mt: 1, ml: 1, float: "right" }}
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
            <Grid item>
              <TextField
                onChange={(event) => {
                  setStock((prevStock) => {
                    return { ...prevStock, morningstarId: event.target.value };
                  });
                }}
                label="Morningstar ID"
                value={stock.morningstarId}
                placeholder={"e.g. 0P000000GY"}
                sx={{ maxWidth: "300px" }}
              />
            </Grid>
            <Grid item>
              <LoadingButton
                size="small"
                loading={morningstarIdRequestInProgress}
                onClick={patchStockMorningstarId}
                disabled={requestInProgress}
                variant="contained"
                startIcon={morningstarIdSet ? <LinkIcon /> : <AddLinkIcon />}
              >
                {morningstarIdSet ? "Update" : "Add"}
              </LoadingButton>
            </Grid>
          </Grid>
          <Grid container spacing={1} marginTop={0} alignItems="center">
            <Grid item>
              <TextField
                onChange={(event) => {
                  setStock((prevStock) => {
                    return { ...prevStock, msciId: event.target.value };
                  });
                }}
                label="MSCI ID"
                value={stock.msciId}
                placeholder={"e.g. apple-inc/IID000000002157615"}
                sx={{ maxWidth: "300px" }}
              />
            </Grid>
            <Grid item>
              <LoadingButton
                size="small"
                loading={msciIdRequestInProgress}
                onClick={patchStockMsciId}
                disabled={requestInProgress}
                variant="contained"
                startIcon={msciIdSet ? <LinkIcon /> : <AddLinkIcon />}
              >
                {msciIdSet ? "Update" : "Add"}
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
          sx={{ mt: 1, ml: 1, float: "right" }}
          disabled={morningstarIdRequestInProgress || msciIdRequestInProgress}
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
            Here’s your new stock:
          </Typography>
          {/* TODO: Check extracted data */}
          <TableContainer>
            <Table size="small">
              <TableBody>
                {/* TODO: Replace with Stock Details Page */}
                <StockRow stock={stock} />
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please check whether all expected fields are filled. If a field is
            not filled, an alert will not be raised when the information cannot
            be extracted at a later time.
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
      <DialogContent
        sx={{ width: useMediaQuery("(min-width:664px)") ? 600 : 320 }}
      >
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          sx={{
            p: 0,
            background: "none",
          }}
        >
          {steps.map((step, index) => {
            return (
              <Step key={step.title}>
                <StepLabel
                  optional={
                    step.optional && (
                      <Typography variant="caption">Optional</Typography>
                    )
                  }
                >
                  {step.title}
                </StepLabel>
                <StepContent>
                  {step.content}
                  <Box sx={{ mb: 2 }}>
                    <Button
                      onClick={handleBack}
                      sx={{
                        mt: 1,
                        mr: 1,
                        float: "left",
                        visibility: step.noStepBack && "hidden",
                      }}
                    >
                      {index === 0 ? "Cancel" : "Back"}
                    </Button>
                    {step.nextButton ?? (
                      <LoadingButton
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mt: 1, ml: 1, float: "right" }}
                        color={(step.buttonColor as AlertColor) ?? "primary"}
                      >
                        {index === steps.length - 1 ? "Finish" : "Continue"}
                      </LoadingButton>
                    )}
                  </Box>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
      </DialogContent>
    </>
  );
};

interface AddStockProps {
  onClose: () => void;
}

export default AddStock;
