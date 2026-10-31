import { AppError } from "@outlay/shared-types";
import { toCssVariables } from "@outlay/tokens";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/global.css";

for (const [name, value] of Object.entries(toCssVariables())) {
  document.documentElement.style.setProperty(name, value);
}

const container = document.getElementById("root");
if (!container) {
  throw new AppError("CONFIG_ERROR", "ROOT_ELEMENT_MISSING");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
