import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarsIcon from "@mui/icons-material/Stars";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
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
  Slider,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
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
} from "@rating-tracker/commons";
import {
  FAVORITES_NAME,
  currencyMinorUnits,
  groupOfIndustry,
  isCurrency,
  isRegion,
  isSector,
  isSize,
  isStyle,
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
import React, { Fragment, useEffect, useState } from "react";

import CurrencyAutocomplete from "../../../components/autocomplete/CurrencyAutocomplete";
import SelectStock from "../../../components/dialogs/stock/SelectStock";
import CheckboxAccordion from "../../../components/etc/CheckboxAccordion";
import { Footer } from "../../../components/etc/Footer";
import { HeaderWrapper } from "../../../components/etc/HeaderWrapper";
import { StockPreview } from "../../../components/stock/layouts/StockPreview";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import {
  isProportionalRepresentationAlgorithm,
  type ProportionalRepresentationAlgorithm,
} from "../../../types/ProportionalRepresentationAlgorithm";
import api from "../../../utils/api";
import { formatPercentage, pluralize } from "../../../utils/formatters";

import { PortfolioBuilderHeader } from "./PortfolioBuilderHeader";

/**
 * The default distribution of regions in a portfolio.
 */
const DEFAULT_REGION_DISTRIBUTION: Record<Region, number> = {
  NorthAmerica: 0.58,
  LatinAmerica: 0.01,
  UnitedKingdom: 0.08,
  Eurozone: 0.12,
  EuropeDeveloped: 0.08,
  EuropeEmerging: 0.01,
  AfricaME: 0.01,
  Japan: 0.05,
  AsiaDeveloped: 0.03,
  AsiaEmerging: 0.02,
  Australasia: 0.01,
};

/**
 * The default distribution of sectors in a portfolio.
 */
const DEFAULT_SECTOR_DISTRIBUTION: Record<Sector, number> = {
  BasicMaterials: 0.05,
  ConsumerCyclical: 0.1,
  FinancialServices: 0.11,
  RealEstate: 0.03,
  ConsumerDefensive: 0.06,
  Healthcare: 0.13,
  Utilities: 0.03,
  CommunicationServices: 0.06,
  Energy: 0.03,
  Industrials: 0.17,
  Technology: 0.23,
};

/**
 * The default distribution of sizes in a portfolio.
 */
const DEFAULT_SIZE_DISTRIBUTION: Record<Size, number> = {
  Large: 0.7,
  Mid: 0.2,
  Small: 0.1,
};

/**
 * The default distribution of styles in a portfolio.
 */
const DEFAULT_STYLE_DISTRIBUTION: Record<Style, number> = {
  Value: 0.2,
  Blend: 0.35,
  Growth: 0.45,
};

/**
 * A record of which controls are disabled because no stock with that property is selected.
 */
const disabledControls = {} as Record<Region | Sector | Size | Style, boolean>;

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
  const [regionConstraints, setRegionConstraints] = useState<Record<Region, number>>(DEFAULT_REGION_DISTRIBUTION);
  const [sectorConstraintOpen, setSectorConstraintOpen] = useState<boolean>(false);
  const [sectorConstraints, setSectorConstraints] = useState<Record<Sector, number>>(DEFAULT_SECTOR_DISTRIBUTION);
  const [sizeConstraintOpen, setSizeConstraintOpen] = useState<boolean>(false);
  const [sizeConstraints, setSizeConstraints] = useState<Record<Size, number>>(DEFAULT_SIZE_DISTRIBUTION);
  const [styleConstraintOpen, setStyleConstraintOpen] = useState<boolean>(false);
  const [styleConstraints, setStyleConstraints] = useState<Record<Style, number>>(DEFAULT_STYLE_DISTRIBUTION);
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
    // Set all controls to disabled by default
    [...regionArray, ...sectorArray, ...sizeArray, ...styleArray].forEach((key) => (disabledControls[key] = true));

    // Reset the constraints to the default values
    setRegionConstraints(DEFAULT_REGION_DISTRIBUTION);
    setSectorConstraints(DEFAULT_SECTOR_DISTRIBUTION);
    setSizeConstraints(DEFAULT_SIZE_DISTRIBUTION);
    setStyleConstraints(DEFAULT_STYLE_DISTRIBUTION);

    // Iterate over the stocks and enable all controls that have a stock with that property
    stocks.forEach((stock) => {
      if (stock.country) {
        const region = regionOfCountry[stock.country];
        if (disabledControls[region]) disabledControls[region] = false;
      }
      if (stock.industry) {
        const sector = sectorOfIndustryGroup[groupOfIndustry[stock.industry]];
        if (disabledControls[sector]) disabledControls[sector] = false;
      }
      if (stock.size && disabledControls[stock.size]) disabledControls[stock.size] = false;
      if (stock.style && disabledControls[stock.style]) disabledControls[stock.style] = false;
    });

    // Set the constraints of the disabled controls to 0
    Object.entries(disabledControls).forEach(([key, value]) => {
      if (value === true) {
        switch (true) {
          case isRegion(key):
            setRegionConstraints((prevConstraints) => ({ ...prevConstraints, [key]: 0 }));
            break;
          case isSector(key):
            setSectorConstraints((prevConstraints) => ({ ...prevConstraints, [key]: 0 }));
            break;
          case isSize(key):
            setSizeConstraints((prevConstraints) => ({ ...prevConstraints, [key]: 0 }));
            break;
          case isStyle(key):
            setStyleConstraints((prevConstraints) => ({ ...prevConstraints, [key]: 0 }));
            break;
        }
      }
    });
  }, [stocks]);

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
    // Smallest amount per stock must be a non-negative number and smaller than the total amount
    setMinAmountError(
      !minAmountInput || Number.isNaN(+minAmountInput) || +minAmountInput < 0 || +minAmountInput > +totalAmountInput,
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
        +minAmountInput > +totalAmountInput
      ) &&
      !(
        !tickInput ||
        Number.isNaN(+tickInput) ||
        +tickInput <= 0 ||
        +totalAmountInput / +tickInput !== Math.trunc(+totalAmountInput / +tickInput)
      )
    );
  };

  const maxStep =
    // Allow navigation to Configure Portfolio: at least one stock is selected
    stocks.length
      ? // Allow navigation to View Results:
        // - no disabled control must have a value greater than 0
        Object.entries({
          ...(regionConstraintOpen ? regionConstraints : {}),
          ...(sectorConstraintOpen ? sectorConstraints : {}),
          ...(sizeConstraintOpen ? sizeConstraints : {}),
          ...(styleConstraintOpen ? styleConstraints : {}),
        })
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, value]) => value > 0)
          .every(([key]) => !disabledControls[key]) &&
        // - the sum of all active constraint sets is 1
        (!regionConstraintOpen || regionConstraintsSum === 1) &&
        (!sectorConstraintOpen || sectorConstraintsSum === 1) &&
        (!sizeConstraintOpen || sizeConstraintsSum === 1) &&
        (!styleConstraintOpen || styleConstraintsSum === 1)
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
                      [...stocks].some((otherStock) => otherStock.ticker === stock.ticker)
                        ? setNotification({
                            title: "Stock already selected",
                            message: `The stock “${stock.name}” (${stock.ticker}) is already part of the selection.`,
                            severity: "warning",
                          })
                        : setStocks((prevStocks) =>
                            [
                              ...prevStocks,
                              // If a stock does not have a size or style, set it to the "Small" size and "Blend" style
                              { ...stock, size: stock.size || "Small", style: stock.style || "Blend" },
                            ].sort((a, b) => a.ticker.localeCompare(b.ticker)),
                          )
                    }
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
                  {[...stocks]
                    .sort((a, b) => a.ticker.localeCompare(b.ticker))
                    .map((stock, index) => (
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
                  Total: {formatPercentage(regionConstraintsSum, { precision: 4 })}
                </Alert>
                {regionArray
                  .filter((region) => !disabledControls[region])
                  .map((region) => (
                    <React.Fragment key={region}>
                      <Typography variant="subtitle1">
                        {regionName[region]}: <strong>{formatPercentage(regionConstraints[region])}</strong>
                      </Typography>
                      <Box px={1}>
                        <Slider
                          value={regionConstraints[region]}
                          min={0}
                          max={1}
                          step={0.005}
                          onChange={(_, value) =>
                            setRegionConstraints((prevConstraints) => ({ ...prevConstraints, [region]: value }))
                          }
                        />
                      </Box>
                    </React.Fragment>
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
                  Total: {formatPercentage(sectorConstraintsSum, { precision: 4 })}
                </Alert>
                {sectorArray
                  .filter((sector) => !disabledControls[sector])
                  .map((sector) => (
                    <React.Fragment key={sector}>
                      <Typography variant="subtitle1">
                        {sectorName[sector]}: <strong>{formatPercentage(sectorConstraints[sector])}</strong>
                      </Typography>
                      <Box px={1}>
                        <Slider
                          value={sectorConstraints[sector]}
                          min={0}
                          max={1}
                          step={0.005}
                          onChange={(_, value) =>
                            setSectorConstraints((prevConstraints) => ({ ...prevConstraints, [sector]: value }))
                          }
                        />
                      </Box>
                    </React.Fragment>
                  ))}
              </CheckboxAccordion>
              <Divider />
              <CheckboxAccordion
                expanded={sizeConstraintOpen}
                onChange={(_, isExpanded) => setSizeConstraintOpen(isExpanded)}
                summary="Configure size distribution"
              >
                <Alert severity={sizeConstraintsSum === 1 ? "success" : "error"} sx={{ mb: 2 }}>
                  Total: {formatPercentage(sizeConstraintsSum, { precision: 4 })}
                </Alert>
                {sizeArray
                  .filter((size) => !disabledControls[size])
                  .map((size) => (
                    <React.Fragment key={size}>
                      <Typography variant="subtitle1">
                        {size}: <strong>{formatPercentage(sizeConstraints[size])}</strong>
                      </Typography>
                      <Box px={1}>
                        <Slider
                          value={sizeConstraints[size]}
                          min={0}
                          max={1}
                          step={0.005}
                          onChange={(_, value) =>
                            setSizeConstraints((prevConstraints) => ({ ...prevConstraints, [size]: value }))
                          }
                        />
                      </Box>
                    </React.Fragment>
                  ))}
              </CheckboxAccordion>
              <Divider />
              <CheckboxAccordion
                expanded={styleConstraintOpen}
                onChange={(_, isExpanded) => setStyleConstraintOpen(isExpanded)}
                summary="Configure style distribution"
              >
                <Alert severity={styleConstraintsSum === 1 ? "success" : "error"} sx={{ mb: 2 }}>
                  Total: {formatPercentage(styleConstraintsSum, { precision: 4 })}
                </Alert>
                {styleArray
                  .filter((style) => !disabledControls[style])
                  .map((style) => (
                    <React.Fragment key={style}>
                      <Typography variant="subtitle1">
                        {style}: <strong>{formatPercentage(styleConstraints[style])}</strong>
                      </Typography>
                      <Box px={1}>
                        <Slider
                          value={styleConstraints[style]}
                          min={0}
                          max={1}
                          step={0.005}
                          onChange={(_, value) =>
                            setStyleConstraints((prevConstraints) => ({ ...prevConstraints, [style]: value }))
                          }
                        />
                      </Box>
                    </React.Fragment>
                  ))}
              </CheckboxAccordion>
            </Card>
          </Grid>
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
        </Grid>
      ),
    },
    {
      title: "View results",
      content: <>Hello</>,
    },
  ];

  return (
    <>
      <HeaderWrapper maxWidth={false}>
        <PortfolioBuilderHeader />
      </HeaderWrapper>
      <Container maxWidth={false}>
        <Card sx={{ m: "auto", mb: 2, px: 2, pb: 2, maxWidth: "lg" }}>
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
              <Button
                sx={{ visibility: activeStep === 0 ? "hidden" : undefined }}
                onClick={() => setActiveStep((prevActiveStep) => prevActiveStep - 1)}
              >
                Back
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                sx={{ visibility: activeStep === steps.length - 1 ? "hidden" : undefined }}
                onClick={() => {
                  if (activeStep === 1 && !validatePortfolioParameters()) return;
                  setActiveStep((prevActiveStep) => prevActiveStep + 1);
                }}
                onMouseOver={() => activeStep === 1 && validatePortfolioParameters()} // Validate input fields on hover
                disabled={
                  activeStep === maxStep ||
                  (activeStep === 1 && (currencyError || totalAmountError || minAmountError || tickError))
                }
              >
                Next
              </Button>
            </Grid>
          </Grid>
          {steps[activeStep].content}
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default PortfolioBuilderModule;
