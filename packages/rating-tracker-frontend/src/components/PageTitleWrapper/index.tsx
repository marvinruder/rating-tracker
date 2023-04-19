import { ReactNode } from "react";
import { Box, Container, styled } from "@mui/material";

const PageTitle = styled(Box)(
  ({ theme }) => `
  padding-top: ${theme.spacing(4)};
  padding-bottom: ${theme.spacing(4)};
  `
);

/**
 * The wrapper for a page title.
 *
 * @param {PageTitleWrapperProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const PageTitleWrapper = (props: PageTitleWrapperProps): JSX.Element => {
  if (props.maxWidth === undefined) props.maxWidth = "lg";
  return (
    <PageTitle className="MuiPageTitle-wrapper">
      <Container maxWidth={props.maxWidth}>{props.children}</Container>
    </PageTitle>
  );
};

/**
 * Properties for the PageTitleWrapper component.
 */
interface PageTitleWrapperProps {
  /**
   * The content of the component.
   */
  children?: ReactNode;
  /**
   * The maximum width of the container.
   */
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
}

export default PageTitleWrapper;
