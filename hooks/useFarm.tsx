"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { stakingAddress, ABIS, MINIMAL_ERC20_ABI } from "../utils/constants";

export interface FarmView {
  pid: number;
  lpToken: string;
  name: string;
  symbol: string;
  staked: ethers.BigNumber;
  pending: ethers.BigNumber;
}

const useFarm = (signer?: ethers.Signer | null) => {
  const [staking, setStaking] = useState<ethers.Contract | null>(null);
  const [farms, setFarms] = useState<FarmView[]>([]);
  const [user, setUser] = useState<string>("");

  /* ---------------------------------------------------------
     INIT STAKING CONTRACT
  --------------------------------------------------------- */
  useEffect(() => {
    if (!signer) return;

    const init = async () => {
      const address = await signer.getAddress();
      setUser(address);

      const contract = new ethers.Contract(
        stakingAddress,
        ABIS.FSKSwapLPStaking,
        signer
      );

      setStaking(contract);
    };

    init();
  }, [signer]);

  /* ---------------------------------------------------------
     LOAD FARMS (MasterChef Pools)
  --------------------------------------------------------- */
  useEffect(() => {
    if (!staking || !user) return;

    const loadFarms = async () => {
      try {
        const poolLength: number = await staking.poolLength();
        const loaded: FarmView[] = [];

        for (let pid = 0; pid < poolLength; pid++) {
          const pool = await staking.poolInfo(pid);
          const pending = await staking.pendingReward(pid, user);
          const userInfo = await staking.userInfo(pid, user);

          const lp = new ethers.Contract(
            pool.lpToken,
            MINIMAL_ERC20_ABI,
            staking.signer
          );

          const [name, symbol] = await Promise.all([
            lp.name(),
            lp.symbol()
          ]);

          loaded.push({
            pid,
            lpToken: pool.lpToken,
            name,
            symbol,
            staked: userInfo.amount,
            pending
          });
        }

        setFarms(loaded);
      } catch (err) {
        console.error("Farm load error:", err);
      }
    };

    loadFarms();
  }, [staking, user]);

  /* ---------------------------------------------------------
     ACTIONS
  --------------------------------------------------------- */

  const stake = async (pid: number, amount: string) => {
    if (!staking) throw new Error("Staking contract not ready");

    const pool = await staking.poolInfo(pid);
    const lp = new ethers.Contract(
      pool.lpToken,
      MINIMAL_ERC20_ABI,
      staking.signer
    );

    const decimals = await lp.decimals();
    const parsed = ethers.utils.parseUnits(amount, decimals);

    const allowance = await lp.allowance(user, stakingAddress);
    if (allowance.lt(parsed)) {
      const approveTx = await lp.approve(stakingAddress, ethers.constants.MaxUint256);
      await approveTx.wait();
    }

    const tx = await staking.deposit(pid, parsed);
    return await tx.wait();
  };

  const unstake = async (pid: number, amount: string) => {
    if (!staking) throw new Error("Staking contract not ready");

    const pool = await staking.poolInfo(pid);
    const lp = new ethers.Contract(
      pool.lpToken,
      MINIMAL_ERC20_ABI,
      staking.signer
    );

    const decimals = await lp.decimals();
    const parsed = ethers.utils.parseUnits(amount, decimals);

    const tx = await staking.withdraw(pid, parsed);
    return await tx.wait();
  };

  const claim = async (pid: number) => {
    if (!staking) throw new Error("Staking contract not ready");

    const tx = await staking.claim(pid);
    return await tx.wait();
  };

  return {
    farms,
    stake,
    unstake,
    claim
  };
};

export default useFarm;
