import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./legacy/App.jsx";
import Dashboard from "./v2/Dashboard.jsx";
import "../css/style.css";
import "../css/v2.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/v2/overview" replace />} />
        <Route path="/legacy/*" element={<App />} />
        <Route path="/v2/*" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/v2/overview" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);