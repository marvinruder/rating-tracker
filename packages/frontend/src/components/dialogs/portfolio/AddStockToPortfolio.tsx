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
  Skeleton,
  Dialog,
  Grid2 as Grid,
  TextField,
  InputAdornment,
} from "@mui/material";
import type { Stock, PortfolioSummary, Currency } from "@rating-tracker/commons";
import { currencyMinorUnits, pluralize, isCurrency, handleResponse } from "@rating-tracker/commons";
import { useEffect, useRef, useState } from "react";

import portfolioClient from "../../../api/portfolio";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";

import { AddPortfolio } from "./AddPortfolio";

/**
 * A dialog to add a stock to a portfolio.
 * @param props The properties of the component.
 * @returns The component.
 */
export const AddStockToPortfolio = (props: AddStockToPortfolioProps): React.JSX.Element => {
  const [portfolioSummaries, setPortfolioSummaries] = useState<PortfolioSummary[]>([]);
  const [portfolioSummariesFinal, setPortfolioSummariesFinal] = useState<boolean>(false);
  const [amountInput, setAmountInput] = useState<string>("");
  const [amountError, setAmountError] = useState<string>(""); // Error message for the amount text field.
  const [addPortfolioOpen, setAddPortfolioOpen] = useState<boolean>(false);
  const [hoverCurrency, setHoverCurrency] = useState<Currency | "…">("…");
  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => getPortfolios(), []);

  /**
   * Checks for errors in the input fields.
   * @param id The ID of the portfolio.
   * @returns Whether the input fields are valid.
   */
  const validate = (id: number): boolean => {
    // For currency minor unit validation, we need to set the minimum value of the input field after the touchend event
    const currency = portfolioSummaries.find((portfolio) => portfolio.id === id)?.currency;
    if (!currency) return false;
    if (!amountInputRef?.current) return false;
    amountInputRef.current.setAttribute("min", Math.pow(10, -1 * currencyMinorUnits[currency]).toString());
    amountInputRef.current.setAttribute("step", Math.pow(10, -1 * currencyMinorUnits[currency]).toString());

    const isAmountValid = amountInputRef.current.checkValidity();
    return isAmountValid;
  };

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

  const portfoliosAlreadyContainingStock: number[] = portfolioSummaries
    .filter((portfolio) => portfolio.stocks.map((stock) => stock.ticker).includes(props.stock.ticker))
    .map((portfolio) => portfolio.id);

  /**
   * Adds the stock to the portfolio.
   * @param id The ID of the portfolio.
   */
  const addStockToPortfolio = (id: number) => {
    if (!validate(id)) return;
    portfolioClient[":id"].stocks[":ticker"]
      .$put({ param: { id: String(id), ticker: props.stock.ticker }, json: { amount: +amountInput } })
      .then(handleResponse)
      .then(() => props.onClose())
      .catch((e) => setErrorNotificationOrClearSession(e, "adding stock to portfolio"));
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Add Stock “{props.stock.name}” to Portfolio</Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{ my: 1, maxWidth: 600, alignItems: "center" }}>
          <Grid size={12}>
            <TextField
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ width: 30, mt: "1px" }}>
                      {hoverCurrency}
                    </InputAdornment>
                  ),
                },
                htmlInput: {
                  inputMode: "decimal",
                  type: "number",
                  // Amount must be divisible by the currency's minor unit
                  step: isCurrency(hoverCurrency) ? Math.pow(10, -1 * currencyMinorUnits[hoverCurrency]) : undefined,
                  // Amount must be positive
                  min: isCurrency(hoverCurrency) ? Math.pow(10, -1 * currencyMinorUnits[hoverCurrency]) : 0,
                },
              }}
              onChange={(event) => {
                setAmountInput(event.target.value);
                // If in error state, check whether error is resolved. If so, clear the error.
                if (amountError && event.target.checkValidity()) setAmountError("");
              }}
              onInvalid={(event) => setAmountError((event.target as HTMLInputElement).validationMessage)}
              error={!!amountError}
              helperText={amountError}
              inputRef={amountInputRef}
              required
              label="Amount"
              value={amountInput}
              autoFocus
              fullWidth
            />
          </Grid>
        </Grid>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Select the portfolio you want to add the stock to:
        </Typography>
        <List onMouseLeave={() => setHoverCurrency("…")} onTouchEnd={() => setHoverCurrency("…")} disablePadding>
          {portfolioSummariesFinal
            ? portfolioSummaries.map((portfolioSummary) => (
                <ListItem
                  key={portfolioSummary.id}
                  onMouseEnter={() => setHoverCurrency(portfolioSummary.currency)}
                  onTouchStart={() => setHoverCurrency(portfolioSummary.currency)}
                  sx={(theme) => ({ borderTop: `1px solid ${theme.palette.divider}` })}
                  disablePadding
                  disableGutters
                >
                  <ListItemButton
                    onClick={() => addStockToPortfolio(portfolioSummary.id)}
                    disabled={portfoliosAlreadyContainingStock.includes(portfolioSummary.id) || !!amountError}
                  >
                    <ListItemText
                      inset
                      primary={portfolioSummary.name}
                      primaryTypographyProps={{ fontWeight: "bold" }}
                      secondary={
                        portfoliosAlreadyContainingStock.includes(portfolioSummary.id)
                          ? `This portfolio already contains “${props.stock.name}”.`
                          : `${
                              portfolioSummary.stocks.length || "No"
                            } stock${pluralize(portfolioSummary.stocks.length)}`
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))
            : [...Array(3)].map(
                // Render skeleton rows
                (_, key) => (
                  <ListItem
                    key={`_${key}`}
                    disablePadding
                    disableGutters
                    sx={(theme) => ({ borderTop: `1px solid ${theme.palette.divider}` })}
                  >
                    <ListItemButton>
                      <ListItemText inset primary={<Skeleton width="160px" />} secondary={<Skeleton width="48px" />} />
                    </ListItemButton>
                  </ListItem>
                ),
              )}
          <ListItem
            disablePadding
            disableGutters
            sx={(theme) => ({
              borderTop: `1px solid ${theme.palette.divider}`,
              borderBottom: `1px solid ${theme.palette.divider}`,
            })}
          >
            <ListItemButton onClick={() => setAddPortfolioOpen(true)}>
              <ListItemIcon>
                <AddIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Create a new portfolio…" primaryTypographyProps={{ fontWeight: "bold" }} />
            </ListItemButton>
          </ListItem>
        </List>
        <Dialog maxWidth="lg" open={addPortfolioOpen} onClose={() => setAddPortfolioOpen(false)}>
          <AddPortfolio onClose={() => setAddPortfolioOpen(false)} onAdd={getPortfolios} />
        </Dialog>
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose} sx={{ mr: "auto" }}>
          Cancel
        </Button>
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
