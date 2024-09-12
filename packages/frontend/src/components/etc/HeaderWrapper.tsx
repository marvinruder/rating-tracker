import { Box, Container, alpha, lighten } from "@mui/material";
import type { ReactNode } from "react";

/**
 * The wrapper for a page title.
 * @param props The properties of the component.
 * @returns The component.
 */
export const HeaderWrapper = (props: HeaderWrapperProps): JSX.Element => (
  <Box
    sx={(theme) => ({
      pt: `calc(76px + ${theme.spacing(4)})`,
      pb: 4,
      marginBottom: `${theme.spacing(4)}`,
      ...theme.applyStyles("light", {
        background: theme.palette.white.alpha50,
        boxShadow:
          `0px 2px 4px -3px ${alpha(theme.palette.black.main, 0.1)}, ` +
          `0px 5px 12px -4px ${alpha(theme.palette.black.main, 0.05)}`,
      }),
      ...theme.applyStyles("dark", {
        background: theme.palette.trueWhite.alpha5,
        boxShadow:
          `0 1px 0 ${alpha(lighten(theme.palette.primary.main, 0.7), 0.15)}, ` +
          `0px 2px 4px -3px rgb(0 0 0 / 20%), 0px 5px 12px -4px rgb(0 0 0 / 10%)`,
      }),
    })}
  >
    <Container maxWidth={props.maxWidth ?? "lg"}>{props.children}</Container>
  </Box>
);

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
