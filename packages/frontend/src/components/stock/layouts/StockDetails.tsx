import NaturePeopleIcon from "@mui/icons-material/NaturePeople";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Box, Grid, Typography, useTheme, Tooltip, Chip, useMediaQuery, Skeleton } from "@mui/material";
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
  Stock,
  superSectorDescription,
  superSectorName,
  superSectorOfSector,
} from "@rating-tracker/commons";

import formatMarketCap from "../../../utils/formatters";
import {
  MorningstarNavigator,
  MarketScreenerNavigator,
  MSCINavigator,
  RefinitivNavigator,
  SPNavigator,
  SustainalyticsNavigator,
} from "../../../utils/navigators";
import { BlueIconChip } from "../../chips/BlueIconChip";
import { GreenIconChip } from "../../chips/GreenIconChip";
import { TemperatureChip } from "../../chips/TemperatureChip";
import { YellowIconChip } from "../../chips/YellowIconChip";
import { Range52WSlider } from "../properties/Range52WSlider";
import { SectorIcon } from "../properties/SectorIcon";
import { StarRating } from "../properties/StarRating";
import { StyleBox } from "../properties/StyleBox";

/**
 * This component displays detailed information about a stock in a grid.
 *
 * @param {StockDetailsProps} props The properties of the component.
 * @returns {JSX.Element} The component.
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
            <Tooltip
              title={<Typography variant="body1">The Country of the company’s operational headquarters.</Typography>}
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
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
                  <Typography variant="body1" paddingBottom={1}>
                    The Size of a company is based on its market capitalization and geographic area.
                  </Typography>
                  <Typography variant="body2" paddingBottom={2}>
                    Large-cap stocks are defined as the group that accounts for the top 70% of the capitalization of
                    each geographic area; mid-cap stocks represent the next 20%; and small-cap stocks represent the
                    balance.
                  </Typography>
                  <Typography variant="body1">
                    The Style category is based on the value and growth characteristics of a company.
                  </Typography>
                </>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
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
            <Tooltip
              title={<Typography variant="body1">A fine-grained categorization of a company’s business.</Typography>}
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
              <Typography variant="h5">Industry</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={9}>
            {props.stock ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
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
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
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
            <Tooltip
              title={
                <Typography variant="body1">
                  The annual dividend per share divided by the current stock price.
                </Typography>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
              <Typography variant="h5">Dividend Yield</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={7.5}>
            <Typography variant="body1" sx={{ textAlign: "right" }}>
              {props.stock ? (
                <>
                  {props.stock.dividendYieldPercent ?? "–"}
                  {"\u2009%"}
                </>
              ) : (
                <Skeleton width={50} sx={{ ml: "auto" }} />
              )}
            </Typography>
          </Grid>
          {/* P/E Ratio */}
          <Grid item xs={4.5}>
            <Tooltip
              title={
                <Typography variant="body1">
                  The company’s current market capitalization divided by its earnings.
                </Typography>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
              <Typography variant="h5">
                P{"\u2009"}/{"\u2009"}E Ratio
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={7.5}>
            <Typography variant="body1" sx={{ textAlign: "right" }}>
              {props.stock ? <>{props.stock.priceEarningRatio ?? "–"}</> : <Skeleton width={45} sx={{ ml: "auto" }} />}
            </Typography>
          </Grid>
          {/* Market Cap */}
          <Grid item xs={4.5}>
            <Tooltip
              title={
                <Typography variant="body1">
                  The current price of a stock multiplied by the number of all its shares.
                </Typography>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
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
            <Tooltip
              title={
                <Typography variant="body1">
                  This range represents the lowest and highest price at which the stock has traded in the last 52 weeks,
                  as well as the last price at the end of a trading day.
                </Typography>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
              <Typography variant="h5">52W Range</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={7.5}>
            {props.stock ? (
              <>
                {props.stock?.lastClose !== null && props.stock?.low52w !== null && props.stock?.high52w !== null && (
                  <Range52WSlider
                    size="small"
                    sx={{
                      mb: `${-0.5 * (theme.typography.body2.fontSize as number)}px`,
                      mt: `${0.5 * (theme.typography.body2.fontSize as number)}px`,
                    }}
                    value={props.stock.lastClose}
                    min={props.stock.low52w}
                    max={props.stock.high52w}
                    marks={[
                      {
                        value: props.stock.low52w,
                        label: props.stock.low52w?.toFixed(2),
                      },
                      {
                        value: props.stock.high52w,
                        label: props.stock.high52w?.toFixed(2),
                      },
                    ]}
                    valueLabelDisplay="on"
                    valueLabelFormat={(value) => value.toFixed(2)}
                    disabled
                  />
                )}
              </>
            ) : (
              <Skeleton variant="rectangular" width={150} height={42} sx={{ ml: "auto" }} />
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
            <Tooltip
              title={
                <>
                  <Typography variant="body1" paddingBottom={1}>
                    An overall score that combines the financial and ESG scores via equal weighting.
                  </Typography>
                  <Typography variant="body2">
                    Values range from 0 to 100, where a score of 0 indicates an average-performing company and a score
                    of 100 indicates a company with perfect overall performance.
                  </Typography>
                </>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
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
            <Tooltip
              title={
                <>
                  <Typography variant="body1" paddingBottom={1}>
                    A score that measures the financial strength of a company.
                  </Typography>
                  <Typography variant="body2">
                    Values range from 0 to 100, where a score of 0 indicates an average-performing company and a score
                    of 100 indicates a company with perfect financial performance.
                  </Typography>
                </>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
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
            <Tooltip
              title={
                <>
                  <Typography variant="body1" paddingBottom={1}>
                    A score that measures the environmental, social, and governance (ESG) behavior of a company.
                  </Typography>
                  <Typography variant="body2">
                    Values range from 0 to 100, where a score of 0 indicates an average-behaving company and a score of
                    100 indicates a company with perfect ESG behavior.
                  </Typography>
                </>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
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
        {/* Financial Ratings */}
        <Typography variant="h4" px="24px" py="16px">
          Financial Ratings
        </Typography>
        <Grid container spacing={1} px="24px" pb="20px">
          {/* Morningstar Star Rating */}
          <Grid item xs={6}>
            <Tooltip
              title={
                <>
                  <Typography variant="body1" paddingBottom={1}>
                    The Morningstar star rating is determined by a stock’s current price, Morningstar’s estimate of the
                    stock’s fair value, and the uncertainty rating of the fair value. The bigger the discount, the
                    higher the star rating.
                  </Typography>
                  <Typography variant="body2">
                    Four- and 5-star ratings mean the stock is undervalued, while a 3-star rating means it’s fairly
                    valued, and 1- and 2-star stocks are overvalued. When looking for investments, a 5-star stock is
                    generally a better opportunity than a 1-star stock.
                  </Typography>
                </>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
              <Typography variant="h5">
                Morningstar
                <br />
                Star Rating
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <MorningstarNavigator stock={props.stock}>
              <Box
                sx={{
                  mt: "4px",
                  height: "24px",
                }}
                width="100%"
                display="inline-flex"
                justifyContent="end"
              >
                {props.stock ? (
                  <StarRating value={props.stock.starRating} />
                ) : (
                  [...Array(5).keys()].map((index) => {
                    return (
                      <Skeleton
                        key={index}
                        sx={{
                          m: "2px",
                          display: "inline-block",
                          verticalAlign: "middle",
                        }}
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
            <Tooltip
              title={
                <>
                  <Typography variant="body1" paddingBottom={1}>
                    The Morningstar Fair Value Estimate tells investors what the long-term intrinsic value of a stock
                    is. It is calculated using a proprietary model that combines the company’s financial statements,
                    analyst estimates, and other factors to determine the company’s fair value.
                  </Typography>
                  <Typography variant="body2">
                    The percentage difference between the stock’s current price and the fair value estimate indicates
                    the stock’s discount (negative percentage) or premium (positive percentage) to its fair value. A
                    stock that is trading at a discount to its fair value is considered undervalued, while a stock
                    trading at a premium to its fair value is considered overvalued.
                  </Typography>
                </>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
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
                  <>
                    <Tooltip title={props.stock.currency && currencyName[props.stock.currency]} arrow>
                      <Box display="inline-block">{props.stock.currency ?? ""}</Box>
                    </Tooltip>{" "}
                    {props.stock?.morningstarFairValue?.toFixed(2) ?? "–"}
                  </>
                ) : (
                  <Skeleton width={90} sx={{ ml: "auto" }} />
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>
                {props.stock ? (
                  <>
                    {props?.stock.morningstarFairValuePercentageToLastClose !== null &&
                      `${props?.stock.morningstarFairValuePercentageToLastClose > 0 ? "+" : ""}${Math.round(
                        props.stock?.morningstarFairValuePercentageToLastClose,
                      )}\u2009%`}
                  </>
                ) : (
                  <Skeleton width={45} sx={{ ml: "auto" }} />
                )}
              </Typography>
            </MorningstarNavigator>
          </Grid>
          {/* Analyst Consensus */}
          <Grid item xs={6}>
            <Tooltip
              title={
                <>
                  <Typography variant="body1" paddingBottom={1}>
                    The consensus of analyst recommendations for a stock is calculated by aggregating the
                    recommendations of analysts who cover the stock and then normalizing the data to a scale of 0 to 10.
                  </Typography>
                  <Typography variant="body2">
                    A score of 0 indicates a strong sell recommendation, while a score of 10 indicates a strong buy
                    recommendation.
                  </Typography>
                </>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
              <Typography variant="h5" height="35px">
                Analyst
                <br />
                Consensus
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            {props.stock ? (
              <>
                {props.stock?.analystConsensus !== null && (
                  <MarketScreenerNavigator stock={props.stock}>
                    <Box width="100%" display="inline-flex" justifyContent="end">
                      <Chip
                        label={<strong>{props.stock.analystConsensus}</strong>}
                        style={{ cursor: "inherit" }}
                        sx={{
                          backgroundColor:
                            props.stock.analystConsensus <= 0.5
                              ? theme.colors.consensus[0]
                              : props.stock.analystConsensus <= 1.5
                              ? theme.colors.consensus[1]
                              : props.stock.analystConsensus <= 2.5
                              ? theme.colors.consensus[2]
                              : props.stock.analystConsensus <= 3.5
                              ? theme.colors.consensus[3]
                              : props.stock.analystConsensus <= 4.5
                              ? theme.colors.consensus[4]
                              : props.stock.analystConsensus <= 5.5
                              ? theme.colors.consensus[5]
                              : props.stock.analystConsensus <= 6.5
                              ? theme.colors.consensus[6]
                              : props.stock.analystConsensus <= 7.5
                              ? theme.colors.consensus[7]
                              : props.stock.analystConsensus <= 8.5
                              ? theme.colors.consensus[8]
                              : props.stock.analystConsensus <= 9.5
                              ? theme.colors.consensus[9]
                              : theme.colors.consensus[10],
                          opacity: props.stock.analystCount < 10 ? props.stock.analystCount / 10 : 1,
                          width: 60,
                          mt: "4px",
                        }}
                        size="small"
                      />
                    </Box>
                  </MarketScreenerNavigator>
                )}
              </>
            ) : (
              <Skeleton variant="rounded" width={60} height={24} sx={{ ml: "auto", mt: "4px" }} />
            )}
          </Grid>
          {/* Analyst Target Price */}
          <Grid item xs={6}>
            <Tooltip
              title={
                <>
                  <Typography variant="body1" paddingBottom={1}>
                    The average analyst target price is the average of the estimated price targets of analysts who cover
                    a stock.
                  </Typography>
                  <Typography variant="body2">
                    The percentage difference between the stock’s current price and the average analyst target price
                    indicates the stock’s discount (negative percentage) or premium (positive percentage) to its average
                    analyst target price. A stock that is trading at a discount to its average analyst target price is
                    considered undervalued, while a stock trading at a premium to its average analyst target price is
                    considered overvalued.
                  </Typography>
                </>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
              <Typography variant="h5" height="35px">
                Analyst Target
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <MarketScreenerNavigator stock={props.stock}>
              <Typography
                variant="body1"
                sx={{
                  opacity: props.stock?.analystCount < 10 ? props.stock?.analystCount / 10 : 1,
                  float: "right",
                }}
              >
                {props.stock ? (
                  <>
                    <Tooltip title={props.stock.currency && currencyName[props.stock.currency]} arrow>
                      <Box display="inline-block">{props.stock.currency ?? ""}</Box>
                    </Tooltip>{" "}
                    {props.stock?.analystTargetPrice?.toFixed(2) ?? "–"}
                  </>
                ) : (
                  <Skeleton width={90} sx={{ ml: "auto" }} />
                )}
              </Typography>
              <br />
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>
                {props.stock ? (
                  <>
                    {props.stock?.analystCount !== null &&
                      props.stock?.analystTargetPricePercentageToLastClose !== null &&
                      `${props.stock?.analystTargetPricePercentageToLastClose > 0 ? "+" : ""}${Math.round(
                        props.stock.analystTargetPricePercentageToLastClose,
                      )}\u2009%`}
                  </>
                ) : (
                  <Skeleton width={45} sx={{ ml: "auto" }} />
                )}
              </Typography>
            </MarketScreenerNavigator>
          </Grid>
          {/* Analyst Count */}
          <Grid item xs={6}>
            <Tooltip
              title={<Typography variant="body1">The number of analysts that cover a stock.</Typography>}
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
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
            <Tooltip
              title={
                <>
                  <Typography variant="body1" paddingBottom={1}>
                    The MSCI ESG Rating aims to measure a company’s management of financially relevant ESG risks and
                    opportunities. MSCI uses a rules-based methodology to identify industry leaders and laggards
                    according to their exposure to ESG risks and how well they manage those risks relative to peers.
                  </Typography>
                  <Typography variant="body2">
                    The ESG Ratings range from leader (AAA, AA), average (A, BBB, BB) to laggard (B, CCC).
                  </Typography>
                </>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
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
            <Tooltip
              title={
                <Typography variant="body1">
                  The MSCI Implied Temperature Rise is a forward-looking metric designed to show the temperature
                  alignment of a company with global temperature goals.
                </Typography>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
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
                        stock={props.stock}
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
          {/* Refinitiv ESG Score */}
          <Grid item xs={6}>
            <Tooltip
              title={
                <>
                  <Typography variant="body1" paddingBottom={1}>
                    The Refinitiv ESG score measures a company’s ESG performance based on verifiable reported data in
                    the public domain.
                  </Typography>
                  <Typography variant="body2">
                    Its values range from 0 to 100, with 0 being the lowest, indicating a poor ESG performance, and 100
                    being the highest, indicating an excellent ESG performance.
                  </Typography>
                </>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
              <Typography variant="h5" mt="6px" height="21px">
                Refinitiv ESG Score
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            {props.stock ? (
              <>
                {props.stock.refinitivESGScore !== null && (
                  <RefinitivNavigator stock={props.stock}>
                    <Typography variant="body1" fontSize={18} sx={{ float: "right" }}>
                      {props.stock.refinitivESGScore}
                    </Typography>
                  </RefinitivNavigator>
                )}
              </>
            ) : (
              <Typography variant="body1" fontSize={18} sx={{ textAlign: "right" }}>
                <Skeleton width={30} sx={{ ml: "auto" }} />
              </Typography>
            )}
          </Grid>
          {/* Refinitiv Emissions */}
          <Grid item xs={6}>
            <Tooltip
              title={
                <>
                  <Typography variant="body1" paddingBottom={1}>
                    The Refinitiv emission reduction score measures a company’s commitment and effectiveness towards
                    reducing environmental emissions in its production and operational processes.
                  </Typography>
                  <Typography variant="body2">
                    Its values range from 0 to 100, with 0 being the lowest, indicating poor emission reduction efforts,
                    and 100 being the highest, indicating excellent emission reduction efforts.
                  </Typography>
                </>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
              <Typography variant="h5" mt="6px" height="21px">
                Refinitiv Emissions
              </Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            {props.stock ? (
              <>
                {props.stock.refinitivEmissions !== null && (
                  <RefinitivNavigator stock={props.stock}>
                    <Typography variant="body1" fontSize={18} sx={{ float: "right" }}>
                      {props.stock.refinitivEmissions}
                    </Typography>
                  </RefinitivNavigator>
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
            <Tooltip
              title={
                <>
                  <Typography variant="body1" paddingBottom={1}>
                    The S&P Global ESG Score measures a companies’ exposure to and performance on key ESG risks and
                    opportunities, the quality and completeness of their public disclosures, and their awareness of
                    emerging but underreported ESG issues.
                  </Typography>
                  <Typography variant="body2">
                    Its values range from 0 to 100, with 0 being the lowest, indicating a poor ESG performance, and 100
                    being the highest, indicating an excellent ESG performance.
                  </Typography>
                </>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
            >
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
              title={
                <>
                  <Typography variant="body1" paddingBottom={1}>
                    The Sustainalytics ESG Risk Rating measures the degree to which a company’s economic value is at
                    risk driven by ESG factors.
                  </Typography>
                  <Typography variant="body2">
                    Its values are distributed across five categories, where values below 10 indicate a negligible risk,
                    and values above 40 indicate a severe risk.
                  </Typography>
                </>
              }
              arrow
              placement={columns === 1 ? "bottom" : "left"}
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
