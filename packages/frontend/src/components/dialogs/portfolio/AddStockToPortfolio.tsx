import AddIcon from "@mui/icons-material/Add";
import {
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
  Grid,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Stock,
  PortfolioSummary,
  stocksEndpointPath,
  portfoliosEndpointPath,
  Currency,
  currencyMinorUnits,
} from "@rating-tracker/commons";
import { Fragment, useEffect, useState } from "react";

import { useNotification } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

import { AddPortfolio } from "./AddPortfolio";

/**
 * A dialog to add a stock to a portfolio.
 *
 * @param {AddStockToPortfolioProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const AddStockToPortfolio = (props: AddStockToPortfolioProps): JSX.Element => {
  const [portfolioSummaries, setPortfolioSummaries] = useState<PortfolioSummary[]>([]);
  const [portfolioSummariesFinal, setPortfolioSummariesFinal] = useState<boolean>(false);
  const [amountInput, setAmountInput] = useState<string>("");
  const [amountError, setAmountError] = useState<boolean>(false);
  const [addPortfolioOpen, setAddPortfolioOpen] = useState<boolean>(false);
  const [hoverCurrency, setHoverCurrency] = useState<Currency | "…">("…");
  const { setErrorNotificationOrClearSession: setErrorNotification } = useNotification();

  useEffect(() => getPortfolios(), []);

  /**
   * Checks for errors in the input fields.
   *
   * @returns {boolean} Whether the input fields are valid.
   */
  const validate = (): boolean => {
    // The following fields are required.
    setAmountError(!amountInput || Number.isNaN(+amountInput) || +amountInput <= 0);
    return !!amountInput && !Number.isNaN(+amountInput) && +amountInput > 0;
  };

  /**
   * Get the portfolios from the backend.
   */
  const getPortfolios = () => {
    api
      .get(portfoliosEndpointPath)
      .then((res) => setPortfolioSummaries(res.data))
      .catch((e) => {
        setErrorNotification(e, "fetching portfolios");
        setPortfolioSummaries([]);
      })
      .finally(() => setPortfolioSummariesFinal(true));
  };

  const portfoliosAlreadyContainingStock: number[] = portfolioSummaries
    .filter((portfolio) => portfolio.stocks.map((stock) => stock.ticker).includes(props.stock.ticker))
    .map((portfolio) => portfolio.id);

  /**
   * Adds the stock to the portfolio.
   *
   * @param {number} id The ID of the portfolio.
   */
  const addStockToPortfolio = (id: number) => {
    if (!validate()) return;
    api
      .put(`${portfoliosEndpointPath}/${id}${stocksEndpointPath}/${props.stock.ticker}`, undefined, {
        params: { amount: +amountInput },
      })
      .then(() => props.onClose())
      .catch((e) => setErrorNotification(e, "adding stock to portfolio"));
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Add Stock “{props.stock.name}” to Portfolio</Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} mt={0} mb={1} maxWidth={600} alignItems="center">
          <Grid item xs={12}>
            <TextField
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ width: 30, mt: "1px" }}>
                    {hoverCurrency}
                  </InputAdornment>
                ),
              }}
              inputProps={{
                inputMode: "decimal",
                pattern: "\\d+(\\.\\d+)?",
                step: Math.pow(10, -1 * currencyMinorUnits[props.stock.currency]),
              }}
              onChange={(event) => {
                setAmountInput(event.target.value.replaceAll(/[^0-9.]/g, ""));
                setAmountError(false);
              }}
              error={amountError}
              label="Amount"
              value={amountInput}
              fullWidth
            />
          </Grid>
        </Grid>
        <Typography variant="body1" mb={1}>
          Select the portfolio you want to add the stock to:
        </Typography>
        <List onMouseLeave={() => setHoverCurrency("…")} onTouchEnd={() => setHoverCurrency("…")} disablePadding>
          {portfolioSummariesFinal
            ? portfolioSummaries.map((portfolioSummary) => (
                <Fragment key={portfolioSummary.id}>
                  <Divider />
                  <ListItem
                    onMouseEnter={() => setHoverCurrency(portfolioSummary.currency)}
                    onTouchStart={() => setHoverCurrency(portfolioSummary.currency)}
                    disablePadding
                    disableGutters
                  >
                    <ListItemButton
                      onClick={() => addStockToPortfolio(portfolioSummary.id)}
                      onMouseOver={validate}
                      disabled={portfoliosAlreadyContainingStock.includes(portfolioSummary.id) || amountError}
                    >
                      <ListItemText
                        inset
                        primary={portfolioSummary.name}
                        primaryTypographyProps={{ variant: "body1", fontWeight: "bold", color: "text.primary" }}
                        secondary={
                          portfoliosAlreadyContainingStock.includes(portfolioSummary.id)
                            ? `This portfolio already contains “${props.stock.name}”.`
                            : (portfolioSummary.stocks.length || "No") +
                              ` stock${portfolioSummary.stocks.length !== 1 ? "s" : ""}`
                        }
                        secondaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Fragment>
              ))
            : [...Array(3)].map(
                (
                  _,
                  key, // Render skeleton rows
                ) => (
                  <Fragment key={key}>
                    <Divider />
                    <ListItem disablePadding disableGutters>
                      <ListItemButton>
                        <ListItemText
                          inset
                          primary={<Skeleton width="160px" />}
                          primaryTypographyProps={{ variant: "body1", fontWeight: "bold", color: "text.primary" }}
                          secondary={<Skeleton width="48px" />}
                          secondaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Fragment>
                ),
              )}
          <Divider />
          <ListItem disablePadding disableGutters>
            <ListItemButton onClick={() => setAddPortfolioOpen(true)}>
              <ListItemIcon>
                <AddIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Create a new portfolio…"
                primaryTypographyProps={{ variant: "body1", fontWeight: "bold", color: "text.primary" }}
              />
            </ListItemButton>
          </ListItem>
          <Divider />
        </List>
        <Dialog maxWidth="lg" open={addPortfolioOpen} onClose={() => setAddPortfolioOpen(false)}>
          <AddPortfolio onClose={() => (setAddPortfolioOpen(false), getPortfolios())} />
        </Dialog>
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose}>Cancel</Button>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the AddStockToPortfolio component.
 */
interface AddStockToPortfolioProps {
  /**
   * The stock to add.
   */
  stock: Stock;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
}