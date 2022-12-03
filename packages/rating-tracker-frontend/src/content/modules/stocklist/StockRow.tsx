import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SectorIcon from "../../../components/SectorIcon";
import StarRating from "../../../components/StarRating";
import StyleBox from "../../../components/StyleBox";
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
  superRegionName,
  superRegionOfRegion,
  superSectorName,
  superSectorOfSector,
} from "rating-tracker-commons";
import axios from "axios";
import { baseUrl, stockAPI } from "../../../endpoints";
import useNotification from "../../../helpers/useNotification";
import { useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";

const StockRow = (props: StockRowProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deletionInProgress, setDeletionInProgress] = useState<boolean>(false);
  const theme = useTheme();
  const { setNotification } = useNotification();

  const deleteStock = () => {
    props.stock &&
      props.getStocks &&
      (setDeletionInProgress(true),
      axios
        .delete(baseUrl + stockAPI + `/${props.stock.ticker}`)
        .then(() => {
          setDeletionInProgress(false);
          props.getStocks();
        })
        .catch((e) => {
          setNotification({
            severity: "error",
            title: "Error while deleting stock",
            message:
              e.response?.status && e.response?.data?.message
                ? `${e.response.status}: ${e.response.data.message}`
                : e.message ?? "No additional information available.",
          });
        }));
  };

  return props.stock ? (
    <TableRow hover>
      <TableCell>
        <Typography
          variant="body1"
          fontWeight="bold"
          color="text.primary"
          width={160}
          noWrap
        >
          {props.stock.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" width={160} noWrap>
          {props.stock.ticker}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body1"
          fontWeight="bold"
          color="text.primary"
          width={125}
          noWrap
        >
          {props.stock.country && countryNameWithFlag[props.stock.country]}
        </Typography>
        <Typography variant="body2" color="text.secondary" width={125} noWrap>
          {props.stock.country &&
            regionName[regionOfCountry[props.stock.country]]}
        </Typography>
      </TableCell>
      <TableCell>
        <Tooltip
          title={
            props.stock.size && props.stock.style
              ? `${props.stock.size}-${props.stock.style}`
              : undefined
          }
          arrow
        >
          <div
            style={{
              width: 2.75 * (theme.typography.body1.fontSize as number),
            }}
          >
            <StyleBox
              fill={theme.colors.alpha.black[100]}
              stroke={theme.colors.alpha.black[100]}
              size={props.stock.size}
              style={props.stock.style}
              length={2.75 * (theme.typography.body1.fontSize as number)}
            />
          </div>
        </Tooltip>
      </TableCell>
      <TableCell>
        <span
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {props.stock.industry && (
            <SectorIcon
              industry={props.stock.industry}
              length={1.75 * (theme.typography.body1.fontSize as number)}
              type={"Sector"}
            />
          )}
          <span style={{ width: 6 }} />
          <Typography variant="body1" fontWeight="bold" width={105} noWrap>
            {props.stock.industry &&
              sectorName[
                sectorOfIndustryGroup[groupOfIndustry[props.stock.industry]]
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
              length={1.75 * (theme.typography.body2.fontSize as number)}
              type={"SuperSector"}
            />
          )}
          <span style={{ width: 6 }} />
          <Typography variant="body2" color="text.secondary" width={105} noWrap>
            {props.stock.industry &&
              superSectorName[
                superSectorOfSector[
                  sectorOfIndustryGroup[groupOfIndustry[props.stock.industry]]
                ]
              ]}
          </Typography>
        </span>
      </TableCell>
      <TableCell>
        <Typography
          variant="body1"
          fontWeight="bold"
          color="text.primary"
          width={150}
          noWrap
        >
          {props.stock.industry && industryName[props.stock.industry]}
        </Typography>
        <Typography variant="body2" color="text.secondary" width={150} noWrap>
          {props.stock.industry &&
            industryGroupName[groupOfIndustry[props.stock.industry]]}
        </Typography>
      </TableCell>
      <TableCell>
        <StarRating value={props.stock.starRating} />
      </TableCell>
      <TableCell>
        <Typography variant="body1" color="text.primary" width={45} noWrap>
          {props.stock.dividendYieldPercent ?? "–"}
          {" %"}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body1" color="text.primary" width={45} noWrap>
          {props.stock.priceEarningRatio ?? "–"}
        </Typography>
      </TableCell>
      {props.getStocks && (
        <TableCell align="right">
          {/* <Tooltip title="Edit Stock" arrow>
              <IconButton
                sx={{
                  "&:hover": {
                    background: theme.colors.primary.lighter,
                  },
                  color: theme.palette.primary.main,
                }}
                color="inherit"
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip> */}
          <Tooltip title="Delete Stock" arrow>
            <IconButton
              sx={{
                "&:hover": {
                  background: theme.colors.error.lighter,
                },
                color: theme.palette.error.main,
              }}
              color="inherit"
              size="small"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      )}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          <Typography variant="h3">
            Delete Stock “{props.stock.name}”
          </Typography>
        </DialogTitle>
        <DialogContent>
          Do you really want to delete the Stock “{props.stock.name}” (
          {props.stock.ticker})? This action cannot be reversed.
        </DialogContent>
        <DialogActions sx={{ p: 2.6666, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <LoadingButton
            loading={deletionInProgress}
            variant="contained"
            onClick={deleteStock}
            color="error"
          >
            Delete “{props.stock.ticker}”
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </TableRow>
  ) : (
    <TableRow hover>
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={160} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={160} />
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={125} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={125} />
        </Typography>
      </TableCell>
      <TableCell>
        <Skeleton
          variant="rectangular"
          width={2.75 * (theme.typography.body1.fontSize as number)}
          height={2.75 * (theme.typography.body1.fontSize as number)}
        />
      </TableCell>
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={132} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={132} />
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={150} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width={150} />
        </Typography>
      </TableCell>
      <TableCell>
        <span style={{ whiteSpace: "nowrap" }}>
          {[...Array(5).keys()].map((index) => {
            return (
              <Skeleton
                key={index}
                sx={{ m: "2px", display: "inline-block" }}
                variant="circular"
                width={20}
                height={20}
              />
            );
          })}
        </span>
      </TableCell>
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={45} />
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body1">
          <Skeleton width={45} />
        </Typography>
      </TableCell>
      {props.getStocks && (
        <TableCell align="right">
          {/* <Skeleton
              sx={{ m: "2px", display: "inline-block" }}
              variant="circular"
              width={
                2 * (theme.typography.body1.fontSize as number) -
                4
              }
              height={
                2 * (theme.typography.body1.fontSize as number) -
                4
              }
            /> */}
          <Skeleton
            sx={{ m: "2px", display: "inline-block" }}
            variant="circular"
            width={2 * (theme.typography.body1.fontSize as number) - 4}
            height={2 * (theme.typography.body1.fontSize as number) - 4}
          />
        </TableCell>
      )}
    </TableRow>
  );
};

interface StockRowProps {
  stock?: Stock;
  getStocks?: () => void;
}

export default StockRow;
