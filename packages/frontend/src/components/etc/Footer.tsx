import GitHubIcon from "@mui/icons-material/GitHub";
import type { BoxProps } from "@mui/material";
import { Box, Container, IconButton, Typography } from "@mui/material";

export const Footer = (props: FooterProps) => (
  <>
    <Box sx={{ flexGrow: 1 }} />
    <Container maxWidth={false}>
      <Box
        sx={{
          m: "auto",
          mt: 2,
          pb: 2,
          display: { xs: "block", md: "flex" },
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: { xs: "center", md: "left" },
        }}
        maxWidth={props.maxWidth}
      >
        <Typography sx={{ ml: { md: "auto" }, mr: { md: 0.5 }, pt: { xs: 2, md: 0 } }} variant="subtitle1">
          Something&nbsp;missing&nbsp;or&nbsp;not&nbsp;working&nbsp;correctly? Report&nbsp;it&nbsp;on&nbsp;GitHub:
        </Typography>
        <IconButton href="https://github.com/marvinruder/rating-tracker">
          <GitHubIcon />
        </IconButton>
        <Typography sx={{ pt: { xs: 2, md: 0 }, order: -1 }} variant="subtitle1">
          &copy; 2022–2024 Marvin A. Ruder
        </Typography>
      </Box>
    </Container>
  </>
);

interface FooterProps {
  /**
   * The maximum width of the container.
   */
  maxWidth?: BoxProps["maxWidth"];
}
