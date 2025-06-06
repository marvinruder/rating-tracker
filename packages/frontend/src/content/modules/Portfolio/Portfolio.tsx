import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NaturePeopleIcon from "@mui/icons-material/NaturePeople";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import VerifiedIcon from "@mui/icons-material/Verified";
import {
  Box,
  Card,
  Chip,
  Container,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { ComputedDatum, DatumId } from "@nivo/sunburst";
import { Sunburst } from "@nivo/sunburst";
import type {
  StockListColumn,
  Portfolio,
  SunburstNode,
  Country,
  Sector,
  SuperSector,
  SuperRegion,
  IndustryGroup,
} from "@rating-tracker/commons";
import {
  stockListColumnArray,
  handleResponse,
  getWeightedAverage,
  getEstimateValue,
  getPercentageToTotalAmount,
  getWeightedAverageMSCIESGRating,
  getWeightedStylebox,
  sizeArray,
  styleArray,
  getCountrySunburstData,
  getSunburstDatumName,
  isCountry,
  emojiFlag,
  isSuperRegion,
  getTotalAmount,
  isRegion,
  superRegionOfRegion,
  superRegionName,
  getIndustrySunburstData,
  isSuperSector,
  isSector,
  isIndustryGroup,
  superSectorName,
  superSectorOfSector,
  sectorOfIndustryGroup,
  stripPrefixFromSunburstID,
  getAnalystRatingDistribution,
  getWeightedMeanAnalystConsensus,
  parseWeightedStock,
} from "@rating-tracker/commons";
import { animated } from "@react-spring/web";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

import portfolioClient from "../../../api/portfolio";
import { BlueIconChip } from "../../../components/chips/BlueIconChip";
import { GreenIconChip } from "../../../components/chips/GreenIconChip";
import { TemperatureChip } from "../../../components/chips/TemperatureChip";
import { YellowIconChip } from "../../../components/chips/YellowIconChip";
import { Footer } from "../../../components/etc/Footer";
import { HeaderWrapper } from "../../../components/etc/HeaderWrapper";
import { StockTable } from "../../../components/stock/layouts/StockTable";
import { AnalystRatingBar } from "../../../components/stock/properties/AnalystRatingBar";
import { getSectorIconPaths } from "../../../components/stock/properties/SectorIcon";
import { StarRating } from "../../../components/stock/properties/StarRating";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import { getMSCIESGRatingColorIndex, getSustainalyticsESGRiskColorIndex } from "../../../utils/colorResolvers";
import { CurrencyWithTooltip, formatPercentage } from "../../../utils/formatters";

import { PortfolioHeader } from "./PortfolioHeader";

/**
 * A module that displays a portfolio.
 * @returns The component.
 */
const PortfolioModule = (): React.JSX.Element => {
  const [portfolio, setPortfolio] = useState<Portfolio>();
  const [columnFilter, setColumnFilter] = useState<StockListColumn[]>([...stockListColumnArray]);
  const [refetchStocksTrigger, setRefetchStocksTrigger] = useState<boolean>(false);

  const refetchStocks = () => setRefetchStocksTrigger((prev) => !prev);

  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const theme = useTheme();

  /**
   * Possible widths of the statistics container.
   */
  const columns = 1 + +useMediaQuery("(min-width:664px)") + +useMediaQuery("(min-width:964px)");

  /**
   * Fetches the portfolio with the given ID.
   * @param id The ID of the portfolio to fetch.
   */
  const getPortfolio = (id: number) => {
    portfolioClient[":id"]
      .$get({ param: { id: String(id) } })
      .then(handleResponse)
      .then((res) => ({
        ...res,
        data: { ...res.data, stocks: res.data.stocks.map((stock) => parseWeightedStock(stock)) },
      }))
      .then((res) => {
        setPortfolio(res.data);
        setCountrySunburstData(getCountrySunburstData(res.data));
        setIndustrySunburstData(getIndustrySunburstData(res.data));
      })
      .catch((e) => setErrorNotificationOrClearSession(e, "fetching portfolio"));
  };

  const { id } = useParams();

  useEffect(() => getPortfolio(Number(id)), [id]);

  const totalAmount = portfolio ? getTotalAmount(portfolio) : null;

  const totalScore = portfolio ? getWeightedAverage(portfolio, "totalScore") : null;
  const financialScore = portfolio ? getWeightedAverage(portfolio, "financialScore") : null;
  const esgScore = portfolio ? getWeightedAverage(portfolio, "esgScore") : null;

  const dividendYieldPercent = portfolio ? getWeightedAverage(portfolio, "dividendYieldPercent") : null;

  const starRating = portfolio ? getWeightedAverage(portfolio, "starRating") : null;
  const morningstarFairValue = portfolio ? getEstimateValue(portfolio, "morningstarFairValue") : null;
  const percentageToMorningstarFairValue = portfolio
    ? getPercentageToTotalAmount(portfolio, "morningstarFairValue")
    : null;
  const analystConsensus = portfolio ? getWeightedMeanAnalystConsensus(portfolio) : null;
  const analystRatings = portfolio ? getAnalystRatingDistribution(portfolio) : null;
  const analystTargetPrice = portfolio ? getEstimateValue(portfolio, "analystTargetPrice") : null;
  const percentageToAnalystTargetPrice = portfolio ? getPercentageToTotalAmount(portfolio, "analystTargetPrice") : null;

  const msciESGRating = portfolio ? getWeightedAverageMSCIESGRating(portfolio) : null;
  const msciTemperature = portfolio ? getWeightedAverage(portfolio, "msciTemperature") : null;
  const lsegESGScore = portfolio ? getWeightedAverage(portfolio, "lsegESGScore") : null;
  const lsegEmissions = portfolio ? getWeightedAverage(portfolio, "lsegEmissions") : null;
  const spESGScore = portfolio ? getWeightedAverage(portfolio, "spESGScore") : null;
  const sustainalyticsESGRisk = portfolio ? getWeightedAverage(portfolio, "sustainalyticsESGRisk") : null;

  const styleBox = portfolio ? getWeightedStylebox(portfolio) : null;

  const [countrySunburstData, setCountrySunburstData] = useState(portfolio ? getCountrySunburstData(portfolio) : null);
  const [industrySunburstData, setIndustrySunburstData] = useState(
    portfolio ? getIndustrySunburstData(portfolio) : null,
  );

  /**
   * The colors to use in the country sunburst chart based on the current selection.
   */
  const countryColors =
    countrySunburstData?.id === "root" && "children" in countrySunburstData
      ? // If everything is shown, use the region colors
        countrySunburstData.children.map((child) => theme.palette.region[child.id as SuperRegion]!)
      : isSuperRegion(countrySunburstData?.id)
        ? // If a super region is selected, use its color
          theme.palette.region[countrySunburstData.id]!
        : isRegion(countrySunburstData?.id)
          ? // If a region is selected, use the color of its super region
            theme.palette.region[superRegionOfRegion[countrySunburstData.id]]!
          : // If something goes wrong, use a default color
            theme.palette.divider;

  /**
   * The colors to use in the industry sunburst chart based on the current selection.
   */
  const industryColors =
    industrySunburstData?.id === "root" && "children" in industrySunburstData
      ? // If everything is shown, use the sector colors
        industrySunburstData.children.map(
          (child) => theme.palette.sector[stripPrefixFromSunburstID(child.id) as SuperSector]!,
        )
      : isSuperSector(stripPrefixFromSunburstID(industrySunburstData?.id))
        ? // If a super sector is selected, use its color
          theme.palette.sector[stripPrefixFromSunburstID(industrySunburstData!.id) as SuperSector]!
        : isSector(stripPrefixFromSunburstID(industrySunburstData?.id))
          ? // If a sector is selected, use the color of its super sector
            theme.palette.sector[superSectorOfSector[stripPrefixFromSunburstID(industrySunburstData!.id) as Sector]]!
          : isIndustryGroup(stripPrefixFromSunburstID(industrySunburstData?.id))
            ? // If an industry group is selected, use the color of the super sector of its sector
              theme.palette.sector[
                superSectorOfSector[
                  sectorOfIndustryGroup[stripPrefixFromSunburstID(industrySunburstData!.id) as IndustryGroup]
                ]
              ]!
            : // If something goes wrong, use a default color
              theme.palette.divider;

  /**
   * Checks whether the given path is in the sunburst data.
   * @param sunburstData The sunburst data to check.
   * @param _path The path to check, starting with the most specific segment.
   * @returns `true` if the path is in the sunburst data, `false` otherwise.
   */
  const pathInSunburstData = (sunburstData: SunburstNode, _path: readonly DatumId[]): boolean => {
    const path = [..._path];
    // Our path must end with the root node.
    // If an arc label expires when zooming out, it has a different root node and is sorted out here.
    const root = path.pop();
    if (sunburstData.id !== root) return false;
    let sunburstDataUnderInspection = { ...sunburstData };
    while (path.length) {
      const segment = path.pop();
      if (
        "children" in sunburstDataUnderInspection &&
        sunburstDataUnderInspection.children.find((child) => child.id === segment)
      ) {
        // If the current node has a child with the current segment as name, go to that child.
        sunburstDataUnderInspection = sunburstDataUnderInspection.children.find((child) => child.id === segment)!;
      } else {
        // If not, we conclude that not the entire path is in the sunburst data.
        // If an arc label expires because a corresponding stock is removed from the portfolio, its children no longer
        // exist in the sunburst data, so it is sorted out here.
        return false;
      }
    }
    // If we were able to find the most specific segment in the sunburst data, the path is in the sunburst data.
    return true;
  };

  /**
   * A tooltip component used in sunburst charts.
   * @param props The datum.
   * @param props.id The ID of the datum.
   * @param props.value The value of the datum.
   * @param props.color The color of the datum.
   * @returns The tooltip.
   */
  const SunburstTooltip = ({ id, value, color }: ComputedDatum<SunburstNode>): React.JSX.Element => (
    <Paper sx={{ px: 0.75, py: 0.5 }}>
      <Typography variant="body1" sx={{ whiteSpace: "nowrap" }}>
        <span style={{ color }}>{"\u25cf"}</span>
        {`\u2002${getSunburstDatumName(id.toString())}`}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        <span style={{ visibility: "hidden" }}>{"\u25cf"}</span>
        {`\u2002${formatPercentage(value, { total: totalAmount! })}`}
        {"\u2002·\u2002"}
        <CurrencyWithTooltip value={value} currency={portfolio!.currency} />
      </Typography>
    </Paper>
  );

  return (
    <>
      <HeaderWrapper maxWidth={false}>
        <PortfolioHeader
          portfolio={portfolio}
          getPortfolio={() => getPortfolio(Number(id))}
          refetchStocks={refetchStocks}
          stockTableFiltersProps={{ columnFilter, setColumnFilter }}
        />
      </HeaderWrapper>
      <Container maxWidth={false}>
        <Card sx={{ m: "auto", mb: 2, maxWidth: "lg" }}>
          <Grid container columns={columns} sx={{ width: "100%", margin: "auto" }}>
            {/* Average Scores */}
            <Grid size={1}>
              <Typography variant="h4" sx={{ px: "24px", py: "16px" }}>
                Average Scores
              </Typography>
              <Grid container columns={12} spacing={1} sx={{ px: "24px", pb: "20px" }}>
                {/* Total Score */}
                <Grid size={6}>
                  <Typography variant="h5" sx={{ mt: "8px" }}>
                    Total Score
                  </Typography>
                </Grid>
                <Grid size={6} sx={{ justifyContent: "flex-end" }}>
                  {portfolio ? (
                    <Box sx={{ width: "100%", display: "inline-flex", justifyContent: "end" }}>
                      <BlueIconChip
                        icon={<VerifiedIcon />}
                        label={<strong>{Math.round(Math.max(0, 100 * totalScore!))}</strong>}
                        sx={{ width: 84, fontSize: 18 }}
                      />
                    </Box>
                  ) : (
                    <Skeleton variant="rounded" width={84} height={32} sx={{ ml: "auto" }} />
                  )}
                </Grid>
                {/* Financial Score */}
                <Grid size={6}>
                  <Typography variant="h5" sx={{ mt: "8px" }}>
                    Financial Score
                  </Typography>
                </Grid>
                <Grid size={6}>
                  {portfolio ? (
                    <Box sx={{ width: "100%", display: "inline-flex", justifyContent: "end" }}>
                      <YellowIconChip
                        icon={<PriceCheckIcon />}
                        label={<strong>{Math.round(Math.max(0, 100 * financialScore!))}</strong>}
                        sx={{ width: 84, fontSize: 18 }}
                      />
                    </Box>
                  ) : (
                    <Skeleton variant="rounded" width={84} height={32} sx={{ ml: "auto" }} />
                  )}
                </Grid>
                {/* ESG Score */}
                <Grid size={6}>
                  <Typography variant="h5" sx={{ mt: "8px" }}>
                    ESG Score
                  </Typography>
                </Grid>
                <Grid size={6}>
                  {portfolio ? (
                    <Box sx={{ width: "100%", display: "inline-flex", justifyContent: "end" }}>
                      <GreenIconChip
                        icon={<NaturePeopleIcon />}
                        label={<strong>{Math.round(Math.max(0, 100 * esgScore!))}</strong>}
                        sx={{ width: 84, fontSize: 18 }}
                      />
                    </Box>
                  ) : (
                    <Skeleton variant="rounded" width={84} height={32} sx={{ ml: "auto" }} />
                  )}
                </Grid>
              </Grid>
              <Typography variant="h4" sx={{ px: "24px", pb: "16px" }}>
                Average Financial Data
              </Typography>
              <Grid container columns={12} spacing={1} sx={{ px: "24px", pb: "20px" }}>
                {/* Dividend Yield */}
                <Grid size={4.5}>
                  <Typography variant="h5">Dividend Yield</Typography>
                </Grid>
                <Grid size={7.5}>
                  <Typography variant="body1" sx={{ textAlign: "right" }}>
                    {portfolio ? (
                      formatPercentage(dividendYieldPercent, { total: 100 })
                    ) : (
                      <Skeleton width={50} sx={{ ml: "auto" }} />
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            {/* Average Financial Ratings */}
            <Grid size={1}>
              {/* Financials */}
              <Typography variant="h4" sx={{ px: "24px", py: "16px" }}>
                Average Financial Ratings
              </Typography>
              <Grid container columns={12} spacing={1} sx={{ px: "24px", pb: "20px" }}>
                {/* Morningstar Star Rating */}
                <Grid size={6}>
                  <Typography variant="h5">
                    Morningstar
                    <br />
                    Star Rating
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Box sx={{ width: "100%", display: "inline-flex", justifyContent: "end", mt: "4px", height: "24px" }}>
                    {portfolio ? (
                      <StarRating value={starRating} />
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
                </Grid>
                {/* Morningstar Fair Value */}
                <Grid size={6}>
                  <Typography variant="h5" sx={{ height: "35px" }}>
                    Morningstar
                    <br />
                    Fair Value
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body1" sx={{ textAlign: "right" }}>
                    {portfolio ? (
                      <CurrencyWithTooltip value={morningstarFairValue} currency={portfolio.currency} />
                    ) : (
                      <Skeleton width={90} sx={{ ml: "auto" }} />
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "right" }}>
                    {portfolio ? (
                      formatPercentage(percentageToMorningstarFairValue, {
                        total: 100,
                        precision: 2,
                        forceSign: true,
                        fallbackString: "",
                      })
                    ) : (
                      <Skeleton width={45} sx={{ ml: "auto" }} />
                    )}
                  </Typography>
                </Grid>
                {/* Analyst Consensus */}
                <Grid size={6}>
                  <Typography variant="h5" sx={{ height: "35px" }}>
                    Analyst
                    <br />
                    Consensus
                  </Typography>
                </Grid>
                <Grid size={6}>
                  {portfolio ? (
                    <>
                      {analystConsensus !== null && analystRatings !== null && (
                        <Box sx={{ width: "100%", display: "inline-flex", justifyContent: "end" }}>
                          <Box sx={{ width: "100%", display: "block" }}>
                            <AnalystRatingBar stock={{ analystConsensus, analystRatings }} />
                          </Box>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Skeleton variant="rounded" height={42} sx={{ ml: "auto", mt: "4px" }} />
                  )}
                </Grid>
                {/* Analyst Target Price */}
                <Grid size={6}>
                  <Typography variant="h5" sx={{ height: "35px" }}>
                    Analyst Target
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body1" sx={{ float: "right" }}>
                    {portfolio ? (
                      <CurrencyWithTooltip value={analystTargetPrice} currency={portfolio.currency} />
                    ) : (
                      <Skeleton width={90} sx={{ ml: "auto" }} />
                    )}
                  </Typography>
                  <br />
                  <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "right" }}>
                    {portfolio ? (
                      formatPercentage(percentageToAnalystTargetPrice, {
                        total: 100,
                        precision: 2,
                        forceSign: true,
                        fallbackString: "",
                      })
                    ) : (
                      <Skeleton width={45} sx={{ ml: "auto" }} />
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            {/* Average ESG Ratings */}
            <Grid size={1}>
              <Typography variant="h4" sx={{ px: "24px", py: "16px" }}>
                Average ESG Ratings
              </Typography>
              <Grid container columns={12} spacing={1} sx={{ px: "24px", pb: "20px" }}>
                {/* MSCI ESG Rating */}
                <Grid size={6}>
                  <Typography variant="h5" sx={{ mt: "5px", height: "19px" }}>
                    MSCI ESG Rating
                  </Typography>
                </Grid>
                <Grid size={6}>
                  {portfolio ? (
                    <>
                      {msciESGRating && (
                        <Box sx={{ width: "100%", display: "inline-flex", justifyContent: "end" }}>
                          <Chip
                            label={<strong>{msciESGRating}</strong>}
                            sx={{
                              backgroundColor: theme.palette.msci[getMSCIESGRatingColorIndex({ msciESGRating })],
                              color: theme.palette.trueWhite.main,
                              width: 48,
                            }}
                            size="small"
                          />
                        </Box>
                      )}
                    </>
                  ) : (
                    <Skeleton variant="rounded" width={48} height={24} sx={{ ml: "auto" }} />
                  )}
                </Grid>
                {/* MSCI Implied Temperature Rise */}
                <Grid size={6}>
                  <Typography variant="h5" sx={{ height: "35px" }}>
                    MSCI Implied
                    <br />
                    Temperature Rise
                  </Typography>
                </Grid>
                <Grid size={6}>
                  {portfolio ? (
                    <>
                      {msciTemperature !== null && (
                        <Box sx={{ width: "100%", display: "inline-flex", justifyContent: "end" }}>
                          <TemperatureChip
                            msciTemperature={msciTemperature}
                            icon={<ThermostatIcon />}
                            label={<strong>{`${Number(msciTemperature.toFixed(1))}\u2009℃`}</strong>}
                            size="small"
                            sx={{ width: 75, mt: "4px" }}
                          />
                        </Box>
                      )}
                    </>
                  ) : (
                    <Skeleton variant="rounded" width={75} height={24} sx={{ mt: "4px", ml: "auto" }} />
                  )}
                </Grid>
                {/* LSEG ESG Score */}
                <Grid size={6}>
                  <Typography variant="h5" sx={{ mt: "6px", height: "21px" }}>
                    LSEG ESG Score
                  </Typography>
                </Grid>
                <Grid size={6}>
                  {portfolio ? (
                    <>
                      {lsegESGScore !== null && (
                        <Typography variant="body1" sx={{ fontSize: 18, float: "right" }}>
                          {Math.round(lsegESGScore)}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body1" sx={{ fontSize: 18, textAlign: "right" }}>
                      <Skeleton width={30} sx={{ ml: "auto" }} />
                    </Typography>
                  )}
                </Grid>
                {/* LSEG Emissions */}
                <Grid size={6}>
                  <Typography variant="h5" sx={{ mt: "6px", height: "21px" }}>
                    LSEG Emissions
                  </Typography>
                </Grid>
                <Grid size={6}>
                  {portfolio ? (
                    <>
                      {lsegEmissions !== null && (
                        <Typography variant="body1" sx={{ fontSize: 18, float: "right" }}>
                          {Math.round(lsegEmissions)}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body1" sx={{ fontSize: 18, textAlign: "right" }}>
                      <Skeleton width={30} sx={{ ml: "auto" }} />
                    </Typography>
                  )}
                </Grid>
                {/* S&P ESG Score */}
                <Grid size={6}>
                  <Typography variant="h5" sx={{ mt: "6px", height: "21px" }}>
                    S&P ESG Score
                  </Typography>
                </Grid>
                <Grid size={6}>
                  {portfolio ? (
                    <>
                      {spESGScore !== null && (
                        <Typography variant="body1" sx={{ fontSize: 18, float: "right" }}>
                          {Math.round(spESGScore)}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body1" sx={{ fontSize: 18, textAlign: "right" }}>
                      <Skeleton width={30} sx={{ ml: "auto" }} />
                    </Typography>
                  )}
                </Grid>
                {/* Sustainalytics ESG Risk */}
                <Grid size={6}>
                  <Typography variant="h5">
                    Sustainalytics
                    <br />
                    ESG Risk
                  </Typography>
                </Grid>
                <Grid size={6}>
                  {portfolio ? (
                    <>
                      {sustainalyticsESGRisk !== null && (
                        <Box sx={{ width: "100%", display: "inline-flex", justifyContent: "end" }}>
                          <Chip
                            label={<strong>{Number(sustainalyticsESGRisk.toFixed(1))}</strong>}
                            sx={{
                              backgroundColor:
                                theme.palette.sustainalytics[
                                  getSustainalyticsESGRiskColorIndex({ sustainalyticsESGRisk })
                                ],
                              width: 64,
                              mt: "4px",
                            }}
                            size="small"
                          />
                        </Box>
                      )}
                    </>
                  ) : (
                    <Skeleton variant="rounded" width={64} height={24} sx={{ mt: "4px", ml: "auto" }} />
                  )}
                </Grid>
              </Grid>
            </Grid>
            {/* Morningstar StyleBox */}
            <Grid size={1}>
              <Typography variant="h4" sx={{ px: "24px", py: "16px" }}>
                Morningstar StyleBox
              </Typography>
              <Grid
                container
                spacing={0}
                columns={3}
                sx={{ mx: "auto", maxWidth: "264px", px: "24px", pb: "20px", ...(columns === 3 && { pt: "8px" }) }}
              >
                {sizeArray.toReversed().map((size) =>
                  styleArray.map((style) => (
                    <Grid
                      size={1}
                      key={`${size}-${style}`}
                      sx={(theme) => ({
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        aspectRatio: 1,
                        border: `1px solid ${theme.palette.black.main}`,
                        backgroundColor:
                          theme.palette.primary.main +
                          // Add transparency to the background color based on the value of the style box.
                          Math.round(255 * (styleBox ? (styleBox[`${size}-${style}`] ?? 0) : 0))
                            .toString(16)
                            .padStart(2, "0"),
                        ...(size !== "Large" && { borderTop: "1px solid transparent" }),
                        ...(style !== "Value" && { borderLeft: "1px solid transparent" }),
                      })}
                    >
                      <Tooltip title={`${size}-${style}`} arrow>
                        <Typography variant="body1">
                          {styleBox && formatPercentage(styleBox[`${size}-${style}`])}
                        </Typography>
                      </Tooltip>
                    </Grid>
                  )),
                )}
              </Grid>
            </Grid>
            {/* Regions */}
            <Grid size={1}>
              <Typography variant="h4" sx={{ px: "24px", py: "16px" }}>
                Regions
              </Typography>
              <IconButton
                color="primary"
                onClick={() => portfolio && setCountrySunburstData(getCountrySunburstData(portfolio))}
                sx={{
                  mx: "24px",
                  visibility: countrySunburstData && countrySunburstData.id !== "root" ? "visible" : "hidden",
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box sx={{ width: 216, mx: "auto", mt: "-32px", mb: 1 }}>
                {countrySunburstData && "children" in countrySunburstData && countrySunburstData.children.length ? (
                  <Sunburst
                    width={216}
                    height={216}
                    data={countrySunburstData}
                    tooltip={SunburstTooltip}
                    theme={{ tooltip: { container: { background: theme.palette.background.paper } } }}
                    borderColor={theme.palette.background.paper}
                    cornerRadius={4}
                    colors={countryColors}
                    childColor={{ from: "color", modifiers: [["brighter", 0.5]] }}
                    // Margins guarantee that arc labels are not cut off
                    margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
                    enableArcLabels
                    arcLabelsComponent={({ datum, style }) =>
                      // Only show arc labels for countries
                      isCountry(datum.id.toString()) &&
                      // As some arc labels are not removed when the corresponding information expires (e.g. by zooming
                      // out or deleting stocks), we need to perform some manual checks to find out whether its data is
                      // valid.
                      pathInSunburstData(countrySunburstData, datum.path) ? (
                        <animated.g transform={style.transform} style={{ pointerEvents: "none" }}>
                          <circle stroke={theme.palette.background.paper} strokeWidth={1} fill={datum.color} r={12} />
                          <text textAnchor="middle" dominantBaseline="central" style={{ fontSize: 16 }}>
                            {emojiFlag(datum.id.toString() as Country)}
                          </text>
                        </animated.g>
                      ) : (
                        <></>
                      )
                    }
                    arcLabelsSkipAngle={15}
                    motionConfig="default"
                    transitionMode="pushIn"
                    // Only allow zooming in if the current selection has child nodes to display
                    onClick={(d) => "children" in d.data && setCountrySunburstData(d.data)}
                  />
                ) : (
                  <></>
                )}
              </Box>
              {countrySunburstData && "children" in countrySunburstData && countrySunburstData.children.length ? (
                <Grid
                  container
                  columnSpacing={1}
                  rowSpacing={0}
                  sx={{ px: "24px", pb: "20px", justifyContent: "center" }}
                >
                  <Grid>
                    <Typography variant="body2">
                      <span style={{ color: theme.palette.region["Americas"] }}>{"\u25cf"}</span>
                      {` ${superRegionName["Americas"]}`}
                    </Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="body2">
                      <span style={{ color: theme.palette.region["EMEA"] }}>{"\u25cf"}</span>
                      {` ${superRegionName["EMEA"]}`}
                    </Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="body2">
                      <span style={{ color: theme.palette.region["Asia"] }}>{"\u25cf"}</span>
                      {` ${superRegionName["Asia"]}`}
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <></>
              )}
            </Grid>
            {/* Industry Sectors */}
            <Grid size={1}>
              <Typography variant="h4" sx={{ px: "24px", py: "16px" }}>
                Industry Sectors
              </Typography>
              <IconButton
                color="primary"
                onClick={() => portfolio && setIndustrySunburstData(getIndustrySunburstData(portfolio))}
                sx={{
                  mx: "24px",
                  visibility: industrySunburstData && industrySunburstData.id !== "root" ? "visible" : "hidden",
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box sx={{ width: 216, mx: "auto", mt: "-32px", mb: 1 }}>
                {industrySunburstData && "children" in industrySunburstData && industrySunburstData.children.length ? (
                  <Sunburst
                    width={216}
                    height={216}
                    data={industrySunburstData}
                    tooltip={SunburstTooltip}
                    theme={{ tooltip: { container: { background: theme.palette.background.paper } } }}
                    borderColor={theme.palette.background.paper}
                    cornerRadius={4}
                    colors={industryColors}
                    childColor={{ from: "color", modifiers: [["brighter", 0.5]] }}
                    // Margins guarantee that arc labels are not cut off
                    margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
                    enableArcLabels
                    arcLabelsComponent={({ datum, style }) =>
                      // Only show arc labels for super sectors and sectors
                      (isSuperSector(stripPrefixFromSunburstID(datum.id.toString())) ||
                        isSector(stripPrefixFromSunburstID(datum.id.toString()))) &&
                      // As some arc labels are not removed when the corresponding information expires (e.g. by zooming
                      // out or deleting stocks), we need to perform some manual checks to find out whether its data is
                      // valid.
                      pathInSunburstData(industrySunburstData, datum.path) ? (
                        <animated.g
                          transform={style.transform}
                          fill={
                            isSuperSector(stripPrefixFromSunburstID(datum.id.toString()))
                              ? theme.palette.background.paper
                              : datum.color
                          }
                          width={15}
                          height={15}
                          style={{ pointerEvents: "none" }}
                        >
                          <g transform={`translate(-10, -10) scale(${(4 / 3).toString()})`}>
                            <rect
                              x={1 / 3}
                              y={1 / 3}
                              width={15 - 2 / 3}
                              height={15 - 2 / 3}
                              stroke={theme.palette.background.paper}
                              strokeWidth={isSuperSector(stripPrefixFromSunburstID(datum.id.toString())) ? 3 / 4 : 0}
                              fill={
                                isSuperSector(stripPrefixFromSunburstID(datum.id.toString()))
                                  ? datum.color
                                  : theme.palette.background.paper
                              }
                            />
                            {getSectorIconPaths(stripPrefixFromSunburstID(datum.id.toString()) as SuperSector | Sector)}
                          </g>
                        </animated.g>
                      ) : (
                        <></>
                      )
                    }
                    arcLabelsSkipAngle={15}
                    motionConfig="default"
                    transitionMode="pushIn"
                    // Only allow zooming in if the current selection has child nodes to display
                    onClick={(d) => "children" in d.data && setIndustrySunburstData(d.data)}
                  />
                ) : (
                  <></>
                )}
              </Box>
              {industrySunburstData && "children" in industrySunburstData && industrySunburstData.children.length ? (
                <Grid
                  container
                  columnSpacing={1}
                  rowSpacing={0}
                  sx={{ px: "24px", pb: "20px", justifyContent: "center" }}
                >
                  <Grid>
                    <Typography variant="body2">
                      <span style={{ color: theme.palette.sector["Cyclical"] }}>{"\u25cf"}</span>
                      {` ${superSectorName["Cyclical"]}`}
                    </Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="body2">
                      <span style={{ color: theme.palette.sector["Defensive"] }}>{"\u25cf"}</span>
                      {` ${superSectorName["Defensive"]}`}
                    </Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="body2">
                      <span style={{ color: theme.palette.sector["Sensitive"] }}>{"\u25cf"}</span>
                      {` ${superSectorName["Sensitive"]}`}
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <></>
              )}
            </Grid>
          </Grid>
        </Card>
        <StockTable
          refetchInitialStocksTrigger={refetchStocksTrigger}
          portfolio={portfolio ?? null}
          getPortfolio={() => getPortfolio(Number(id))}
          showSkeletons={!portfolio}
          columns={columnFilter}
        />
      </Container>
      <Footer />
    </>
  );
};

export default PortfolioModule;
