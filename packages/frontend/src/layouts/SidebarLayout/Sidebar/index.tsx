import type { BoxProps } from "@mui/material";
import { Box, Drawer, alpha, useTheme, lighten, darken } from "@mui/material";
import { FC, useContext } from "react";

import SidebarContext from "../../../contexts/SidebarContext";

import { SidebarContent } from "./SidebarContent";

/**
 * A wrapper for the sidebar component.
 *
 * @param {React.ReactNode} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const SidebarWrapper: FC<BoxProps & { children: React.ReactNode }> = (
  props: BoxProps & { children: React.ReactNode },
): JSX.Element => {
  const theme = useTheme();
  return (
    <Box
      width={theme.sidebar.width}
      color={theme.colors.alpha.trueWhite[70]}
      position="relative"
      zIndex={7}
      height="100%"
      {...props}
    >
      {props.children}
    </Box>
  );
};

/**
 * The sidebar of the sidebar layout.
 *
 * @returns {JSX.Element} The component.
 */
export const Sidebar = (): JSX.Element => {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();

  return (
    <>
      <SidebarWrapper
        sx={{
          display: { xs: "none", lg: "inline-block" },
          position: "fixed",
          left: 0,
          top: 0,
          background:
            theme.palette.mode === "dark"
              ? alpha(lighten(theme.header.background, 0.1), 0.5)
              : alpha(darken(theme.colors.alpha.black[100], 0.5), 0.85),
          boxShadow: theme.palette.mode === "dark" ? theme.sidebar.boxShadow : "none",
        }}
      >
        <SidebarContent />
      </SidebarWrapper>
      <Drawer
        sx={{ boxShadow: `${theme.sidebar.boxShadow}` }}
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
          <SidebarContent />
        </SidebarWrapper>
      </Drawer>
    </>
  );
};
