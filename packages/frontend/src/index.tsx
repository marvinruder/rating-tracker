import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { SidebarProvider } from "./contexts/SidebarContext";

createRoot(document.getElementById("root")).render(
  <SidebarProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SidebarProvider>,
);
