import ClearIcon from "@mui/icons-material/Clear";
import type { ListItemProps } from "@mui/material";
import { IconButton, ListItem, ListItemAvatar, Avatar, Box, Typography, useTheme, ListItemText } from "@mui/material";
import type { Stock, YahooStockStub } from "@rating-tracker/commons";
import { baseURL, emojiFlag, stockLogoEndpointSuffix, stocksAPIPath } from "@rating-tracker/commons";
import { NavLink } from "react-router-dom";

import { SectorIcon } from "../properties/SectorIcon";

/**
 * A preview of a stock, showing its name, country and sector in a `ListItem` component.
 * @param props The properties of the component.
 * @param props.stock The stock to preview.
 * @param props.navLink Whether the component is a `NavLink`.
 * @param props.onDelete The function to call when the user clicks on the Delete button.
 *                       If not provided, the button will not be shown.
 * @returns The component.
 */
export const StockPreview = ({ stock, navLink, onDelete, ...props }: StockPreviewProps): JSX.Element => {
  const theme = useTheme();
  return (
    <ListItem
      {...props}
      {...(navLink ? { component: NavLink, to: `${stocksAPIPath}/${encodeURIComponent(stock.ticker)}` } : {})}
      sx={{
        ...props.sx,
        cursor: props.onClick || navLink ? "pointer" : undefined,
        py: 1.5,
        color: "inherit",
        "&:hover": props.onClick || navLink ? { background: theme.palette.action.hover } : {},
        "> .MuiListItemSecondaryAction-root": { right: 9 },
      }}
      {...(onDelete
        ? {
            secondaryAction: (
              <IconButton aria-label={`Delete stock “${stock.name}”`} color="error" onClick={onDelete}>
                <ClearIcon />
              </IconButton>
            ),
          }
        : {})}
    >
      <ListItemAvatar>
        <Avatar
          sx={
            "logoUrl" in stock
              ? { width: 40, height: 40, background: "none", visibility: stock.logoUrl === null ? "hidden" : undefined }
              : { width: 80, height: 80, m: "-20px", background: "none" }
          }
          src={
            "logoUrl" in stock
              ? stock.logoUrl === null
                ? undefined
                : stock.logoUrl
              : `${baseURL}${stocksAPIPath}/${encodeURIComponent(stock.ticker)}${stockLogoEndpointSuffix}` +
                `?variant=${theme.palette.mode}`
          }
          alt={`Logo of “${stock.name}”`}
          slotProps={{ img: { loading: "lazy" } }}
        />
      </ListItemAvatar>
      <ListItemText primary={stock.name} primaryTypographyProps={{ fontWeight: "bold" }} secondary={stock.ticker} />
      <Typography sx={{ fontSize: 18, ml: 1 }}>{"country" in stock ? emojiFlag(stock.country) : ""}</Typography>
      <Box sx={{ width: 24, height: 24, ml: 1, mr: onDelete && 1 }}>
        <SectorIcon industry={stock.industry} length={24} type="Sector" />
      </Box>
    </ListItem>
  );
};

/**
 * The properties of the StockPreview component.
 */
interface StockPreviewProps extends ListItemProps {
  /**
   * The stock to preview.
   */
  stock: Stock | YahooStockStub;
  /**
   * Whether the component is a `NavLink`.
   */
  navLink?: boolean;
  /**
   * The function to call when the user clicks on the Delete button. If not provided, the button will not be shown.
   */
  onDelete?: () => void;
}
