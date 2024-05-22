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
  useTheme,
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

import type { StockFilter } from "../../../types/StockFilter";
import { formatPercentage } from "../../../utils/formatters";
import { NestedCheckboxList } from "../../etc/NestedCheckboxList";
import { StarRating } from "../properties/StarRating";

export const StockTableFilters: FC<StockTableFiltersProps> = (props: StockTableFiltersProps): JSX.Element => {
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [columnFilterOpen, setColumnFilterOpen] = useState<boolean>(false);

  const [totalScoreInput, setTotalScoreInput] = useState<number[]>([0, 100]);
  const [financialScoreInput, setFinancialScoreInput] = useState<number[]>([0, 100]);
  const [esgScoreInput, setEsgScoreInput] = useState<number[]>([0, 100]);

  const [dividendYieldPercentInput, setDividendYieldPercentInput] = useState<number[]>([0, 20]);
  const [priceEarningRatioInput, setPriceEarningRatioInput] = useState<number[]>([0, 100]);

  const [starRatingInput, setStarRatingInput] = useState<number[]>([0, 5]);
  const [morningstarFairValueDiffInput, setMorningstarFairValueDiffInput] = useState<number[]>([-50, 50]);
  const [analystConsensusInput, setAnalystConsensusInput] = useState<(AnalystRating | "None")[]>(["None", "Buy"]);
  const [analystCountInput, setAnalystCountInput] = useState<number[]>([0, 60]);
  const [analystTargetDiffInput, setAnalystTargetDiffInput] = useState<number[]>([-50, 50]);

  const [msciESGRatingInput, setMSCIESGRatingInput] = useState<(MSCIESGRating | "None")[]>(["AAA", "None"]);
  const [msciTemperatureInput, setMSCITemperatureInput] = useState<number[]>([1.0, 4.0]);
  const [lsegESGScoreInput, setLSEGESGScoreInput] = useState<number[]>([0, 100]);
  const [lsegEmissionsInput, setLSEGEmissionsInput] = useState<number[]>([0, 100]);
  const [spESGScoreInput, setSPESGScoreInput] = useState<number[]>([0, 100]);
  const [sustainalyticsESGRiskInput, setSustainalyticsESGRiskInput] = useState<number[]>([0, 50]);

  const [countryInput, setCountryInput] = useState<Country[]>([]);

  const [industryInput, setIndustryInput] = useState<Industry[]>([]);

  const [styleboxInput, setStyleboxInput] = useState<{
    size?: Size;
    style?: Style;
  }>({});

  const theme = useTheme();

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
    case 0:
      // The screen is less than 664px wide.
      filterContainerWidth = 300;
      break;
  }

  /**
   * Applies the filters. If a filter is set to its default value (where it does not filter anything), it is not
   * included in the filter object.
   */
  const applyFilters = () => {
    props.setFilter({
      totalScoreMin: totalScoreInput[0] !== 0 ? totalScoreInput[0] : undefined,
      totalScoreMax: totalScoreInput[1] !== 100 ? totalScoreInput[1] : undefined,
      financialScoreMin: financialScoreInput[0] !== 0 ? financialScoreInput[0] : undefined,
      financialScoreMax: financialScoreInput[1] !== 100 ? financialScoreInput[1] : undefined,
      esgScoreMin: esgScoreInput[0] !== 0 ? esgScoreInput[0] : undefined,
      esgScoreMax: esgScoreInput[1] !== 100 ? esgScoreInput[1] : undefined,
      dividendYieldPercentMin: dividendYieldPercentInput[0] !== 0 ? dividendYieldPercentInput[0] : undefined,
      dividendYieldPercentMax: dividendYieldPercentInput[1] !== 20 ? dividendYieldPercentInput[1] : undefined,
      priceEarningRatioMin: priceEarningRatioInput[0] !== 0 ? priceEarningRatioInput[0] : undefined,
      priceEarningRatioMax: priceEarningRatioInput[1] !== 100 ? priceEarningRatioInput[1] : undefined,
      starRatingMin: starRatingInput[0] !== 0 ? starRatingInput[0] : undefined,
      starRatingMax: starRatingInput[1] !== 5 ? starRatingInput[1] : undefined,
      morningstarFairValueDiffMin:
        morningstarFairValueDiffInput[0] !== -50 ? morningstarFairValueDiffInput[0] : undefined,
      morningstarFairValueDiffMax:
        morningstarFairValueDiffInput[1] !== 50 ? morningstarFairValueDiffInput[1] : undefined,
      analystConsensusMin: analystConsensusInput[0] !== "None" ? analystConsensusInput[0] : undefined,
      analystConsensusMax:
        analystConsensusInput[1] !== "Buy" && analystConsensusInput[1] !== "None"
          ? analystConsensusInput[1]
          : undefined,
      analystCountMin: analystCountInput[0] !== 0 ? analystCountInput[0] : undefined,
      analystCountMax: analystCountInput[1] !== 60 ? analystCountInput[1] : undefined,
      analystTargetDiffMin: analystTargetDiffInput[0] !== -50 ? analystTargetDiffInput[0] : undefined,
      analystTargetDiffMax: analystTargetDiffInput[1] !== 50 ? analystTargetDiffInput[1] : undefined,
      msciESGRatingMin:
        msciESGRatingInput[0] !== "AAA" && msciESGRatingInput[0] !== "None" ? msciESGRatingInput[0] : undefined,
      msciESGRatingMax: msciESGRatingInput[1] !== "None" ? msciESGRatingInput[1] : undefined,
      msciTemperatureMin: msciTemperatureInput[0] !== 1.0 ? msciTemperatureInput[0] : undefined,
      msciTemperatureMax: msciTemperatureInput[1] !== 4.0 ? msciTemperatureInput[1] : undefined,
      lsegESGScoreMin: lsegESGScoreInput[0] !== 0 ? lsegESGScoreInput[0] : undefined,
      lsegESGScoreMax: lsegESGScoreInput[1] !== 100 ? lsegESGScoreInput[1] : undefined,
      lsegEmissionsMin: lsegEmissionsInput[0] !== 0 ? lsegEmissionsInput[0] : undefined,
      lsegEmissionsMax: lsegEmissionsInput[1] !== 100 ? lsegEmissionsInput[1] : undefined,
      spESGScoreMin: spESGScoreInput[0] !== 0 ? spESGScoreInput[0] : undefined,
      spESGScoreMax: spESGScoreInput[1] !== 100 ? spESGScoreInput[1] : undefined,
      sustainalyticsESGRiskMin: sustainalyticsESGRiskInput[0] !== 0 ? sustainalyticsESGRiskInput[0] : undefined,
      sustainalyticsESGRiskMax: sustainalyticsESGRiskInput[1] !== 50 ? sustainalyticsESGRiskInput[1] : undefined,
      countries: countryInput,
      industries: industryInput,
      size: styleboxInput.size,
      style: styleboxInput.style,
    });
  };

  return (
    <>
      <Tooltip arrow title="Filter stocks">
        <Box id="filter-stocks-label" display="inline-block" ml={1}>
          <IconButton aria-labelledby="filter-stocks-label" color="primary" onClick={() => setFilterOpen(true)}>
            <TuneIcon />
          </IconButton>
        </Box>
      </Tooltip>
      <Tooltip arrow title="Filter columns">
        <Box id="filter-columns-label" display="inline-block" ml={1}>
          <IconButton aria-labelledby="filter-columns-label" color="primary" onClick={() => setColumnFilterOpen(true)}>
            <FilterListIcon />
          </IconButton>
        </Box>
      </Tooltip>
      <Tooltip arrow title="Clear all filters">
        <Box id="clear-filters-label" display="inline-block" ml={props.filtersInUse ? 1 : 0}>
          <IconButton
            aria-labelledby="clear-filters-label"
            sx={{ display: !props.filtersInUse && "none" }}
            color="error"
            onClick={() => {
              // Reset all filters to their default values
              props.setFilter({});
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
          <Grid container width={filterContainerWidth} mb={2}>
            <Grid item width={300} order={1}>
              {/* Overall Scores */}
              <Typography variant="h4" px="24px" py="16px">
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
                  onChange={(_, newValue: number[]) => setTotalScoreInput(newValue)}
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
                  onChange={(_, newValue: number[]) => setFinancialScoreInput(newValue)}
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
                  onChange={(_, newValue: number[]) => setEsgScoreInput(newValue)}
                  valueLabelDisplay="auto"
                />
              </Box>
              {/* Core Financials */}
              <Typography variant="h4" px="24px" py="16px" pt="0px">
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
                  onChange={(_, newValue: number[]) => setDividendYieldPercentInput(newValue)}
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
                  onChange={(_, newValue: number[]) => setPriceEarningRatioInput(newValue)}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Grid>
            <Grid item order={filterContainerWidth === 600 ? 3 : 2}>
              {/* Financial Ratings */}
              <Typography variant="h4" px="24px" py="16px">
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
                  onChange={(_, newValue: number[]) => setStarRatingInput(newValue)}
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
                  onChange={(_, newValue: number[]) => setMorningstarFairValueDiffInput(newValue)}
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
                  onChange={(_, newValue: number[]) =>
                    setAnalystConsensusInput(
                      newValue.map((value) => (value === -1 ? "None" : analystRatingArray[value])),
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
                  onChange={(_, newValue: number[]) => setAnalystCountInput(newValue)}
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
                  onChange={(_, newValue: number[]) => setAnalystTargetDiffInput(newValue)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) =>
                    formatPercentage(value, { total: 100, precision: 2, forceSign: true, fallbackString: "0\u2009%" })
                  }
                />
              </Box>
            </Grid>
            <Grid item order={filterContainerWidth === 600 ? 4 : 3}>
              {/* ESG Ratings */}
              <Typography variant="h4" px="24px" py="16px">
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
                  onChange={(_, newValue: number[]) =>
                    setMSCIESGRatingInput(newValue.map((value) => (value === 7 ? "None" : msciESGRatingArray[value])))
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
                  onChange={(_, newValue: number[]) => setMSCITemperatureInput(newValue)}
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
                  onChange={(_, newValue: number[]) => setLSEGESGScoreInput(newValue)}
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
                  onChange={(_, newValue: number[]) => setLSEGEmissionsInput(newValue)}
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
                  onChange={(_, newValue: number[]) => setSPESGScoreInput(newValue)}
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
                  onChange={(_, newValue: number[]) => setSustainalyticsESGRiskInput(newValue)}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Grid>
            <Grid item order={filterContainerWidth === 600 ? 5 : 4}>
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
            <Grid item order={filterContainerWidth === 600 ? 6 : 5}>
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
            <Grid item order={filterContainerWidth === 600 ? 2 : 6}>
              {/* StyleBox */}
              <DialogTitle>
                <Typography variant="h4">Style</Typography>
              </DialogTitle>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Grid container columns={7} width="175px" ml="51.5px" mr="71.5px">
                  <Grid xs={1} item>
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
                    <Grid key={style} xs={2} item>
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
                        <Fragment key={"fragment" + size}>
                          <Grid key={size} xs={1} item>
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
                                xs={2}
                                sx={{
                                  backgroundColor:
                                    (styleboxInput.size == size || !styleboxInput.size) &&
                                    (styleboxInput.style == style || !styleboxInput.style) &&
                                    (styleboxInput.size || styleboxInput.style)
                                      ? theme.colors.alpha.black[100]
                                      : theme.colors.alpha.white[100],
                                  height: "50px",
                                  outline: `1px solid ${theme.colors.alpha.black[100]}`,
                                }}
                                onClick={() => setStyleboxInput({ size, style })}
                                item
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
          <Typography variant="h3" pb={2}>
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
                      inputProps={{ "aria-labelledby": `stock-list-column-${index}-label` }}
                      checked={props.columnFilter.includes(column)}
                      sx={{ p: 0 }}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={column} primaryTypographyProps={{ id: `stock-list-column-${index}-label` }} />
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
  setFilter: React.Dispatch<React.SetStateAction<StockFilter>>;
  columnFilter: StockListColumn[];
  setColumnFilter: React.Dispatch<React.SetStateAction<StockListColumn[]>>;
  filtersInUse: boolean;
}
