import { FC, ReactNode } from "react";
import PropTypes from "prop-types";
import { Box, Container, styled } from "@mui/material";

const PageTitle = styled(Box)(
  ({ theme }) => `
  padding-top: ${theme.spacing(4)};
  padding-bottom: ${theme.spacing(4)};
  `
);

interface PageTitleWrapperProps {
  children?: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
}

const PageTitleWrapper: FC<PageTitleWrapperProps> = ({
  children,
  maxWidth,
}) => {
  if (maxWidth === undefined) maxWidth = "lg";
  return (
    <PageTitle className="MuiPageTitle-wrapper">
      <Container maxWidth={maxWidth}>{children}</Container>
    </PageTitle>
  );
};

PageTitleWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl", false]),
};

export default PageTitleWrapper;
