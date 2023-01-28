import { useContext } from "react";
import SidebarContext from "../../../contexts/SidebarContext";

import {
  Box,
  Drawer,
  alpha,
  styled,
  Divider,
  useTheme,
  lighten,
  darken,
} from "@mui/material";

import SidebarMenu from "./SidebarMenu";
import Logo from "../../../components/Logo";

/**
 * A wrapper for the sidebar component.
 */
const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.sidebar.width};
        min-width: ${theme.sidebar.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
        padding-bottom: 68px;
`
);

/**
 * The sidebar of the sidebar layout.
 *
 * @returns {JSX.Element} The component.
 */
const Sidebar = (): JSX.Element => {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();

  return (
    <>
      <SidebarWrapper
        sx={{
          display: {
            xs: "none",
            lg: "inline-block",
          },
          position: "fixed",
          left: 0,
          top: 0,
          background:
            theme.palette.mode === "dark"
              ? alpha(lighten(theme.header.background, 0.1), 0.5)
              : alpha(darken(theme.colors.alpha.black[100], 0.5), 0.85),
          boxShadow:
            theme.palette.mode === "dark" ? theme.sidebar.boxShadow : "none",
        }}
      >
        <Box mt={3} mx={2}>
          <Logo />
        </Box>
        <Divider
          sx={{
            mt: 3,
            mx: 2,
            background: theme.colors.alpha.trueWhite[10],
          }}
        />
        <SidebarMenu />
        {/* This would display another area at the bottom of the sidebar.
        <Divider
          sx={{
            background: theme.colors.alpha.trueWhite[10],
          }}
        />
        <Box p={2}>
          <Button
            href="https://bloomui.com"
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="success"
            size="small"
            fullWidth
          >
            Upgrade to PRO
          </Button>
        </Box> */}
      </SidebarWrapper>
      <Drawer
        sx={{
          boxShadow: `${theme.sidebar.boxShadow}`,
        }}
        anchor={theme.direction === "rtl" ? "right" : "left"}
        open={sidebarToggle}
        onClose={closeSidebar}
        variant="temporary"
        elevation={9}
      >
        <SidebarWrapper
          sx={{
            background:
              theme.palette.mode === "dark"
                ? theme.colors.alpha.white[100]
                : alpha(darken(theme.colors.alpha.black[100], 0.5), 0.85),
          }}
        >
          <Box mt={3} mx={2}>
            <Logo />
          </Box>
          <Divider
            sx={{
              mt: 3,
              mx: 2,
              background: theme.colors.alpha.trueWhite[10],
            }}
          />
          <SidebarMenu />
        </SidebarWrapper>
      </Drawer>
    </>
  );
};

export default Sidebar;
