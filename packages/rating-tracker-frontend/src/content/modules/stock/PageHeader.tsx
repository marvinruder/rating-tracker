import {
  Box,
  Grid,
  Typography,
  Dialog,
  IconButton,
  Skeleton,
  Avatar,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteStock from "packages/rating-tracker-frontend/src/components/DeleteStock";
import EditStock from "packages/rating-tracker-frontend/src/components/EditStock";
import { Stock } from "rating-tracker-commons";
import { useState } from "react";
import {
  baseUrl,
  stockAPI,
  logoEndpoint,
} from "packages/rating-tracker-frontend/src/endpoints";

/**
 * A header for the stock details page.
 *
 * @param {PageHeaderProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const PageHeader = (props: PageHeaderProps): JSX.Element => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);

  const theme = useTheme();

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item sx={{ display: "flex", alignItems: "center" }}>
          {props.stock ? ( // Actual header with logo and name
            <>
              <Avatar
                sx={{
                  width: 112,
                  height: 112,
                  m: "-16px",
                  mr: "-8px",
                  background: "none",
                }}
                src={
                  baseUrl +
                  stockAPI +
                  logoEndpoint +
                  `/${props.stock.ticker}?dark=${theme.palette.mode === "dark"}`
                }
                alt=" "
              />
              <Box>
                <Typography variant="h3" component="h3" gutterBottom>
                  {props.stock.name}
                </Typography>
                <Typography variant="subtitle2">
                  {props.stock.ticker} | {props.stock.isin}
                </Typography>
              </Box>
            </>
          ) : (
            // Skeleton
            <>
              <Skeleton
                variant="circular"
                width={56}
                height={56}
                sx={{
                  m: "12px",
                  mr: "20px",
                }}
              />
              <Box>
                <Typography variant="h3">
                  <Skeleton width={320} />
                </Typography>
                <Typography variant="subtitle2">
                  <Skeleton width={120} />
                </Typography>
              </Box>
            </>
          )}
        </Grid>
        <Grid item ml="auto">
          <IconButton
            sx={{ ml: 1, mt: 1 }}
            color="primary"
            onClick={() => setEditDialogOpen(true)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            sx={{ ml: 1, mt: 1 }}
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Dialog
        open={editDialogOpen}
        onClose={() => (
          setEditDialogOpen(false), props.getStock && props.getStock()
        )}
      >
        <EditStock
          stock={props.stock}
          getStocks={props.getStock}
          onClose={() => setEditDialogOpen(false)}
        />
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DeleteStock
          stock={props.stock}
          onClose={() => setDeleteDialogOpen(false)}
          navigateTo="/stocklist"
        />
      </Dialog>
    </>
  );
};

/**
 * The properties of the PageHeader component.
 */
interface PageHeaderProps {
  /**
   * The stock to display.
   */
  stock?: Stock;
  /**
   * A method to update the stock, e.g. after editing.
   */
  getStock?: () => void;
}

export default PageHeader;
