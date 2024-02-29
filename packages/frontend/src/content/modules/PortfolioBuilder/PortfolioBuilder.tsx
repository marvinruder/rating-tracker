import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import StarsIcon from "@mui/icons-material/Stars";
import type { SlideProps } from "@mui/material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  Skeleton,
  Slide,
  Slider,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type {
  ScatterSeriesType as _ScatterSeriesType,
  ScatterValueType as _ScatterValueType,
} from "@mui/x-charts/models/seriesType";
import { ScatterChart } from "@mui/x-charts/ScatterChart";
import type {
  Currency,
  Portfolio,
  PortfolioSummary,
  Region,
  Sector,
  Size,
  Stock,
  Style,
  Watchlist,
  WatchlistSummary,
  WeightedStock,
} from "@rating-tracker/commons";
import {
  FAVORITES_NAME,
  currencyMinorUnits,
  groupOfIndustry,
  isCurrency,
  portfoliosEndpointPath,
  regionArray,
  regionName,
  regionOfCountry,
  sectorArray,
  sectorName,
  sectorOfIndustryGroup,
  sizeArray,
  styleArray,
  watchlistsEndpointPath,
} from "@rating-tracker/commons";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import CurrencyAutocomplete from "../../../components/autocomplete/CurrencyAutocomplete";
import PinnedDialog from "../../../components/dialogs/PinnedDialog";
import { UpdateStocksInPortfolio } from "../../../components/dialogs/portfolio/UpdateStocksInPortfolio";
import SelectStock from "../../../components/dialogs/stock/SelectStock";
import CheckboxAccordion from "../../../components/etc/CheckboxAccordion";
import DiffProgressBar from "../../../components/etc/DiffProgressBar";
import { Footer } from "../../../components/etc/Footer";
import { HeaderWrapper } from "../../../components/etc/HeaderWrapper";
import { StockPreview } from "../../../components/stock/layouts/StockPreview";
import { StockRow } from "../../../components/stock/layouts/StockRow";
import { PropertyDescription } from "../../../components/stock/properties/PropertyDescription";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import {
  isProportionalRepresentationAlgorithm,
  type ProportionalRepresentationAlgorithm,
} from "../../../types/ProportionalRepresentationAlgorithm";
import api from "../../../utils/api";
import { ExponentialNumber, formatPercentage, pluralize } from "../../../utils/formatters";
import { computePortfolio } from "../../../utils/portfolioComputation";

import { PortfolioBuilderHeader } from "./PortfolioBuilderHeader";

type ScatterValueType = _ScatterValueType & { count: number };
type ScatterSeriesType = Omit<_ScatterSeriesType, "data"> & { data: ScatterValueType[] };

/**
 * A module that allows the user to build a portfolio of their selected stocks weighted by their preferred proportions
 * of regions, sectors and other factors.
 * @returns The component.
 */
