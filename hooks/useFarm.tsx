import { useState, useEffect, useCallback } from "react";
import { Contract, JsonRpcSigner, BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { FARM_ABI, ERC20_ABI } from "@/constants/abis";
import { FSK_FARM_ADDRESS } from "@/constants/addresses";

export interface FarmView {
  pid: number;
  name: string;
  symbol: string;
  staked: string;
  pending: string;
  apy: number;
  lpTokenAddress: string;
  rewardTokenSymbol: string;
}

interface UseFarmHook {
  farms: FarmView[];
  loadingFarms: boolean;
  loadFarms: () => Promise<void>;
  claim: (pid: number) => Promise<void>;
  stake: (pid: number, amount: string) => Promise<void>;
  unstake: (pid: number, amount: string) => Promise<void>;
}

const REWARD_TOKEN_PRICE = 0.1; // Example placeholder, integrate real price feed
const LP_TOKEN_PRICE = 1; // Example placeholder

const useFarm = (signer: JsonRpcSigner | null): UseFarmHook => {
  const [farms, setFarms] = useState<FarmView[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(false);

  const loadFarms = useCallback(async () => {
    if (!signer) return;
    setLoadingFarms(true);

    try {
      const farmContract = new Contract(FSK_FARM_ADDRESS, FARM_ABI, signer);
      const poolLength = Number(await farmContract.poolLength());

      const userAddress = await signer.getAddress();
      const farmData: FarmView[] = [];

      for (let pid = 0; pid < poolLength; pid++) {
        const poolInfo = await farmContract.poolInfo(pid);
        const userInfo = await farmContract.userInfo(pid, userAddress);
        const pending = await farmContract.pendingReward(pid, userAddress);

        const lpToken = new Contract(poolInfo.lpToken, ERC20_ABI, signer);
        const name = await lpToken.name();
        const symbol = await lpToken.symbol();

        const rewardToken = new Contract(poolInfo.rewardToken, ERC20_ABI, signer);
        const rewardSymbol = await rewardToken.symbol();

        // Example APY calculation
        const rewardPerYear = Number(formatEther(poolInfo.rewardPerBlock || 0)) * 10512000; // assuming 3s block time
        const totalStaked = Number(formatEther(await lpToken.balanceOf(FSK_FARM_ADDRESS)));
        const apy = totalStaked > 0 ? (rewardPerYear * REWARD_TOKEN_PRICE) / (totalStaked * LP_TOKEN_PRICE) * 100 : 0;

        farmData.push({
          pid,
          name,
          symbol,
          staked: formatEther(userInfo.amount),
          pending: formatEther(pending),
          apy,
          lpTokenAddress: poolInfo.lpToken,
          rewardTokenSymbol: rewardSymbol,
        });
      }

      setFarms(farmData);
    } catch (err) {
      console.error("Failed to load farms:", err);
    } finally {
      setLoadingFarms(false);
    }
  }, [signer]);

  const claim = useCallback(
    async (pid: number) => {
      if (!signer) throw new Error("Wallet not connected");
      const farmContract = new Contract(FSK_FARM_ADDRESS, FARM_ABI, signer);
      try {
        const tx = await farmContract.claim(pid);
        await tx.wait();
        await loadFarms();
      } catch (err) {
        console.error("Claim failed:", err);
        throw err;
      }
    },
    [signer, loadFarms]
  );

  const stake = useCallback(
    async (pid: number, amount: string) => {
      if (!signer) throw new Error("Wallet not connected");
      const farmContract = new Contract(FSK_FARM_ADDRESS, FARM_ABI, signer);

      const poolInfo = await farmContract.poolInfo(pid);
      const lpToken = new Contract(poolInfo.lpToken, ERC20_ABI, signer);

      try {
        const allowance: BigNumber = await lpToken.allowance(await signer.getAddress(), FSK_FARM_ADDRESS);
        if (allowance.lt(parseEther(amount))) {
          const approveTx = await lpToken.approve(FSK_FARM_ADDRESS, parseEther(amount));
          await approveTx.wait();
        }

        const tx = await farmContract.deposit(pid, parseEther(amount));
        await tx.wait();
        await loadFarms();
      } catch (err) {
        console.error("Stake failed:", err);
        throw err;
      }
    },
    [signer, loadFarms]
  );

  const unstake = useCallback(
    async (pid: number, amount: string) => {
      if (!signer) throw new Error("Wallet not connected");
      const farmContract = new Contract(FSK_FARM_ADDRESS, FARM_ABI, signer);
      try {
        const tx = await farmContract.withdraw(pid, parseEther(amount));
        await tx.wait();
        await loadFarms();
      } catch (err) {
        console.error("Unstake failed:", err);
        throw err;
      }
    },
    [signer, loadFarms]
  );

  // Optional: refresh farms every 15 seconds
  useEffect(() => {
    if (!signer) return;
    const interval = setInterval(loadFarms, 15000);
    return () => clearInterval(interval);
  }, [signer, loadFarms]);

  return {
    farms,
    loadingFarms,
    loadFarms,
    claim,
    stake,
    unstake,
  };
};

export default useFarm;
