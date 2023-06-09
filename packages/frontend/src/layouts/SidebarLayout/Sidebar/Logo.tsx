import { Badge, Box, useTheme } from "@mui/material";
import { NavLink } from "react-router-dom";
import packageInfo from "../../../../package.json";
import QueryStatsIcon from "@mui/icons-material/QueryStats";

/**
 * The Logo component, shown at the top of the sidebar. Contains the app name and version.
 *
 * @returns {JSX.Element} The Logo component
 */
export const Logo = (): JSX.Element => {
  const theme = useTheme();
  return (
    <NavLink
      to="/"
      style={{
        color: theme.sidebar.textColor,
        display: "flex",
        textDecoration: "none",
        fontWeight: "bold",
      }}
    >
      <Box sx={{ height: 52, transform: "scale(0.8)", fontSize: 52 }}>
        <Badge
          badgeContent={packageInfo.version}
          color="success"
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <QueryStatsIcon fontSize="inherit" />
        </Badge>
      </Box>
      <Box display="flex" alignItems="flex-end" height={52} pl={2}>
        <Box sx={{ fontSize: 15, fontWeight: "bold" }}>Rating Tracker</Box>
      </Box>
    </NavLink>
  );
};
