"use client";

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Swap from "../pages/Swap";
import Launchpad from "../pages/Launchpad";
import FlashSwap from "../pages/FlashSwap";
import Staking from "../pages/Staking";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Swap />} />
        <Route path="/launchpad" element={<Launchpad />} />
        <Route path="/flashswap" element={<FlashSwap />} />
        <Route path="/staking" element={<Staking />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
