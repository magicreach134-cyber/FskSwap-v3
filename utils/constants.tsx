/* =========================================================
   FskSwap – Global Constants (Production-Grade)
   Network: BNB Testnet (DEX-standard, Netlify-safe)
========================================================= */

import type { AddressLike } from "ethers";

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

export const RPC_URL = RPC_URLS[ACTIVE_CHAIN_ID][0];

/* ================= ENV VALIDATION (Contracts Only) ================= */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[ENV ERROR] Missing environment variable: ${key}`);
  }
  return value;
}

/* ================= CONTRACT ADDRESSES ================= */

export const CONTRACTS = {
  FSKMegaLocker: requireEnv("NEXT_PUBLIC_LOCKER_FACTORY_ADDRESS"),
  FSKLaunchpadFactory: requireEnv("NEXT_PUBLIC_LAUNCHPAD_FACTORY_ADDRESS"),
  FSKFeeCollector: requireEnv("NEXT_PUBLIC_FEECOLLECTOR_ADDRESS"),
  FskFlashSwap: requireEnv("NEXT_PUBLIC_FLASHSWAP_ADDRESS"),
  FskHelpFundPool: requireEnv("NEXT_PUBLIC_HELPFUND_ADDRESS"),
  FSKRouterV3: requireEnv("NEXT_PUBLIC_ROUTER_ADDRESS"),
  FskFactoryV2: requireEnv("NEXT_PUBLIC_FACTORY_ADDRESS"),
  FSKSwapLPStaking: requireEnv("NEXT_PUBLIC_STAKING_ADDRESS"),
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
  FSK: requireEnv("NEXT_PUBLIC_FSK_ADDRESS"),
  FUSDT: requireEnv("NEXT_PUBLIC_FUSDT_ADDRESS"),
  USDC: requireEnv("NEXT_PUBLIC_USDC_ADDRESS"),
  WBNB: requireEnv("NEXT_PUBLIC_WBNB_ADDRESS"),
  BTC: requireEnv("NEXT_PUBLIC_BTC_ADDRESS"),
  ETH: requireEnv("NEXT_PUBLIC_ETH_ADDRESS"),
  SOL: requireEnv("NEXT_PUBLIC_SOL_ADDRESS"),
} as const;

/* ================= TOKEN MAP ================= */

export const TOKEN_ADDRESS_MAP: Record<string, AddressLike> = {
  FSK: TOKENS.FSK,
  FUSDT: TOKENS.FUSDT,
  USDC: TOKENS.USDC,
  WBNB: TOKENS.WBNB,
  BTC: TOKENS.BTC,
  ETH: TOKENS.ETH,
  SOL: TOKENS.SOL,
};

/* ================= TOKEN LIST (UI + ROUTER) ================= */

export type TokenMeta = {
  symbol: string;
  address: AddressLike;
  decimals: number;
};

export const TOKEN_LIST: TokenMeta[] = [
  { symbol: "FSK", address: TOKENS.FSK, decimals: 18 },
  { symbol: "FUSDT", address: TOKENS.FUSDT, decimals: 18 },
  { symbol: "USDC", address: TOKENS.USDC, decimals: 18 },
  { symbol: "WBNB", address: TOKENS.WBNB, decimals: 18 },
  { symbol: "BTC", address: TOKENS.BTC, decimals: 8 },
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

/* ================= ABIS ================= */

import BTC from "./abis/BTC.json";
import ETH from "./abis/ETH.json";
import SOL from "./abis/SOL.json";
import USDC from "./abis/USDC.json";
import FUSDT from "./abis/FUSDT.json";
import WBNB from "./abis/WBNB.json";
import FSK from "./abis/Fressking.json";

import FSKFactory from "./abis/FskFactory.json";
import FSKRouter from "./abis/FskRouter.json";
import FSKFeeCollector from "./abis/FSKFeeCollector.json";
import FSKHelpFundAllPool from "./abis/FSKHelpFundAllPool.json";
import FSKLaunchpadFactory from "./abis/FSKLaunchpadFactory.json";
import FSKPresale from "./abis/FSKPresale.json";
import FSKSwapLPStaking from "./abis/FSKSwapLPStaking.json";
import FskFlashSwap from "./abis/FskFlashSwap.json";
import FSKMegaLocker from "./abis/FSKMegaLocker.json";
import IFSKRouter from "./abis/IFSKRouter.json";

export const ABIS = {
  BTC,
  ETH,
  SOL,
  USDC,
  FUSDT,
  WBNB,
  FSK,
  FSKFactory,
  FSKRouter,
  FSKFeeCollector,
  FSKHelpFundAllPool,
  FSKLaunchpadFactory,
  FSKPresale,
  FSKSwapLPStaking,
  FskFlashSwap,
  FSKMegaLocker,
  IFSKRouter,
} as const;

/* ================= MINIMAL ERC20 ================= */

export const MINIMAL_ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
] as const;

/* ================= APP CONSTANTS ================= */

export const APP_CONSTANTS = {
  DEFAULT_DEADLINE_SECONDS: 1200, // 20 minutes
  DEFAULT_SLIPPAGE_PERCENT: 0.5,  // 0.5%
} as const;

/* ================= SPECIFIC EXPORTS ================= */

export { 
  FSKMegaLocker as FSKMegaLockerABI, 
  RPC_URL as DEFAULT_BNB_RPC 
} from "./abis";

export { FSKMegaLocker };
