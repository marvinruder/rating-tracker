import ClearIcon from "@mui/icons-material/Clear";
import type { ListItemProps } from "@mui/material";
import {
  IconButton,
  ListItem,
  ListItemAvatar,
  Avatar,
  Box,
  Typography,
  useTheme,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import type { Stock } from "@rating-tracker/commons";
import { baseURL, emojiFlag, stockLogoEndpointSuffix, stocksEndpointPath } from "@rating-tracker/commons";
import { NavLink } from "react-router-dom";

import { SectorIcon } from "../properties/SectorIcon";

/**
 * A preview of a stock, showing its name, country and sector in a `ListItem` component.
 * @param props The properties of the component.
 * @returns The component.
 */
export const StockPreview = (props: StockPreviewProps): JSX.Element => {
  const theme = useTheme();
  return (
    <ListItem
      {...(props.navLink ? { component: NavLink, to: `${stocksEndpointPath}/${props.stock.ticker}` } : {})}
      onClick={props.onClick}
      sx={{
        cursor: props.onClick || props.navLink ? "pointer" : undefined,
        py: 1.5,
        color: "inherit",
        "&:hover": props.onClick || props.navLink ? { background: theme.palette.action.hover } : {},
      }}
      disableGutters={props.disableGutters}
    >
      <ListItemAvatar>
        <Avatar
          sx={{ width: 80, height: 80, m: "-20px", background: "none" }}
          src={`${baseURL}${stocksEndpointPath}/${props.stock.ticker}${stockLogoEndpointSuffix}?dark=${
            theme.palette.mode === "dark"
          }`}
          alt=" "
        />
      </ListItemAvatar>
      <ListItemText
        primary={props.stock.name}
        primaryTypographyProps={{ fontWeight: "bold" }}
        secondary={props.stock.ticker}
      />
      <Typography sx={{ ml: 1 }} fontSize={18}>
        {emojiFlag(props.stock.country)}
      </Typography>
      <Box width={24} height={24} ml={1}>
        <SectorIcon industry={props.stock.industry} length={24} type="Sector" />
      </Box>
      {props.onDelete && (
        <ListItemSecondaryAction>
          <IconButton color="error" onClick={props.onDelete}>
            <ClearIcon />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

/**
 * The properties of the StockPreview component.
 */
interface StockPreviewProps extends Pick<ListItemProps, "disableGutters"> {
  /**
   * The stock to preview.
   */
  stock: Stock;
  /**
   * Whether the component is a `NavLink`.
   */
  navLink?: boolean;
  /**
   * The function to call when the user clicks on the list item.
   */
  onClick?: () => void;
  /**
   * The function to call when the user clicks on the Delete button. If not provided, the button will not be shown.
   */
  onDelete?: () => void;
}
