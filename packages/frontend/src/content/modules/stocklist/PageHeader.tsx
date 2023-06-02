import {
  Box,
  Typography,
  Button,
  Grid,
  Tooltip,
  Dialog,
  DialogTitle,
  IconButton,
  useTheme,
  useMediaQuery,
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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import TuneIcon from "@mui/icons-material/Tune";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import TableRowsIcon from "@mui/icons-material/TableRows";
import { FC, useContext, useState } from "react";
import {
  Country,
  countryNameWithFlag,
  getCountriesInRegion,
  getIndustriesInGroup,
  getIndustryGroupsInSector,
  getRegionsInSuperRegion,
  getSectorsInSuperSector,
  Industry,
  IndustryGroup,
  industryGroupName,
  industryName,
  MSCIESGRating,
  msciESGRatingArray,
  Region,
  regionName,
  Sector,
  sectorName,
  Size,
  sizeArray,
  StockListColumn,
  stockListColumnArray,
  Style,
  styleArray,
  SuperRegion,
  superRegionArray,
  superRegionName,
  SuperSector,
  superSectorArray,
  superSectorName,
  WRITE_STOCKS_ACCESS,
} from "@rating-tracker/commons";
import React from "react";
import NestedCheckboxList from "../../../components/NestedCheckboxList";
import AddStock from "../../../components/dialogs/AddStock";
import StarRating from "../../../components/StarRating";
import { StockFilter } from "../../../types/StockFilter";
import { UserContext } from "../../../router";

/**
 * A header for the stock list page. It contains the stock list filters and column filter.
 *
 * @param {PageHeaderProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const PageHeader: FC<PageHeaderProps> = (props: PageHeaderProps): JSX.Element => {
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [columnFilterOpen, setColumnFilterOpen] = useState<boolean>(false);

  const [totalScoreInput, setTotalScoreInput] = useState<number[]>([0, 100]);
  const [financialScoreInput, setFinancialScoreInput] = useState<number[]>([0, 100]);
  const [esgScoreInput, setEsgScoreInput] = useState<number[]>([0, 100]);

  const [dividendYieldPercentInput, setDividendYieldPercentInput] = useState<number[]>([0, 20]);
  const [priceEarningRatioInput, setPriceEarningRatioInput] = useState<number[]>([0, 100]);

  const [starRatingInput, setStarRatingInput] = useState<number[]>([0, 5]);
  const [morningstarFairValueDiffInput, setMorningstarFairValueDiffInput] = useState<number[]>([-50, 50]);
  const [analystConsensusInput, setAnalystConsensusInput] = useState<number[]>([0, 10]);
  const [analystCountInput, setAnalystCountInput] = useState<number[]>([0, 60]);
  const [analystTargetDiffInput, setAnalystTargetDiffInput] = useState<number[]>([-50, 50]);

  const [msciESGRatingInput, setMSCIESGRatingInput] = useState<(MSCIESGRating | "None")[]>(["AAA", "None"]);
  const [msciTemperatureInput, setMSCITemperatureInput] = useState<number[]>([1.0, 4.0]);
  const [refinitivESGScoreInput, setRefinitivESGScoreInput] = useState<number[]>([0, 100]);
  const [refinitivEmissionsInput, setRefinitivEmissionsInput] = useState<number[]>([0, 100]);
  const [spESGScoreInput, setSPESGScoreInput] = useState<number[]>([0, 100]);
  const [sustainalyticsESGRiskInput, setSustainalyticsESGRiskInput] = useState<number[]>([0, 50]);

  const [countryInput, setCountryInput] = useState<Country[]>([]);

  const [industryInput, setIndustryInput] = useState<Industry[]>([]);

  const [styleboxInput, setStyleboxInput] = useState<{
    size?: Size;
    style?: Style;
  }>({});

  const [addStockOpen, setAddStockOpen] = useState<boolean>(false);

  const { user } = useContext(UserContext);

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
      analystConsensusMin: analystConsensusInput[0] !== 0 ? analystConsensusInput[0] : undefined,
      analystConsensusMax: analystConsensusInput[1] !== 10 ? analystConsensusInput[1] : undefined,
      analystCountMin: analystCountInput[0] !== 0 ? analystCountInput[0] : undefined,
      analystCountMax: analystCountInput[1] !== 60 ? analystCountInput[1] : undefined,
      analystTargetDiffMin: analystTargetDiffInput[0] !== -50 ? analystTargetDiffInput[0] : undefined,
      analystTargetDiffMax: analystTargetDiffInput[1] !== 50 ? analystTargetDiffInput[1] : undefined,
      msciESGRatingMin:
        msciESGRatingInput[0] !== "AAA" && msciESGRatingInput[0] !== "None" ? msciESGRatingInput[0] : undefined,
      msciESGRatingMax: msciESGRatingInput[1] !== "None" ? msciESGRatingInput[1] : undefined,
      msciTemperatureMin: msciTemperatureInput[0] !== 1.0 ? msciTemperatureInput[0] : undefined,
      msciTemperatureMax: msciTemperatureInput[1] !== 4.0 ? msciTemperatureInput[1] : undefined,
      refinitivESGScoreMin: refinitivESGScoreInput[0] !== 0 ? refinitivESGScoreInput[0] : undefined,
      refinitivESGScoreMax: refinitivESGScoreInput[1] !== 100 ? refinitivESGScoreInput[1] : undefined,
      refinitivEmissionsMin: refinitivEmissionsInput[0] !== 0 ? refinitivEmissionsInput[0] : undefined,
      refinitivEmissionsMax: refinitivEmissionsInput[1] !== 100 ? refinitivEmissionsInput[1] : undefined,
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

  const theme = useTheme();

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          Stock List
        </Typography>
        <Typography variant="subtitle2">
          This list shows all stocks currently available in the Rating Tracker.
        </Typography>
      </Grid>
      <Grid item ml="auto">
        <Tooltip
          arrow
          title={
            user.hasAccessRight(WRITE_STOCKS_ACCESS)
              ? "Add a new stock"
              : "You do not have the necessary access rights to create stocks."
          }
        >
          <Box display="inline-block" ml={1} mt={1}>
            <IconButton
              color="primary"
              onClick={() => setAddStockOpen(true)}
              disabled={!user.hasAccessRight(WRITE_STOCKS_ACCESS)}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Tooltip>
        <Tooltip arrow title="Filter stock list">
          <Box display="inline-block" ml={1} mt={1}>
            <IconButton color="primary" onClick={() => setFilterOpen(true)}>
              <TuneIcon />
            </IconButton>
          </Box>
        </Tooltip>
        <Tooltip arrow title="Filter columns">
          <Box display="inline-block" ml={1} mt={1}>
            <IconButton color="primary" onClick={() => setColumnFilterOpen(true)}>
              <FilterListIcon />
            </IconButton>
          </Box>
        </Tooltip>
        <Tooltip arrow title="Clear all filters">
          <Box display="inline-block" ml={1} mt={1}>
            <IconButton
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
                setAnalystConsensusInput([0, 10]);
                setAnalystCountInput([0, 60]);
                setAnalystTargetDiffInput([-50, 50]);
                setMSCIESGRatingInput(["AAA", "None"]);
                setMSCITemperatureInput([1.0, 4.0]);
                setRefinitivESGScoreInput([0, 100]);
                setRefinitivEmissionsInput([0, 100]);
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
        <Dialog maxWidth="lg" open={addStockOpen}>
          <AddStock onClose={() => (setAddStockOpen(false), props.triggerRefetch())} />
        </Dialog>
        <Dialog onClose={() => setFilterOpen(false)} open={filterOpen} maxWidth="lg">
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
                  <Typography variant="h5">Total Score</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={totalScoreInput}
                    min={0}
                    max={100}
                    onChange={(_, newValue: number[]) => setTotalScoreInput(newValue)}
                    valueLabelDisplay="auto"
                  />
                  {/* Financial Score */}
                  <Typography variant="h5">Financial Score</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={financialScoreInput}
                    min={0}
                    max={100}
                    onChange={(_, newValue: number[]) => setFinancialScoreInput(newValue)}
                    valueLabelDisplay="auto"
                  />
                  {/* ESG Score */}
                  <Typography variant="h5">ESG Score</Typography>
                  <Slider
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
                  <Typography variant="h5">Dividend Yield</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={dividendYieldPercentInput}
                    min={0}
                    max={20}
                    step={0.5}
                    onChange={(_, newValue: number[]) => setDividendYieldPercentInput(newValue)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}\u2009%`}
                  />
                  {/* Price / Earning Ratio */}
                  <Typography variant="h5">Price / Earning Ratio</Typography>
                  <Slider
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
                  <Typography variant="h5">Star Rating</Typography>
                  <Slider
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
                  <Typography variant="h5">Morningstar Fair Value Difference</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={morningstarFairValueDiffInput}
                    min={-50}
                    max={50}
                    onChange={(_, newValue: number[]) => setMorningstarFairValueDiffInput(newValue)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}\u2009%`}
                  />
                  {/* Analyst Consensus */}
                  <Typography variant="h5">Analyst Consensus</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={analystConsensusInput}
                    min={0}
                    max={10}
                    step={0.1}
                    onChange={(_, newValue: number[]) => setAnalystConsensusInput(newValue)}
                    valueLabelDisplay="auto"
                  />
                  {/* Analyst Count */}
                  <Typography variant="h5">Analyst Count</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={analystCountInput}
                    min={0}
                    max={60}
                    onChange={(_, newValue: number[]) => setAnalystCountInput(newValue)}
                    valueLabelDisplay="auto"
                  />
                  {/* Analyst Target Difference */}
                  <Typography variant="h5">Analyst Target Difference</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={analystTargetDiffInput}
                    min={-50}
                    max={50}
                    onChange={(_, newValue: number[]) => setAnalystTargetDiffInput(newValue)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}\u2009%`}
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
                  <Typography variant="h5">MSCI ESG Rating</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={msciESGRatingInput.map((value) =>
                      value === "None" ? 7 : msciESGRatingArray.findIndex((element) => element === value)
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
                  <Typography variant="h5">MSCI Implied Temperature Rise</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={msciTemperatureInput}
                    min={1}
                    max={4}
                    step={0.1}
                    onChange={(_, newValue: number[]) => setMSCITemperatureInput(newValue)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}\u2009℃`}
                  />
                  {/* Refinitiv ESG Score */}
                  <Typography variant="h5">Refinitiv ESG Score</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={refinitivESGScoreInput}
                    min={0}
                    max={100}
                    onChange={(_, newValue: number[]) => setRefinitivESGScoreInput(newValue)}
                    valueLabelDisplay="auto"
                  />
                  {/* Refinitiv Emissions Rating */}
                  <Typography variant="h5">Refinitiv Emissions</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={refinitivEmissionsInput}
                    min={0}
                    max={100}
                    onChange={(_, newValue: number[]) => setRefinitivEmissionsInput(newValue)}
                    valueLabelDisplay="auto"
                  />
                  {/* S&P ESG Score */}
                  <Typography variant="h5">S&P ESG Score</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={spESGScoreInput}
                    min={0}
                    max={100}
                    onChange={(_, newValue: number[]) => setSPESGScoreInput(newValue)}
                    valueLabelDisplay="auto"
                  />
                  {/* Sustainalytics ESG Risk */}
                  <Typography variant="h5">Sustainalytics ESG Risk</Typography>
                  <Slider
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
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
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
                            sx={{
                              ml: "15px",
                              mr: "15px",
                              mb: "5px",
                              width: "20px",
                              height: "20px",
                              borderRadius: 20,
                            }}
                            onClick={() =>
                              setStyleboxInput({
                                size: undefined,
                                style: style,
                              })
                            }
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
                          <React.Fragment key={"fragment" + size}>
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
                                  onClick={() =>
                                    setStyleboxInput({
                                      size: size,
                                      style: undefined,
                                    })
                                  }
                                >
                                  <ArrowRightIcon />
                                </IconButton>
                              </Tooltip>
                            </Grid>
                            {styleArray.map((style) => (
                              <Tooltip title={`${size}-${style}`} key={size + style} arrow>
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
                                  onClick={() =>
                                    setStyleboxInput({
                                      size: size,
                                      style: style,
                                    })
                                  }
                                  item
                                />
                              </Tooltip>
                            ))}
                          </React.Fragment>
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
              sx={{ width: "100%", borderRadius: 0 }}
            >
              Apply
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog onClose={() => setColumnFilterOpen(false)} open={columnFilterOpen}>
          <DialogTitle minWidth={300}>
            <Typography variant="h3" pb={2}>
              Filter Columns
            </Typography>
            <Button sx={{ width: "50%", pb: 1 }} onClick={() => props.setColumnFilter([])}>
              Deselect All
            </Button>
            <Button sx={{ width: "50%", pb: 1 }} onClick={() => props.setColumnFilter([...stockListColumnArray])}>
              Select All
            </Button>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ py: 1 }}>
            <List disablePadding>
              {stockListColumnArray.map((column) => {
                return (
                  <ListItem key={column} sx={{ px: 0 }} dense>
                    <ListItemButton
                      role={undefined}
                      onClick={() =>
                        props.setColumnFilter((prevColumnFilter) => [
                          ...prevColumnFilter.filter((prevColumn) => prevColumn !== column),
                          ...(prevColumnFilter.includes(column) ? [] : [column]),
                        ])
                      }
                      sx={{ px: 0 }}
                      dense
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Checkbox checked={props.columnFilter.includes(column)} sx={{ p: 0 }} disableRipple />
                      </ListItemIcon>
                      <ListItemText primary={column} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </DialogContent>
          <DialogActions sx={{ p: 0 }}>
            <Button
              onClick={() => {
                setColumnFilterOpen(false);
              }}
              startIcon={<TableRowsIcon />}
              sx={{ width: "100%", borderRadius: 0 }}
            >
              View Table
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Grid>
  );
};

interface PageHeaderProps {
  setFilter: React.Dispatch<React.SetStateAction<StockFilter>>;
  columnFilter: StockListColumn[];
  setColumnFilter: React.Dispatch<React.SetStateAction<StockListColumn[]>>;
  filtersInUse: boolean;
  triggerRefetch: () => void;
}

export default PageHeader;
