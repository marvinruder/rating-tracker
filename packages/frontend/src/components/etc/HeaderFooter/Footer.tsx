import { Box, Container, Link, Typography } from "@mui/material";

export const Footer = () => {
  return (
    <Container sx={{ mt: 4 }}>
      <Box
        pb={4}
        display={{ xs: "block", md: "flex" }}
        alignItems="center"
        textAlign={{ xs: "center", md: "left" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="subtitle1">&copy; 2022–2023 Marvin A. Ruder</Typography>
        </Box>
        <Typography sx={{ pt: { xs: 2, md: 0 } }} variant="subtitle1">
          Crafted with{" "}
          <Link href="https://bloomui.com" target="_blank" rel="noopener noreferrer">
            BloomUI.com
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};