const PortfolioBuilderModule = (): JSX.Element => {
  const [activeStep, setActiveStep] = useState<number>(0); // The dialog step to show.
  const [stocks, setStocks] = useState<Stock[]>([]); // The stocks to build the portfolio from.
  const [portfolioSummaries, setPortfolioSummaries] = useState<PortfolioSummary[]>([]);
  const [portfolioSummariesFinal, setPortfolioSummariesFinal] = useState<boolean>(false);
  const [watchlistSummaries, setWatchlistSummaries] = useState<WatchlistSummary[]>([]);
  const [watchlistSummariesFinal, setWatchlistSummariesFinal] = useState<boolean>(false);

  const [regionConstraintOpen, setRegionConstraintOpen] = useState<boolean>(false);
  const [regionConstraints, setRegionConstraints] = useState<Record<Region, number>>(
    Object.fromEntries(regionArray.map((region) => [region, 0])) as Record<Region, number>,
  );
  const [sectorConstraintOpen, setSectorConstraintOpen] = useState<boolean>(false);
  const [sectorConstraints, setSectorConstraints] = useState<Record<Sector, number>>(
    Object.fromEntries(sectorArray.map((sector) => [sector, 0])) as Record<Sector, number>,
  );
  const [sizeConstraintOpen, setSizeConstraintOpen] = useState<boolean>(false);
  const [sizeConstraints, setSizeConstraints] = useState<Record<Size, number>>(
    Object.fromEntries(sizeArray.map((size) => [size, 0])) as Record<Size, number>,
  );
  const [styleConstraintOpen, setStyleConstraintOpen] = useState<boolean>(false);
  const [styleConstraints, setStyleConstraints] = useState<Record<Style, number>>(
    Object.fromEntries(styleArray.map((style) => [style, 0])) as Record<Style, number>,
  );
  // A record of which controls are disabled because no stock with that property is selected.
  const [disabledControls, setDisabledControls] = useState<Record<Region | Sector | Size | Style, boolean>>(
    Object.fromEntries(
      ([...regionArray, ...sectorArray, ...sizeArray, ...styleArray] as const).map((key) => [key, true]),
    ) as Record<Region | Sector | Size | Style, boolean>,
  );

  // A record of the minimum values for controls, based on the selected stocks as well as the total amount and minimum
  // amount per stock
  const [minControlValues, setMinControlValues] = useState<Record<Region | Sector | Size | Style, number>>(
    Object.fromEntries(
      ([...regionArray, ...sectorArray, ...sizeArray, ...styleArray] as const).map((key) => [key, 0]),
    ) as Record<Region | Sector | Size | Style, number>,
  );
  const [currency, setCurrency] = useState<Currency>();
  const [currencyError, setCurrencyError] = useState<boolean>(false); // Error in the currency input field.
  const [totalAmountInput, setTotalAmountInput] = useState<string>("");
  const [totalAmountError, setTotalAmountError] = useState<boolean>(false);
  const [minAmountInput, setMinAmountInput] = useState<string>("1.00");
  const [minAmountError, setMinAmountError] = useState<boolean>(false);
  const [tickInput, setTickInput] = useState<string>("1.00");
  const [tickError, setTickError] = useState<boolean>(false);
  const [proportionalRepresentationAlgorithm, setProportionalRepresentationAlgorithm] =
    useState<ProportionalRepresentationAlgorithm>("sainteLague");

  const [weightedStocks, setWeightedStocks] = useState<WeightedStock[]>([]);
  const [rse, setRSE] = useState<number>(0);
  const [scatterData, setScatterData] = useState<ScatterSeriesType[]>([]);
  const [regionResults, setRegionResults] = useState<Record<Region, number>>(
    Object.fromEntries(regionArray.map((region) => [region, 0])) as Record<Region, number>,
  );
  const [sectorResults, setSectorResults] = useState<Record<Sector, number>>(
    Object.fromEntries(sectorArray.map((sector) => [sector, 0])) as Record<Sector, number>,
  );
  const [sizeResults, setSizeResults] = useState<Record<Size, number>>(
    Object.fromEntries(sizeArray.map((size) => [size, 0])) as Record<Size, number>,
  );
  const [styleResults, setStyleResults] = useState<Record<Style, number>>(
    Object.fromEntries(styleArray.map((style) => [style, 0])) as Record<Style, number>,
  );
  const [updatePortfolioDialogOpen, setUpdatePortfolioDialogOpen] = useState<boolean>(false);

  const fullScreenDialogs = !useMediaQuery("(min-width:664px)");
  const navigate = useNavigate();

  /**
   * The sum of all region constraints. Must be 1 in order to be able to proceed to the next step.
   */
  let regionConstraintsSum = Object.values(regionConstraints).reduce((a, b) => a + b);
  if (Math.abs(regionConstraintsSum - 1) < regionArray.length * Number.EPSILON) regionConstraintsSum = 1;

  /**
   * The sum of all sector constraints. Must be 1 in order to be able to proceed to the next step.
   */
  let sectorConstraintsSum = Object.values(sectorConstraints).reduce((a, b) => a + b);
  if (Math.abs(sectorConstraintsSum - 1) < sectorArray.length * Number.EPSILON) sectorConstraintsSum = 1;

  /**
   * The sum of all size constraints. Must be 1 in order to be able to proceed to the next step.
   */
  let sizeConstraintsSum = Object.values(sizeConstraints).reduce((a, b) => a + b);
  if (Math.abs(sizeConstraintsSum - 1) < sizeArray.length * Number.EPSILON) sizeConstraintsSum = 1;

  /**
   * The sum of all style constraints. Must be 1 in order to be able to proceed to the next step.
   */
  let styleConstraintsSum = Object.values(styleConstraints).reduce((a, b) => a + b);
  if (Math.abs(styleConstraintsSum - 1) < styleArray.length * Number.EPSILON) styleConstraintsSum = 1;

  // Recompute the disabled controls when the stocks change
  useEffect(() => {
    if (activeStep) return;
    const newDisabledControls = Object.fromEntries(
      ([...regionArray, ...sectorArray, ...sizeArray, ...styleArray] as const).map((key) => [key, true]),
    ) as Record<Region | Sector | Size | Style, boolean>;

    const newRegionConstraints = Object.fromEntries(regionArray.map((region) => [region, 0])) as Record<Region, number>;
    const newSectorConstraints = Object.fromEntries(sectorArray.map((sector) => [sector, 0])) as Record<Sector, number>;
    const newSizeConstraints = Object.fromEntries(sizeArray.map((size) => [size, 0])) as Record<Size, number>;
    const newStyleConstraints = Object.fromEntries(styleArray.map((style) => [style, 0])) as Record<Style, number>;

    stocks.forEach((stock) => {
      // Enable all controls that have a stock with that property
      newDisabledControls[regionOfCountry[stock.country]] = false;
      newDisabledControls[sectorOfIndustryGroup[groupOfIndustry[stock.industry]]] = false;
      newDisabledControls[stock.size] = false;
      newDisabledControls[stock.style] = false;

      // Reset the constraints to the distribution that would occur with equal weights
      newRegionConstraints[regionOfCountry[stock.country]] += 1 / stocks.length;
      newSectorConstraints[sectorOfIndustryGroup[groupOfIndustry[stock.industry]]] += 1 / stocks.length;
      newSizeConstraints[stock.size] += 1 / stocks.length;
      newStyleConstraints[stock.style] += 1 / stocks.length;
    });

    setDisabledControls(newDisabledControls);

    setRegionConstraints(newRegionConstraints);
    setSectorConstraints(newSectorConstraints);
    setSizeConstraints(newSizeConstraints);
    setStyleConstraints(newStyleConstraints);
  }, [stocks]);

  // Set minimal values for the controls based on the total amount and the minimal amount per stock
  useEffect(() => {
    const totalAmount = +totalAmountInput;
    const minAmount = +minAmountInput;
    const minWeight = minAmount / totalAmount;
    const newMinControlValues = Object.fromEntries(
      ([...regionArray, ...sectorArray, ...sizeArray, ...styleArray] as const).map((key) => [key, 0]),
    ) as Record<Region | Sector | Size | Style, number>;

    if (Number.isNaN(minWeight) || minWeight < 0 || minWeight * stocks.length > 1) {
      setMinControlValues(newMinControlValues);
      return;
    }

    stocks.forEach((stock) => {
      newMinControlValues[regionOfCountry[stock.country]] += minWeight;
      newMinControlValues[sectorOfIndustryGroup[groupOfIndustry[stock.industry]]] += minWeight;
      newMinControlValues[stock.size] += minWeight;
      newMinControlValues[stock.style] += minWeight;
    });

    setMinControlValues(newMinControlValues);
  }, [stocks, totalAmountInput, minAmountInput]);

  // Set distribution results based on the weighted stocks
  useEffect(() => {
    const newScatterData: ScatterSeriesType[] = [];
    const newRegionResults = Object.fromEntries(regionArray.map((region) => [region, 0])) as Record<Region, number>;
    const newSectorResults = Object.fromEntries(sectorArray.map((sector) => [sector, 0])) as Record<Sector, number>;
    const newSizeResults = Object.fromEntries(sizeArray.map((size) => [size, 0])) as Record<Size, number>;
    const newStyleResults = Object.fromEntries(styleArray.map((style) => [style, 0])) as Record<Style, number>;

    const totalAmount = +totalAmountInput;

    weightedStocks
      .sort((a, b) => b.amount - a.amount)
      .forEach((stock) => {
        if (!newScatterData.find((series) => series.id === stock.amount))
          newScatterData.push({
            type: "scatter",
            id: stock.amount,
            label: `${currency} ${stock.amount.toFixed(currencyMinorUnits[currency])}`,
            data: [],
            color: theme.palette.primary.main,
            markerSize: 5,
            valueFormatter: (value: ScatterValueType) => `# of stocks: ${value.count.toString()}`,
          });
        const index = newScatterData.findIndex((series) => series.id === stock.amount);
        newScatterData[index].data.push({
          x: stock.amount,
          y: newScatterData[index].data.length + 1,
          id: stock.ticker,
          count: weightedStocks.filter((otherStock) => otherStock.amount === stock.amount).length,
        });

        newRegionResults[regionOfCountry[stock.country]] += stock.amount / totalAmount;
        newSectorResults[sectorOfIndustryGroup[groupOfIndustry[stock.industry]]] += stock.amount / totalAmount;
        newSizeResults[stock.size] += stock.amount / totalAmount;
        newStyleResults[stock.style] += stock.amount / totalAmount;
      });

    setScatterData(newScatterData);
    setRegionResults(newRegionResults);
    setSectorResults(newSectorResults);
    setSizeResults(newSizeResults);
    setStyleResults(newStyleResults);
  }, [weightedStocks]);

  /**
   * Checks for errors in the portfolio parameter input fields.
   * @returns Whether the input fields are valid.
   */
  const validatePortfolioParameters = (): boolean => {
    // The following fields are required.
    // Currency must be set
    setCurrencyError(!currency);
    // Total amount must be a positive number
    setTotalAmountError(!totalAmountInput || Number.isNaN(+totalAmountInput) || +totalAmountInput <= 0);
    // Smallest amount must be a non-negative number and must fit into the total amount as often as there are stocks
    setMinAmountError(
      !minAmountInput ||
        Number.isNaN(+minAmountInput) ||
        +minAmountInput < 0 ||
        +minAmountInput * stocks.length > +totalAmountInput,
    );
    // Tick must be a positive number and divide the total amount evenly
    setTickError(
      !tickInput ||
        Number.isNaN(+tickInput) ||
        +tickInput <= 0 ||
        +totalAmountInput / +tickInput !== Math.trunc(+totalAmountInput / +tickInput),
    );
    return (
      !!currency &&
      !(!totalAmountInput || Number.isNaN(+totalAmountInput) || +totalAmountInput <= 0) &&
      !(
        !minAmountInput ||
        Number.isNaN(+minAmountInput) ||
        +minAmountInput < 0 ||
        +minAmountInput * stocks.length > +totalAmountInput
      ) &&
      !(
        !tickInput ||
        Number.isNaN(+tickInput) ||
        +tickInput <= 0 ||
        +totalAmountInput / +tickInput !== Math.trunc(+totalAmountInput / +tickInput)
      )
    );
  };

  /**
   * The constraints to use for the portfolio computation.
   */
  const activeConstraints = {
    ...(regionConstraintOpen ? regionConstraints : {}),
    ...(sectorConstraintOpen ? sectorConstraints : {}),
    ...(sizeConstraintOpen ? sizeConstraints : {}),
    ...(styleConstraintOpen ? styleConstraints : {}),
  } as Record<Region | Sector | Size | Style, number>;

  /**
   * Which step to allow navigation to based on the validity of input fields.
   */
  const maxStep =
    // Allow navigation to Configure Portfolio: at least one stock is selected
    stocks.length
      ? // Allow navigation to View Results:
        // - no disabled control must have a value greater than 0
        Object.entries(activeConstraints)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, value]) => value > 0)
          .every(([key]) => !disabledControls[key]) &&
        // - the sum of all active constraint sets is 1
        (!regionConstraintOpen || regionConstraintsSum === 1) &&
        (!sectorConstraintOpen || sectorConstraintsSum === 1) &&
        (!sizeConstraintOpen || sizeConstraintsSum === 1) &&
        (!styleConstraintOpen || styleConstraintsSum === 1) &&
        // - no input field must have an error
        !(currencyError || totalAmountError || minAmountError || tickError)
        ? 2
        : 1
      : 0;

  const { setNotification, setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const theme = useTheme();

  /**
   * Adds a collection of stocks to the selection.
   * @param collection The collection containing the stocks to add to the selection. May be a portfolio or a watchlist.
   */
  const addToSelection = (collection: Portfolio | Watchlist) => {
    let alreadySelected = false;
    setStocks((prevStocks) => {
      const newStocks = [...prevStocks];
      collection.stocks.forEach((stock) => {
        [...newStocks].some((otherStock) => otherStock.ticker === stock.ticker)
          ? (alreadySelected = true)
          : // If a stock does not have a size or style, set it to the "Small" size and "Blend" style
            newStocks.push({ ...stock, size: stock.size || "Small", style: stock.style || "Blend" });
      });
      return newStocks.sort((a, b) => a.ticker.localeCompare(b.ticker));
    });
    if (alreadySelected)
      setNotification({
        title: "Some stocks already selected",
        message: `Some stocks from the collection “${collection.name}” are already part of the selection.`,
        severity: "warning",
      });
  };

  /**
   * Get the portfolios from the backend.
   */
  const getPortfolios = () => {
    api
      .get(portfoliosEndpointPath)
      .then((res) => setPortfolioSummaries(res.data))
      .catch((e) => {
        setErrorNotificationOrClearSession(e, "fetching portfolios");
        setPortfolioSummaries([]);
      })
      .finally(() => setPortfolioSummariesFinal(true));
  };

  /**
   * Get the watchlists from the backend.
   */
  const getWatchlists = () => {
    api
      .get(watchlistsEndpointPath)
      .then((res) => setWatchlistSummaries(res.data))
      .catch((e) => {
        setErrorNotificationOrClearSession(e, "fetching watchlists");
        setWatchlistSummaries([]);
      })
      .finally(() => setWatchlistSummariesFinal(true));
  };

  useEffect(() => (getPortfolios(), getWatchlists()), []);

  /**
   * The different steps to show in the stepper.
   */
  const steps = [
    {
      title: "Select stocks",
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" pb={2}>
              Add stocks to selection:
            </Typography>
            <Card elevation={0}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  Add all stocks from existing portfolio
                </AccordionSummary>
                <AccordionDetails>
                  {portfolioSummariesFinal
                    ? portfolioSummaries.map((portfolioSummary, index) => (
                        <Fragment key={portfolioSummary.id}>
                          {index ? <Divider /> : <></>}
                          <ListItem disablePadding disableGutters>
                            <ListItemButton
                              onClick={() =>
                                api
                                  .get(portfoliosEndpointPath + `/${portfolioSummary.id}`)
                                  .then((res) => addToSelection(res.data))
                                  .catch((e) =>
                                    setErrorNotificationOrClearSession(e, "adding stocks from portfolio to selection"),
                                  )
                              }
                            >
                              <ListItemText
                                primary={portfolioSummary.name}
                                primaryTypographyProps={{ fontWeight: "bold" }}
                                secondary={
                                  (portfolioSummary.stocks.length || "No") +
                                  ` stock${pluralize(portfolioSummary.stocks.length)}`
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        </Fragment>
                      ))
                    : [...Array(3)].map(
                        // Render skeleton rows
                        (_, key) => (
                          <Fragment key={key}>
                            {key ? <Divider /> : <></>}
                            <ListItem disablePadding disableGutters>
                              <ListItemButton>
                                <ListItemText
                                  primary={<Skeleton width="160px" />}
                                  secondary={<Skeleton width="48px" />}
                                />
                              </ListItemButton>
                            </ListItem>
                          </Fragment>
                        ),
                      )}
                </AccordionDetails>
              </Accordion>
              <Divider />
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>Add all stocks from watchlist</AccordionSummary>
                <AccordionDetails>
                  {watchlistSummariesFinal
                    ? watchlistSummaries.map((watchlistSummary, index) => (
                        <Fragment key={watchlistSummary.id}>
                          {index ? <Divider /> : <></>}
                          <ListItem disablePadding disableGutters>
                            <ListItemButton
                              onClick={() =>
                                api
                                  .get(watchlistsEndpointPath + `/${watchlistSummary.id}`)
                                  .then((res) => addToSelection(res.data))
                                  .catch((e) =>
                                    setErrorNotificationOrClearSession(e, "adding stocks from watchlist to selection"),
                                  )
                              }
                            >
                              {watchlistSummary?.name === FAVORITES_NAME && (
                                <ListItemIcon>
                                  <Tooltip title="This is your Favorites watchlist." arrow>
                                    <StarsIcon color="warning" />
                                  </Tooltip>
                                </ListItemIcon>
                              )}
                              <ListItemText
                                inset={watchlistSummary?.name !== FAVORITES_NAME}
                                primary={watchlistSummary.name}
                                primaryTypographyProps={{ fontWeight: "bold" }}
                                secondary={
                                  (watchlistSummary.stocks.length || "No") +
                                  ` stock${pluralize(watchlistSummary.stocks.length)}`
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        </Fragment>
                      ))
                    : [...Array(3)].map(
                        // Render skeleton rows
                        (_, key) => (
                          <Fragment key={key}>
                            {key ? <Divider /> : <></>}
                            <ListItem disablePadding disableGutters>
                              <ListItemButton>
                                <ListItemText
                                  inset
                                  primary={<Skeleton width="160px" />}
                                  secondary={<Skeleton width="48px" />}
                                />
                              </ListItemButton>
                            </ListItem>
                          </Fragment>
                        ),
                      )}
                </AccordionDetails>
              </Accordion>
              <Divider />
              <Accordion slotProps={{ transition: { unmountOnExit: true } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>Select stocks manually</AccordionSummary>
                <AccordionDetails sx={{ ".MuiDialogContent-root": { overflowY: "hidden" } }}>
                  <SelectStock
                    title="Select a stock to add it to the portfolio"
                    onClose={() => {}}
                    onSelect={(stock) =>
                      setStocks((prevStocks) =>
                        [
                          ...prevStocks,
                          // If a stock does not have a size or style, set it to the "Small" size and "Blend" style
                          { ...stock, size: stock.size || "Small", style: stock.style || "Blend" },
                        ].sort((a, b) => a.ticker.localeCompare(b.ticker)),
                      )
                    }
                    disabledStocks={stocks}
                    stockDisabledReason="This stock is already part of the selection."
                    disablePadding
                  />
                </AccordionDetails>
              </Accordion>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" pb={2}>
              Selected stocks
            </Typography>
            {stocks.length ? (
              <>
                <List sx={{ pt: 0 }}>
                  {stocks.map((stock, index) => (
                    <Fragment key={stock.ticker}>
                      {index ? <Divider /> : <></>}
                      <StockPreview
                        stock={stock}
                        onDelete={() =>
                          setStocks((prevStocks) =>
                            prevStocks.filter((otherStock) => otherStock.ticker !== stock.ticker),
                          )
                        }
                        disableGutters
                      />
                    </Fragment>
                  ))}
                </List>
                <Typography variant="body2" component="span">
                  <Typography sx={{ fontWeight: "bold" }} variant="body1" component="span">
                    {stocks.length}
                  </Typography>{" "}
                  stock{pluralize(stocks.length)} selected.
                </Typography>
              </>
            ) : (
              <Typography textAlign="center" variant="subtitle1" py={3}>
                No Stocks
              </Typography>
            )}
          </Grid>
        </Grid>
      ),
    },
    {
      title: "Configure portfolio",
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" pb={2}>
              Define portfolio parameters:
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <CurrencyAutocomplete
                  value={currency ?? null}
                  onChange={(_, value) => isCurrency(value) && (setCurrency(value), setCurrencyError(false))}
                  error={currencyError}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ width: 30, mt: "1px" }}>
                        {currency || "…"}
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    inputMode: "decimal",
                    pattern: "\\d+(\\.\\d+)?",
                    step: Math.pow(10, -1 * currencyMinorUnits[currency || "…"]) || undefined,
                  }}
                  onChange={(event) => {
                    setTotalAmountInput(event.target.value.replaceAll(/[^0-9.]/g, ""));
                    setTotalAmountError(false);
                  }}
                  error={totalAmountError}
                  label="Total Amount"
                  value={totalAmountInput}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ width: 30, mt: "1px" }}>
                        {currency || "…"}
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    inputMode: "decimal",
                    pattern: "\\d+(\\.\\d+)?",
                    step: Math.pow(10, -1 * currencyMinorUnits[currency || "…"]) || undefined,
                  }}
                  onChange={(event) => {
                    setMinAmountInput(event.target.value.replaceAll(/[^0-9.]/g, ""));
                    setMinAmountError(false);
                  }}
                  error={minAmountError}
                  label="Smallest amount per stock"
                  value={minAmountInput}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ width: 30, mt: "1px" }}>
                        {currency || "…"}
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    inputMode: "decimal",
                    pattern: "\\d+(\\.\\d+)?",
                    step: Math.pow(10, -1 * currencyMinorUnits[currency || "…"]) || undefined,
                  }}
                  onChange={(event) => {
                    setTickInput(event.target.value.replaceAll(/[^0-9.]/g, ""));
                    setTickError(false);
                  }}
                  error={tickError}
                  label="Round amounts to multiples of"
                  value={tickInput}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl>
                  <FormLabel id="proportional-representation-algoritm-radio-buttons-group">
                    Proportional Representation Algorithm
                  </FormLabel>
                  <RadioGroup
                    aria-labelledby="proportional-representation-algoritm-radio-buttons-group"
                    value={proportionalRepresentationAlgorithm}
                    onChange={(_, value) =>
                      isProportionalRepresentationAlgorithm(value) && setProportionalRepresentationAlgorithm(value)
                    }
                    row
                  >
                    <FormControlLabel value="sainteLague" control={<Radio />} label="Sainte-Laguë/Schepers" />
                    <FormControlLabel value="hareNiemeyer" control={<Radio />} label="Hare/Niemeyer" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" pb={2}>
              Add constraints:
            </Typography>
            <Card elevation={0}>
              <CheckboxAccordion
                expanded={regionConstraintOpen}
                // Stocks always have a country, so the user can always configure region distribution
                onChange={(_, isExpanded) => setRegionConstraintOpen(isExpanded)}
                summary="Configure region distribution"
              >
                <Alert severity={regionConstraintsSum === 1 ? "success" : "error"} sx={{ mb: 2 }}>
                  Total: {formatPercentage(regionConstraintsSum, { fixed: 1 })}
                </Alert>
                {regionArray
                  .filter((region) => !disabledControls[region])
                  .map((region) => (
                    <Fragment key={region}>
                      <Typography variant="subtitle1">
                        {regionName[region]}:{" "}
                        <strong>{formatPercentage(regionConstraints[region], { fixed: 1 })}</strong>
                      </Typography>
                      <Box px={1}>
                        <Slider
                          value={regionConstraints[region]}
                          min={0}
                          max={1}
                          step={0.005}
                          onChange={(_, value: number) => {
                            if (value < minControlValues[region]) value = minControlValues[region];
                            if (value !== regionConstraints[region])
                              setRegionConstraints((prevConstraints) => ({ ...prevConstraints, [region]: value }));
                          }}
                        />
                      </Box>
                    </Fragment>
                  ))}
              </CheckboxAccordion>
              <Divider />
              <CheckboxAccordion
                expanded={sectorConstraintOpen}
                onChange={(_, isExpanded) => {
                  if (!sectorConstraintOpen && stocks.some((stock) => stock.industry === null)) {
                    // If a stock does not have a sector, prevent the user from configuring sector distribution
                    setNotification({
                      title: "Missing sector information",
                      message:
                        "Some stocks in the selection are missing sector information. " +
                        "You cannot configure sector distribution with these stocks selected: " +
                        stocks
                          .filter((stock) => stock.industry === null)
                          .map((stock) => `${stock.name} (${stock.ticker})`)
                          .join(", ") +
                        ".",
                      severity: "error",
                    });
                  } else setSectorConstraintOpen(isExpanded);
                }}
                summary="Configure sector distribution"
              >
                <Alert severity={sectorConstraintsSum === 1 ? "success" : "error"} sx={{ mb: 2 }}>
                  Total: {formatPercentage(sectorConstraintsSum, { fixed: 1 })}
                </Alert>
                {sectorArray
                  .filter((sector) => !disabledControls[sector])
                  .map((sector) => (
                    <Fragment key={sector}>
                      <Typography variant="subtitle1">
                        {sectorName[sector]}:{" "}
                        <strong>{formatPercentage(sectorConstraints[sector], { fixed: 1 })}</strong>
                      </Typography>
                      <Box px={1}>
                        <Slider
                          value={sectorConstraints[sector]}
                          min={0}
                          max={1}
                          step={0.005}
                          onChange={(_, value: number) => {
                            if (value < minControlValues[sector]) value = minControlValues[sector];
                            if (value !== sectorConstraints[sector])
                              setSectorConstraints((prevConstraints) => ({ ...prevConstraints, [sector]: value }));
                          }}
                        />
                      </Box>
                    </Fragment>
                  ))}
              </CheckboxAccordion>
              <Divider />
              <CheckboxAccordion
                expanded={sizeConstraintOpen}
                onChange={(_, isExpanded) => setSizeConstraintOpen(isExpanded)}
                summary="Configure size distribution"
              >
                <Alert severity={sizeConstraintsSum === 1 ? "success" : "error"} sx={{ mb: 2 }}>
                  Total: {formatPercentage(sizeConstraintsSum, { fixed: 1 })}
                </Alert>
                {sizeArray
                  .filter((size) => !disabledControls[size])
                  .map((size) => (
                    <Fragment key={size}>
                      <Typography variant="subtitle1">
                        {size}: <strong>{formatPercentage(sizeConstraints[size], { fixed: 1 })}</strong>
                      </Typography>
                      <Box px={1}>
                        <Slider
                          value={sizeConstraints[size]}
                          min={0}
                          max={1}
                          step={0.005}
                          onChange={(_, value: number) => {
                            if (value < minControlValues[size]) value = minControlValues[size];
                            if (value !== sizeConstraints[size])
                              setSizeConstraints((prevConstraints) => ({ ...prevConstraints, [size]: value }));
                          }}
                        />
                      </Box>
                    </Fragment>
                  ))}
              </CheckboxAccordion>
              <Divider />
              <CheckboxAccordion
                expanded={styleConstraintOpen}
                onChange={(_, isExpanded) => setStyleConstraintOpen(isExpanded)}
                summary="Configure style distribution"
              >
                <Alert severity={styleConstraintsSum === 1 ? "success" : "error"} sx={{ mb: 2 }}>
                  Total: {formatPercentage(styleConstraintsSum, { fixed: 1 })}
                </Alert>
                {styleArray
                  .filter((style) => !disabledControls[style])
                  .map((style) => (
                    <Fragment key={style}>
                      <Typography variant="subtitle1">
                        {style}: <strong>{formatPercentage(styleConstraints[style], { fixed: 1 })}</strong>
                      </Typography>
                      <Box px={1}>
                        <Slider
                          value={styleConstraints[style]}
                          min={0}
                          max={1}
                          step={0.005}
                          onChange={(_, value: number) => {
                            if (value < minControlValues[style]) value = minControlValues[style];
                            if (value !== styleConstraints[style])
                              setStyleConstraints((prevConstraints) => ({ ...prevConstraints, [style]: value }));
                          }}
                        />
                      </Box>
                    </Fragment>
                  ))}
              </CheckboxAccordion>
            </Card>
          </Grid>
        </Grid>
      ),
    },
    {
      title: "View results",
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" pb={2}>
              Computation results
            </Typography>
            <Alert severity={rse ? "warning" : "success"} sx={{ mb: 2 }}>
              <AlertTitle>{rse ? "Solution is not exact" : "Exact solution found"}</AlertTitle>
              {rse ? (
                <>
                  You may observe some deviations from the defined constraints. The Root Squared Error is{" "}
                  <ExponentialNumber decimal={rse} />.
                </>
              ) : (
                "All constraints were observed. Deviations from the target values are attributable to rounding errors."
              )}
            </Alert>
            <Box>
              <Typography variant="h5" mb={-3}>
                Amount distribution
              </Typography>
              <ScatterChart
                series={scatterData}
                xAxis={[
                  {
                    min: weightedStocks.reduce((min, stock) => Math.min(min, stock.amount), Infinity) - +minAmountInput,
                    max:
                      weightedStocks.reduce((max, stock) => Math.max(max, stock.amount), -Infinity) + +minAmountInput,
                    tickMinStep: +tickInput,
                    valueFormatter: (value) => `${currency} ${value.toFixed(currencyMinorUnits[currency])}`,
                  },
                ]}
                yAxis={[{ min: 0 }]}
                slotProps={{ legend: { hidden: true } }}
                height={200}
              />
            </Box>
            {regionConstraintOpen && (
              <Box pb={1}>
                <Typography variant="h5" pb={0.5}>
                  Region distribution
                </Typography>
                {regionArray
                  .filter((region) => !disabledControls[region])
                  .map((region) => (
                    <DiffProgressBar
                      key={region}
                      name={regionName[region]}
                      actual={regionResults[region]}
                      target={regionConstraints[region]}
                    />
                  ))}
              </Box>
            )}
            {sectorConstraintOpen && (
              <Box pb={1}>
                <Typography variant="h5" pb={0.5}>
                  Sector distribution
                </Typography>
                {sectorArray
                  .filter((sector) => !disabledControls[sector])
                  .map((sector) => (
                    <DiffProgressBar
                      key={sector}
                      name={sectorName[sector]}
                      actual={sectorResults[sector]}
                      target={sectorConstraints[sector]}
                    />
                  ))}
              </Box>
            )}
            {sizeConstraintOpen && (
              <Box pb={1}>
                <Typography variant="h5" pb={0.5}>
                  Size distribution
                </Typography>
                {sizeArray
                  .filter((size) => !disabledControls[size])
                  .map((size) => (
                    <DiffProgressBar key={size} name={size} actual={sizeResults[size]} target={sizeConstraints[size]} />
                  ))}
              </Box>
            )}
            {styleConstraintOpen && (
              <Box pb={1}>
                <Typography variant="h5" pb={0.5}>
                  Style distribution
                </Typography>
                {styleArray
                  .filter((style) => !disabledControls[style])
                  .map((style) => (
                    <DiffProgressBar
                      key={style}
                      name={style}
                      actual={styleResults[style]}
                      target={styleConstraints[style]}
                    />
                  ))}
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" pb={2}>
              Portfolio
            </Typography>
            <Card elevation={0}>
              <TableContainer sx={{ overscrollBehaviorX: "none" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ height: 52.5 }}>
                      {/* No Actions Menu */}
                      <TableCell sx={{ p: 0.25 }} />
                      {/* Amount in Portfolio */}
                      <TableCell>
                        <Tooltip title={<PropertyDescription property="amount" />} arrow>
                          <Box display="inline-block">Amount</Box>
                        </Tooltip>
                      </TableCell>
                      {/* Name and Logo */}
                      <TableCell>Stock</TableCell>
                      {/* Country and Region */}
                      <TableCell>
                        <Tooltip title={<PropertyDescription property="country" />} arrow>
                          <Box display="inline-block">Country</Box>
                        </Tooltip>
                      </TableCell>
                      {/* StyleBox */}
                      <TableCell>
                        <Tooltip title={<PropertyDescription property="size" />} arrow placement="top">
                          <Box display="inline-block">Size</Box>
                        </Tooltip>
                        <br />
                        <Tooltip title={<PropertyDescription property="style" />} arrow placement="bottom">
                          <Box display="inline-block">Style</Box>
                        </Tooltip>
                      </TableCell>
                      {/* Sector */}
                      <TableCell>
                        <Tooltip title={<PropertyDescription property="sector" />} arrow>
                          <Box display="inline-block">Sector</Box>
                        </Tooltip>
                      </TableCell>
                      {/* Industry */}
                      <TableCell>
                        <Tooltip title={<PropertyDescription property="industry" />} arrow>
                          <Box display="inline-block">Industry</Box>
                        </Tooltip>
                      </TableCell>
                      {/* Total Score */}
                      <TableCell>
                        <Tooltip title={<PropertyDescription property="totalScore" />} arrow>
                          <Box display="inline-block">Total</Box>
                        </Tooltip>
                      </TableCell>
                      {/* Financial Score */}
                      <TableCell>
                        <Tooltip title={<PropertyDescription property="financialScore" />} arrow>
                          <Box display="inline-block">Financial</Box>
                        </Tooltip>
                      </TableCell>
                      {/* ESG Score */}
                      <TableCell>
                        <Tooltip title={<PropertyDescription property="esgScore" />} arrow>
                          <Box display="inline-block">ESG</Box>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {weightedStocks.map((stock) => (
                      <StockRow
                        key={stock.ticker}
                        stock={stock}
                        columns={[
                          "Country",
                          "Size and Style",
                          "Sector",
                          "Industry",
                          "Total Score",
                          "Financial Score",
                          "ESG Score",
                        ]}
                        portfolio={{ currency, stocks: weightedStocks }}
                        hideActionsMenu
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      ),
    },
  ];

  return (
    <>
      <HeaderWrapper maxWidth={false}>
        <PortfolioBuilderHeader />
      </HeaderWrapper>
      <Container maxWidth={false}>
        <Card sx={{ m: "auto", mb: 2, px: 2, pb: 2 }}>
          <Stepper
            activeStep={activeStep}
            sx={{ background: "none" }}
            alternativeLabel={useMediaQuery(theme.breakpoints.down("md"))}
          >
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel>{step.title}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Grid container pb={2} justifyContent="space-between">
            <Grid item>
              {activeStep > 0 && (
                <Button onClick={() => setActiveStep((prevActiveStep) => prevActiveStep - 1)}>Back</Button>
              )}
            </Grid>
            <Grid item>
              {activeStep === 0 && (
                <Button
                  onClick={() => setStocks([])}
                  variant="text"
                  color="error"
                  sx={{ mr: 1, display: stocks.length ? undefined : "none" }}
                  startIcon={<ClearIcon />}
                >
                  Clear Stocks
                </Button>
              )}
              {activeStep === steps.length - 1 ? (
                <Button variant="contained" startIcon={<SaveIcon />} onClick={() => setUpdatePortfolioDialogOpen(true)}>
                  Save…
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => {
                    if (activeStep === 1) {
                      if (!validatePortfolioParameters()) return;
                      const { weightedStocks, rse } = computePortfolio(stocks, activeConstraints, {
                        totalAmount: +totalAmountInput,
                        minAmount: +minAmountInput,
                        tick: +tickInput,
                        proportionalRepresentationAlgorithm,
                      });
                      setWeightedStocks(weightedStocks);
                      setRSE(rse);
                    }
                    setActiveStep((prevActiveStep) => prevActiveStep + 1);
                  }}
                  // Validate input fields on hover
                  onMouseOver={() => activeStep === 1 && validatePortfolioParameters()}
                  disabled={activeStep === maxStep}
                >
                  Next
                </Button>
              )}
            </Grid>
          </Grid>
          {steps[activeStep].content}
          <PinnedDialog
            maxWidth="xs"
            open={updatePortfolioDialogOpen}
            onClose={() => setUpdatePortfolioDialogOpen(false)}
            TransitionComponent={fullScreenDialogs ? Slide : undefined}
            TransitionProps={{ direction: "up" } as SlideProps}
            fullScreen={fullScreenDialogs}
          >
            {!fullScreenDialogs && <Box width={444} />}
            <UpdateStocksInPortfolio
              portfolioRawData={{ currency, stocks: weightedStocks }}
              onClose={() => setUpdatePortfolioDialogOpen(false)}
              onUpdate={(id) => navigate(`${portfoliosEndpointPath}/${id}`)}
            />
          </PinnedDialog>
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default PortfolioBuilderModule;
