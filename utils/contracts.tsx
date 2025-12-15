// src/utils/contracts.ts
import { ABIS, CONTRACTS } from "@/utils/constants";

// ---------- Contract Addresses ----------
export const launchpadFactoryAddress = CONTRACTS.FSKLaunchpadFactory;
export const routerAddress = CONTRACTS.FSKRouterV3;
export const factoryAddress = CONTRACTS.FskFactoryV2;
export const feeCollectorAddress = CONTRACTS.FSKFeeCollector;
export const flashSwapAddress = CONTRACTS.FskFlashSwap;
export const lockerAddress = CONTRACTS.FSKMegaLocker;
export const stakingAddress = CONTRACTS.FSKSwapLPStaking;
export const helpFundPoolAddress = CONTRACTS.FskHelpFundPool;

// ---------- Contract ABIs ----------
export const FSKLaunchpadFactoryABI = ABIS.FSKLaunchpadFactory;
export const FSKRouterABI = ABIS.FSKRouter;
export const FSKFactoryABI = ABIS.FSKFactory;
export const FSKFeeCollectorABI = ABIS.FSKFeeCollector;
export const FskFlashSwapABI = ABIS.FskFlashSwap;
export const FSKMegaLockerABI = ABIS.FSKMegaLocker;
export const FSKSwapLPStakingABI = ABIS.FSKSwapLPStaking;
export const FskHelpFundPoolABI = ABIS.FSKHelpFundAllPool;

// ---------- Minimal ERC20 ABI ----------
export const MINIMAL_ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
];
