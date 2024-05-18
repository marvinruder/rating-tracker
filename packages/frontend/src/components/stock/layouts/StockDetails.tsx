import NaturePeopleIcon from "@mui/icons-material/NaturePeople";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Box, Grid, Typography, useTheme, Tooltip, Chip, useMediaQuery, Skeleton } from "@mui/material";
import type { Stock } from "@rating-tracker/commons";
import {
  countryNameWithFlag,
  currencyName,
  groupOfIndustry,
  industryDescription,
  industryGroupName,
  industryName,
  regionName,
  regionOfCountry,
  sectorDescription,
  sectorName,
  sectorOfIndustryGroup,
  superSectorDescription,
  superSectorName,
  superSectorOfSector,
} from "@rating-tracker/commons";

import { CurrencyWithTooltip, formatMarketCap, formatPercentage } from "../../../utils/formatters";
import { BlueIconChip } from "../../chips/BlueIconChip";
import { GreenIconChip } from "../../chips/GreenIconChip";
import { TemperatureChip } from "../../chips/TemperatureChip";
import { YellowIconChip } from "../../chips/YellowIconChip";
import {
  MorningstarNavigator,
  MarketScreenerNavigator,
  MSCINavigator,
  LSEGNavigator,
  SPNavigator,
  SustainalyticsNavigator,
} from "../../etc/Navigators";
import { AnalystRatingBar } from "../properties/AnalystRatingBar";
import { PropertyDescription } from "../properties/PropertyDescription";
import { Range52WSlider } from "../properties/Range52WSlider";
import { SectorIcon } from "../properties/SectorIcon";
import { StarRating } from "../properties/StarRating";
import { StyleBox } from "../properties/StyleBox";

/**
 * This component displays detailed information about a stock in a grid.
 * @param props The properties of the component.
 * @returns The component.
 */
