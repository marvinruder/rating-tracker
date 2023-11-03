import { CssBaseline } from "@mui/material";
import { useRoutes } from "react-router-dom";

import { LogoBackground } from "./components/etc/LogoBackground";
import router from "./router";
import ThemeProvider from "./theme/ThemeProvider";

/**
 * The Rating Tracker Application.
 *
 * @returns {JSX.Element} The component.
 */
const App = (): JSX.Element => {
  /**
   * The routes to the different views.
   */
  const content = useRoutes(router);

  return (
    <ThemeProvider>
      <CssBaseline />
      {content}
      <LogoBackground />
    </ThemeProvider>
  );
};

export default App;
