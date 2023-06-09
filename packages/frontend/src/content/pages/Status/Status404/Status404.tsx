import { Box, Typography, Container } from "@mui/material";

/**
 * Shows a 404 Not Found page.
 *
 * @returns {JSX.Element} The component.
 */
export const Status404 = (): JSX.Element => {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flex: 1,
        overflow: "auto",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="md">
        <Box textAlign="center">
          <img alt="404" height={180} src="/assets/images/status/404.svg" />
          <Typography variant="h2" sx={{ my: 2 }}>
            The page you were looking for does not exist.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
