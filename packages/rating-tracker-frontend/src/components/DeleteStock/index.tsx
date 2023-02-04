import LoadingButton from "@mui/lab/LoadingButton";
import { DialogTitle, Typography, DialogContent, DialogActions, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Stock } from "rating-tracker-commons";
import { useState } from "react";
import axios from "axios";
import { baseUrl, stockAPI } from "../../endpoints";
import useNotification from "../../helpers/useNotification";
import { useNavigate } from "react-router";

/**
 * A dialog to delete a stock from the backend.
 *
 * @param {DeleteStockProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const DeleteStock = (props: DeleteStockProps): JSX.Element => {
  const [requestInProgress, setRequestInProgress] = useState(false);

  const { setNotification } = useNotification();
  const navigate = useNavigate();

  /**
   * Deletes the stock from the backend.
   */
  const deleteStock = () => {
    props.stock &&
      (setRequestInProgress(true),
      axios
        .delete(baseUrl + stockAPI + `/${props.stock.ticker}`)
        // If the dialog is shown from the stock list, the list should be updated.
        .then(() => props.getStocks && props.getStocks())
        .catch((e) => {
          setNotification({
            severity: "error",
            title: "Error while deleting stock",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        })
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
      <DialogActions sx={{ p: 2.6666, pt: 0 }}>
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

export default DeleteStock;
