import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, alpha, lighten, IconButton, Tooltip, useTheme, Divider } from "@mui/material";
import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { HeaderButtons } from "./Buttons/Buttons";
import { HeaderUserbox } from "./Userbox/Userbox";

/**
 * The header of the sidebar layout.
 * @param props The component props.
 * @returns The component.
 */
export const Header = (props: HeaderProps): JSX.Element => {
  const theme = useTheme();
  const { pathname } = useLocation();

  useEffect(() => {
    document
      .getElementById(`meta-theme-color-${theme.palette.mode}`)
      ?.setAttribute("content", theme.palette.white.main);
    return () => {
      document
        .getElementById(`meta-theme-color-${theme.palette.mode}`)
        ?.setAttribute("content", theme.palette.background.default);
    };
  }, [theme.palette.mode]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 1,
        color: theme.palette.secondary.main,
        right: 0,
        zIndex: 6,
        backgroundColor: alpha(theme.palette.white.main, 0.95),
        backdropFilter: "blur(3px)",
        position: "fixed",
        justifyContent: "space-between",
        width: "100%",
        [theme.breakpoints.up("lg")]: { left: theme.sidebar.width, width: "auto" },
        ...theme.applyStyles("light", {
          boxShadow:
            `0px 2px 8px -3px ${alpha(theme.palette.black.main, 0.2)}, ` +
            `0px 5px 22px -4px ${alpha(theme.palette.black.main, 0.1)}`,
        }),
        ...theme.applyStyles("dark", {
          boxShadow:
            `0 1px 0 ${alpha(lighten(theme.palette.primary.main, 0.7), 0.15)}, ` +
            `0px 2px 8px -3px rgb(0 0 0 / 20%), 0px 5px 22px -4px rgb(0 0 0 / 10%)`,
        }),
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
            <IconButton color="primary" onClick={props.toggleSidebar}>
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
            <IconButton color="primary" component={NavLink} to={pathname.split("/").slice(0, -1).join("/")}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <HeaderButtons />
        <Divider orientation="vertical" flexItem sx={{ m: 1 }} />
        <HeaderUserbox />
      </Box>
    </Box>
  );
};

/**
 * Properties for the Header component.
 */
interface HeaderProps {
  /**
   * Toggles the sidebar.
   */
  toggleSidebar: () => void;
}
