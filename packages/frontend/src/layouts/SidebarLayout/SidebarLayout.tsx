import { Box } from "@mui/material";
import type { FC } from "react";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "./Header/Header";
import { Sidebar } from "./Sidebar/Sidebar";

/**
 * A layout with a sidebar.
 * @returns The component.
 */
const SidebarLayout: FC = (): React.JSX.Element => {
  const [sidebarToggle, setSidebarToggle] = useState(false);

  /**
   * Toggles the sidebar.
   */
  const toggleSidebar = () => {
    setSidebarToggle(!sidebarToggle);
  };

  /**
   * Closes the sidebar.
   */
  const closeSidebar = () => {
    setSidebarToggle(false);
  };

  return (
    <>
      <Box sx={{ flex: 1 }}>
        <Header toggleSidebar={toggleSidebar} />
        <Sidebar sidebarToggle={sidebarToggle} closeSidebar={closeSidebar} />
        <Box
          sx={(theme) => ({
            position: "relative",
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            minHeight: "100dvh",
            [theme.breakpoints.up("lg")]: { ml: `${theme.sidebar.width}` },
          })}
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
