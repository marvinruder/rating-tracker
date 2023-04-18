import { FC, ReactNode } from "react";
import { Outlet } from "react-router-dom";

import { Box } from "@mui/material";

/**
 * A base layout for the application.
 * @param {BaseLayoutProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const BaseLayout: FC<BaseLayoutProps> = (props: BaseLayoutProps) => {
  return (
    <Box
      sx={{
        flex: 1,
        height: "100%",
      }}
    >
      {props.children || <Outlet />}
    </Box>
  );
};

/**
 * Properties for the base layout.
 */
interface BaseLayoutProps {
  /**
   * The children to be rendered.
   */
  children?: ReactNode;
}

export default BaseLayout;
