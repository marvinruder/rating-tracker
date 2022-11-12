import {
  Typography,
  Button,
  Grid,
  Tooltip,
  Dialog,
  DialogTitle,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClearIcon from "@mui/icons-material/Clear";
import TuneIcon from "@mui/icons-material/Tune";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import { FC, useState } from "react";
import {
  Country,
  Industry,
  IndustryGroup,
  Region,
  Sector,
  Size,
  sizeArray,
  Style,
  styleArray,
  SuperRegion,
  superRegionArray,
  SuperSector,
  superSectorArray,
} from "src/types";
import React from "react";
import NestedCheckboxList from "src/components/NestedCheckboxList";
import {
  getRegionsInSuperRegion,
  superRegionName,
} from "src/taxonomy/regions/superregion";
import { getCountriesInRegion, regionName } from "src/taxonomy/regions/region";
import {
  getIndustriesInGroup,
  industryGroupName,
} from "src/taxonomy/sectors/industryGroup";
import {
  getIndustryGroupsInSector,
  sectorName,
} from "src/taxonomy/sectors/sector";
import {
  getSectorsInSuperSector,
  superSectorName,
} from "src/taxonomy/sectors/superSector";
import { countryNameWithFlag } from "src/taxonomy/regions/country";
import { industryName } from "src/taxonomy/sectors/industry";

const PageHeader: FC<PageHeaderProps> = (props: PageHeaderProps) => {
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [stockNameInput, setStockNameInput] = useState<string>("");
  const [styleboxInput, setStyleboxInput] = useState<{
    size?: Size;
    style?: Style;
  }>({});
  const [countryInput, setCountryInput] = useState<Country[]>([]);
  const [industryInput, setIndustryInput] = useState<Industry[]>([]);

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
      <Grid item>
        <Tooltip title="Not yet implemented" arrow>
          <span>
            <Button
              sx={{ mt: { xs: 2, md: 0 }, ml: { xs: 0, md: 2 } }}
              variant="contained"
              startIcon={<AddIcon />}
              disabled
            >
              New Stock
            </Button>
          </span>
        </Tooltip>
        <Button
          sx={{ mt: { xs: 2, md: 0 }, ml: { xs: 0, md: 2 } }}
          variant="contained"
          startIcon={<TuneIcon />}
          onClick={() => setFilterOpen(true)}
        >
          Filter Stocks
        </Button>
        <Button
          sx={{
            display: props.filtersInUse ? undefined : "none",
            mt: { xs: 2, md: 0 },
            ml: { xs: 0, md: 2 },
          }}
          variant="contained"
          color="error"
          startIcon={<ClearIcon />}
          onClick={() => {
            props.applyFilters();
            setStockNameInput("");
            setStyleboxInput({});
            setCountryInput([]);
            setIndustryInput([]);
          }}
        >
          Clear Filters
        </Button>
        <Dialog onClose={() => setFilterOpen(false)} open={filterOpen}>
          <Grid
            container
            width={useMediaQuery("(min-width:664px)") ? 600 : 300}
          >
            <Grid item width={300}>
              <DialogTitle>Name</DialogTitle>
              <TextField
                onChange={(event) => {
                  setStockNameInput(event.target.value);
                }}
                value={stockNameInput}
                placeholder={"e.g. Apple Inc."}
                sx={{ width: "100%", pl: "24px", pr: "24px" }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    props.applyFilters(
                      stockNameInput,
                      styleboxInput.size,
                      styleboxInput.style,
                      countryInput,
                      industryInput
                    );
                    setFilterOpen(false);
                  }
                }}
                InputProps={{
                  sx: { pr: "5px" },
                  endAdornment: (
                    <IconButton
                      sx={{
                        borderRadius: 1024,
                        visibility: stockNameInput ? "visible" : "hidden",
                      }}
                      onClick={() => setStockNameInput("")}
                    >
                      <ClearIcon />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            <Grid item>
              <DialogTitle>Style</DialogTitle>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Grid container pl="24px" pr="24px" columns={5} width="298px">
                  <Grid xs={1} item>
                    <Tooltip title="Clear selection" arrow>
                      <IconButton
                        sx={{
                          m: "5px",
                          width: "40px",
                          height: "40px",
                          borderRadius: 1024,
                          visibility:
                            styleboxInput.size || styleboxInput.style
                              ? "visible"
                              : "hidden",
                        }}
                        onClick={() => setStyleboxInput({})}
                      >
                        <ClearIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  {styleArray.map((style) => (
                    <Grid key={style} xs={1} item>
                      <Tooltip title={`All ${style}`} arrow>
                        <IconButton
                          sx={{
                            m: "5px",
                            width: "40px",
                            height: "40px",
                            borderRadius: 1024,
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
                  <Grid xs={1} item />
                  {Array.from(sizeArray)
                    .reverse()
                    .map((size) => {
                      return (
                        <React.Fragment key={"fragment" + size}>
                          <Grid key={size} xs={1} item>
                            <Tooltip title={`All ${size}`} arrow>
                              <IconButton
                                sx={{
                                  m: "5px",
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: 1024,
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
                                xs={1}
                                sx={{
                                  backgroundColor:
                                    (styleboxInput.size == size ||
                                      !styleboxInput.size) &&
                                    (styleboxInput.style == style ||
                                      !styleboxInput.style) &&
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
                          <Grid xs={1} item />
                        </React.Fragment>
                      );
                    })}
                </Grid>
              </div>
            </Grid>
            <Grid item>
              <DialogTitle>Region</DialogTitle>
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
            <Grid item>
              <DialogTitle>Industry</DialogTitle>
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
          </Grid>
          <Button
            onClick={() => {
              props.applyFilters(
                stockNameInput,
                styleboxInput.size,
                styleboxInput.style,
                countryInput,
                industryInput
              );
              setFilterOpen(false);
            }}
            startIcon={<PublishedWithChangesIcon />}
            color="success"
            sx={{ borderRadius: 0, mt: 2 }}
          >
            Apply
          </Button>
        </Dialog>
      </Grid>
    </Grid>
  );
};

interface PageHeaderProps {
  applyFilters: (
    name?: string,
    size?: Size,
    style?: Style,
    countries?: Country[],
    industries?: Industry[]
  ) => void;
  filtersInUse: boolean;
}

export default PageHeader;
