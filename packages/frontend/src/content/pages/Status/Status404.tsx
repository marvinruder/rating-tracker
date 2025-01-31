import { Box, Typography, Container } from "@mui/material";

/**
 * Shows a 404 Not Found page.
 * @returns The component.
 */
const Status404 = (): React.JSX.Element => {
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
        <Box sx={{ textAlign: "center" }}>
          <img alt="404" height={180} src="/assets/images/status/404.svg" />
          <Typography variant="h2" sx={{ my: 2 }}>
            The page you were looking for does not exist.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Status404;
