import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="oakstone-ui-theme">
        <App />
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);
