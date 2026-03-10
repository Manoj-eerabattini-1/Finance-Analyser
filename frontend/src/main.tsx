import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { CurrencyProvider } from "./context/CurrencyContext.tsx";
import { cleanupOldMockData } from "./utils/localStorageCleanup.ts";
import "./index.css";

// Clean up old mock localStorage data from previous implementation
cleanupOldMockData();

createRoot(document.getElementById("root")!).render(
  <CurrencyProvider>
    <App />
  </CurrencyProvider>
);
