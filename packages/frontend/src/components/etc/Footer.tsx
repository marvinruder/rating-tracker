import { Container, Typography } from "@mui/material";

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
      <Typography sx={{ pt: { xs: 2, md: 0 } }} variant="subtitle1">
        &copy; 2022–2023 Marvin A. Ruder
      </Typography>
    </Container>
  );
};