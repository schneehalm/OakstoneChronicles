import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/components/ui/theme-provider";

// Demo-Daten laden (wird automatisch ausgeführt)
import "./loadDemoData";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="oakstone-ui-theme">
    <App />
  </ThemeProvider>
);
