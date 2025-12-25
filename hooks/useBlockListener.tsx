"use client";

import { useEffect, useRef } from "react";
import { ethers } from "ethers";

/* ======================================================
   TYPES
   ====================================================== */

interface BlockListenerOptions {
  chainId?: number;
  enabled?: boolean;
  throttleMs?: number; // default 1500ms
}

/* ======================================================
   useBlockListener
   ====================================================== */

const useBlockListener = (
  provider: ethers.providers.Web3Provider | null | undefined,
  onBlock: (blockNumber: number) => void,
  options?: BlockListenerOptions
) => {
  const lastBlockRef = useRef<number | null>(null);
  const lastEmitRef = useRef<number>(0);

  useEffect(() => {
    if (!provider || options?.enabled === false) return;

    let active = true;

    const subscribe = async () => {
      if (options?.chainId) {
        const net = await provider.getNetwork();
        if (net.chainId !== options.chainId) return;
      }

      const handler = (blockNumber: number) => {
        if (!active) return;

        const now = Date.now();
        const throttle = options?.throttleMs ?? 1500;

        if (now - lastEmitRef.current < throttle) return;
        if (blockNumber === lastBlockRef.current) return;

        lastEmitRef.current = now;
        lastBlockRef.current = blockNumber;

        onBlock(blockNumber);
      };

      provider.on("block", handler);

      return () => {
        provider.off("block", handler);
      };
    };

    let cleanup: (() => void) | undefined;

    subscribe().then((fn) => {
      cleanup = fn;
    });

    return () => {
      active = false;
      if (cleanup) cleanup();
    };
  }, [provider, onBlock, options?.chainId, options?.enabled, options?.throttleMs]);
};

export default useBlockListener;
