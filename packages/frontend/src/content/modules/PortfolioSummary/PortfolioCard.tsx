import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
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
import type { PortfolioSummary } from "@rating-tracker/commons";
import { currencyMinorUnits, getTotalAmount, pluralize, portfoliosAPIPath } from "@rating-tracker/commons";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import PinnedDialog from "../../../components/dialogs/PinnedDialog";
import { DeletePortfolio } from "../../../components/dialogs/portfolio/DeletePortfolio";
import { EditPortfolio } from "../../../components/dialogs/portfolio/EditPortfolio";
import AddStockToCollection from "../../../components/dialogs/stock/AddStockToCollection";

/**
 * This component displays information about a portfolio in a card used in the portfolio summary module.
 * @param props The properties of the component.
 * @returns The component.
 */
const PortfolioCard = (props: PortfolioCardProps): React.JSX.Element => {
  const [addStockToCollectionDialogOpen, setAddStockToCollectionDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  return (
    <Card>
      <CardActionArea>
        <Link to={`${portfoliosAPIPath}/${props.portfolio?.id}`} component={NavLink} sx={{ color: "inherit" }}>
          <CardContent>
            <Box>
              <Typography variant="h3">{props.portfolio?.name ?? <Skeleton width="160px" />}</Typography>
              <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
                {props.portfolio ? (
                  `${props.portfolio.stocks.length || "No"} stock${pluralize(props.portfolio.stocks.length)}${
                    props.portfolio.stocks.length
                      ? `\u2002·\u2002${props.portfolio.currency} ${getTotalAmount(props.portfolio).toFixed(
                          currencyMinorUnits[props.portfolio.currency],
                        )} total`
                      : ""
                  }`
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
          <Tooltip arrow title="Add stock">
            <Box sx={{ display: "inline-block", ml: 1 }}>
              <IconButton
                aria-label={`Add stock to portfolio “${props.portfolio.name}”`}
                color="success"
                onClick={() => setAddStockToCollectionDialogOpen(true)}
              >
                <AddShoppingCartIcon />
              </IconButton>
            </Box>
          </Tooltip>
        ) : (
          <Skeleton variant="rounded" width={40} height={40} sx={{ display: "inline-block", ml: 1 }} />
        )}
        {props.portfolio ? (
          <Tooltip arrow title="Edit portfolio">
            <Box sx={{ display: "inline-block", ml: 1 }}>
              <IconButton
                aria-label={`Edit portfolio “${props.portfolio.name}”`}
                color="primary"
                onClick={() => setEditDialogOpen(true)}
              >
                <EditIcon />
              </IconButton>
            </Box>
          </Tooltip>
        ) : (
          <Skeleton variant="rounded" width={40} height={40} sx={{ display: "inline-block", ml: 1 }} />
        )}
        {props.portfolio ? (
          <Tooltip arrow title="Delete portfolio">
            <Box sx={{ display: "inline-block", ml: 1 }}>
              <IconButton
                aria-label={`Delete portfolio “${props.portfolio.name}”`}
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Tooltip>
        ) : (
          <Skeleton variant="rounded" width={40} height={40} sx={{ display: "inline-block", ml: 1 }} />
        )}
        {props.portfolio && props.getPortfolios ? (
          <>
            {/* Add Stock to Collection Dialog */}
            <PinnedDialog
              maxWidth="xs"
              fullWidth
              open={addStockToCollectionDialogOpen}
              onClose={() => setAddStockToCollectionDialogOpen(false)}
            >
              <AddStockToCollection
                collection={props.portfolio}
                onAdd={props.getPortfolios}
                onClose={() => setAddStockToCollectionDialogOpen(false)}
              />
            </PinnedDialog>
            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
              <EditPortfolio
                portfolio={props.portfolio}
                onEdit={props.getPortfolios}
                onClose={() => setEditDialogOpen(false)}
              />
            </Dialog>
            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
              <DeletePortfolio
                portfolio={props.portfolio}
                onClose={() => setDeleteDialogOpen(false)}
                onDelete={props.getPortfolios}
              />
            </Dialog>
          </>
        ) : (
          <></>
        )}
      </CardActions>
    </Card>
  );
};

/**
 * Properties for the PortfolioCard component.
 */
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
