import { Box, Container, alpha, lighten, useTheme } from "@mui/material";
import { ReactNode } from "react";

/**
 * The wrapper for a page title.
 *
 * @param {HeaderWrapperProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
export const HeaderWrapper = (props: HeaderWrapperProps): JSX.Element => {
  const theme = useTheme();
  if (props.maxWidth === undefined) props.maxWidth = "lg";

  return (
    <Box
      pt={`calc(${theme.header.height} + ${theme.spacing(4)})`}
      pb={4}
      sx={{
        background: theme.palette.mode === "dark" ? theme.colors.alpha.trueWhite[5] : theme.colors.alpha.white[50],
        marginBottom: `${theme.spacing(4)}`,
        boxShadow:
          theme.palette.mode === "dark"
            ? `0 1px 0 ${alpha(
                lighten(theme.colors.primary.main, 0.7),
                0.15,
              )}, 0px 2px 4px -3px rgba(0, 0, 0, 0.2), 0px 5px 12px -4px rgba(0, 0, 0, .1)`
            : `0px 2px 4px -3px ${alpha(theme.colors.alpha.black[100], 0.1)}, 0px 5px 12px -4px ${alpha(
                theme.colors.alpha.black[100],
                0.05,
              )}`,
      }}
    >
      <Container maxWidth={props.maxWidth}>{props.children}</Container>
    </Box>
  );
};

/**
 * Properties for the HeaderWrapper component.
 */
interface HeaderWrapperProps {
  /**
   * The content of the component.
   */
  children?: ReactNode;
  /**
   * The maximum width of the container.
   */
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
}
