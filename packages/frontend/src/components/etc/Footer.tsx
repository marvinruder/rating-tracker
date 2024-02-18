import GitHubIcon from "@mui/icons-material/GitHub";
import { Container, IconButton, Typography } from "@mui/material";

export const Footer = () => {
  return (
    <Container
      sx={{
        mt: 2,
        pb: { xs: 4, md: 2 },
        display: { xs: "block", md: "flex" },
        alignItems: "center",
        justifyContent: "space-between",
        textAlign: { xs: "center", md: "left" },
      }}
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
    </Container>
  );
};
