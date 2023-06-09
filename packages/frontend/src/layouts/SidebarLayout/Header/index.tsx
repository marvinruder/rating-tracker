import { useContext } from "react";

import { Box, alpha, lighten, IconButton, Tooltip, useTheme, Divider } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import { NavLink, useLocation } from "react-router-dom";

import SidebarContext from "../../../contexts/SidebarContext";

import { HeaderButtons } from "./Buttons";
import { HeaderUserbox } from "./Userbox";

/**
 * The header of the sidebar layout.
 *
 * @returns {JSX.Element} The component.
 */
export const Header = (): JSX.Element => {
  const { toggleSidebar } = useContext(SidebarContext);
  const theme = useTheme();
  const { pathname } = useLocation();

  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{
        px: 1,
        boxShadow:
          theme.palette.mode === "dark"
            ? `0 1px 0 ${alpha(
                lighten(theme.colors.primary.main, 0.7),
                0.15
              )}, 0px 2px 8px -3px rgba(0, 0, 0, 0.2), 0px 5px 22px -4px rgba(0, 0, 0, .1)`
            : `0px 2px 8px -3px ${alpha(theme.colors.alpha.black[100], 0.2)}, 0px 5px 22px -4px ${alpha(
                theme.colors.alpha.black[100],
                0.1
              )}`,
        color: theme.header.textColor,
        right: 0,
        zIndex: 6,
        backgroundColor: alpha(theme.header.background, 0.95),
        backdropFilter: "blur(3px)",
        position: "fixed",
        justifyContent: "space-between",
        width: "100%",
        [theme.breakpoints.up("lg")]: {
          left: theme.sidebar.width,
          width: "auto",
        },
      }}
    >
      <Box
        component="span"
        sx={{
          mr: 1,
          my: 1,
          display: "inline-block",
          // Since the sidebar is hidden on small screens, we need to show the menu button.
        }}
      >
        <Box component="span" sx={{ display: { lg: "none", xs: undefined } }}>
          <Tooltip arrow title="Toggle Menu">
            <IconButton color="primary" onClick={toggleSidebar}>
              <MenuIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box
          component="span"
          sx={{
            mr: 1,
            my: 1,
            display: pathname.split("/").filter((component) => component).length > 1 ? "inline-block" : "none",
          }}
        >
          <Tooltip arrow title="Go back">
            <IconButton
              color="primary"
              disableRipple
              component={NavLink}
              to={pathname.split("/").slice(0, -1).join("/")}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box display="flex" alignItems="center">
        <HeaderButtons />
        <Divider orientation="vertical" flexItem sx={{ m: 1 }} />
        <HeaderUserbox />
      </Box>
    </Box>
  );
};
