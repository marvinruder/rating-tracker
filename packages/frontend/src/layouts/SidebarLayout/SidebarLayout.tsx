import { Box, useTheme } from "@mui/material";
import type { FC } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "./Header/Header";
import { Sidebar } from "./Sidebar/Sidebar";

/**
 * A layout with a sidebar.
 *
 * @returns {JSX.Element} The component.
 */
const SidebarLayout: FC = (): JSX.Element => {
  const theme = useTheme();

  return (
    <>
      <Box sx={{ flex: 1 }}>
        <Header />
        <Sidebar />
        <Box
          sx={{
            position: "relative",
            zIndex: 5,
            display: "block",
            flex: 1,
            [theme.breakpoints.up("lg")]: { ml: `${theme.sidebar.width}` },
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <Box
        sx={{
          position: "fixed",
          width: "100vw",
          height: "200dvh",
          overflow: "scroll",
          zIndex: -1,
          backdropFilter: "blur(3px)",
        }}
      />
    </>
  );
};

export default SidebarLayout;
