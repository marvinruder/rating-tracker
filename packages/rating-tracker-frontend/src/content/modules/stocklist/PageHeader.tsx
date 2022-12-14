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
import { FC, useState } from "react";
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
  Style,
  styleArray,
  SuperRegion,
  superRegionArray,
  superRegionName,
  SuperSector,
  superSectorArray,
  superSectorName,
} from "rating-tracker-commons";
import React from "react";
import NestedCheckboxList from "../../../components/NestedCheckboxList";
import AddStock from "../../../components/AddStock";
import StarRating from "../../../components/StarRating";
import { stockListColumnArray } from "rating-tracker-commons";

const PageHeader: FC<PageHeaderProps> = (props: PageHeaderProps) => {
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [columnFilterOpen, setColumnFilterOpen] = useState<boolean>(false);

  const [totalScoreInput, setTotalScoreInput] = useState<number[]>([0, 100]);
  const [financialScoreInput, setFinancialScoreInput] = useState<number[]>([
    0, 100,
  ]);
  const [esgScoreInput, setEsgScoreInput] = useState<number[]>([0, 100]);

  const [dividendYieldPercentInput, setDividendYieldPercentInput] = useState<
    number[]
  >([0, 20]);
  const [priceEarningRatioInput, setPriceEarningRatioInput] = useState<
    number[]
  >([0, 100]);

  const [starRatingInput, setStarRatingInput] = useState<number[]>([0, 5]);
  const [morningstarFairValueDiffInput, setMorningstarFairValueDiffInput] =
    useState<number[]>([-50, 50]);
  const [analystConsensusInput, setAnalystConsensusInput] = useState<number[]>([
    0, 10,
  ]);
  const [analystCountInput, setAnalystCountInput] = useState<number[]>([0, 60]);
  const [analystTargetDiffInput, setAnalystTargetDiffInput] = useState<
    number[]
  >([-50, 50]);

  const [msciESGRatingInput, setMsciESGRatingInput] = useState<
    (MSCIESGRating | "None")[]
  >(["AAA", "None"]);
  const [msciTemperatureInput, setMsciTemperatureInput] = useState<number[]>([
    1.0, 4.0,
  ]);
  const [refinitivESGScoreInput, setRefinitivESGScoreInput] = useState<
    number[]
  >([0, 100]);
  const [refinitivEmissionsInput, setRefinitivEmissionsInput] = useState<
    number[]
  >([0, 100]);
  const [spESGScoreInput, setSpESGScoreInput] = useState<number[]>([0, 100]);
  const [sustainalyticsESGRiskInput, setSustainalyticsESGRiskInput] = useState<
    number[]
  >([0, 50]);

  const [countryInput, setCountryInput] = useState<Country[]>([]);

  const [industryInput, setIndustryInput] = useState<Industry[]>([]);

  const [styleboxInput, setStyleboxInput] = useState<{
    size?: Size;
    style?: Style;
  }>({});

  const [addStockOpen, setAddStockOpen] = useState<boolean>(false);

  let filterContainerWidth: 900 | 600 | 300;

  switch (
    +useMediaQuery("(min-width:964px)") + +useMediaQuery("(min-width:664px)")
  ) {
    case 2:
      filterContainerWidth = 900;
      break;
    case 1:
      filterContainerWidth = 600;
      break;
    case 0:
      filterContainerWidth = 300;
      break;
  }

  const applyFiltersUsingState = () => {
    props.applyFilters(
      totalScoreInput[0] !== 0 ? totalScoreInput[0] : undefined,
      totalScoreInput[1] !== 100 ? totalScoreInput[1] : undefined,
      financialScoreInput[0] !== 0 ? financialScoreInput[0] : undefined,
      financialScoreInput[1] !== 100 ? financialScoreInput[1] : undefined,
      esgScoreInput[0] !== 0 ? esgScoreInput[0] : undefined,
      esgScoreInput[1] !== 100 ? esgScoreInput[1] : undefined,
      dividendYieldPercentInput[0] !== 0
        ? dividendYieldPercentInput[0]
        : undefined,
      dividendYieldPercentInput[1] !== 20
        ? dividendYieldPercentInput[1]
        : undefined,
      priceEarningRatioInput[0] !== 0 ? priceEarningRatioInput[0] : undefined,
      priceEarningRatioInput[1] !== 100 ? priceEarningRatioInput[1] : undefined,
      starRatingInput[0] !== 0 ? starRatingInput[0] : undefined,
      starRatingInput[1] !== 5 ? starRatingInput[1] : undefined,
      morningstarFairValueDiffInput[0] !== -50
        ? morningstarFairValueDiffInput[0]
        : undefined,
      morningstarFairValueDiffInput[1] !== 50
        ? morningstarFairValueDiffInput[1]
        : undefined,
      analystConsensusInput[0] !== 0 ? analystConsensusInput[0] : undefined,
      analystConsensusInput[1] !== 10 ? analystConsensusInput[1] : undefined,
      analystCountInput[0] !== 0 ? analystCountInput[0] : undefined,
      analystCountInput[1] !== 60 ? analystCountInput[1] : undefined,
      analystTargetDiffInput[0] !== -50 ? analystTargetDiffInput[0] : undefined,
      analystTargetDiffInput[1] !== 50 ? analystTargetDiffInput[1] : undefined,
      msciESGRatingInput[0] !== "AAA" && msciESGRatingInput[0] !== "None"
        ? msciESGRatingInput[0]
        : undefined,
      msciESGRatingInput[1] !== "None" ? msciESGRatingInput[1] : undefined,
      msciTemperatureInput[0] !== 1.0 ? msciTemperatureInput[0] : undefined,
      msciTemperatureInput[1] !== 4.0 ? msciTemperatureInput[1] : undefined,
      refinitivESGScoreInput[0] !== 0 ? refinitivESGScoreInput[0] : undefined,
      refinitivESGScoreInput[1] !== 100 ? refinitivESGScoreInput[1] : undefined,
      refinitivEmissionsInput[0] !== 0 ? refinitivEmissionsInput[0] : undefined,
      refinitivEmissionsInput[1] !== 100
        ? refinitivEmissionsInput[1]
        : undefined,
      spESGScoreInput[0] !== 0 ? spESGScoreInput[0] : undefined,
      spESGScoreInput[1] !== 100 ? spESGScoreInput[1] : undefined,
      sustainalyticsESGRiskInput[0] !== 0
        ? sustainalyticsESGRiskInput[0]
        : undefined,
      sustainalyticsESGRiskInput[1] !== 50
        ? sustainalyticsESGRiskInput[1]
        : undefined,
      countryInput,
      industryInput,
      styleboxInput.size,
      styleboxInput.style
    );
  };

  const theme = useTheme();

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          Stock List
        </Typography>
        <Typography variant="subtitle2">
          This list shows all stocks currently available in this service
        </Typography>
      </Grid>
      <Grid item ml="auto">
        <IconButton
          sx={{ ml: 1, mt: 1 }}
          color="primary"
          onClick={() => setAddStockOpen(true)}
        >
          <AddIcon />
        </IconButton>
        <IconButton
          sx={{ ml: 1, mt: 1 }}
          color="primary"
          onClick={() => setFilterOpen(true)}
        >
          <TuneIcon />
        </IconButton>
        <IconButton
          sx={{ ml: 1, mt: 1 }}
          color="primary"
          onClick={() => setColumnFilterOpen(true)}
        >
          <FilterListIcon />
        </IconButton>
        <IconButton
          sx={{ display: !props.filtersInUse && "none", ml: 1, mt: 1 }}
          color="error"
          onClick={() => {
            props.applyFilters();
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
            setMsciESGRatingInput(["AAA", "None"]);
            setMsciTemperatureInput([1.0, 4.0]);
            setRefinitivESGScoreInput([0, 100]);
            setRefinitivEmissionsInput([0, 100]);
            setSpESGScoreInput([0, 100]);
            setSustainalyticsESGRiskInput([0, 50]);
            setStyleboxInput({});
            setCountryInput([]);
            setIndustryInput([]);
          }}
        >
          <ClearIcon />
        </IconButton>
        <Dialog maxWidth="lg" open={addStockOpen}>
          <AddStock
            onClose={() => (setAddStockOpen(false), props.triggerRefetch())}
          />
        </Dialog>
        <Dialog
          onClose={() => setFilterOpen(false)}
          open={filterOpen}
          maxWidth="lg"
        >
          <DialogTitle>
            <Typography variant="h3">Filter Stocks</Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 0 }}>
            <Grid container width={filterContainerWidth} mb={2}>
              <Grid item width={300} order={1}>
                <Typography variant="h4" px="24px" py="16px">
                  Overall Scores
                </Typography>
                <Box sx={{ width: 300, px: "24px", pb: "20px" }}>
                  <Typography variant="h5">Total Score</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={totalScoreInput}
                    min={0}
                    max={100}
                    onChange={(_, newValue: number[]) =>
                      setTotalScoreInput(newValue)
                    }
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="h5">Financial Score</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={financialScoreInput}
                    min={0}
                    max={100}
                    onChange={(_, newValue: number[]) =>
                      setFinancialScoreInput(newValue)
                    }
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="h5">ESG Score</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={esgScoreInput}
                    min={0}
                    max={100}
                    onChange={(_, newValue: number[]) =>
                      setEsgScoreInput(newValue)
                    }
                    valueLabelDisplay="auto"
                  />
                </Box>
                <Typography variant="h4" px="24px" py="16px" pt="0px">
                  Core Financials
                </Typography>
                <Box sx={{ width: 300, px: "24px", pb: "20px" }}>
                  <Typography variant="h5">Dividend Yield</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={dividendYieldPercentInput}
                    min={0}
                    max={20}
                    step={0.5}
                    onChange={(_, newValue: number[]) =>
                      setDividendYieldPercentInput(newValue)
                    }
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}\u2009%`}
                  />
                  <Typography variant="h5">Price / Earning Ratio</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={priceEarningRatioInput}
                    min={0}
                    max={100}
                    onChange={(_, newValue: number[]) =>
                      setPriceEarningRatioInput(newValue)
                    }
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Grid>
              <Grid item order={filterContainerWidth === 600 ? 3 : 2}>
                <Typography variant="h4" px="24px" py="16px">
                  Financial Ratings
                </Typography>
                <Box sx={{ width: 300, px: "24px", pb: "20px" }}>
                  <Typography variant="h5">Star Rating</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={starRatingInput}
                    min={0}
                    max={5}
                    step={1}
                    marks
                    onChange={(_, newValue: number[]) =>
                      setStarRatingInput(newValue)
                    }
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => (
                      <Box sx={{ fontSize: 12 }}>
                        <StarRating value={value} size="inherit" />
                      </Box>
                    )}
                  />
                  <Typography variant="h5">
                    Morningstar Fair Value Difference
                  </Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={morningstarFairValueDiffInput}
                    min={-50}
                    max={50}
                    onChange={(_, newValue: number[]) =>
                      setMorningstarFairValueDiffInput(newValue)
                    }
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}\u2009%`}
                  />
                  <Typography variant="h5">Analyst Consensus</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={analystConsensusInput}
                    min={0}
                    max={10}
                    step={0.1}
                    onChange={(_, newValue: number[]) =>
                      setAnalystConsensusInput(newValue)
                    }
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="h5">Analyst Count</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={analystCountInput}
                    min={0}
                    max={60}
                    onChange={(_, newValue: number[]) =>
                      setAnalystCountInput(newValue)
                    }
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="h5">
                    Analyst Target Difference
                  </Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={analystTargetDiffInput}
                    min={-50}
                    max={50}
                    onChange={(_, newValue: number[]) =>
                      setAnalystTargetDiffInput(newValue)
                    }
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}\u2009%`}
                  />
                </Box>
              </Grid>
              <Grid item order={filterContainerWidth === 600 ? 4 : 3}>
                <Typography variant="h4" px="24px" py="16px">
                  ESG Ratings
                </Typography>
                <Box sx={{ width: 300, px: "24px", pb: "20px" }}>
                  <Typography variant="h5">MSCI ESG Rating</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={msciESGRatingInput.map((value) =>
                      value === "None"
                        ? 7
                        : msciESGRatingArray.findIndex(
                            (element) => element === value
                          )
                    )}
                    min={0}
                    max={7}
                    step={1}
                    marks
                    onChange={(_, newValue: number[]) =>
                      setMsciESGRatingInput(
                        newValue.map((value) =>
                          value === 7 ? "None" : msciESGRatingArray[value]
                        )
                      )
                    }
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) =>
                      value === 7 ? "None" : msciESGRatingArray[value]
                    }
                  />
                  <Typography variant="h5">
                    MSCI Implied Temperature Rise
                  </Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={msciTemperatureInput}
                    min={1}
                    max={4}
                    step={0.1}
                    onChange={(_, newValue: number[]) =>
                      setMsciTemperatureInput(newValue)
                    }
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="h5">Refinitiv ESG Score</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={refinitivESGScoreInput}
                    min={0}
                    max={100}
                    onChange={(_, newValue: number[]) =>
                      setRefinitivESGScoreInput(newValue)
                    }
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="h5">Refinitiv Emissions</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={refinitivEmissionsInput}
                    min={0}
                    max={100}
                    onChange={(_, newValue: number[]) =>
                      setRefinitivEmissionsInput(newValue)
                    }
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="h5">S&P ESG Score</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={spESGScoreInput}
                    min={0}
                    max={100}
                    onChange={(_, newValue: number[]) =>
                      setSpESGScoreInput(newValue)
                    }
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="h5">Sustainalytics ESG Risk</Typography>
                  <Slider
                    sx={{ width: "230px", ml: "10px", mr: "10px" }}
                    value={sustainalyticsESGRiskInput}
                    min={0}
                    max={50}
                    onChange={(_, newValue: number[]) =>
                      setSustainalyticsESGRiskInput(newValue)
                    }
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Grid>
              <Grid item order={filterContainerWidth === 600 ? 5 : 4}>
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
                <DialogTitle>
                  <Typography variant="h4">Industry</Typography>
                </DialogTitle>
                <NestedCheckboxList<
                  SuperSector,
                  Sector,
                  IndustryGroup,
                  Industry
                >
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
                <DialogTitle>
                  <Typography variant="h4">Style</Typography>
                </DialogTitle>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Grid
                    container
                    columns={7}
                    width="175px"
                    ml="51.5px"
                    mr="71.5px"
                  >
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
                            visibility:
                              styleboxInput.size || styleboxInput.style
                                ? "visible"
                                : "hidden",
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
                              <Tooltip
                                title={`${size}-${style}`}
                                key={size + style}
                                arrow
                              >
                                <Grid
                                  xs={2}
                                  sx={{
                                    backgroundColor:
                                      (styleboxInput.size == size ||
                                        !styleboxInput.size) &&
                                      (styleboxInput.style == style ||
                                        !styleboxInput.style) &&
                                      (styleboxInput.size ||
                                        styleboxInput.style)
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
                applyFiltersUsingState();
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
        <Dialog
          onClose={() => setColumnFilterOpen(false)}
          open={columnFilterOpen}
        >
          <DialogTitle minWidth={300}>
            <Typography variant="h3" pb={2}>
              Filter Columns
            </Typography>
            <Button
              sx={{ width: "50%", pb: 1 }}
              onClick={() => props.setColumnFilter([])}
            >
              Deselect All
            </Button>
            <Button
              sx={{ width: "50%", pb: 1 }}
              onClick={() => props.setColumnFilter([...stockListColumnArray])}
            >
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
                          ...prevColumnFilter.filter(
                            (prevColumn) => prevColumn !== column
                          ),
                          ...(prevColumnFilter.includes(column)
                            ? []
                            : [column]),
                        ])
                      }
                      sx={{ px: 0 }}
                      dense
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Checkbox
                          checked={props.columnFilter.includes(column)}
                          sx={{ p: 0 }}
                          disableRipple
                        />
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
  applyFilters: (
    totalScoreMin?: number,
    totalScoreMax?: number,
    financialScoreMin?: number,
    financialScoreMax?: number,
    esgScoreMin?: number,
    esgScoreMax?: number,
    dividendYieldPercentMin?: number,
    dividendYieldPercentMax?: number,
    priceEarningRatioMin?: number,
    priceEarningRatioMax?: number,
    starRatingMin?: number,
    starRatingMax?: number,
    morningstarFairValueDiffMin?: number,
    morningstarFairValueDiffMax?: number,
    analystConsensusMin?: number,
    analystConsensusMax?: number,
    analystCountMin?: number,
    analystCountMax?: number,
    analystTargetDiffMin?: number,
    analystTargetDiffMax?: number,
    msciESGRatingMin?: MSCIESGRating,
    msciESGRatingMax?: MSCIESGRating,
    msciTemperatureMin?: number,
    msciTemperatureMax?: number,
    refinitivESGScoreMin?: number,
    refinitivESGScoreMax?: number,
    refinitivEmissionsMin?: number,
    refinitivEmissionsMax?: number,
    spESGScoreMin?: number,
    spESGScoreMax?: number,
    sustainalyticsESGRiskMin?: number,
    sustainalyticsESGRiskMax?: number,
    countries?: Country[],
    industries?: Industry[],
    size?: Size,
    style?: Style
  ) => void;
  columnFilter: StockListColumn[];
  setColumnFilter: React.Dispatch<React.SetStateAction<StockListColumn[]>>;
  filtersInUse: boolean;
  triggerRefetch: () => void;
}

export default PageHeader;
