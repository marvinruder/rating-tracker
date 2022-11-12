import { Box, Typography, Container, styled } from "@mui/material";

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

function Status404() {
  return (
    <MainContent>
      <Container maxWidth="md">
        <Box textAlign="center">
          <img alt="404" height={180} src="/static/images/status/404.svg" />
          <Typography variant="h2" sx={{ my: 2 }}>
            The page you were looking for does not exist.
          </Typography>
        </Box>
      </Container>
    </MainContent>
  );
}

export default Status404;
