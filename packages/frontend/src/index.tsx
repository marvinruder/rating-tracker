import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

if (/iPad|iPhone|iPod/.test(navigator.platform))
  document
    .querySelector('meta[name="viewport"]')
    ?.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no");

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
