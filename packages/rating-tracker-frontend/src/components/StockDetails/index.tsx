import {
  Box,
  Grid,
  DialogTitle,
  Typography,
  DialogContent,
  useTheme,
  Tooltip,
  Chip,
  styled,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import {
  countryNameWithFlag,
  groupOfIndustry,
  industryGroupName,
  industryName,
  regionName,
  regionOfCountry,
  sectorName,
  sectorOfIndustryGroup,
  Stock,
  superSectorName,
  superSectorOfSector,
} from "rating-tracker-commons";
import formatMarketCap from "../../helpers/formatters";
import Range52WSlider from "../Range52WSlider";
import SectorIcon from "../SectorIcon";
import StyleBox from "../StyleBox";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import NaturePeopleIcon from "@mui/icons-material/NaturePeople";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import {
  navigateToMarketScreener,
  navigateToMorningstar,
  navigateToMSCI,
  navigateToRefinitiv,
  navigateToSP,
  navigateToSustainalytics,
} from "../../helpers/navigators";
import StarRating from "../StarRating";

const StockDetails = (props: StockDetailsProps) => {
  const theme = useTheme();

  const TemperatureChip = styled(Chip)(() => ({
    ".MuiChip-icon": {
      color:
        props.stock.msciTemperature <= 1.5
          ? theme.colors.msci.Aligned1
          : props.stock.msciTemperature <= 2.0
          ? theme.colors.msci.Aligned2
          : props.stock.msciTemperature <= 3.2
          ? theme.colors.msci.Misaligned
          : theme.colors.msci.StronglyMisaligned,
    },
  }));
  const GreenIconChip = styled(Chip)(() => ({
    ".MuiChip-icon": {
      color: theme.colors.sector.Defensive,
    },
  }));
  const YellowIconChip = styled(Chip)(() => ({
    ".MuiChip-icon": {
      color: theme.colors.msci.Average,
    },
  }));
  const BlueIconChip = styled(Chip)(() => ({
    ".MuiChip-icon": {
      color: theme.colors.primary.main,
    },
  }));

  let detailsContainerWidth: 900 | 600 | 300;

  switch (
    +useMediaQuery("(min-width:964px)") + +useMediaQuery("(min-width:664px)")
  ) {
    case 2:
      detailsContainerWidth =
        props.maxWidth && props.maxWidth < 900 ? props.maxWidth : 900;
      break;
    case 1:
      detailsContainerWidth =
        props.maxWidth && props.maxWidth < 600 ? props.maxWidth : 600;
      break;
    case 0:
      detailsContainerWidth =
        props.maxWidth && props.maxWidth < 300 ? props.maxWidth : 300;
      break;
  }

  return (
    <Grid container width={detailsContainerWidth} margin="auto">
      <Grid item width={300} order={1}>
        <DialogTitle>
          <Typography variant="h4">Key Figures</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Typography variant="h5">Country</Typography>
            </Grid>
            <Grid item xs={9}>
              <Typography variant="body1">
                {props.stock ? (
                  countryNameWithFlag[props.stock?.country]
                ) : (
                  <Skeleton width={160} />
                )}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="h5">Region</Typography>
            </Grid>
            <Grid item xs={9}>
              <Typography variant="body1">
                {props.stock ? (
                  regionName[regionOfCountry[props.stock?.country]]
                ) : (
                  <Skeleton width={160} />
                )}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="h5">StyleBox</Typography>
            </Grid>
            <Grid item xs={9}>
              {props.stock ? (
                <Tooltip
                  title={
                    props.stock.size && props.stock.style
                      ? `${props.stock.size}-${props.stock.style}`
                      : undefined
                  }
                  arrow
                >
                  <Box
                    sx={{
                      width: 2.75 * (theme.typography.body1.fontSize as number),
                      height:
                        2.75 * (theme.typography.body1.fontSize as number),
                    }}
                  >
                    <StyleBox
                      fill={theme.colors.alpha.black[100]}
                      stroke={theme.colors.alpha.black[100]}
                      size={props.stock.size}
                      style={props.stock.style}
                      length={
                        2.75 * (theme.typography.body1.fontSize as number)
                      }
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
            <Grid item xs={3}>
              <Typography variant="h5" height={78}>
                Industry
              </Typography>
            </Grid>
            <Grid item xs={9}>
              {props.stock ? (
                <>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {props.stock.industry && (
                      <SectorIcon
                        industry={props.stock.industry}
                        length={
                          1.75 * (theme.typography.body2.fontSize as number)
                        }
                        type={"SuperSector"}
                      />
                    )}
                    <span style={{ width: 6 }} />
                    <Typography variant="body1">
                      {props.stock.industry &&
                        superSectorName[
                          superSectorOfSector[
                            sectorOfIndustryGroup[
                              groupOfIndustry[props.stock.industry]
                            ]
                          ]
                        ]}
                    </Typography>
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {props.stock.industry && (
                      <SectorIcon
                        industry={props.stock.industry}
                        length={
                          1.75 * (theme.typography.body1.fontSize as number)
                        }
                        type={"Sector"}
                      />
                    )}
                    <span style={{ width: 6 }} />
                    <Typography variant="body1">
                      {props.stock.industry &&
                        sectorName[
                          sectorOfIndustryGroup[
                            groupOfIndustry[props.stock.industry]
                          ]
                        ]}
                    </Typography>
                  </span>
                  <Typography
                    variant="body1"
                    ml={`${
                      6 + 1.75 * (theme.typography.body1.fontSize as number)
                    }px`}
                  >
                    {props.stock.industry &&
                      industryGroupName[groupOfIndustry[props.stock.industry]]}
                  </Typography>
                  <Typography
                    variant="body1"
                    ml={`${
                      6 + 1.75 * (theme.typography.body1.fontSize as number)
                    }px`}
                  >
                    {props.stock.industry && industryName[props.stock.industry]}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body1">
                    <Skeleton width={100} />
                  </Typography>
                  <Typography variant="body1">
                    <Skeleton width={130} />
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
        </DialogContent>
      </Grid>
      <Grid item width={300} order={detailsContainerWidth === 900 ? 2 : 5}>
        <DialogTitle>
          <Typography variant="h4">Financial Data</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            <Grid item xs={4.5}>
              <Typography variant="h5">Dividend Yield</Typography>
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
            <Grid item xs={4.5}>
              <Typography variant="h5">
                P{"\u2009"}/{"\u2009"}E Ratio
              </Typography>
            </Grid>
            <Grid item xs={7.5}>
              <Typography variant="body1" sx={{ textAlign: "right" }}>
                {props.stock ? (
                  <>{props.stock.priceEarningRatio ?? "–"}</>
                ) : (
                  <Skeleton width={45} sx={{ ml: "auto" }} />
                )}
              </Typography>
            </Grid>
            <Grid item xs={4.5}>
              <Typography variant="h5">Market Cap</Typography>
            </Grid>
            <Grid item xs={7.5}>
              <Typography variant="body1" sx={{ textAlign: "right" }}>
                {props.stock ? (
                  <>
                    {props.stock.currency ?? ""}{" "}
                    {props.stock.marketCap ? formatMarketCap(props.stock) : "–"}
                  </>
                ) : (
                  <Skeleton width={60} sx={{ ml: "auto" }} />
                )}
              </Typography>
            </Grid>
            <Grid item xs={4.5} mt="11.5px">
              <Typography variant="h5">52W Range</Typography>
            </Grid>
            <Grid item xs={7.5}>
              {props.stock ? (
                <>
                  {props.stock?.lastClose &&
                    props.stock?.low52w &&
                    props.stock.high52w && (
                      <Range52WSlider
                        size="small"
                        sx={{
                          mb: `${
                            -0.5 * (theme.typography.body2.fontSize as number)
                          }px`,
                          mt: `${
                            0.5 * (theme.typography.body2.fontSize as number)
                          }px`,
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
                <Skeleton variant="rectangular" width={150} height={42} />
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Grid>
      <Grid item width={300} order={detailsContainerWidth === 900 ? 3 : 2}>
        <DialogTitle>
          <Typography variant="h4">Overall Scores</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="h5" mt="8px">
                Total Score
              </Typography>
            </Grid>
            <Grid item xs={6}>
              {props.stock ? (
                <BlueIconChip
                  icon={<EmojiEventsIcon />}
                  label={
                    <strong>
                      {Math.round(
                        Math.max(0, 100 * props.stock?.getTotalScore())
                      )}
                    </strong>
                  }
                  sx={{ width: 84, fontSize: 18, ml: "37.5px" }}
                />
              ) : (
                <Skeleton
                  variant="rounded"
                  width={84}
                  height={32}
                  sx={{ ml: "auto" }}
                />
              )}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5" mt="8px">
                Financial Score
              </Typography>
            </Grid>
            <Grid item xs={6}>
              {props.stock ? (
                <YellowIconChip
                  icon={<PriceCheckIcon />}
                  label={
                    <strong>
                      {Math.round(
                        Math.max(0, 100 * props.stock?.getFinancialScore())
                      )}
                    </strong>
                  }
                  sx={{ width: 84, fontSize: 18, ml: "37.5px" }}
                />
              ) : (
                <Skeleton
                  variant="rounded"
                  width={84}
                  height={32}
                  sx={{ ml: "auto" }}
                />
              )}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5" mt="8px">
                ESG Score
              </Typography>
            </Grid>
            <Grid item xs={6}>
              {props.stock ? (
                <GreenIconChip
                  icon={<NaturePeopleIcon />}
                  label={
                    <strong>
                      {Math.round(
                        Math.max(0, 100 * props.stock?.getESGScore())
                      )}
                    </strong>
                  }
                  sx={{ width: 84, fontSize: 18, ml: "37.5px" }}
                />
              ) : (
                <Skeleton
                  variant="rounded"
                  width={84}
                  height={32}
                  sx={{ ml: "auto" }}
                />
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Grid>
      <Grid item width={300} order={detailsContainerWidth === 900 ? 4 : 3}>
        <DialogTitle>
          <Typography variant="h4">Financial Ratings</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="h5">
                Morningstar
                <br />
                Star Rating
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Box
                onClick={() => navigateToMorningstar(props.stock)}
                sx={{
                  cursor: props.stock?.morningstarId ? "pointer" : undefined,
                  ml: "1.5px",
                  mt: "4px",
                  height: "24px",
                }}
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
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5" height="35px">
                Morningstar
                <br />
                Fair Value
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <span
                onClick={() => navigateToMorningstar(props.stock)}
                style={{
                  cursor: props.stock?.morningstarId ? "pointer" : undefined,
                }}
              >
                <Typography variant="body1" sx={{ textAlign: "right" }}>
                  {props.stock ? (
                    <>
                      {props.stock?.currency ?? ""}{" "}
                      {props.stock?.morningstarFairValue?.toFixed(2) ?? "–"}
                    </>
                  ) : (
                    <Skeleton width={90} sx={{ ml: "auto" }} />
                  )}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "right" }}
                >
                  {props.stock ? (
                    <>
                      {props.stock?.morningstarFairValue &&
                        props.stock?.lastClose &&
                        `${
                          props.stock?.lastClose >
                          props.stock?.morningstarFairValue
                            ? "+"
                            : ""
                        }${Math.round(
                          props.stock?.getPercentageToLastClose(
                            "morningstarFairValue"
                          )
                        )}\u2009%`}
                    </>
                  ) : (
                    <Skeleton width={45} sx={{ ml: "auto" }} />
                  )}
                </Typography>
              </span>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5" height="19px" mt="5px">
                Analyst Consensus
              </Typography>
            </Grid>
            <Grid item xs={6}>
              {props.stock ? (
                <>
                  {props.stock?.analystConsensus && (
                    <span
                      onClick={() => navigateToMarketScreener(props.stock)}
                      style={{
                        cursor: props.stock.marketScreenerId
                          ? "pointer"
                          : undefined,
                      }}
                    >
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
                          opacity:
                            props.stock.analystCount < 10
                              ? props.stock.analystCount / 10
                              : 1,
                          width: 60,
                          ml: "61.5px",
                        }}
                        size="small"
                      />
                    </span>
                  )}
                </>
              ) : (
                <Skeleton
                  variant="rounded"
                  width={60}
                  height={24}
                  sx={{ ml: "auto" }}
                />
              )}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5" height="35px">
                Analyst Target
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <span
                onClick={() => navigateToMarketScreener(props.stock)}
                style={{
                  cursor: props.stock?.marketScreenerId ? "pointer" : undefined,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    opacity:
                      props.stock?.analystCount < 10
                        ? props.stock?.analystCount / 10
                        : 1,
                    float: "right",
                  }}
                >
                  {props.stock ? (
                    <>
                      {props.stock?.currency ?? ""}{" "}
                      {props.stock?.analystTargetPrice?.toFixed(2) ?? "–"}
                    </>
                  ) : (
                    <Skeleton width={90} sx={{ ml: "auto" }} />
                  )}
                </Typography>
                <br />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "right" }}
                >
                  {props.stock ? (
                    <>
                      {props.stock?.analystTargetPrice &&
                        props.stock?.analystCount &&
                        props.stock?.lastClose &&
                        `${
                          props.stock.lastClose > props.stock.analystTargetPrice
                            ? "+"
                            : ""
                        }${Math.round(
                          props.stock.getPercentageToLastClose(
                            "analystTargetPrice"
                          )
                        )}\u2009%`}
                    </>
                  ) : (
                    <Skeleton width={45} sx={{ ml: "auto" }} />
                  )}
                </Typography>
              </span>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5">Analyst Count</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" sx={{ textAlign: "right" }}>
                {props.stock ? (
                  <>
                    {props.stock?.analystTargetPrice &&
                      props.stock?.analystCount &&
                      props.stock?.lastClose &&
                      `n\u2009=\u2009${props.stock?.analystCount}`}
                  </>
                ) : (
                  <Skeleton width={60} sx={{ ml: "auto" }} />
                )}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
      </Grid>
      <Grid item width={300} order={detailsContainerWidth === 900 ? 5 : 4}>
        <DialogTitle>
          <Typography variant="h4">ESG Ratings</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="h5" mt="5px" height="19px">
                MSCI ESG Rating
              </Typography>
            </Grid>
            <Grid item xs={6}>
              {props.stock ? (
                <>
                  {props.stock.msciESGRating && (
                    <span
                      onClick={() => navigateToMSCI(props.stock)}
                      style={{
                        cursor: props.stock.msciId ? "pointer" : undefined,
                      }}
                    >
                      <Chip
                        label={<strong>{props.stock.msciESGRating}</strong>}
                        style={{ cursor: "inherit" }}
                        sx={{
                          backgroundColor: ["AAA", "AA"].includes(
                            props.stock.msciESGRating
                          )
                            ? theme.colors.msci.Leader
                            : ["B", "CCC"].includes(props.stock.msciESGRating)
                            ? theme.colors.msci.Laggard
                            : theme.colors.msci.Average,
                          color: theme.colors.alpha.trueWhite[100],
                          width: 48,
                          ml: "73.5px",
                        }}
                        size="small"
                      />
                    </span>
                  )}
                </>
              ) : (
                <Skeleton
                  variant="rounded"
                  width={48}
                  height={24}
                  sx={{ ml: "auto" }}
                />
              )}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5">
                MSCI Implied Temperature Rise
              </Typography>
            </Grid>
            <Grid item xs={6}>
              {props.stock ? (
                <>
                  {props.stock.msciTemperature && (
                    <span
                      onClick={() => navigateToMSCI(props.stock)}
                      style={{
                        cursor: props.stock.msciId ? "pointer" : undefined,
                      }}
                    >
                      <TemperatureChip
                        icon={<ThermostatIcon />}
                        label={
                          <strong>{props.stock.msciTemperature + "°C"}</strong>
                        }
                        size="small"
                        sx={{ width: 72, ml: "49.5px", mt: "4px" }}
                        style={{ cursor: "inherit" }}
                      />
                    </span>
                  )}
                </>
              ) : (
                <Skeleton
                  variant="rounded"
                  width={72}
                  height={24}
                  sx={{ mt: "4px", ml: "auto" }}
                />
              )}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5" mt="6px" height="21px">
                Refinitiv ESG Score
              </Typography>
            </Grid>
            <Grid item xs={6}>
              {props.stock ? (
                <>
                  {props.stock.refinitivESGScore && (
                    <span
                      onClick={() => navigateToRefinitiv(props.stock)}
                      style={{
                        cursor: props.stock.ric ? "pointer" : undefined,
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontSize={18}
                        sx={{ float: "right" }}
                      >
                        {props.stock.refinitivESGScore}
                      </Typography>
                    </span>
                  )}
                </>
              ) : (
                <Typography
                  variant="body1"
                  fontSize={18}
                  sx={{ textAlign: "right" }}
                >
                  <Skeleton width={30} sx={{ ml: "auto" }} />
                </Typography>
              )}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5" mt="6px" height="21px">
                Refinitiv Emissions
              </Typography>
            </Grid>
            <Grid item xs={6}>
              {props.stock ? (
                <>
                  {props.stock.refinitivEmissions && (
                    <span
                      onClick={() => navigateToRefinitiv(props.stock)}
                      style={{
                        cursor: props.stock.ric ? "pointer" : undefined,
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontSize={18}
                        sx={{ float: "right" }}
                      >
                        {props.stock.refinitivEmissions}
                      </Typography>
                    </span>
                  )}
                </>
              ) : (
                <Typography
                  variant="body1"
                  fontSize={18}
                  sx={{ textAlign: "right" }}
                >
                  <Skeleton width={30} sx={{ ml: "auto" }} />
                </Typography>
              )}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5" mt="6px" height="21px">
                S&P ESG Score
              </Typography>
            </Grid>
            <Grid item xs={6}>
              {props.stock ? (
                <>
                  {props.stock.spESGScore && (
                    <span
                      onClick={() => navigateToSP(props.stock)}
                      style={{
                        cursor: props.stock.spId ? "pointer" : undefined,
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontSize={18}
                        sx={{ float: "right" }}
                      >
                        {props.stock.spESGScore}
                      </Typography>
                    </span>
                  )}
                </>
              ) : (
                <Typography
                  variant="body1"
                  fontSize={18}
                  sx={{ textAlign: "right" }}
                >
                  <Skeleton width={30} sx={{ ml: "auto" }} />
                </Typography>
              )}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5">
                Sustainalytics
                <br />
                ESG Risk
              </Typography>
            </Grid>
            <Grid item xs={6}>
              {props.stock ? (
                <>
                  {props.stock.sustainalyticsESGRisk && (
                    <span
                      onClick={() => navigateToSustainalytics(props.stock)}
                      style={{
                        cursor: props.stock.sustainalyticsId
                          ? "pointer"
                          : undefined,
                      }}
                    >
                      <Chip
                        label={
                          <strong>{props.stock.sustainalyticsESGRisk}</strong>
                        }
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
                          ml: "57.5px",
                          mt: "4px",
                        }}
                        size="small"
                      />
                    </span>
                  )}
                </>
              ) : (
                <Skeleton
                  variant="rounded"
                  width={64}
                  height={24}
                  sx={{ mt: "4px", ml: "auto" }}
                />
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Grid>
      <Grid item width={300} order={6} px="24px" pt="14px" pb="20px">
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

interface StockDetailsProps {
  stock?: Stock;
  maxWidth?: 600 | 300;
}

export default StockDetails;
