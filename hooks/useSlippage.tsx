// hooks/useSlippage.ts
"use client";

import { useState, useEffect } from "react";

interface SlippageSettings {
  slippage: number; // percentage, e.g., 0.5 for 0.5%
  setSlippage: (value: number) => void;
  saveSlippage: (value: number) => void;
}

/**
 * useSlippage Hook
 * Handles user-configurable slippage tolerance
 * Supports localStorage persistence
 */
const useSlippage = (): SlippageSettings => {
  const [slippage, setSlippageState] = useState<number>(0.5); // default 0.5%

  useEffect(() => {
    try {
      const stored = localStorage.getItem("slippageTolerance");
      if (stored) {
        setSlippageState(parseFloat(stored));
      }
    } catch (e) {
      console.warn("useSlippage: Failed to read slippage from localStorage", e);
    }
  }, []);

  const setSlippage = (value: number) => {
    if (value < 0 || value > 50) {
      console.warn("Slippage value must be between 0% and 50%");
      return;
    }
    setSlippageState(value);
  };

  const saveSlippage = (value: number) => {
    setSlippage(value);
    try {
      localStorage.setItem("slippageTolerance", value.toString());
    } catch (e) {
      console.warn("useSlippage: Failed to save slippage to localStorage", e);
    }
  };

  return {
    slippage,
    setSlippage,
    saveSlippage,
  };
};

export default useSlippage;
