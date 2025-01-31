import QueryStatsIcon from "@mui/icons-material/QueryStats";
import { Badge, Box, Typography, useTheme } from "@mui/material";
import { NavLink } from "react-router-dom";

import packageInfo from "../../../../package.json";

/**
 * The Logo component, shown at the top of the sidebar. Contains the app name and version.
 * @returns The Logo component
 */
export const Logo = (): React.JSX.Element => {
  const theme = useTheme();
  return (
    <NavLink
      to="/"
      style={{
        color: theme.palette.trueWhite.alpha70,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "end",
        textDecoration: "none",
        fontWeight: "bold",
      }}
    >
      <Typography variant="h2" sx={{ fontSize: 18 }}>
        Rating Tracker
      </Typography>
      <Box sx={{ height: 52, transform: "scale(0.83)", fontSize: 52, color: theme.palette.trueWhite.alpha30 }}>
        <Badge
          badgeContent={packageInfo.version}
          color="primary"
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <QueryStatsIcon fontSize="inherit" />
        </Badge>
      </Box>
    </NavLink>
  );
};
