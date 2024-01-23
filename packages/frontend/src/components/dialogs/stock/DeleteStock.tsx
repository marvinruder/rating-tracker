import DeleteIcon from "@mui/icons-material/Delete";
import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, DialogActions, Button } from "@mui/material";
import type { Stock } from "@rating-tracker/commons";
import { stocksEndpointPath } from "@rating-tracker/commons";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useNotification } from "../../../contexts/NotificationContext";
import api from "../../../utils/api";

/**
 * A dialog to delete a stock from the backend.
 *
 * @param {DeleteStockProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const DeleteStock = (props: DeleteStockProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState(false);

  const { setErrorNotificationOrClearSession: setErrorNotification } = useNotification();
  const navigate = useNavigate();

  /**
   * Deletes the stock from the backend.
   */
  const deleteStock = () => {
    props.stock &&
      (setRequestInProgress(true),
      api
        .delete(stocksEndpointPath + `/${props.stock.ticker}`)
        // If the dialog is shown from the stock list, the list should be updated.
        .then(() => props.getStocks && props.getStocks())
        .catch((e) => setErrorNotification(e, "deleting stock"))
        .finally(() => {
          setRequestInProgress(false);
          // If the dialog is shown from e.g. a detail page, the user should be redirected to another page.
          props.navigateTo && navigate(props.navigateTo);
          props.onClose();
        }));
  };

  return (
    <>
      <DialogTitle>
        <Typography variant="h3">Delete Stock “{props.stock.name}”</Typography>
      </DialogTitle>
      <DialogContent>
        Do you really want to delete the Stock “{props.stock.name}” ({props.stock.ticker})? This action cannot be
        reversed.
      </DialogContent>
      <DialogActions sx={{ p: 2.6666, pt: 1 }}>
        <Button onClick={props.onClose}>Cancel</Button>
        <LoadingButton
          loading={requestInProgress}
          variant="contained"
          onClick={deleteStock}
          color="error"
          startIcon={<DeleteIcon />}
        >
          Delete “{props.stock.ticker}”
        </LoadingButton>
      </DialogActions>
    </>
  );
};

/**
 * Properties for the DeleteStock component.
 */
interface DeleteStockProps {
  /**
   * The stock to delete.
   */
  stock: Stock;
  /**
   * A method to update the stock list after the stock was deleted.
   */
  getStocks?: () => void;
  /**
   * A method that is called when the dialog is closed.
   */
  onClose: () => void;
  /**
   * The path to navigate to after the stock was deleted.
   */
  navigateTo?: string;
}
