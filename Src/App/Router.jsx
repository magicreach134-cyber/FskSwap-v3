// src/app/router.jsx
import React from "react";
import { ThemeProvider } from "../context/ThemeContext";
import Swap from "../pages/Swap";
import Launchpad from "../pages/Launchpad";
import FlashSwap from "../pages/FlashSwap";
import Staking from "../pages/Staking";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

const AppRouter = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/swap" />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/launchpad" element={<Launchpad />} />
          <Route path="/flashswap" element={<FlashSwap />} />
          <Route path="/staking" element={<Staking />} />
          {/* Add 404 fallback */}
          <Route path="*" element={<div style={{ padding: "2rem" }}><h2>Page Not Found</h2></div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default AppRouter;
