import type { BoxProps } from "@mui/material";
import { Box, Drawer, alpha, useTheme, lighten, darken, useMediaQuery } from "@mui/material";
import type { FC } from "react";

import { SidebarContent } from "./SidebarContent";

/**
 * A wrapper for the sidebar component.
 * @param props The properties of the component.
 * @returns The component.
 */
const SidebarWrapper: FC<React.PropsWithChildren<BoxProps>> = (
  props: React.PropsWithChildren<BoxProps>,
): JSX.Element => {
  const theme = useTheme();

  return (
    <Box
      width={theme.sidebar.width}
      color={theme.colors.alpha.trueWhite[70]}
      position="relative"
      zIndex={7}
      display="flex"
      flexDirection="column"
      height="100dvh"
      overflow="scroll"
      boxShadow={theme.palette.mode === "dark" ? theme.sidebar.boxShadow : "none"}
      {...props}
    >
      {props.children}
    </Box>
  );
};

/**
 * The sidebar of the sidebar layout.
 * @param props The component props.
 * @returns The component.
 */
export const Sidebar = (props: SidebarProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Box position="fixed" height="100dvh">
      {useMediaQuery(theme.breakpoints.up("lg")) ? (
        <SidebarWrapper
          sx={{
            background:
              theme.palette.mode === "dark"
                ? alpha(lighten(theme.header.background, 0.1), 0.5)
                : alpha(darken(theme.colors.alpha.black[100], 0.5), 0.85),
          }}
        >
          <SidebarContent closeSidebar={props.closeSidebar} />
        </SidebarWrapper>
      ) : (
        <Drawer
          sx={{ boxShadow: `${theme.sidebar.boxShadow}` }}
          open={props.sidebarToggle}
          onClose={props.closeSidebar}
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
            <SidebarContent closeSidebar={props.closeSidebar} />
          </SidebarWrapper>
        </Drawer>
      )}
    </Box>
  );
};

interface SidebarProps {
  /**
   * Whether the sidebar is open or not.
   */
  sidebarToggle: boolean;
  /**
   * Closes the sidebar.
   */
  closeSidebar: () => void;
}
