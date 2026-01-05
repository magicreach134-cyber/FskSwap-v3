import { useCallback, useEffect, useState } from "react";
import { Contract, JsonRpcSigner, Address, formatUnits, parseUnits } from "ethers";
import { FSK_FARM_ABI, FSK_TOKEN_ABI } from "@/lib/abis";
import { FARM_ADDRESSES, TOKEN_ADDRESSES } from "@/lib/constants";

export interface FarmView {
  pid: number;
  name: string;
  symbol: string;
  staked: string;
  pending: string;
  tokenAddress: Address;
  farmAddress: Address;
}

const useFarm = (signer: JsonRpcSigner | null) => {
  const [farms, setFarms] = useState<FarmView[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------- LOAD FARMS ---------- */
  const loadFarms = useCallback(async () => {
    if (!signer) return;

    setLoading(true);
    try {
      const loadedFarms: FarmView[] = [];

      for (let i = 0; i < FARM_ADDRESSES.length; i++) {
        const farmAddress = FARM_ADDRESSES[i];
        const tokenAddress = TOKEN_ADDRESSES[i];

        const farmContract = new Contract(farmAddress, FSK_FARM_ABI, signer);
        const tokenContract = new Contract(tokenAddress, FSK_TOKEN_ABI, signer);

        const [name, symbol, stakedRaw, pendingRaw] = await Promise.all([
          tokenContract.name(),
          tokenContract.symbol(),
          farmContract.balanceOf(await signer.getAddress()),
          farmContract.pendingReward(await signer.getAddress()),
        ]);

        loadedFarms.push({
          pid: i,
          name,
          symbol,
          staked: formatUnits(stakedRaw, 18),
          pending: formatUnits(pendingRaw, 18),
          tokenAddress,
          farmAddress,
        });
      }

      setFarms(loadedFarms);
    } catch (err) {
      console.error("Failed to load farms:", err);
    } finally {
      setLoading(false);
    }
  }, [signer]);

  /* ---------- CLAIM FARM ---------- */
  const claim = useCallback(
    async (pid: number) => {
      if (!signer) throw new Error("Wallet not connected");

      const farmAddress = FARM_ADDRESSES[pid];
      const farmContract = new Contract(farmAddress, FSK_FARM_ABI, signer);

      const tx = await farmContract.claim();
      await tx.wait();
    },
    [signer]
  );

  /* ---------- STAKE TOKENS ---------- */
  const stake = useCallback(
    async (pid: number, amount: string) => {
      if (!signer) throw new Error("Wallet not connected");

      const farmAddress = FARM_ADDRESSES[pid];
      const tokenAddress = TOKEN_ADDRESSES[pid];

      const tokenContract = new Contract(tokenAddress, FSK_TOKEN_ABI, signer);
      const farmContract = new Contract(farmAddress, FSK_FARM_ABI, signer);

      // Approve tokens first
      const amountParsed = parseUnits(amount, 18);
      const allowance = await tokenContract.allowance(await signer.getAddress(), farmAddress);
      if (allowance.lt(amountParsed)) {
        const approveTx = await tokenContract.approve(farmAddress, amountParsed);
        await approveTx.wait();
      }

      // Stake
      const stakeTx = await farmContract.stake(amountParsed);
      await stakeTx.wait();
    },
    [signer]
  );

  /* ---------- UNSTAKE TOKENS ---------- */
  const unstake = useCallback(
    async (pid: number, amount: string) => {
      if (!signer) throw new Error("Wallet not connected");

      const farmAddress = FARM_ADDRESSES[pid];
      const farmContract = new Contract(farmAddress, FSK_FARM_ABI, signer);

      const amountParsed = parseUnits(amount, 18);
      const tx = await farmContract.withdraw(amountParsed);
      await tx.wait();
    },
    [signer]
  );

  return { farms, loading, loadFarms, claim, stake, unstake };
};

export default useFarm;
