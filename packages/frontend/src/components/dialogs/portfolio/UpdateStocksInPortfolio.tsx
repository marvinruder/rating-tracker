import AddIcon from "@mui/icons-material/Add";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  DialogTitle,
  Typography,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
  Skeleton,
  Dialog,
  LinearProgress,
  useTheme,
} from "@mui/material";
import type { PortfolioSummary, PortfolioRawData, WeightedStock } from "@rating-tracker/commons";
import { handleResponse, pluralize } from "@rating-tracker/commons";
import { Fragment, useEffect, useState } from "react";

import portfolioClient from "../../../api/portfolio";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";
import { CurrencyWithTooltip } from "../../../utils/formatters";

import { AddPortfolio } from "./AddPortfolio";

/**
 * A dialog to update the stocks as well as the currency in a portfolio.
 * @param props The properties of the component.
 * @returns The component.
 */
export const UpdateStocksInPortfolio = (props: UpdateStocksInPortfolioProps): JSX.Element => {
  const [portfolioSummaries, setPortfolioSummaries] = useState<PortfolioSummary[]>([]);
  const [portfolioSummariesFinal, setPortfolioSummariesFinal] = useState<boolean>(false);
  const [addPortfolioOpen, setAddPortfolioOpen] = useState<boolean>(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioSummary>();
  const [doneRequests, setDoneRequests] = useState<number>(0);
  const [requestsInProgress, setRequestsInProgress] = useState<boolean>(false);
  const [currentRequest, setCurrentRequest] = useState<string>("");

  const theme = useTheme();
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const currencyToUpdate: boolean = props.portfolioRawData.currency !== selectedPortfolio?.currency;
  const stocksToAdd: WeightedStock[] = props.portfolioRawData.stocks.filter(
    (stock) => !selectedPortfolio?.stocks.find((s) => s.ticker === stock.ticker),
  );
  const stocksToUpdate: WeightedStock[] = props.portfolioRawData.stocks.filter((stock) => {
    const stockWithOldAmount = selectedPortfolio?.stocks.find((s) => s.ticker === stock.ticker);
    return stockWithOldAmount ? stockWithOldAmount.amount !== stock.amount : false;
  });
  const stocksToRemove: Pick<WeightedStock, "ticker" | "amount">[] | undefined = selectedPortfolio?.stocks.filter(
    (stock) => !props.portfolioRawData.stocks.find((s) => s.ticker === stock.ticker),
  );

  const totalRequests: number =
    (currencyToUpdate ? 1 : 0) +
    (stocksToAdd?.length ?? 0) +
    (stocksToUpdate?.length ?? 0) +
    (stocksToRemove?.length ?? 0);

  const portfolioIsUpToDate: boolean = !(
    currencyToUpdate ||
    stocksToAdd?.length ||
    stocksToUpdate?.length ||
    stocksToRemove?.length
  );

  useEffect(() => getPortfolios(), []);

  /**
   * Get the portfolios from the backend.
   */
  const getPortfolios = () => {
    portfolioClient.index
      .$get()
      .then(handleResponse)
      .then((res) => setPortfolioSummaries(res.data))
      .catch((e) => {
        setErrorNotificationOrClearSession(e, "fetching portfolios");
        setPortfolioSummaries([]);
      })
      .finally(() => setPortfolioSummariesFinal(true));
  };

  /**
   * Update the stocks in the portfolio.
   */
  const updateStocksInPortfolio = async () => {
    if (!selectedPortfolio) return;
    setRequestsInProgress(true);
    try {
      if (currencyToUpdate) {
        setCurrentRequest(
          `Changing currency from ${props.portfolioRawData.currency} to ${selectedPortfolio?.currency}…`,
        );
        await portfolioClient[":id"]
          .$patch({ param: { id: String(selectedPortfolio.id) }, json: { currency: props.portfolioRawData.currency } })
          .then(handleResponse);
        setDoneRequests((prev) => prev + 1);
      }
      for (const stock of stocksToAdd) {
        setCurrentRequest(`Adding “${stock.name}” (${stock.ticker})…`);
        await portfolioClient[":id"].stocks[":ticker"]
          .$put({ param: { id: String(selectedPortfolio.id), ticker: stock.ticker }, json: { amount: stock.amount } })
          .then(handleResponse);
        setDoneRequests((prev) => prev + 1);
      }
      for (const stock of stocksToUpdate) {
        setCurrentRequest(`Updating amount of “${stock.name}” (${stock.ticker})…`);
        await portfolioClient[":id"].stocks[":ticker"]
          .$patch({ param: { id: String(selectedPortfolio.id), ticker: stock.ticker }, json: { amount: stock.amount } })
          .then(handleResponse);
        setDoneRequests((prev) => prev + 1);
      }
      for (const stock of stocksToRemove!) {
        setCurrentRequest(`Removing “${stock.ticker}”…`);
        await portfolioClient[":id"].stocks[":ticker"]
          .$delete({ param: { id: String(selectedPortfolio.id), ticker: stock.ticker } })
          .then(handleResponse);
        setDoneRequests((prev) => prev + 1);
      }
      props.onUpdate(selectedPortfolio.id);
      props.onClose();
    } catch (e) {
      setErrorNotificationOrClearSession(e, "updating the portfolio");
    } finally {
      setRequestsInProgress(false);
    }
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Update Stocks in Portfolio</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Select the portfolio you want to update the stocks of:
        </Typography>
        <List
          disablePadding
          sx={(theme) => ({
            " > .MuiListItem-root": { borderTop: `1px solid ${theme.palette.divider}` },
            " > .MuiListItem-root:last-child": { borderBottom: `1px solid ${theme.palette.divider}` },
          })}
        >
          {portfolioSummariesFinal
            ? portfolioSummaries.map((portfolioSummary) => (
                <Fragment key={portfolioSummary.id}>
                  <ListItem disablePadding disableGutters>
                    <ListItemButton
                      onClick={() => setSelectedPortfolio(portfolioSummary)}
                      disabled={requestsInProgress}
                      selected={selectedPortfolio?.id === portfolioSummary.id}
                    >
                      <ListItemText
                        inset
                        primary={portfolioSummary.name}
                        primaryTypographyProps={{ fontWeight: "bold" }}
                        secondary={`${
                          portfolioSummary.stocks.length || "No"
                        } stock${pluralize(portfolioSummary.stocks.length)}`}
                      />
                    </ListItemButton>
                  </ListItem>
                </Fragment>
              ))
            : [...Array(3)].map(
                // Render skeleton rows
                (_, key) => (
                  <Fragment key={key}>
                    <ListItem disablePadding disableGutters>
                      <ListItemButton>
                        <ListItemText
                          inset
                          primary={<Skeleton width="160px" />}
                          secondary={<Skeleton width="48px" />}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Fragment>
                ),
              )}
          <ListItem disablePadding disableGutters>
            <ListItemButton onClick={() => setAddPortfolioOpen(true)} disabled={requestsInProgress}>
              <ListItemIcon>
                <AddIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Create a new portfolio…" primaryTypographyProps={{ fontWeight: "bold" }} />
            </ListItemButton>
          </ListItem>
        </List>
        {selectedPortfolio && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            {portfolioIsUpToDate ? (
              "The portfolio is already up to date."
            ) : (
              <>
                The following changes will be made to the portfolio “{selectedPortfolio.name}”:
                <ul>
                  {currencyToUpdate && (
                    <li>
                      Change the currency from {props.portfolioRawData.currency} to {selectedPortfolio?.currency}
                    </li>
                  )}
                  {stocksToAdd.length ? (
                    <li>
                      Add {stocksToAdd.length} new stock{pluralize(stocksToAdd.length)}:
                      <ul>
                        {stocksToAdd.map((stock) => (
                          <li key={stock.ticker}>
                            {stock.name} ({stock.ticker})
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : (
                    <></>
                  )}
                  {stocksToUpdate.length ? (
                    <li>
                      Update the amount{pluralize(stocksToUpdate.length)} of {stocksToUpdate.length} stock
                      {pluralize(stocksToUpdate.length)}:
                      <ul>
                        {stocksToUpdate.map((stock) => (
                          <li key={stock.ticker}>
                            {stock.name} ({stock.ticker})<br />
                            <span style={{ color: theme.palette.text.secondary }}>
                              from{" "}
                              <CurrencyWithTooltip
                                value={selectedPortfolio.stocks.find((s) => s.ticker === stock.ticker)?.amount}
                                currency={selectedPortfolio.currency}
                              />{" "}
                              to <CurrencyWithTooltip value={stock.amount} currency={selectedPortfolio.currency} />
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : (
                    <></>
                  )}
                  {stocksToRemove?.length ? (
                    <li>
                      Remove {stocksToRemove.length} stock{pluralize(stocksToRemove.length)}:
                      <ul>
                        {stocksToRemove.map((stock) => (
                          <li key={stock.ticker}>{stock.ticker}</li>
                        ))}
                      </ul>
                    </li>
                  ) : (
                    <></>
                  )}
                </ul>
              </>
            )}
          </Typography>
        )}
        <Dialog maxWidth="lg" open={addPortfolioOpen} onClose={() => setAddPortfolioOpen(false)}>
          <AddPortfolio onClose={() => setAddPortfolioOpen(false)} onAdd={getPortfolios} />
        </Dialog>
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 0, flexDirection: "column" }}>
        <Divider sx={{ mb: 1, width: "100%" }} />
        {requestsInProgress && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1, width: "100%" }}>
              {currentRequest}
            </Typography>
            <LinearProgress
              aria-label="Progress of updating the portfolio"
              sx={{ width: "100%", mb: 2 }}
              variant="determinate"
              value={(100 * doneRequests) / totalRequests}
            />
          </>
        )}
        <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <Button onClick={props.onClose} sx={{ mr: "auto" }}>
            Cancel
          </Button>
          <LoadingButton
            loading={requestsInProgress}
            disabled={!selectedPortfolio || portfolioIsUpToDate}
            variant="contained"
            onClick={updateStocksInPortfolio}
            startIcon={<PublishedWithChangesIcon />}
          >
            Update Portfolio
          </LoadingButton>
        </Box>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the UpdateStocksInPortfolio component.
 */
interface UpdateStocksInPortfolioProps {
  /**
   * The raw portfolio data, containing the weighted stocks and the currency.
   */
  portfolioRawData: PortfolioRawData;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
  /**
   * A method that is called after the portfolio was updated successfully.
   * @param id The ID of the updated portfolio.
   */
  onUpdate: (id: PortfolioSummary["id"]) => void;
}
