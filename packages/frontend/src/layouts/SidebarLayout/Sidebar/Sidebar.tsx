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
): React.JSX.Element => {
  return (
    <Box
      {...props}
      sx={(theme) => ({
        ...(props.sx as object),
        width: theme.sidebar.width,
        color: theme.palette.trueWhite.alpha70,
        position: "relative",
        zIndex: 7,
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        overflow: "scroll",
        ...theme.applyStyles("light", { boxShadow: "none" }),
        ...theme.applyStyles("dark", { boxShadow: theme.palette.sidebar.boxShadow }),
      })}
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
export const Sidebar = (props: SidebarProps): React.JSX.Element => {
  const theme = useTheme();
  return (
    <Box sx={{ position: "fixed", height: "100dvh" }}>
      {useMediaQuery(theme.breakpoints.up("lg")) ? (
        <SidebarWrapper
          sx={{
            ...theme.applyStyles("light", { background: alpha(darken(theme.palette.black.main, 0.5), 0.85) }),
            ...theme.applyStyles("dark", { background: alpha(lighten(theme.palette.white.main, 0.1), 0.5) }),
          }}
        >
          <SidebarContent closeSidebar={props.closeSidebar} />
        </SidebarWrapper>
      ) : (
        <Drawer
          sx={(theme) => ({ boxShadow: `${theme.palette.sidebar.boxShadow}` })}
          open={props.sidebarToggle}
          onClose={props.closeSidebar}
          variant="temporary"
          elevation={9}
        >
          <SidebarWrapper
            sx={{
              ...theme.applyStyles("light", { background: alpha(darken(theme.palette.black.main, 0.5), 0.85) }),
              ...theme.applyStyles("dark", { background: theme.palette.white.main }),
            }}
          >
            <SidebarContent closeSidebar={props.closeSidebar} />
          </SidebarWrapper>
        </Drawer>
      )}
    </Box>
  );
};

/**
 * Properties for the Sidebar component.
 */
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
