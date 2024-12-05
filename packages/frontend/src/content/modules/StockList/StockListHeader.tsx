import AddIcon from "@mui/icons-material/Add";
import type { SlideProps } from "@mui/material";
import { Box, Typography, Grid2 as Grid, Tooltip, Dialog, IconButton, useMediaQuery, Slide } from "@mui/material";
import { WRITE_STOCKS_ACCESS } from "@rating-tracker/commons";
import type { FC } from "react";
import { useState } from "react";

import { AddStock } from "../../../components/dialogs/stock/AddStock";
import type { StockTableFiltersProps } from "../../../components/stock/layouts/StockTableFilters";
import { StockTableFilters } from "../../../components/stock/layouts/StockTableFilters";
import { useUserContextState } from "../../../contexts/UserContext";

/**
 * A header for the stock list page. It contains the stock list filters and column filter.
 * @param props The properties of the component.
 * @returns The component.
 */
const StockListHeader: FC<StockListHeaderProps> = (props: StockListHeaderProps): React.JSX.Element => {
  const [addStockOpen, setAddStockOpen] = useState<boolean>(false);

  const { user } = useUserContextState();

  const fullScreenDialogs = !useMediaQuery("(min-width:664px)");

  return (
    <Grid container sx={{ justifyContent: "space-between", alignItems: "center", rowGap: 1 }}>
      <Grid>
        <Typography variant="h3" component="h3" gutterBottom>
          Stock List
        </Typography>
        <Typography variant="subtitle2">
          This list shows all stocks currently available in the Rating Tracker.
        </Typography>
      </Grid>
      <Grid sx={{ ml: "auto" }}>
        <Tooltip
          arrow
          title={
            user.hasAccessRight(WRITE_STOCKS_ACCESS)
              ? "Add a new stock"
              : "You do not have the necessary access rights to create stocks."
          }
        >
          <Box id="add-stock-label" sx={{ display: "inline-block", ml: 1 }}>
            <IconButton
              aria-labelledby="add-stock-label"
              color="primary"
              onClick={() => setAddStockOpen(true)}
              disabled={!user.hasAccessRight(WRITE_STOCKS_ACCESS)}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Tooltip>
        <Dialog
          maxWidth="sm"
          open={addStockOpen}
          fullScreen={fullScreenDialogs}
          TransitionComponent={fullScreenDialogs ? Slide : undefined}
          TransitionProps={{ direction: "up" } as SlideProps}
          fullWidth
        >
          <AddStock onClose={() => setAddStockOpen(false)} onCloseAfterAdd={props.refetchStocks} />
        </Dialog>
        <StockTableFilters {...props.stockTableFiltersProps} />
      </Grid>
    </Grid>
  );
};

/**
 * Properties for the StockListHeader component.
 */
interface StockListHeaderProps {
  /**
   * The properties of the stock table filters.
   */
  stockTableFiltersProps: StockTableFiltersProps;
  /**
   * A method to update the stock list, e.g. after a new stock was created.
   */
  refetchStocks: () => void;
}

export default StockListHeader;
