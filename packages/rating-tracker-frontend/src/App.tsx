import { useRoutes } from "react-router-dom";
import router from "./router";

import { CssBaseline } from "@mui/material";
import ThemeProvider from "./theme/ThemeProvider";
import ParticleBackground from "./components/ParticleBackground";

function App() {
  const content = useRoutes(router);

  return (
    <ThemeProvider>
      <CssBaseline />
      {content}
      <ParticleBackground />
    </ThemeProvider>
  );
}
export default App;
