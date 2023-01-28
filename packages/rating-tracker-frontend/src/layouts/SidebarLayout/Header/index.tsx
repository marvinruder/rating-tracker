import { useContext } from "react";

import {
  Box,
  alpha,
  lighten,
  IconButton,
  Tooltip,
  styled,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import SidebarContext from "../../../contexts/SidebarContext";

import HeaderButtons from "./Buttons";

/**
 * A wrapper for the header component.
 */
const HeaderWrapper = styled(Box)(
  ({ theme }) => `
        // height: ${theme.header.height};
        color: ${theme.header.textColor};
        right: 0;
        z-index: 6;
        background-color: ${alpha(theme.header.background, 0.95)};
        backdrop-filter: blur(3px);
        position: fixed;
        justify-content: space-between;
        width: 100%;
        @media (min-width: ${theme.breakpoints.values.lg}px) {
            left: ${theme.sidebar.width};
            width: auto;
        }
`
);

/**
 * The header of the sidebar layout.
 *
 * @returns {JSX.Element} The component.
 */
const Header = (): JSX.Element => {
  const { toggleSidebar } = useContext(SidebarContext);
  const theme = useTheme();

  return (
    <HeaderWrapper
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
            : `0px 2px 8px -3px ${alpha(
                theme.colors.alpha.black[100],
                0.2
              )}, 0px 5px 22px -4px ${alpha(
                theme.colors.alpha.black[100],
                0.1
              )}`,
      }}
    >
      <Box
        component="span"
        sx={{
          mr: 1,
          my: 1,
          display: "inline-block",
          // Since the sidebar is hidden on small screens, we need to show the menu button.
          visibility: { lg: "hidden", xs: "visible" },
        }}
      >
        <Tooltip arrow title="Toggle Menu">
          <IconButton color="primary" onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box display="flex" alignItems="center">
        <HeaderButtons />
      </Box>
    </HeaderWrapper>
  );
};

export default Header;