export const StockDetails = (props: StockDetailsProps): JSX.Element => {
  const theme = useTheme();

  /**
   * Possible widths of the details container.
   */
  let columns: 1 | 2 | 3;

  switch (+useMediaQuery("(min-width:964px)") + +useMediaQuery("(min-width:664px)")) {
    case 2:
      // The screen is at least 964px wide.
      columns = props.maxColumns && props.maxColumns < 3 ? props.maxColumns : 3;
      break;
    case 1:
      // The screen is at least 664px, but less than 964px wide.
      columns = props.maxColumns && props.maxColumns < 2 ? props.maxColumns : 2;
      break;
    case 0:
      // The screen is less than 664px wide.
      columns = props.maxColumns && props.maxColumns < 1 ? props.maxColumns : 1;
      break;
  }

  const tooltipPlacement = columns === 1 ? "bottom" : "left";

  return (
    <Grid container columns={columns} width="100%" margin="auto">
      {/* Key Figures */}
      <Grid item xs={1} order={1}>
        <Typography variant="h4" px="24px" py="16px">
          Key Figures
        </Typography>
        <Grid container spacing={1} px="24px" pb="20px">
          {/* Country */}
          <Grid item xs={3}>
            <Tooltip title={<PropertyDescription property="country" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5">Country</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={9}>
            <Typography variant="body1">
              {props.stock ? countryNameWithFlag[props.stock?.country] : <Skeleton width={160} />}
            </Typography>
          </Grid>
          {/* Region */}
          <Grid item xs={3}>
            <Typography variant="h5">Region</Typography>
          </Grid>
          <Grid item xs={9}>
            <Typography variant="body1">
              {props.stock ? regionName[regionOfCountry[props.stock?.country]] : <Skeleton width={160} />}
            </Typography>
          </Grid>
          {/* Stylebox */}
          <Grid item xs={3}>
            <Tooltip
              title={
                <>
                  <PropertyDescription property="size" />
                  <br />
                  <PropertyDescription property="style" />
                </>
              }
              arrow
              placement={tooltipPlacement}
            >
              <Typography variant="h5">StyleBox</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={9}>
            {props.stock ? (
              <Tooltip
                title={props.stock.size && props.stock.style ? `${props.stock.size}-${props.stock.style}` : undefined}
                arrow
              >
                <Box
                  sx={{
                    width: 2.75 * (theme.typography.body1.fontSize as number),
                    height: 2.75 * (theme.typography.body1.fontSize as number),
                  }}
                >
                  <StyleBox
                    fill={theme.colors.alpha.black[100]}
                    stroke={theme.colors.alpha.black[100]}
                    size={props.stock.size}
                    style={props.stock.style}
                    length={2.75 * (theme.typography.body1.fontSize as number)}
                  />
                </Box>
              </Tooltip>
            ) : (
              <Skeleton
                variant="rectangular"
                width={2.75 * (theme.typography.body1.fontSize as number)}
                height={2.75 * (theme.typography.body1.fontSize as number)}
              />
            )}
          </Grid>
          {/* Sector and industry */}
          <Grid item xs={3}>
            <Tooltip title={<PropertyDescription property="industry" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5">Industry</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={9}>
            {props.stock ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {props.stock.industry && (
                    <SectorIcon
                      industry={props.stock.industry}
                      length={1.75 * (theme.typography.body2.fontSize as number)}
                      type="SuperSector"
                    />
                  )}
                  <Box width={6} />
                  <Tooltip
                    title={
                      props.stock.industry &&
                      superSectorDescription[
                        superSectorOfSector[sectorOfIndustryGroup[groupOfIndustry[props.stock.industry]]]
                      ]
                    }
                    arrow
                    placement={columns === 1 ? "bottom" : "right"}
                  >
                    <Typography variant="body1">
                      {props.stock.industry &&
                        superSectorName[
                          superSectorOfSector[sectorOfIndustryGroup[groupOfIndustry[props.stock.industry]]]
                        ]}
                    </Typography>
                  </Tooltip>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {props.stock.industry && (
                    <SectorIcon
                      industry={props.stock.industry}
                      length={1.75 * (theme.typography.body1.fontSize as number)}
                      type="Sector"
                    />
                  )}
                  <Box width={6} />
                  <Tooltip
                    title={
                      props.stock.industry &&
                      sectorDescription[sectorOfIndustryGroup[groupOfIndustry[props.stock.industry]]]
                    }
                    arrow
                    placement={columns === 1 ? "bottom" : "right"}
                  >
                    <Typography variant="body1">
                      {props.stock.industry && sectorName[sectorOfIndustryGroup[groupOfIndustry[props.stock.industry]]]}
                    </Typography>
                  </Tooltip>
                </Box>
                <Typography variant="body1" ml={`${6 + 1.75 * (theme.typography.body1.fontSize as number)}px`}>
                  {props.stock.industry && industryGroupName[groupOfIndustry[props.stock.industry]]}
                </Typography>
                <Tooltip
                  title={props.stock.industry && industryDescription[props.stock.industry]}
                  arrow
                  placement={columns === 1 ? "bottom" : "right"}
                >
                  <Typography variant="body1" ml={`${6 + 1.75 * (theme.typography.body1.fontSize as number)}px`}>
                    {props.stock.industry && industryName[props.stock.industry]}
                  </Typography>
                </Tooltip>
              </>
            ) : (
              <>
                <Typography variant="body1">
                  <Skeleton width={100} height={21} />
                </Typography>
                <Typography variant="body1">
                  <Skeleton width={130} height={21} />
                </Typography>
                <Typography variant="body1">
                  <Skeleton width={160} />
                </Typography>
                <Typography variant="body1">
                  <Skeleton width={180} />
                </Typography>
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
      {/* Financial Data */}
      <Grid item xs={1} order={columns === 3 ? 2 : 5}>
        <Typography variant="h4" px="24px" py="16px">
          Financial Data
        </Typography>
        <Grid container spacing={1} px="24px" pb="20px">
          {/* Dividend Yield */}
          <Grid item xs={4.5}>
            <Tooltip title={<PropertyDescription property="dividendYieldPercent" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5">Dividend Yield</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={7.5}>
            <Typography variant="body1" sx={{ textAlign: "right" }}>
              {props.stock ? (
                formatPercentage(props.stock.dividendYieldPercent, { total: 100 })
              ) : (
                <Skeleton width={50} sx={{ ml: "auto" }} />
              )}
            </Typography>
          </Grid>
          {/* P/E Ratio */}
          <Grid item xs={4.5}>
            <Tooltip title={<PropertyDescription property="priceEarningRatio" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5">
                P{"\u2009"}/{"\u2009"}E Ratio
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={7.5}>
            <Typography variant="body1" sx={{ textAlign: "right" }}>
              {props.stock ? (
                <>{Number(props.stock.priceEarningRatio?.toPrecision(3)) || "–"}</>
              ) : (
                <Skeleton width={45} sx={{ ml: "auto" }} />
              )}
            </Typography>
          </Grid>
          {/* Market Cap */}
          <Grid item xs={4.5}>
            <Tooltip title={<PropertyDescription property="marketCap" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5">Market Cap</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={7.5}>
            <Typography variant="body1" sx={{ textAlign: "right" }}>
              {props.stock ? (
                <>
                  <Tooltip title={props.stock.currency && currencyName[props.stock.currency]} arrow>
                    <Box display="inline-block">{props.stock.currency ?? ""}</Box>
                  </Tooltip>{" "}
                  {props.stock.marketCap !== null ? formatMarketCap(props.stock) : "–"}
                </>
              ) : (
                <Skeleton width={60} sx={{ ml: "auto" }} />
              )}
            </Typography>
          </Grid>
          {/* 52W Range */}
          <Grid item xs={4.5} mt="11.5px">
            <Tooltip title={<PropertyDescription property="positionIn52w" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5">52W Range</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={7.5}>
            {props.stock ? (
              <>
                {props.stock?.lastClose !== null && props.stock?.low52w !== null && props.stock?.high52w !== null && (
                  <Range52WSlider stock={props.stock} />
                )}
              </>
            ) : (
              <Skeleton variant="rectangular" height={42} sx={{ ml: "auto" }} />
            )}
          </Grid>
        </Grid>
      </Grid>
      {/* Overall Scores */}
      <Grid item xs={1} order={columns === 3 ? 3 : 2}>
        <Typography variant="h4" px="24px" py="16px">
          Overall Scores
        </Typography>
        <Grid container spacing={1} px="24px" pb="20px">
          {/* Total Score */}
          <Grid item xs={6}>
            <Tooltip title={<PropertyDescription property="totalScore" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5" mt="8px">
                Total Score
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6} justifyContent="flex-end">
            {props.stock ? (
              <Box width="100%" display="inline-flex" justifyContent="end">
                <BlueIconChip
                  icon={<VerifiedIcon />}
                  label={<strong>{Math.round(Math.max(0, 100 * props.stock?.totalScore))}</strong>}
                  sx={{ width: 84, fontSize: 18 }}
                />
              </Box>
            ) : (
              <Skeleton variant="rounded" width={84} height={32} sx={{ ml: "auto" }} />
            )}
          </Grid>
          {/* Financial Score */}
          <Grid item xs={6}>
            <Tooltip title={<PropertyDescription property="financialScore" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5" mt="8px">
                Financial Score
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            {props.stock ? (
              <Box width="100%" display="inline-flex" justifyContent="end">
                <YellowIconChip
                  icon={<PriceCheckIcon />}
                  label={<strong>{Math.round(Math.max(0, 100 * props.stock?.financialScore))}</strong>}
                  sx={{ width: 84, fontSize: 18 }}
                />
              </Box>
            ) : (
              <Skeleton variant="rounded" width={84} height={32} sx={{ ml: "auto" }} />
            )}
          </Grid>
          {/* ESG Score */}
          <Grid item xs={6}>
            <Tooltip title={<PropertyDescription property="esgScore" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5" mt="8px">
                ESG Score
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            {props.stock ? (
              <Box width="100%" display="inline-flex" justifyContent="end">
                <GreenIconChip
                  icon={<NaturePeopleIcon />}
                  label={<strong>{Math.round(Math.max(0, 100 * props.stock?.esgScore))}</strong>}
                  sx={{ width: 84, fontSize: 18 }}
                />
              </Box>
            ) : (
              <Skeleton variant="rounded" width={84} height={32} sx={{ ml: "auto" }} />
            )}
          </Grid>
        </Grid>
      </Grid>
      {/* Financial Ratings */}
      <Grid item xs={1} order={columns === 3 ? 4 : 3}>
        <Typography variant="h4" px="24px" py="16px">
          Financial Ratings
        </Typography>
        <Grid container spacing={1} px="24px" pb="20px">
          {/* Morningstar Star Rating */}
          <Grid item xs={6}>
            <Tooltip title={<PropertyDescription property="starRating" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5">
                Morningstar
                <br />
                Star Rating
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <MorningstarNavigator stock={props.stock}>
              <Box sx={{ mt: "4px", height: "24px" }} width="100%" display="inline-flex" justifyContent="end">
                {props.stock ? (
                  <StarRating value={props.stock.starRating} />
                ) : (
                  [...Array(5).keys()].map((index) => {
                    return (
                      <Skeleton
                        key={index}
                        sx={{ m: "2px", display: "inline-block", verticalAlign: "middle" }}
                        variant="circular"
                        width={20}
                        height={20}
                      />
                    );
                  })
                )}
              </Box>
            </MorningstarNavigator>
          </Grid>
          {/* Morningstar Fair Value */}
          <Grid item xs={6}>
            <Tooltip title={<PropertyDescription property="morningstarFairValue" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5" height="35px">
                Morningstar
                <br />
                Fair Value
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <MorningstarNavigator stock={props.stock}>
              <Typography variant="body1" sx={{ textAlign: "right" }}>
                {props.stock ? (
                  <CurrencyWithTooltip value={props.stock.morningstarFairValue} currency={props.stock.currency} />
                ) : (
                  <Skeleton width={90} sx={{ ml: "auto" }} />
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>
                {props.stock ? (
                  formatPercentage(props.stock.morningstarFairValuePercentageToLastClose, {
                    total: 100,
                    precision: 2,
                    forceSign: true,
                    fallbackString: "",
                  })
                ) : (
                  <Skeleton width={45} sx={{ ml: "auto" }} />
                )}
              </Typography>
            </MorningstarNavigator>
          </Grid>
          {/* Analyst Ratings */}
          <Grid item xs={6}>
            <Tooltip title={<PropertyDescription property="analystRatings" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5" height="35px">
                Analyst
                <br />
                Ratings
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            {props.stock ? (
              <>
                {props.stock?.analystConsensus !== null && props.stock?.analystRatings !== null && (
                  <MarketScreenerNavigator stock={props.stock}>
                    <AnalystRatingBar stock={props.stock} open />
                  </MarketScreenerNavigator>
                )}
              </>
            ) : (
              <Skeleton variant="rounded" height={42} sx={{ ml: "auto", mt: "4px" }} />
            )}
          </Grid>
          {/* Analyst Target Price */}
          <Grid item xs={6}>
            <Tooltip title={<PropertyDescription property="analystTargetPrice" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5" height="35px">
                Analyst Target
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <MarketScreenerNavigator stock={props.stock}>
              <Typography
                variant="body1"
                sx={{ opacity: props.stock?.analystCount < 10 ? props.stock?.analystCount / 10 : 1, float: "right" }}
              >
                {props.stock ? (
                  <CurrencyWithTooltip value={props.stock.analystTargetPrice} currency={props.stock.currency} />
                ) : (
                  <Skeleton width={90} sx={{ ml: "auto" }} />
                )}
              </Typography>
              <br />
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>
                {props.stock ? (
                  formatPercentage(props.stock.analystTargetPricePercentageToLastClose, {
                    total: 100,
                    precision: 2,
                    forceSign: true,
                    fallbackString: "",
                  })
                ) : (
                  <Skeleton width={45} sx={{ ml: "auto" }} />
                )}
              </Typography>
            </MarketScreenerNavigator>
          </Grid>
          {/* Analyst Count */}
          <Grid item xs={6}>
            <Tooltip title={<PropertyDescription property="analystCount" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5">Analyst Count</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ textAlign: "right" }}>
              {props.stock ? (
                <>
                  {props.stock?.analystTargetPrice !== null &&
                    props.stock?.analystCount !== null &&
                    props.stock?.lastClose !== null &&
                    props.stock?.analystTargetPricePercentageToLastClose !== null &&
                    `n\u2009=\u2009${props.stock?.analystCount}`}
                </>
              ) : (
                <Skeleton width={60} sx={{ ml: "auto" }} />
              )}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      {/* ESG Ratings */}
      <Grid item xs={1} order={columns === 3 ? 5 : 4}>
        <Typography variant="h4" px="24px" py="16px">
          ESG Ratings
        </Typography>
        <Grid container spacing={1} px="24px" pb="20px">
          {/* MSCI ESG Rating */}
          <Grid item xs={6}>
            <Tooltip title={<PropertyDescription property="msciESGRating" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5" mt="5px" height="19px">
                MSCI ESG Rating
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            {props.stock ? (
              <>
                {props.stock.msciESGRating && (
                  <MSCINavigator stock={props.stock}>
                    <Box width="100%" display="inline-flex" justifyContent="end">
                      <Chip
                        label={<strong>{props.stock.msciESGRating}</strong>}
                        style={{ cursor: "inherit" }}
                        sx={{
                          backgroundColor: ["AAA", "AA"].includes(props.stock.msciESGRating)
                            ? theme.colors.msci.Leader
                            : ["B", "CCC"].includes(props.stock.msciESGRating)
                              ? theme.colors.msci.Laggard
                              : theme.colors.msci.Average,
                          color: theme.colors.alpha.trueWhite[100],
                          width: 48,
                        }}
                        size="small"
                      />
                    </Box>
                  </MSCINavigator>
                )}
              </>
            ) : (
              <Skeleton variant="rounded" width={48} height={24} sx={{ ml: "auto" }} />
            )}
          </Grid>
          {/* MSCI Implied Temperature Rise */}
          <Grid item xs={6}>
            <Tooltip title={<PropertyDescription property="msciTemperature" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5" height="35px">
                MSCI Implied
                <br />
                Temperature Rise
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            {props.stock ? (
              <>
                {props.stock.msciTemperature !== null && (
                  <MSCINavigator stock={props.stock}>
                    <Box width="100%" display="inline-flex" justifyContent="end">
                      <TemperatureChip
                        msciTemperature={props.stock.msciTemperature}
                        icon={<ThermostatIcon />}
                        label={<strong>{props.stock.msciTemperature + "\u2009℃"}</strong>}
                        size="small"
                        sx={{ width: 75, mt: "4px" }}
                        style={{ cursor: "inherit" }}
                      />
                    </Box>
                  </MSCINavigator>
                )}
              </>
            ) : (
              <Skeleton variant="rounded" width={75} height={24} sx={{ mt: "4px", ml: "auto" }} />
            )}
          </Grid>
          {/* LSEG ESG Score */}
          <Grid item xs={6}>
            <Tooltip title={<PropertyDescription property="lsegESGScore" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5" mt="6px" height="21px">
                LSEG ESG Score
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            {props.stock ? (
              <>
                {props.stock.lsegESGScore !== null && (
                  <LSEGNavigator stock={props.stock}>
                    <Typography variant="body1" fontSize={18} sx={{ float: "right" }}>
                      {props.stock.lsegESGScore}
                    </Typography>
                  </LSEGNavigator>
                )}
              </>
            ) : (
              <Typography variant="body1" fontSize={18} sx={{ textAlign: "right" }}>
                <Skeleton width={30} sx={{ ml: "auto" }} />
              </Typography>
            )}
          </Grid>
          {/* LSEG Emissions */}
          <Grid item xs={6}>
            <Tooltip title={<PropertyDescription property="lsegEmissions" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5" mt="6px" height="21px">
                LSEG Emissions
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            {props.stock ? (
              <>
                {props.stock.lsegEmissions !== null && (
                  <LSEGNavigator stock={props.stock}>
                    <Typography variant="body1" fontSize={18} sx={{ float: "right" }}>
                      {props.stock.lsegEmissions}
                    </Typography>
                  </LSEGNavigator>
                )}
              </>
            ) : (
              <Typography variant="body1" fontSize={18} sx={{ textAlign: "right" }}>
                <Skeleton width={30} sx={{ ml: "auto" }} />
              </Typography>
            )}
          </Grid>
          {/* S&P ESG Score */}
          <Grid item xs={6}>
            <Tooltip title={<PropertyDescription property="spESGScore" />} arrow placement={tooltipPlacement}>
              <Typography variant="h5" mt="6px" height="21px">
                S&P ESG Score
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            {props.stock ? (
              <>
                {props.stock.spESGScore !== null && (
                  <SPNavigator stock={props.stock}>
                    <Typography variant="body1" fontSize={18} sx={{ float: "right" }}>
                      {props.stock.spESGScore}
                    </Typography>
                  </SPNavigator>
                )}
              </>
            ) : (
              <Typography variant="body1" fontSize={18} sx={{ textAlign: "right" }}>
                <Skeleton width={30} sx={{ ml: "auto" }} />
              </Typography>
            )}
          </Grid>
          {/* Sustainalytics ESG Risk */}
          <Grid item xs={6}>
            <Tooltip
              title={<PropertyDescription property="sustainalyticsESGRisk" />}
              arrow
              placement={tooltipPlacement}
            >
              <Typography variant="h5">
                Sustainalytics
                <br />
                ESG Risk
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            {props.stock ? (
              <>
                {props.stock.sustainalyticsESGRisk !== null && (
                  <SustainalyticsNavigator stock={props.stock}>
                    <Box width="100%" display="inline-flex" justifyContent="end">
                      <Chip
                        label={<strong>{props.stock.sustainalyticsESGRisk}</strong>}
                        style={{ cursor: "inherit" }}
                        sx={{
                          backgroundColor:
                            props.stock.sustainalyticsESGRisk < 10
                              ? theme.colors.sustainalytics.negligible
                              : props.stock.sustainalyticsESGRisk < 20
                                ? theme.colors.sustainalytics.low
                                : props.stock.sustainalyticsESGRisk < 30
                                  ? theme.colors.sustainalytics.medium
                                  : props.stock.sustainalyticsESGRisk < 40
                                    ? theme.colors.sustainalytics.high
                                    : theme.colors.sustainalytics.severe,
                          width: 64,
                          mt: "4px",
                        }}
                        size="small"
                      />
                    </Box>
                  </SustainalyticsNavigator>
                )}
              </>
            ) : (
              <Skeleton variant="rounded" width={64} height={24} sx={{ mt: "4px", ml: "auto" }} />
            )}
          </Grid>
        </Grid>
      </Grid>
      {/* Description */}
      <Grid item xs={1} order={6} px="24px" pt="14px" pb="20px">
        <Typography variant="body1">
          {props.stock ? (
            <>{props.stock.description}</>
          ) : (
            <>
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="86%" />
              <Skeleton variant="text" width="93%" />
              <Skeleton variant="text" width="97%" />
              <Skeleton variant="text" width="94%" />
              <Skeleton variant="text" width="91%" />
              <Skeleton variant="text" width="89%" />
              <Skeleton variant="text" width="98%" />
              <Skeleton variant="text" width="53%" />
            </>
          )}
        </Typography>
      </Grid>
    </Grid>
  );
};

/**
 * Properties for the StockDetails component
 */
interface StockDetailsProps {
  /**
   * The stock to display details of.
   */
  stock?: Stock;
  /**
   * The maximum columns of the component.
   */
  maxColumns?: 1 | 2;
}
