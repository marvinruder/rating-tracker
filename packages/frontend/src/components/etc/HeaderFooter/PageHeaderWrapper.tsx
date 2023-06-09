import { ReactNode } from "react";
import { Box, Container } from "@mui/material";

/**
 * The wrapper for a page title.
 *
 * @param {PageHeaderWrapperProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const PageHeaderWrapper = (props: PageHeaderWrapperProps): JSX.Element => {
  if (props.maxWidth === undefined) props.maxWidth = "lg";

  return (
    <Box py={4} className="MuiPageTitle-wrapper">
      <Container maxWidth={props.maxWidth}>{props.children}</Container>
    </Box>
  );
};

/**
 * Properties for the PageHeaderWrapper component.
 */
interface PageHeaderWrapperProps {
  /**
   * The content of the component.
   */
  children?: ReactNode;
  /**
   * The maximum width of the container.
   */
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
}
