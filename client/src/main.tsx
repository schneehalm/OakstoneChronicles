import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Root app component rendering with provider order:
// 1. QueryClientProvider for data fetching
// 2. ThemeProvider for UI theme
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="oakstone-ui-theme">
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);
