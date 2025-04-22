import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import TableRowsIcon from "@mui/icons-material/TableRows";
import TuneIcon from "@mui/icons-material/Tune";
import {
  Box,
  Typography,
  Button,
  Grid,
  Tooltip,
  DialogTitle,
  IconButton,
  Slider,
  DialogContent,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  DialogActions,
  Divider,
  Drawer,
  useMediaQuery,
  FormControlLabel,
} from "@mui/material";
import type {
  AnalystRating,
  Country,
  Industry,
  IndustryGroup,
  MSCIESGRating,
  Region,
  Sector,
  Size,
  StockListColumn,
  Style,
  SuperRegion,
  SuperSector,
} from "@rating-tracker/commons";
import {
  analystRatingArray,
  countryNameWithFlag,
  getCountriesInRegion,
  getIndustriesInGroup,
  getIndustryGroupsInSector,
  getRegionsInSuperRegion,
  getSectorsInSuperSector,
  industryGroupName,
  industryName,
  msciESGRatingArray,
  regionName,
  sectorName,
  sizeArray,
  stockListColumnArray,
  styleArray,
  superRegionArray,
  superRegionName,
  superSectorArray,
  superSectorName,
} from "@rating-tracker/commons";
import type { FC } from "react";
import React, { Fragment, useState } from "react";
import { useSearchParams } from "react-router";

import useStockFilter from "../../../hooks/useStockFilter";
import { formatPercentage } from "../../../utils/formatters";
import { NestedCheckboxList } from "../../etc/NestedCheckboxList";
import { StarRating } from "../properties/StarRating";

