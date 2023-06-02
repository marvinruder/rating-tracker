import { Watchlist, watchlistEndpointPath } from "@rating-tracker/commons";
import { useEffect, useState } from "react";
import PageTitleWrapper from "../../../components/PageTitleWrapper";
import PageHeader from "./PageHeader";
import axios from "axios";
import { baseUrl } from "../../../router";
import { useNotification } from "../../../contexts/NotificationContext";
import { useParams } from "react-router";
import Footer from "../../../components/Footer";
import {
  Box,
  Card,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import StockRow from "../../../components/StockRow";

/**
 * A module that displays a watchlist.
 *
 * @returns {JSX.Element} The component.
 */
const WatchlistModule = (): JSX.Element => {
  const [watchlist, setWatchlist] = useState<Watchlist>();
  const { setNotification } = useNotification();

  /**
   * Fetches the watchlist with the given ID.
   *
   * @param {number} id The ID of the watchlist to fetch.
   */
  const getWatchlist = (id: number) => {
    axios
      .get(baseUrl + watchlistEndpointPath + `/${id}`)
      .then((res) => setWatchlist(res.data))
      .catch((e) => {
        setNotification({
          severity: "error",
          title: "Error while fetching the stock",
          message:
            e.response?.status && e.response?.data?.message
              ? `${e.response.status}: ${e.response.data.message}`
              : e.message ?? "No additional information available.",
        });
      });
  };

  const { id } = useParams();

  useEffect(() => {
    getWatchlist(Number(id));
  }, [id]);

  return (
    <>
      <PageTitleWrapper maxWidth={false}>
        <PageHeader watchlist={watchlist} getWatchlist={() => getWatchlist(Number(id))} />
      </PageTitleWrapper>
      <Container maxWidth={false}>
        <Card>
          {watchlist && watchlist.stocks.length === 0 ? (
            <Typography variant="h6" textAlign="center" p={2}>
              No stocks.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ height: 52.5 }}>
                    {/* Actions */}
                    <TableCell></TableCell>
                    {/* Name and Logo */}
                    <TableCell>Stock</TableCell>
                    {/* Country and Region */}
                    <TableCell>
                      <Tooltip
                        title={
                          <Typography variant="body1">
                            The Country of the company’s operational headquarters.
                          </Typography>
                        }
                        arrow
                      >
                        <Box display="inline-block">Country</Box>
                      </Tooltip>
                    </TableCell>
                    {/* StyleBox */}
                    <TableCell>
                      <Tooltip
                        title={
                          <>
                            <Typography variant="body1" paddingBottom={1}>
                              The Size of a company based on its market capitalization and geographic area.
                            </Typography>
                            <Typography variant="body2">
                              Large-cap stocks are defined as the group that accounts for the top 70% of the
                              capitalization of each geographic area; mid-cap stocks represent the next 20%; and
                              small-cap stocks represent the balance.
                            </Typography>
                          </>
                        }
                        arrow
                        placement="top"
                      >
                        <Box display="inline-block">Size</Box>
                      </Tooltip>
                      <br />
                      <Tooltip
                        title={
                          <Typography variant="body1">
                            The Style category based on the value and growth characteristics of a company.
                          </Typography>
                        }
                        arrow
                        placement="bottom"
                      >
                        <Box display="inline-block">Style</Box>
                      </Tooltip>
                    </TableCell>
                    {/* Sector */}
                    <TableCell>
                      <Tooltip
                        title={
                          <Typography variant="body1">The general sphere in which a company does business.</Typography>
                        }
                        arrow
                      >
                        <Box display="inline-block">Sector</Box>
                      </Tooltip>
                    </TableCell>
                    {/* Industry */}
                    <TableCell>
                      <Tooltip
                        title={
                          <Typography variant="body1">
                            A more fine-grained categorization of a company’s business.
                          </Typography>
                        }
                        arrow
                      >
                        <Box display="inline-block">Industry</Box>
                      </Tooltip>
                    </TableCell>
                    {/* Total Score */}
                    <TableCell>
                      <Tooltip
                        title={
                          <>
                            <Typography variant="body1" paddingBottom={1}>
                              An overall score that combines the financial and ESG scores, computed as the harmonic mean
                              of both, so that a stock has to perform well in both financial and ESG ratings to obtain a
                              good total score.
                            </Typography>
                            <Typography variant="body2">
                              Values range from 0 to 100, where a score of 0 indicates an average-performing company and
                              a score of 100 indicates a company with perfect overall performance.
                            </Typography>
                          </>
                        }
                        arrow
                      >
                        <Box display="inline-block">Total</Box>
                      </Tooltip>
                    </TableCell>
                    {/* Financial Score */}
                    <TableCell>
                      <Tooltip
                        title={
                          <>
                            <Typography variant="body1" paddingBottom={1}>
                              A score that measures the financial strength of a company.
                            </Typography>
                            <Typography variant="body2">
                              Values range from 0 to 100, where a score of 0 indicates an average-performing company and
                              a score of 100 indicates a company with perfect financial performance.
                            </Typography>
                          </>
                        }
                        arrow
                      >
                        <Box display="inline-block">Financial</Box>
                      </Tooltip>
                    </TableCell>
                    {/* ESG Score */}
                    <TableCell>
                      <Tooltip
                        title={
                          <>
                            <Typography variant="body1" paddingBottom={1}>
                              A score that measures the environmental, social, and governance (ESG) behavior of a
                              company.
                            </Typography>
                            <Typography variant="body2">
                              Values range from 0 to 100, where a score of 0 indicates an average-behaving company and a
                              score of 100 indicates a company with perfect ESG behavior.
                            </Typography>
                          </>
                        }
                        arrow
                      >
                        <Box display="inline-block">ESG</Box>
                      </Tooltip>
                    </TableCell>
                    {/* Morningstar Star Rating */}
                    <TableCell>
                      <Tooltip
                        title={
                          <>
                            <Typography variant="body1" paddingBottom={1}>
                              The Morningstar star rating is determined by a stock’s current price, Morningstar’s
                              estimate of the stock’s fair value, and the uncertainty rating of the fair value. The
                              bigger the discount, the higher the star rating.
                            </Typography>
                            <Typography variant="body2">
                              Four- and 5-star ratings mean the stock is undervalued, while a 3-star rating means it’s
                              fairly valued, and 1- and 2-star stocks are overvalued. When looking for investments, a
                              5-star stock is generally a better opportunity than a 1-star stock.
                            </Typography>
                          </>
                        }
                        arrow
                      >
                        <Box display="inline-block">Star Rating</Box>
                      </Tooltip>
                    </TableCell>
                    {/* Morningstar Fair Value */}
                    <TableCell>
                      <Tooltip
                        title={
                          <>
                            <Typography variant="body1" paddingBottom={1}>
                              The Morningstar Fair Value Estimate tells investors what the long-term intrinsic value of
                              a stock is. It is calculated using a proprietary model that combines the company’s
                              financial statements, analyst estimates, and other factors to determine the company’s fair
                              value.
                            </Typography>
                            <Typography variant="body2">
                              The percentage difference between the stock’s current price and the fair value estimate
                              indicates the stock’s discount (negative percentage) or premium (positive percentage) to
                              its fair value. A stock that is trading at a discount to its fair value is considered
                              undervalued, while a stock trading at a premium to its fair value is considered
                              overvalued.
                            </Typography>
                          </>
                        }
                        arrow
                      >
                        <Box display="inline-block">Fair Value</Box>
                      </Tooltip>
                    </TableCell>
                    {/* Analyst Consensus */}
                    <TableCell>
                      <Tooltip
                        title={
                          <>
                            <Typography variant="body1" paddingBottom={1}>
                              The consensus of analyst recommendations for a stock is calculated by aggregating the
                              recommendations of analysts who cover the stock and then normalizing the data to a scale
                              of 0 to 10.
                            </Typography>
                            <Typography variant="body2">
                              A score of 0 indicates a strong sell recommendation, while a score of 10 indicates a
                              strong buy recommendation.
                            </Typography>
                          </>
                        }
                        arrow
                      >
                        <Box display="inline-block">Anlst Consns</Box>
                      </Tooltip>
                    </TableCell>
                    {/* Analyst Target Price */}
                    <TableCell>
                      <Tooltip
                        title={
                          <>
                            <Typography variant="body1" paddingBottom={1}>
                              The average analyst target price is the average of the estimated price targets of analysts
                              who cover a stock.
                            </Typography>
                            <Typography variant="body2">
                              The percentage difference between the stock’s current price and the average analyst target
                              price indicates the stock’s discount (negative percentage) or premium (positive
                              percentage) to its average analyst target price. A stock that is trading at a discount to
                              its average analyst target price is considered undervalued, while a stock trading at a
                              premium to its average analyst target price is considered overvalued.
                            </Typography>
                          </>
                        }
                        arrow
                      >
                        <Box display="inline-block">Analyst Target</Box>
                      </Tooltip>
                    </TableCell>
                    {/* MSCI ESG Rating */}
                    <TableCell>
                      <Tooltip
                        title={
                          <>
                            <Typography variant="body1" paddingBottom={1}>
                              The MSCI ESG Rating aims to measure a company’s management of financially relevant ESG
                              risks and opportunities. MSCI uses a rules-based methodology to identify industry leaders
                              and laggards according to their exposure to ESG risks and how well they manage those risks
                              relative to peers.
                            </Typography>
                            <Typography variant="body2">
                              The ESG Ratings range from leader (AAA, AA), average (A, BBB, BB) to laggard (B, CCC).
                            </Typography>
                          </>
                        }
                        arrow
                      >
                        <Box display="inline-block">MSCI ESG</Box>
                      </Tooltip>
                    </TableCell>
                    {/* MSCI Implied Temperature Rise */}
                    <TableCell>
                      <Tooltip
                        title={
                          <Typography variant="body1">
                            The MSCI Implied Temperature Rise is a forward-looking metric designed to show the
                            temperature alignment of a company with global temperature goals.
                          </Typography>
                        }
                        arrow
                      >
                        <Box display="inline-block">MSCI Temp</Box>
                      </Tooltip>
                    </TableCell>
                    {/* Refinitiv */}
                    <TableCell>
                      <Tooltip
                        title={
                          <>
                            <Typography variant="body1" paddingBottom={1}>
                              The Refinitiv ESG score measures a company’s ESG performance based on verifiable reported
                              data in the public domain.
                            </Typography>
                            <Typography variant="body2">
                              Its values range from 0 to 100, with 0 being the lowest, indicating a poor ESG
                              performance, and 100 being the highest, indicating an excellent ESG performance.
                            </Typography>
                          </>
                        }
                        arrow
                        placement="top"
                      >
                        <Box display="inline-block">Refinitiv </Box>
                      </Tooltip>
                      <br />
                      <Tooltip
                        title={
                          <>
                            <Typography variant="body1" paddingBottom={1}>
                              The Refinitiv emission reduction score measures a company’s commitment and effectiveness
                              towards reducing environmental emissions in its production and operational processes.
                            </Typography>
                            <Typography variant="body2">
                              Its values range from 0 to 100, with 0 being the lowest, indicating poor emission
                              reduction efforts, and 100 being the highest, indicating excellent emission reduction
                              efforts.
                            </Typography>
                          </>
                        }
                        arrow
                        placement="bottom"
                      >
                        <Box display="inline-block">Emissions</Box>
                      </Tooltip>
                    </TableCell>
                    {/* S&P ESG Score */}
                    <TableCell>
                      <Tooltip
                        title={
                          <>
                            <Typography variant="body1" paddingBottom={1}>
                              The S&P Global ESG Score measures a companies’ exposure to and performance on key ESG
                              risks and opportunities, the quality and completeness of their public disclosures, and
                              their awareness of emerging but underreported ESG issues.
                            </Typography>
                            <Typography variant="body2">
                              Its values range from 0 to 100, with 0 being the lowest, indicating a poor ESG
                              performance, and 100 being the highest, indicating an excellent ESG performance.
                            </Typography>
                          </>
                        }
                        arrow
                      >
                        <Box display="inline-block">S&P</Box>
                      </Tooltip>
                    </TableCell>
                    {/* Sustainalytics ESG Risk */}
                    <TableCell>
                      <Tooltip
                        title={
                          <>
                            <Typography variant="body1" paddingBottom={1}>
                              The Sustainalytics ESG Risk Rating measures the degree to which a company’s economic value
                              is at risk driven by ESG factors.
                            </Typography>
                            <Typography variant="body2">
                              Its values are distributed across five categories, where values below 10 indicate a
                              negligible risk, and values above 40 indicate a severe risk.
                            </Typography>
                          </>
                        }
                        arrow
                      >
                        <Box display="inline-block">Sustain-alytics</Box>
                      </Tooltip>
                    </TableCell>
                    {/* 52 Week Range */}
                    <TableCell>
                      <Tooltip
                        title={
                          <Typography variant="body1">
                            This range represents the lowest and highest price at which the stock has traded in the last
                            52 weeks, as well as the last price at the end of a trading day.
                          </Typography>
                        }
                        arrow
                      >
                        <Box display="inline-block">52W Range</Box>
                      </Tooltip>
                    </TableCell>
                    {/* Dividend Yield */}
                    <TableCell>
                      <Tooltip
                        title={
                          <Typography variant="body1">
                            The annual dividend per share divided by the current stock price.
                          </Typography>
                        }
                        arrow
                      >
                        <Box display="inline-block">Div Yield</Box>
                      </Tooltip>
                    </TableCell>
                    {/* P/E Ratio */}
                    <TableCell>
                      <Tooltip
                        title={
                          <Typography variant="body1">
                            The company’s current market capitalization divided by its earnings.
                          </Typography>
                        }
                        arrow
                      >
                        <Box display="inline-block">P/E</Box>
                      </Tooltip>
                    </TableCell>
                    {/* Market Cap */}
                    <TableCell>
                      <Tooltip
                        title={
                          <Typography variant="body1">
                            The current price of a stock multiplied by the number of all its shares.
                          </Typography>
                        }
                        arrow
                      >
                        <Box display="inline-block">Market Cap</Box>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {watchlist?.stocks
                    ? watchlist.stocks.map(
                        (
                          stock // Render stock rows
                        ) => (
                          <StockRow
                            stock={stock}
                            getStocks={() => getWatchlist(Number(id))}
                            key={stock.ticker}
                            watchlist={watchlist}
                          />
                        )
                      )
                    : [...Array(10)].map(
                        (
                          _,
                          key // Render skeleton rows
                        ) => <StockRow key={key} getStocks={() => getWatchlist(Number(id))} />
                      )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default WatchlistModule;
