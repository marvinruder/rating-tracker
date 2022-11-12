import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import "nprogress/nprogress.css";
import App from "./App";
import { SidebarProvider } from "./contexts/SidebarContext";

createRoot(document.getElementById("root")).render(
  <SidebarProvider>
    <HashRouter>
      <App />
    </HashRouter>
  </SidebarProvider>
);
