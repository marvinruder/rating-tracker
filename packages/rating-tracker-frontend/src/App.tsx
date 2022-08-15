import { useRoutes } from "react-router-dom";
import router from "src/router";

import { CssBaseline } from "@mui/material";
import ThemeProvider from "./theme/ThemeProvider";

function App() {
  const content = useRoutes(router);

  return (
    <ThemeProvider>
      <CssBaseline />
      {content}
    </ThemeProvider>
  );
}
export default App;
