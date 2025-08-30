import React from "react";
import { createRoot } from "react-dom/client";
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'
import AlexUltimateInterface from "./components/Alex/AlexUltimateInterface.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AlexUltimateInterface />
    <SpeedInsights />
  </React.StrictMode>
);