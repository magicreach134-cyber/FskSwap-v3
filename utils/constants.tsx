/* =========================================================
   FskSwap – Global Constants (Production-Grade)
   Network: BNB Testnet
========================================================= */
// Backward compatibility for existing hooks
export const BNB_TESTNET_RPC = DEFAULT_BNB_RPC;

import { getAddress, type AddressLike } from "ethers";

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

/* ================= ENV VALIDATION ================= */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`[ENV ERROR] Missing environment variable: ${key}`);
  return value;
}

/* ================= CONTRACT ADDRESSES ================= */

export const CONTRACTS = {
  FSKMegaLocker: getAddress(requireEnv("NEXT_PUBLIC_LOCKER_FACTORY_ADDRESS")),
  FSKLaunchpadFactory: getAddress(requireEnv("NEXT_PUBLIC_LAUNCHPAD_FACTORY_ADDRESS")),
  FSKFeeCollector: getAddress(requireEnv("NEXT_PUBLIC_FEECOLLECTOR_ADDRESS")),
  FskFlashSwap: getAddress(requireEnv("NEXT_PUBLIC_FLASHSWAP_ADDRESS")),
  FskHelpFundPool: getAddress(requireEnv("NEXT_PUBLIC_HELPFUND_ADDRESS")),
  FSKRouterV3: getAddress(requireEnv("NEXT_PUBLIC_ROUTER_ADDRESS")),
  FskFactoryV2: getAddress(requireEnv("NEXT_PUBLIC_FACTORY_ADDRESS")),
  FSKSwapLPStaking: getAddress(requireEnv("NEXT_PUBLIC_STAKING_ADDRESS")),
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
  FSK: getAddress(requireEnv("NEXT_PUBLIC_FSK_ADDRESS")),
  FUSDT: getAddress(requireEnv("NEXT_PUBLIC_FUSDT_ADDRESS")),
  USDC: getAddress(requireEnv("NEXT_PUBLIC_USDC_ADDRESS")),
  WBNB: getAddress(requireEnv("NEXT_PUBLIC_WBNB_ADDRESS")),
  BTC: getAddress(requireEnv("NEXT_PUBLIC_BTC_ADDRESS")),
  ETH: getAddress(requireEnv("NEXT_PUBLIC_ETH_ADDRESS")),
  SOL: getAddress(requireEnv("NEXT_PUBLIC_SOL_ADDRESS")),
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

/* ================= TOKEN LIST ================= */

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
  DEFAULT_DEADLINE_SECONDS: 1200,
  DEFAULT_SLIPPAGE_PERCENT: 0.5,
} as const;

/* ================= EXPORT SHORTHANDS ================= */

export const DEFAULT_BNB_RPC = RPC_URL;
export const FSKMegaLockerAddress = CONTRACTS.FSKMegaLocker;
export const FSKMegaLockerABI = FSKMegaLocker_ABI;
export const FSKLaunchpadFactoryAddress = CONTRACTS.FSKLaunchpadFactory;
export const FSKLaunchpadFactoryABI = FSKLaunchpadFactory_ABI;
export const FSKRouterAddress = CONTRACTS.FSKRouterV3;
export const FSKRouterABI = FSKRouter_ABI;
export const FSKSwapLPStakingAddress = CONTRACTS.FSKSwapLPStaking;
export const FSKSwapLPStakingABI = FSKSwapLPStaking_ABI;
export const FSKFeeCollectorAddress = CONTRACTS.FSKFeeCollector;
export const FSKFeeCollectorABI = FSKFeeCollector_ABI;
export const FlashSwapAddress = CONTRACTS.FskFlashSwap;
export const FlashSwapABI = FskFlashSwap_ABI;
export const HelpFundPoolAddress = CONTRACTS.FskHelpFundPool;
export const HelpFundPoolABI = FSKHelpFundAllPool_ABI;
