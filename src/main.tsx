import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./legacy/App.jsx";
import Dashboard from "./features/dashboard/Dashboard";
import { queryClient } from "./lib/query-client";
import "../css/style.css";
import "../css/v2.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/v2/overview" replace />} />
          <Route path="/legacy/*" element={<App />} />
          <Route path="/v2/*" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/v2/overview" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);