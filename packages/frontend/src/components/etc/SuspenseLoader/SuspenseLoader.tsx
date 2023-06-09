import { useEffect } from "react";
import NProgress from "nprogress";
import { Box, CircularProgress } from "@mui/material";

/**
 * A component that renders a loading indicator.
 *
 * @returns {JSX.Element} The component.
 */
export const SuspenseLoader = (): JSX.Element => {
  useEffect(() => {
    NProgress.start();

    return () => {
      NProgress.done();
    };
  }, []);

  return (
    <Box
      position="fixed"
      left={0}
      top={0}
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <CircularProgress size={64} thickness={3} />
    </Box>
  );
};
