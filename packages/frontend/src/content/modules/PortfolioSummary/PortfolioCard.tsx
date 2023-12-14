import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Dialog,
  IconButton,
  Link,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import { PortfolioSummary, currencyMinorUnits, portfoliosEndpointPath } from "@rating-tracker/commons";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import { DeletePortfolio } from "../../../components/dialogs/portfolio/DeletePortfolio";
import { EditPortfolio } from "../../../components/dialogs/portfolio/EditPortfolio";

/**
 * This component displays information about a portfolio in a card used in the portfolio summary module.
 *
 * @param {PortfolioCardProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const PortfolioCard = (props: PortfolioCardProps): JSX.Element => {
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  return (
    <Card>
      <CardActionArea>
        <Link
          to={`${portfoliosEndpointPath}/${props.portfolio?.id}`}
          component={NavLink}
          color="inherit"
          underline="none"
        >
          <CardContent>
            <Box>
              <Typography variant="h3">{props.portfolio?.name ?? <Skeleton width="160px" />}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
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
          </CardContent>
        </Link>
      </CardActionArea>
      <CardActions sx={{ justifyContent: "flex-end" }}>
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
        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <EditPortfolio
            portfolio={props.portfolio}
            getPortfolios={props.getPortfolios}
            onClose={() => setEditDialogOpen(false)}
          />
        </Dialog>
        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DeletePortfolio
            portfolio={props.portfolio}
            getPortfolios={props.getPortfolios}
            onClose={() => setDeleteDialogOpen(false)}
          />
        </Dialog>
      </CardActions>
    </Card>
  );
};

interface PortfolioCardProps {
  /**
   * The portfolio to display.
   */
  portfolio?: PortfolioSummary;
  /**
   * A method to update the portfolios, e.g. after a portfolio was modified or deleted.
   */
  getPortfolios?: () => void;
}

export default PortfolioCard;
