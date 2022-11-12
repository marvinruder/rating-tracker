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

function Status500() {
  const [pending, setPending] = useState(false);
  function handleClick() {
    setPending(true);
    window.location.reload();
  }

  return (
    <MainContent>
      <Container maxWidth="md">
        <Box textAlign="center">
          <img alt="500" height={260} src="/static/images/status/500.svg" />
          <Typography variant="h2" sx={{ my: 2 }}>
            There was an error, please try again later
          </Typography>
          <Typography
            variant="h4"
            color="text.secondary"
            fontWeight="normal"
            sx={{ mb: 4 }}
          >
            The server encountered an internal error and was not able to
            complete your request
          </Typography>
          <LoadingButton
            onClick={handleClick}
            loading={pending}
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
          >
            Refresh view
          </LoadingButton>
          <Button href="/overview" variant="contained" sx={{ ml: 1 }}>
            Go back
          </Button>
        </Box>
      </Container>
    </MainContent>
  );
}

export default Status500;