export const StockTableFilters: FC<StockTableFiltersProps> = (props: StockTableFiltersProps): React.JSX.Element => {
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [columnFilterOpen, setColumnFilterOpen] = useState<boolean>(false);

  /**
   * The currently active filters.
   */
  const filter = useStockFilter();
  /**
   * Whether any filters or column filters are currently in use.
   */
  const filtersInUse = Object.keys(filter).length > 0 || props.columnFilter.length < stockListColumnArray.length;

  const [totalScoreInput, setTotalScoreInput] = useState<number[]>([
    100 * (filter.totalScoreMin ?? 0),
    100 * (filter.totalScoreMax ?? 1),
  ]);
  const [financialScoreInput, setFinancialScoreInput] = useState<number[]>([
    100 * (filter.financialScoreMin ?? 0),
    100 * (filter.financialScoreMax ?? 1),
  ]);
  const [esgScoreInput, setEsgScoreInput] = useState<number[]>([
    100 * (filter.esgScoreMin ?? 0),
    100 * (filter.esgScoreMax ?? 1),
  ]);

  const [dividendYieldPercentInput, setDividendYieldPercentInput] = useState<number[]>([
    filter.dividendYieldPercentMin ?? 0,
    filter.dividendYieldPercentMax ?? 20,
  ]);
  const [priceEarningRatioInput, setPriceEarningRatioInput] = useState<number[]>([
    filter.priceEarningRatioMin ?? 0,
    filter.priceEarningRatioMax ?? 100,
  ]);

  const [starRatingInput, setStarRatingInput] = useState<number[]>([
    filter.starRatingMin ?? 0,
    filter.starRatingMax ?? 5,
  ]);
  const [morningstarFairValueDiffInput, setMorningstarFairValueDiffInput] = useState<number[]>([
    filter.morningstarFairValueDiffMin ?? -50,
    filter.morningstarFairValueDiffMax ?? 50,
  ]);
  const [analystConsensusInput, setAnalystConsensusInput] = useState<(AnalystRating | "None")[]>([
    filter.analystConsensusMin ?? "None",
    filter.analystConsensusMax ?? "Buy",
  ]);
  const [analystCountInput, setAnalystCountInput] = useState<number[]>([
    filter.analystCountMin ?? 0,
    filter.analystCountMax ?? 60,
  ]);
  const [analystTargetDiffInput, setAnalystTargetDiffInput] = useState<number[]>([
    filter.analystTargetDiffMin ?? -50,
    filter.analystTargetDiffMax ?? 50,
  ]);

  const [msciESGRatingInput, setMSCIESGRatingInput] = useState<(MSCIESGRating | "None")[]>([
    filter.msciESGRatingMin ?? "AAA",
    filter.msciESGRatingMax ?? "None",
  ]);
  const [msciTemperatureInput, setMSCITemperatureInput] = useState<number[]>([
    filter.msciTemperatureMin ?? 1.0,
    filter.msciTemperatureMax ?? 4.0,
  ]);
  const [lsegESGScoreInput, setLSEGESGScoreInput] = useState<number[]>([
    filter.lsegESGScoreMin ?? 0,
    filter.lsegESGScoreMax ?? 100,
  ]);
  const [lsegEmissionsInput, setLSEGEmissionsInput] = useState<number[]>([
    filter.lsegEmissionsMin ?? 0,
    filter.lsegEmissionsMax ?? 100,
  ]);
  const [spESGScoreInput, setSPESGScoreInput] = useState<number[]>([
    filter.spESGScoreMin ?? 0,
    filter.spESGScoreMax ?? 100,
  ]);
  const [sustainalyticsESGRiskInput, setSustainalyticsESGRiskInput] = useState<number[]>([
    filter.sustainalyticsESGRiskMin ?? 0,
    filter.sustainalyticsESGRiskMax ?? 50,
  ]);

  const [countryInput, setCountryInput] = useState<Country[]>(filter.countries ?? []);

  const [industryInput, setIndustryInput] = useState<Industry[]>(filter.industries ?? []);

  const [styleboxInput, setStyleboxInput] = useState<{
    size?: Size;
    style?: Style;
  }>({ ...(filter.size ? { size: filter.size } : {}), ...(filter.style ? { style: filter.style } : {}) });

  const setSearchParams = useSearchParams()[1];

  /**
   * Possible widths for the filter container.
   */
  let filterContainerWidth: 900 | 600 | 300;

  switch (+useMediaQuery("(min-width:964px)") + +useMediaQuery("(min-width:664px)")) {
    case 2:
      // The screen is at least 964px wide.
      filterContainerWidth = 900;
      break;
    case 1:
      // The screen is at least 664px, but less than 964px wide.
      filterContainerWidth = 600;
      break;
    default:
      // The screen is less than 664px wide.
      filterContainerWidth = 300;
      break;
  }

  /**
   * Applies the filters. If a filter is set to its default value (where it does not filter anything), it is not
   * included in the filter object.
   */
  const applyFilters = () =>
    setSearchParams(() => {
      const params = new URLSearchParams([
        ...countryInput.map((country) => ["countries", country]),
        ...industryInput.map((industry) => ["industries", industry]),
      ]);
      if (totalScoreInput[0] !== 0) params.set("totalScoreMin", (0.01 * totalScoreInput[0]).toString());
      if (totalScoreInput[1] !== 100) params.set("totalScoreMax", (0.01 * totalScoreInput[1]).toString());
      if (financialScoreInput[0] !== 0) params.set("financialScoreMin", (0.01 * financialScoreInput[0]).toString());
      if (financialScoreInput[1] !== 100) params.set("financialScoreMax", (0.01 * financialScoreInput[1]).toString());
      if (esgScoreInput[0] !== 0) params.set("esgScoreMin", (0.01 * esgScoreInput[0]).toString());
      if (esgScoreInput[1] !== 100) params.set("esgScoreMax", (0.01 * esgScoreInput[1]).toString());
      if (dividendYieldPercentInput[0] !== 0)
        params.set("dividendYieldPercentMin", dividendYieldPercentInput[0].toString());
      if (dividendYieldPercentInput[1] !== 20)
        params.set("dividendYieldPercentMax", dividendYieldPercentInput[1].toString());
      if (priceEarningRatioInput[0] !== 0) params.set("priceEarningRatioMin", priceEarningRatioInput[0].toString());
      if (priceEarningRatioInput[1] !== 100) params.set("priceEarningRatioMax", priceEarningRatioInput[1].toString());
      if (starRatingInput[0] !== 0) params.set("starRatingMin", starRatingInput[0].toString());
      if (starRatingInput[1] !== 5) params.set("starRatingMax", starRatingInput[1].toString());
      if (morningstarFairValueDiffInput[0] !== -50)
        params.set("morningstarFairValueDiffMin", morningstarFairValueDiffInput[0].toString());
      if (morningstarFairValueDiffInput[1] !== 50)
        params.set("morningstarFairValueDiffMax", morningstarFairValueDiffInput[1].toString());
      if (analystConsensusInput[0] !== "None") params.set("analystConsensusMin", analystConsensusInput[0]);
      if (analystConsensusInput[1] !== "Buy" && analystConsensusInput[1] !== "None")
        params.set("analystConsensusMax", analystConsensusInput[1]);
      if (analystCountInput[0] !== 0) params.set("analystCountMin", analystCountInput[0].toString());
      if (analystCountInput[1] !== 60) params.set("analystCountMax", analystCountInput[1].toString());
      if (analystTargetDiffInput[0] !== -50) params.set("analystTargetDiffMin", analystTargetDiffInput[0].toString());
      if (analystTargetDiffInput[1] !== 50) params.set("analystTargetDiffMax", analystTargetDiffInput[1].toString());
      if (msciESGRatingInput[0] !== "AAA" && msciESGRatingInput[0] !== "None")
        params.set("msciESGRatingMin", msciESGRatingInput[0]);
      if (msciESGRatingInput[1] !== "None") params.set("msciESGRatingMax", msciESGRatingInput[1]);
      if (msciTemperatureInput[0] !== 1.0) params.set("msciTemperatureMin", msciTemperatureInput[0].toString());
      if (msciTemperatureInput[1] !== 4.0) params.set("msciTemperatureMax", msciTemperatureInput[1].toString());
      if (lsegESGScoreInput[0] !== 0) params.set("lsegESGScoreMin", lsegESGScoreInput[0].toString());
      if (lsegESGScoreInput[1] !== 100) params.set("lsegESGScoreMax", lsegESGScoreInput[1].toString());
      if (lsegEmissionsInput[0] !== 0) params.set("lsegEmissionsMin", lsegEmissionsInput[0].toString());
      if (lsegEmissionsInput[1] !== 100) params.set("lsegEmissionsMax", lsegEmissionsInput[1].toString());
      if (spESGScoreInput[0] !== 0) params.set("spESGScoreMin", spESGScoreInput[0].toString());
      if (spESGScoreInput[1] !== 100) params.set("spESGScoreMax", spESGScoreInput[1].toString());
      if (sustainalyticsESGRiskInput[0] !== 0)
        params.set("sustainalyticsESGRiskMin", sustainalyticsESGRiskInput[0].toString());
      if (sustainalyticsESGRiskInput[1] !== 50)
        params.set("sustainalyticsESGRiskMax", sustainalyticsESGRiskInput[1].toString());
      if (styleboxInput.size) params.set("size", styleboxInput.size);
      if (styleboxInput.style) params.set("style", styleboxInput.style);
      return params;
    });

  return (
    <>
      <Tooltip arrow title="Filter stocks">
        <Box id="filter-stocks-label" sx={{ display: "inline-block", ml: 1 }}>
          <IconButton aria-labelledby="filter-stocks-label" color="primary" onClick={() => setFilterOpen(true)}>
            <TuneIcon />
          </IconButton>
        </Box>
      </Tooltip>
      <Tooltip arrow title="Filter columns">
        <Box id="filter-columns-label" sx={{ display: "inline-block", ml: 1 }}>
          <IconButton aria-labelledby="filter-columns-label" color="primary" onClick={() => setColumnFilterOpen(true)}>
            <FilterListIcon />
          </IconButton>
        </Box>
      </Tooltip>
      <Tooltip arrow title="Clear all filters">
        <Box id="clear-filters-label" sx={{ display: "inline-block", ml: filtersInUse ? 1 : 0 }}>
          <IconButton
            aria-labelledby="clear-filters-label"
            sx={{ display: filtersInUse ? undefined : "none" }}
            color="error"
            onClick={() => {
              // Reset all filters to their default values
              setSearchParams(() => new URLSearchParams());
              props.setColumnFilter([...stockListColumnArray]);
              setTotalScoreInput([0, 100]);
              setFinancialScoreInput([0, 100]);
              setEsgScoreInput([0, 100]);
              setDividendYieldPercentInput([0, 20]);
              setPriceEarningRatioInput([0, 100]);
              setStarRatingInput([0, 5]);
              setMorningstarFairValueDiffInput([-50, 50]);
              setAnalystConsensusInput(["None", "Buy"]);
              setAnalystCountInput([0, 60]);
              setAnalystTargetDiffInput([-50, 50]);
              setMSCIESGRatingInput(["AAA", "None"]);
              setMSCITemperatureInput([1.0, 4.0]);
              setLSEGESGScoreInput([0, 100]);
              setLSEGEmissionsInput([0, 100]);
              setSPESGScoreInput([0, 100]);
              setSustainalyticsESGRiskInput([0, 50]);
              setStyleboxInput({});
              setCountryInput([]);
              setIndustryInput([]);
            }}
          >
            <ClearIcon />
          </IconButton>
        </Box>
      </Tooltip>
      <Drawer anchor="right" onClose={() => setFilterOpen(false)} open={filterOpen}>
        <DialogTitle>
          <Typography variant="h3">Filter Stocks</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0 }}>
          <Grid container sx={{ width: filterContainerWidth, mb: 2 }}>
            <Grid sx={{ width: 300, order: 1 }}>
              {/* Overall Scores */}
              <Typography variant="h4" sx={{ px: "24px", py: "16px" }}>
                Overall Scores
              </Typography>
              <Box sx={{ width: 300, px: "24px", pb: "20px" }}>
                {/* Total Score */}
                <Typography id="total-score-label" variant="h5">
                  Total Score
                </Typography>
                <Slider
                  aria-labelledby="total-score-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={totalScoreInput}
                  min={0}
                  max={100}
                  onChange={(_, newValue) => setTotalScoreInput(newValue as number[])}
                  valueLabelDisplay="auto"
                />
                {/* Financial Score */}
                <Typography id="financial-score-label" variant="h5">
                  Financial Score
                </Typography>
                <Slider
                  aria-labelledby="financial-score-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={financialScoreInput}
                  min={0}
                  max={100}
                  onChange={(_, newValue) => setFinancialScoreInput(newValue as number[])}
                  valueLabelDisplay="auto"
                />
                {/* ESG Score */}
                <Typography id="esg-score-label" variant="h5">
                  ESG Score
                </Typography>
                <Slider
                  aria-labelledby="esg-score-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={esgScoreInput}
                  min={0}
                  max={100}
                  onChange={(_, newValue) => setEsgScoreInput(newValue as number[])}
                  valueLabelDisplay="auto"
                />
              </Box>
              {/* Core Financials */}
              <Typography variant="h4" sx={{ px: "24px", py: "16px", pt: "0px" }}>
                Core Financials
              </Typography>
              <Box sx={{ width: 300, px: "24px", pb: "20px" }}>
                {/* Dividend Yield */}
                <Typography id="dividend-yield-label" variant="h5">
                  Dividend Yield
                </Typography>
                <Slider
                  aria-labelledby="dividend-yield-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={dividendYieldPercentInput}
                  min={0}
                  max={20}
                  step={0.5}
                  onChange={(_, newValue) => setDividendYieldPercentInput(newValue as number[])}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => formatPercentage(value, { total: 100, precision: 2 })}
                />
                {/* Price / Earning Ratio */}
                <Typography id="p-e-ratio-label" variant="h5">
                  Price / Earning Ratio
                </Typography>
                <Slider
                  aria-labelledby="p-e-ratio-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={priceEarningRatioInput}
                  min={0}
                  max={100}
                  onChange={(_, newValue) => setPriceEarningRatioInput(newValue as number[])}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Grid>
            <Grid sx={filterContainerWidth === 600 ? { order: 3 } : { order: 2 }}>
              {/* Financial Ratings */}
              <Typography variant="h4" sx={{ px: "24px", py: "16px" }}>
                Financial Ratings
              </Typography>
              <Box sx={{ width: 300, px: "24px", pb: "20px" }}>
                {/* Star Rating */}
                <Typography id="star-rating-label" variant="h5">
                  Star Rating
                </Typography>
                <Slider
                  aria-labelledby="star-rating-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={starRatingInput}
                  min={0}
                  max={5}
                  step={1}
                  marks
                  onChange={(_, newValue) => setStarRatingInput(newValue as number[])}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => (
                    <Box sx={{ fontSize: 12 }}>
                      <StarRating value={value} size="inherit" />
                    </Box>
                  )}
                />
                {/* Morningstar Fair Value Difference */}
                <Typography id="morningstar-fair-value-difference-label" variant="h5">
                  Morningstar Fair Value Difference
                </Typography>
                <Slider
                  aria-labelledby="morningstar-fair-value-difference-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={morningstarFairValueDiffInput}
                  min={-50}
                  max={50}
                  onChange={(_, newValue) => setMorningstarFairValueDiffInput(newValue as number[])}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) =>
                    formatPercentage(value, { total: 100, precision: 2, forceSign: true, fallbackString: "0\u2009%" })
                  }
                />
                {/* Analyst Consensus */}
                <Typography id="analyst-consensus-label" variant="h5">
                  Analyst Consensus
                </Typography>
                <Slider
                  aria-labelledby="analyst-consensus-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={analystConsensusInput.map((value) =>
                    value === "None" ? -1 : analystRatingArray.findIndex((element) => element === value),
                  )}
                  min={-1}
                  max={4}
                  step={1}
                  marks
                  onChange={(_, newValue) =>
                    setAnalystConsensusInput(
                      (newValue as number[]).map((value) => (value === -1 ? "None" : analystRatingArray[value])),
                    )
                  }
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => (value === -1 ? "None" : analystRatingArray[value])}
                />
                {/* Analyst Count */}
                <Typography id="analyst-count-label" variant="h5">
                  Analyst Count
                </Typography>
                <Slider
                  aria-labelledby="analyst-count-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={analystCountInput}
                  min={0}
                  max={60}
                  onChange={(_, newValue) => setAnalystCountInput(newValue as number[])}
                  valueLabelDisplay="auto"
                />
                {/* Analyst Target Difference */}
                <Typography id="analyst-target-difference-label" variant="h5">
                  Analyst Target Difference
                </Typography>
                <Slider
                  aria-labelledby="analyst-target-difference-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={analystTargetDiffInput}
                  min={-50}
                  max={50}
                  onChange={(_, newValue) => setAnalystTargetDiffInput(newValue as number[])}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) =>
                    formatPercentage(value, { total: 100, precision: 2, forceSign: true, fallbackString: "0\u2009%" })
                  }
                />
              </Box>
            </Grid>
            <Grid sx={filterContainerWidth === 600 ? { order: 4 } : { order: 3 }}>
              {/* ESG Ratings */}
              <Typography variant="h4" sx={{ px: "24px", py: "16px" }}>
                ESG Ratings
              </Typography>
              <Box sx={{ width: 300, px: "24px", pb: "20px" }}>
                {/* MSCI ESG Rating */}
                <Typography id="msci-esg-rating-label" variant="h5">
                  MSCI ESG Rating
                </Typography>
                <Slider
                  aria-labelledby="msci-esg-rating-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={msciESGRatingInput.map((value) =>
                    value === "None" ? 7 : msciESGRatingArray.findIndex((element) => element === value),
                  )}
                  min={0}
                  max={7}
                  step={1}
                  marks
                  onChange={(_, newValue) =>
                    setMSCIESGRatingInput(
                      (newValue as number[]).map((value) => (value === 7 ? "None" : msciESGRatingArray[value])),
                    )
                  }
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => (value === 7 ? "None" : msciESGRatingArray[value])}
                />
                {/* MSCI Implied Temperature Rise */}
                <Typography id="msci-implied-temperature-rise-label" variant="h5">
                  MSCI Implied Temperature Rise
                </Typography>
                <Slider
                  aria-labelledby="msci-implied-temperature-rise-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={msciTemperatureInput}
                  min={1}
                  max={4}
                  step={0.1}
                  onChange={(_, newValue) => setMSCITemperatureInput(newValue as number[])}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}\u2009℃`}
                />
                {/* LSEG ESG Score */}
                <Typography id="lseg-esg-score-label" variant="h5">
                  LSEG ESG Score
                </Typography>
                <Slider
                  aria-labelledby="lseg-esg-score-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={lsegESGScoreInput}
                  min={0}
                  max={100}
                  onChange={(_, newValue) => setLSEGESGScoreInput(newValue as number[])}
                  valueLabelDisplay="auto"
                />
                {/* LSEG Emissions Rating */}
                <Typography id="lseg-emissions-label" variant="h5">
                  LSEG Emissions
                </Typography>
                <Slider
                  aria-labelledby="lseg-emissions-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={lsegEmissionsInput}
                  min={0}
                  max={100}
                  onChange={(_, newValue) => setLSEGEmissionsInput(newValue as number[])}
                  valueLabelDisplay="auto"
                />
                {/* S&P ESG Score */}
                <Typography id="sp-esg-score-label" variant="h5">
                  S&P ESG Score
                </Typography>
                <Slider
                  aria-labelledby="sp-esg-score-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={spESGScoreInput}
                  min={0}
                  max={100}
                  onChange={(_, newValue) => setSPESGScoreInput(newValue as number[])}
                  valueLabelDisplay="auto"
                />
                {/* Sustainalytics ESG Risk */}
                <Typography id="sustainalytics-esg-risk-label" variant="h5">
                  Sustainalytics ESG Risk
                </Typography>
                <Slider
                  aria-labelledby="sustainalytics-esg-risk-label"
                  sx={{ width: "230px", ml: "10px", mr: "10px" }}
                  value={sustainalyticsESGRiskInput}
                  min={0}
                  max={50}
                  onChange={(_, newValue) => setSustainalyticsESGRiskInput(newValue as number[])}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Grid>
            <Grid sx={filterContainerWidth === 600 ? { order: 5 } : { order: 4 }}>
              {/* Region */}
              <DialogTitle>
                <Typography variant="h4">Region</Typography>
              </DialogTitle>
              <NestedCheckboxList<SuperRegion, Region, Country, never>
                firstLevelElements={superRegionArray}
                firstLevelLabels={superRegionName}
                getSecondLevelElements={getRegionsInSuperRegion}
                secondLevelLabels={regionName}
                getThirdLevelElements={getCountriesInRegion}
                thirdLevelLabels={countryNameWithFlag}
                height={180}
                selectedLastLevelElements={countryInput}
                setSelectedLastLevelElements={setCountryInput}
              />
            </Grid>
            <Grid sx={filterContainerWidth === 600 ? { order: 6 } : { order: 5 }}>
              {/* Industry */}
              <DialogTitle>
                <Typography variant="h4">Industry</Typography>
              </DialogTitle>
              <NestedCheckboxList<SuperSector, Sector, IndustryGroup, Industry>
                firstLevelElements={superSectorArray}
                firstLevelLabels={superSectorName}
                getSecondLevelElements={getSectorsInSuperSector}
                secondLevelLabels={sectorName}
                getThirdLevelElements={getIndustryGroupsInSector}
                thirdLevelLabels={industryGroupName}
                getFourthLevelElements={getIndustriesInGroup}
                fourthLevelLabels={industryName}
                height={180}
                selectedLastLevelElements={industryInput}
                setSelectedLastLevelElements={setIndustryInput}
              />
            </Grid>
            <Grid sx={filterContainerWidth === 600 ? { order: 2 } : { order: 6 }}>
              {/* StyleBox */}
              <DialogTitle>
                <Typography variant="h4">Style</Typography>
              </DialogTitle>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Grid container columns={7} sx={{ width: "175px", ml: "51.5px", mr: "71.5px" }}>
                  <Grid size={1}>
                    <Tooltip title="Clear selection" arrow>
                      <IconButton
                        sx={{
                          ml: "0px",
                          mr: "15px",
                          mb: "5px",
                          width: "20px",
                          height: "20px",
                          borderRadius: 20,
                          visibility: styleboxInput.size || styleboxInput.style ? "visible" : "hidden",
                        }}
                        onClick={() => setStyleboxInput({})}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  {styleArray.map((style) => (
                    <Grid key={style} size={2}>
                      <Tooltip title={`All ${style}`} arrow>
                        <IconButton
                          sx={{ ml: "15px", mr: "15px", mb: "5px", width: "20px", height: "20px", borderRadius: 20 }}
                          onClick={() => setStyleboxInput({ size: undefined, style: style })}
                        >
                          <ArrowDropDownIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  ))}
                  {Array.from(sizeArray)
                    .reverse()
                    .map((size) => {
                      return (
                        <Fragment key={`fragment${size}`}>
                          <Grid key={size} size={1}>
                            <Tooltip title={`All ${size}`} arrow>
                              <IconButton
                                sx={{
                                  mt: "15px",
                                  mb: "15px",
                                  mr: "5px",
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: 20,
                                }}
                                onClick={() => setStyleboxInput({ size, style: undefined })}
                              >
                                <ArrowRightIcon />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                          {styleArray.map((style) => (
                            <Tooltip title={`${size}-${style}`} key={`${size}-${style}`} arrow>
                              <Grid
                                size={2}
                                sx={(theme) => ({
                                  backgroundColor:
                                    (styleboxInput.size === size || !styleboxInput.size) &&
                                    (styleboxInput.style === style || !styleboxInput.style) &&
                                    (styleboxInput.size || styleboxInput.style)
                                      ? theme.palette.black.main
                                      : theme.palette.white.main,
                                  height: "50px",
                                  outline: `1px solid ${theme.palette.black.main}`,
                                })}
                                onClick={() => setStyleboxInput({ size, style })}
                              />
                            </Tooltip>
                          ))}
                        </Fragment>
                      );
                    })}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 0 }}>
          <Button
            onClick={() => {
              applyFilters();
              setFilterOpen(false);
            }}
            startIcon={<PublishedWithChangesIcon />}
            color="success"
            sx={{ borderRadius: 0 }}
            fullWidth
          >
            Apply
          </Button>
        </DialogActions>
      </Drawer>
      <Drawer anchor="right" onClose={() => setColumnFilterOpen(false)} open={columnFilterOpen}>
        <DialogTitle minWidth={300}>
          <Typography variant="h3" sx={{ pb: 2 }}>
            Filter Columns
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                indeterminate={props.columnFilter.length > 0 && props.columnFilter.length < stockListColumnArray.length}
                checked={props.columnFilter.length === stockListColumnArray.length}
                onChange={(event) => props.setColumnFilter(event.target.checked ? [...stockListColumnArray] : [])}
                sx={{ my: -1 }}
              />
            }
            label="Select All"
            slotProps={{ typography: { variant: "h4", pb: "1px" } }}
          />
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ px: 0, py: 1 }}>
          <List disablePadding>
            {stockListColumnArray.map((column, index) => (
              <ListItem key={column} dense>
                <ListItemButton
                  role={undefined}
                  onClick={() =>
                    props.setColumnFilter((prevColumnFilter) => [
                      ...prevColumnFilter.filter((prevColumn) => prevColumn !== column),
                      ...(prevColumnFilter.includes(column) ? [] : [column]),
                    ])
                  }
                  dense
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Checkbox
                      slotProps={{ input: { "aria-labelledby": `stock-list-column-${index}-label` } }}
                      checked={props.columnFilter.includes(column)}
                      sx={{ p: 0 }}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={column} slotProps={{ primary: { id: `stock-list-column-${index}-label` } }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 0 }}>
          <Button
            onClick={() => setColumnFilterOpen(false)}
            startIcon={<TableRowsIcon />}
            sx={{ borderRadius: 0 }}
            fullWidth
          >
            View Table
          </Button>
        </DialogActions>
      </Drawer>
    </>
  );
};

/**
 * Properties for the StockTableFilters component.
 */
export interface StockTableFiltersProps {
  columnFilter: StockListColumn[];
  setColumnFilter: React.Dispatch<React.SetStateAction<StockListColumn[]>>;
}
