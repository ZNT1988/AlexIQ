import React from "react";
import { createRoot } from "react-dom/client";
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'
import App from "./App";
import { AuthProvider } from "./hooks/useAuth.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
    <SpeedInsights />
  </React.StrictMode>
);