import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, DialogActions, Button } from "@mui/material";
import type { Stock, PortfolioSummary } from "@rating-tracker/commons";
import { handleResponse } from "@rating-tracker/commons";
import { useState } from "react";

import portfolioClient from "../../../api/portfolio";
import { useNotificationContextUpdater } from "../../../contexts/NotificationContext";

/**
 * A dialog to remove a stock from a portfolio.
 * @param props The properties of the component.
 * @returns The component.
 */
export const RemoveStockFromPortfolio = (props: RemoveStockFromPortfolioProps): React.JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState(false);

  const { setErrorNotificationOrClearSession } = useNotificationContextUpdater();

  /**
   * Removes the stock from the portfolio.
   */
  const removeStockFromPortfolio = () => {
    setRequestInProgress(true);
    portfolioClient[":id"].stocks[":ticker"]
      .$delete({ param: { id: String(props.portfolio.id), ticker: props.stock.ticker } })
      .then(handleResponse)
      .then(() => (props.onRemove(), props.onClose()))
      .catch((e) => setErrorNotificationOrClearSession(e, "removing stock from portfolio"))
      .finally(() => setRequestInProgress(false));
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">
          Remove Stock “{props.stock.name}” from “{props.portfolio.name}”
        </Typography>
      </DialogTitle>
      <DialogContent>
        Do you really want to remove the Stock “{props.stock.name}” ({props.stock.ticker}) from the portfolio “
        {props.portfolio.name}”?
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose} sx={{ mr: "auto" }}>
          Cancel
        </Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={removeStockFromPortfolio}
          color="error"
          startIcon={<RemoveShoppingCartIcon />}
        >
          Remove “{props.stock.ticker}”
        </LoadingButton>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the RemoveStockFromPortfolio component.
 */
interface RemoveStockFromPortfolioProps {
  /**
   * The stock to remove.
   */
  stock: Stock;
  /**
   * The portfolio to remove the stock from
   */
  portfolio: PortfolioSummary;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
  /**
   * A method that is called after the stock was removed from the portfolio.
   */
  onRemove: () => void;
}
