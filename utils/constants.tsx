/* =========================================================
   FskSwap – Global Constants (Production-Grade)
   Network: BNB Testnet
========================================================= */

import { getAddress } from "ethers";

/* ================= RPC CONFIG ================= */

export enum ChainId {
  BSC_TESTNET = 97,
  BSC_MAINNET = 56,
}

export const RPC_URLS: Record<ChainId, string[]> = {
  [ChainId.BSC_TESTNET]: [
    "https://data-seed-prebsc-1-s1.binance.org:8545",
    "https://data-seed-prebsc-2-s1.binance.org:8545",
    "https://bsc-testnet.publicnode.com",
  ],
  [ChainId.BSC_MAINNET]: [
    "https://bsc-dataseed.binance.org",
    "https://bsc-dataseed1.defibit.io",
    "https://bsc.publicnode.com",
  ],
};

export const ACTIVE_CHAIN_ID = ChainId.BSC_TESTNET;
export const DEFAULT_BNB_RPC = RPC_URLS[ACTIVE_CHAIN_ID][0];
export const BNB_TESTNET_RPC = DEFAULT_BNB_RPC;

/* ================= ENV SAFE ACCESS ================= */

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[ENV ERROR] Missing environment variable: ${key}`);
  }
  return value;
}

/* ================= CONTRACT ADDRESSES ================= */

export const CONTRACTS = {
  FSKMegaLocker: getAddress(getEnv("NEXT_PUBLIC_LOCKER_FACTORY_ADDRESS")),
  FSKLaunchpadFactory: getAddress(getEnv("NEXT_PUBLIC_LAUNCHPAD_FACTORY_ADDRESS")),
  FSKFeeCollector: getAddress(getEnv("NEXT_PUBLIC_FEECOLLECTOR_ADDRESS")),
  FskFlashSwap: getAddress(getEnv("NEXT_PUBLIC_FLASHSWAP_ADDRESS")),
  FskHelpFundPool: getAddress(getEnv("NEXT_PUBLIC_HELPFUND_ADDRESS")),
  FSKRouterV3: getAddress(getEnv("NEXT_PUBLIC_ROUTER_ADDRESS")),
  FskFactoryV2: getAddress(getEnv("NEXT_PUBLIC_FACTORY_ADDRESS")),
  FSKSwapLPStaking: getAddress(getEnv("NEXT_PUBLIC_STAKING_ADDRESS")),
} as const;

/* ================= SHORTHANDS ================= */

export const routerAddress = CONTRACTS.FSKRouterV3;
export const factoryAddress = CONTRACTS.FskFactoryV2;
export const launchpadFactoryAddress = CONTRACTS.FSKLaunchpadFactory;
export const feeCollectorAddress = CONTRACTS.FSKFeeCollector;
export const flashSwapAddress = CONTRACTS.FskFlashSwap;
export const lockerAddress = CONTRACTS.FSKMegaLocker;
export const stakingAddress = CONTRACTS.FSKSwapLPStaking;
export const helpFundPoolAddress = CONTRACTS.FskHelpFundPool;

/* ================= TOKENS ================= */

export const TOKENS = {
  FSK: getAddress(getEnv("NEXT_PUBLIC_FSK_ADDRESS")),
  FUSDT: getAddress(getEnv("NEXT_PUBLIC_FUSDT_ADDRESS")),
  USDC: getAddress(getEnv("NEXT_PUBLIC_USDC_ADDRESS")),
  WBNB: getAddress(getEnv("NEXT_PUBLIC_WBNB_ADDRESS")),
  BTC: getAddress(getEnv("NEXT_PUBLIC_BTC_ADDRESS")),
  ETH: getAddress(getEnv("NEXT_PUBLIC_ETH_ADDRESS")),
  SOL: getAddress(getEnv("NEXT_PUBLIC_SOL_ADDRESS")),
} as const;

/* ================= TOKEN LIST ================= */

export type TokenMeta = {
  symbol: string;
  address: string;
  decimals: number;
};

export const TOKEN_LIST: TokenMeta[] = [
  { symbol: "FSK", address: TOKENS.FSK, decimals: 18 },
  { symbol: "FUSDT", address: TOKENS.FUSDT, decimals: 18 },
  { symbol: "USDC", address: TOKENS.USDC, decimals: 18 },
  { symbol: "WBNB", address: TOKENS.WBNB, decimals: 18 },
  { symbol: "BTC", address: TOKENS.BTC, decimals: 18 },
  { symbol: "ETH", address: TOKENS.ETH, decimals: 18 },
  { symbol: "SOL", address: TOKENS.SOL, decimals: 18 },
];

/* ================= TOKEN COLORS ================= */

export const TOKEN_COLORS: Record<string, string> = {
  FSK: "#f6c94d",
  FUSDT: "#e06b3a",
  USDC: "#2a9df4",
  WBNB: "#f3b33d",
  BTC: "#f7931a",
  ETH: "#627eea",
  SOL: "#66f9a1",
};

/* ================= MINIMAL ERC20 ABI ================= */

export const MINIMAL_ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function transfer(address,uint256) returns (bool)",
];

/* ================= LOCKER ABI & ADDRESS ================= */

export const FSKMegaLockerAddress = CONTRACTS.FSKMegaLocker;
export const FSKMegaLockerABI = [
  "function getOwnerLocks(address) view returns (uint256[])",
  "function getLock(uint256) view returns (address lockerOwner, address token, uint256 amount, uint256 unlockTime, bool withdrawn)",
  "function withdrawFromLock(uint256,uint256) returns (bool)",
  "function getBeneficiaryVestings(address) view returns (uint256[])",
  "function vestings(uint256) view returns (address beneficiary, address token, uint256 amount, uint256 start, uint256 duration, uint256 claimed)",
  "function withdrawFromVesting(uint256) returns (bool)",
];

/* ================= ABIS ================= */

import BTC_ABI from "./abis/BTC.json";
import ETH_ABI from "./abis/ETH.json";
import SOL_ABI from "./abis/SOL.json";
import USDC_ABI from "./abis/USDC.json";
import FUSDT_ABI from "./abis/FUSDT.json";
import WBNB_ABI from "./abis/WBNB.json";
import FSK_ABI from "./abis/Fressking.json";

import FSKFactory_ABI from "./abis/FskFactory.json";
import FSKRouter_ABI from "./abis/FskRouter.json";
import FSKFeeCollector_ABI from "./abis/FSKFeeCollector.json";
import FSKHelpFundAllPool_ABI from "./abis/FSKHelpFundAllPool.json";
import FSKLaunchpadFactory_ABI from "./abis/FSKLaunchpadFactory.json";
import FSKPresale_ABI from "./abis/FSKPresale.json";
import FSKSwapLPStaking_ABI from "./abis/FSKSwapLPStaking.json";
import FskFlashSwap_ABI from "./abis/FskFlashSwap.json";
import FSKMegaLocker_ABI from "./abis/FSKMegaLocker.json";
import IFSKRouter_ABI from "./abis/IFSKRouter.json";

export const ABIS = {
  BTC: BTC_ABI,
  ETH: ETH_ABI,
  SOL: SOL_ABI,
  USDC: USDC_ABI,
  FUSDT: FUSDT_ABI,
  WBNB: WBNB_ABI,
  FSK: FSK_ABI,
  FSKFactory: FSKFactory_ABI,
  FSKRouter: FSKRouter_ABI,
  FSKFeeCollector: FSKFeeCollector_ABI,
  FSKHelpFundAllPool: FSKHelpFundAllPool_ABI,
  FSKLaunchpadFactory: FSKLaunchpadFactory_ABI,
  FSKPresale: FSKPresale_ABI,
  FSKSwapLPStaking: FSKSwapLPStaking_ABI,
  FskFlashSwap: FskFlashSwap_ABI,
  FSKMegaLocker: FSKMegaLocker_ABI,
  IFSKRouter: IFSKRouter_ABI,
} as const;

/* ================= APP CONSTANTS ================= */

export const APP_CONSTANTS = {
  DEFAULT_DEADLINE_SECONDS: 1200,
  DEFAULT_SLIPPAGE_PERCENT: 0.5,
} as const;
