import AddIcon from "@mui/icons-material/Add";
import type { SlideProps } from "@mui/material";
import { Box, Typography, Grid, Tooltip, Dialog, IconButton, useMediaQuery, Slide } from "@mui/material";
import { WRITE_STOCKS_ACCESS } from "@rating-tracker/commons";
import type { FC } from "react";
import { useContext, useState } from "react";

import { AddStock } from "../../../components/dialogs/stock/AddStock";
import type { StockTableFiltersProps } from "../../../components/stock/layouts/StockTableFilters";
import { StockTableFilters } from "../../../components/stock/layouts/StockTableFilters";
import { UserContext } from "../../../contexts/UserContext";

/**
 * A header for the stock list page. It contains the stock list filters and column filter.
 *
 * @param {StockListHeaderProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const StockListHeader: FC<StockListHeaderProps> = (props: StockListHeaderProps): JSX.Element => {
  const [addStockOpen, setAddStockOpen] = useState<boolean>(false);

  const { user } = useContext(UserContext);

  const fullScreenDialogs = !useMediaQuery("(min-width:664px)");

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          Stock List
        </Typography>
        <Typography variant="subtitle2">
          This list shows all stocks currently available in the Rating Tracker.
        </Typography>
      </Grid>
      <Grid item ml="auto">
        <Tooltip
          arrow
          title={
            user.hasAccessRight(WRITE_STOCKS_ACCESS)
              ? "Add a new stock"
              : "You do not have the necessary access rights to create stocks."
          }
        >
          <Box display="inline-block" ml={1} mt={1}>
            <IconButton
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
          <AddStock onClose={() => (setAddStockOpen(false), props.triggerRefetch())} />
        </Dialog>
        <StockTableFilters {...props.stockTableFiltersProps} />
      </Grid>
    </Grid>
  );
};

interface StockListHeaderProps {
  /**
   * The properties of the stock table filters.
   */
  stockTableFiltersProps: StockTableFiltersProps;
  /**
   * A function to trigger a refetch of the stock list.
   */
  triggerRefetch: () => void;
}

export default StockListHeader;
