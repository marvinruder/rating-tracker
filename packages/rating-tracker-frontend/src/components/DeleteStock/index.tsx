import LoadingButton from "@mui/lab/LoadingButton";
import {
  DialogTitle,
  Typography,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Stock } from "rating-tracker-commons";
import { useState } from "react";
import axios from "axios";
import { baseUrl, stockAPI } from "../../endpoints";
import useNotification from "../../helpers/useNotification";
import { useNavigate } from "react-router";

const DeleteStock = (props: DeleteStockProps) => {
  const [requestInProgress, setRequestInProgress] = useState(false);

  const { setNotification } = useNotification();
  const navigate = useNavigate();

  const deleteStock = () => {
    props.stock &&
      (setRequestInProgress(true),
      axios
        .delete(baseUrl + stockAPI + `/${props.stock.ticker}`)
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
        Do you really want to delete the Stock “{props.stock.name}” (
        {props.stock.ticker})? This action cannot be reversed.
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

interface DeleteStockProps {
  stock: Stock;
  getStocks?: () => void;
  onClose: () => void;
  navigateTo?: string;
}

export default DeleteStock;
