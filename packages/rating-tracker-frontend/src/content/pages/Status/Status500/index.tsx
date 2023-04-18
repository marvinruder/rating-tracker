import { useState } from "react";
import { Box, Typography, Container, Button, styled } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import LoadingButton from "@mui/lab/LoadingButton";

const MainContent = styled(Box)(
  () => `
    height: 100%;
    display: flex;
    flex: 1;
    overflow: auto;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
);

/**
 * Shows a 500 Internal Server Error page.
 * @returns {JSX.Element} The component.
 */
function Status500(): JSX.Element {
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
    <MainContent>
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
    </MainContent>
  );
}

export default Status500;
