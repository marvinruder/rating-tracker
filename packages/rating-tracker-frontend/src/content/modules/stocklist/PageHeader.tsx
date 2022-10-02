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

import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import ArrowRightTwoToneIcon from "@mui/icons-material/ArrowRightTwoTone";
import ArrowDropDownTwoToneIcon from "@mui/icons-material/ArrowDropDownTwoTone";
import ClearTwoToneIcon from "@mui/icons-material/ClearTwoTone";
import TuneTwoToneIcon from "@mui/icons-material/TuneTwoTone";
import PublishedWithChangesTwoToneIcon from "@mui/icons-material/PublishedWithChangesTwoTone";
import { FC, useState } from "react";
import { Size } from "src/enums/size";
import { Style } from "src/enums/style";
import React from "react";
import NestedCheckboxList from "src/components/NestedCheckboxList/index";
import {
  getRegionsInSuperRegions,
  SuperRegion,
} from "src/enums/regions/superregion";
import { getCountriesInRegion, Region } from "src/enums/regions/region";
import { Country } from "src/enums/regions/country";
import {
  getSectorsInSuperSector,
  SuperSector,
} from "src/enums/sectors/superSector";
import { getIndustryGroupsInSector, Sector } from "src/enums/sectors/sector";
import { Industry } from "src/enums/sectors/industry";
import {
  getIndustriesInGroup,
  IndustryGroup,
} from "src/enums/sectors/industryGroup";

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
              startIcon={<AddTwoToneIcon />}
              disabled
            >
              New Stock
            </Button>
          </span>
        </Tooltip>
        <Button
          sx={{ mt: { xs: 2, md: 0 }, ml: { xs: 0, md: 2 } }}
          variant="contained"
          startIcon={<TuneTwoToneIcon />}
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
          startIcon={<ClearTwoToneIcon />}
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
                      <ClearTwoToneIcon />
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
                        <ClearTwoToneIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  {Object.values(Style)
                    .filter((style) => typeof style === "string")
                    .map((style) => (
                      <Grid key={style as string} xs={1} item>
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
                                style: style as Style,
                              })
                            }
                          >
                            <ArrowDropDownTwoToneIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    ))}
                  <Grid xs={1} item />
                  {Object.values(Size)
                    .filter((size) => typeof size === "string")
                    .map((size) => {
                      return (
                        <React.Fragment key={"fragment" + (size as string)}>
                          <Grid key={size as string} xs={1} item>
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
                                    size: size as Size,
                                    style: undefined,
                                  })
                                }
                              >
                                <ArrowRightTwoToneIcon />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                          {Object.values(Style)
                            .filter((style) => typeof style === "string")
                            .map((style) => (
                              <Tooltip
                                title={`${size}-${style}`}
                                key={(size as string) + (style as string)}
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
                                      (styleboxInput.size ||
                                        styleboxInput.style)
                                        ? theme.colors.alpha.black[100]
                                        : theme.colors.alpha.white[100],
                                    height: "50px",
                                    outline: `1px solid ${theme.colors.alpha.black[100]}`,
                                  }}
                                  onClick={() =>
                                    setStyleboxInput({
                                      size: size as Size,
                                      style: style as Style,
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
                firstLevelElements={[
                  SuperRegion.Americas,
                  SuperRegion.EMEA,
                  SuperRegion.Asia,
                ]}
                getSecondLevelElements={getRegionsInSuperRegions}
                getThirdLevelElements={getCountriesInRegion}
                height={180}
                selectedLastLevelElements={countryInput}
                setSelectedLastLevelElements={setCountryInput}
              />
            </Grid>
            <Grid item>
              <DialogTitle>Industry</DialogTitle>
              <NestedCheckboxList<SuperSector, Sector, IndustryGroup, Industry>
                firstLevelElements={[
                  SuperSector.Cyclical,
                  SuperSector.Defensive,
                  SuperSector.Sensitive,
                ]}
                getSecondLevelElements={getSectorsInSuperSector}
                getThirdLevelElements={getIndustryGroupsInSector}
                getFourthLevelElements={getIndustriesInGroup}
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
            startIcon={<PublishedWithChangesTwoToneIcon />}
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
