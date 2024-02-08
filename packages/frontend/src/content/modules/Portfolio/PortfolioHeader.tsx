import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Grid, Typography, Dialog, IconButton, Skeleton, Tooltip, Divider } from "@mui/material";
import type { Portfolio } from "@rating-tracker/commons";
import { currencyMinorUnits, getTotalAmount, portfoliosEndpointPath } from "@rating-tracker/commons";
import { useState } from "react";
import { useNavigate } from "react-router";

import { DeletePortfolio } from "../../../components/dialogs/portfolio/DeletePortfolio";
import { EditPortfolio } from "../../../components/dialogs/portfolio/EditPortfolio";
import type { StockTableFiltersProps } from "../../../components/stock/layouts/StockTableFilters";
import { StockTableFilters } from "../../../components/stock/layouts/StockTableFilters";

/**
 * A header for the portfolio details page.
 * @param props The properties of the component.
 * @returns The component.
 */
export const PortfolioHeader = (props: PortfolioHeaderProps): JSX.Element => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);

  const navigate = useNavigate();

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
                  ? `\u2002·\u2002${props.portfolio.currency} ${getTotalAmount(props.portfolio).toFixed(
                      currencyMinorUnits[props.portfolio.currency],
                    )} total`
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
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
            <EditPortfolio
              portfolio={props.portfolio}
              onEdit={props.getPortfolio}
              onClose={() => setEditDialogOpen(false)}
            />
          </Dialog>
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DeletePortfolio
              portfolio={props.portfolio}
              onClose={() => setDeleteDialogOpen(false)}
              onDelete={() => navigate(portfoliosEndpointPath)}
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
  getPortfolio: () => void;
  /**
   * The properties of the stock table filters.
   */
  stockTableFiltersProps: StockTableFiltersProps;
}
