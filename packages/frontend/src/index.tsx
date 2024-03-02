import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

if (/iPad|iPhone|iPod/.test(navigator.platform)) {
  const viewportMeta = document.createElement("meta");
  viewportMeta.name = "viewport";
  viewportMeta.content = "width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no";
  document.head.appendChild(viewportMeta);
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
