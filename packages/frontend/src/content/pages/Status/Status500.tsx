import RefreshIcon from "@mui/icons-material/Refresh";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Typography, Container, Button } from "@mui/material";
import { useState } from "react";

/**
 * Shows a 500 Internal Server Error page.
 *
 * @returns {JSX.Element} The component.
 */
export const Status500 = (): JSX.Element => {
  const [pending, setPending] = useState(false);
  /**
   * Shows a loading indicator and reloads the page.
   */
  function handleReload() {
    setPending(true);
    window.location.reload();
  }

  /**
   * Shows a loading indicator and goes back to the previous page.
   */
  function handleBack() {
    setPending(true);
    window.history.back();
  }

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
          <img alt="500" height={260} src="/assets/images/status/500.svg" />
          <Typography variant="h2" sx={{ my: 2 }}>
            There was an error, please try again later
          </Typography>
          <Typography variant="h4" color="text.secondary" fontWeight="normal" sx={{ mb: 4 }}>
            The server encountered an internal error and was not able to complete your request
          </Typography>
          <LoadingButton
            onClick={handleReload}
            loading={pending}
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
          >
            Refresh view
          </LoadingButton>
          <Button onClick={handleBack} variant="contained" sx={{ ml: 1 }}>
            Go back
          </Button>
        </Box>
      </Container>
    </Box>
  );
};