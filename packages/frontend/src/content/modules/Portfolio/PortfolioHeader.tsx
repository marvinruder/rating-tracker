import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Grid, Typography, Dialog, IconButton, Skeleton, Tooltip, Divider } from "@mui/material";
import { currencyMinorUnits, Portfolio, portfoliosEndpointPath } from "@rating-tracker/commons";
import { useState } from "react";

import { DeletePortfolio } from "../../../components/dialogs/portfolio/DeletePortfolio";
import { EditPortfolio } from "../../../components/dialogs/portfolio/EditPortfolio";
import { StockTableFilters, StockTableFiltersProps } from "../../../components/stock/layouts/StockTableFilters";

/**
 * A header for the portfolio details page.
 *
 * @param {PortfolioHeaderProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const PortfolioHeader = (props: PortfolioHeaderProps): JSX.Element => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item sx={{ display: "flex", alignItems: "center", maxWidth: "calc(100% - 147px)" }}>
          <Box>
            <Typography variant="h3" component="h3" gutterBottom>
              {props.portfolio ? props.portfolio.name : <Skeleton width={160} />}
            </Typography>
            <Typography variant="subtitle2">
              {props.portfolio ? (
                (props.portfolio.stocks.length || "No") +
                ` stock${props.portfolio.stocks.length !== 1 ? "s" : ""}` +
                (props.portfolio.stocks.length
                  ? ` · ${props.portfolio.stocks
                      .reduce((sum, stock) => sum + stock.amount, 0)
                      .toFixed(currencyMinorUnits[props.portfolio.currency])} ${props.portfolio.currency} total`
                  : "")
              ) : (
                <Skeleton width="48px" />
              )}
            </Typography>
          </Box>
        </Grid>
        <Grid item ml="auto" height={40} display="inline-flex">
          {props.portfolio ? (
            <Tooltip arrow title="Edit portfolio">
              <Box display="inline-block" ml={1}>
                <IconButton color="primary" onClick={() => setEditDialogOpen(true)}>
                  <EditIcon />
                </IconButton>
              </Box>
            </Tooltip>
          ) : (
            <Skeleton variant="rounded" width={40} height={40} sx={{ display: "inline-block", ml: 1 }} />
          )}
          {props.portfolio ? (
            <Tooltip arrow title="Delete portfolio">
              <Box display="inline-block" ml={1}>
                <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Tooltip>
          ) : (
            <Skeleton variant="rounded" width={40} height={40} sx={{ display: "inline-block", ml: 1 }} />
          )}
          <Divider orientation="vertical" component="div" sx={{ display: "inline-block", ml: 1, height: 40 }} />
          <StockTableFilters {...props.stockTableFiltersProps} />
        </Grid>
      </Grid>
      {props.portfolio && (
        <>
          <Dialog
            open={editDialogOpen}
            onClose={() => (setEditDialogOpen(false), props.getPortfolio && props.getPortfolio())}
          >
            <EditPortfolio
              portfolio={props.portfolio}
              getPortfolios={props.getPortfolio}
              onClose={() => setEditDialogOpen(false)}
            />
          </Dialog>
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DeletePortfolio
              portfolio={props.portfolio}
              onClose={() => setDeleteDialogOpen(false)}
              navigateTo={portfoliosEndpointPath}
            />
          </Dialog>
        </>
      )}
    </>
  );
};

/**
 * The properties of the PortfolioHeader component.
 */
interface PortfolioHeaderProps {
  /**
   * The portfolio to display.
   */
  portfolio?: Portfolio;
  /**
   * A method to update the portfolio, e.g. after editing.
   */
  getPortfolio?: () => void;
  /**
   * The properties of the stock table filters.
   */
  stockTableFiltersProps: StockTableFiltersProps;
}
