// ================= RPC =================
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ??
  "https://data-seed-prebsc-1-s1.binance.org:8545";

export const ENV_KEYS = {
  RPC_URL: "NEXT_PUBLIC_RPC_URL",
  WALLET_CONNECT_PROJECT_ID: "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID",
  BSCSCAN_API_KEY: "NEXT_PUBLIC_BSCSCAN_API_KEY",
};

// ================= CONTRACT ADDRESSES =================
export const CONTRACTS = {
  FSKMegaLocker: process.env.NEXT_PUBLIC_LOCKER_FACTORY_ADDRESS!,
  FSKLaunchpadFactory: process.env.NEXT_PUBLIC_LAUNCHPAD_FACTORY_ADDRESS!,
  FSKFeeCollector: process.env.NEXT_PUBLIC_FEECOLLECTOR_ADDRESS!,
  FskFlashSwap: process.env.NEXT_PUBLIC_FLASHSWAP_ADDRESS!,
  FskHelpFundPool: process.env.NEXT_PUBLIC_HELPFUND_ADDRESS!,
  FSKRouterV3: process.env.NEXT_PUBLIC_ROUTER_ADDRESS!,
  FskFactoryV2: process.env.NEXT_PUBLIC_FACTORY_ADDRESS!,
  FSKSwapLPStaking: process.env.NEXT_PUBLIC_STAKING_ADDRESS!,
};

// Shorthands
export const routerAddress = CONTRACTS.FSKRouterV3;
export const factoryAddress = CONTRACTS.FskFactoryV2;
export const launchpadFactoryAddress = CONTRACTS.FSKLaunchpadFactory;
export const feeCollectorAddress = CONTRACTS.FSKFeeCollector;
export const flashSwapAddress = CONTRACTS.FskFlashSwap;
export const lockerAddress = CONTRACTS.FSKMegaLocker;
export const stakingAddress = CONTRACTS.FSKSwapLPStaking;
export const helpFundPoolAddress = CONTRACTS.FskHelpFundPool;

// ================= TOKENS =================
export const TOKENS = {
  BTC: process.env.NEXT_PUBLIC_BTC_ADDRESS!,
  ETH: process.env.NEXT_PUBLIC_ETH_ADDRESS!,
  SOL: process.env.NEXT_PUBLIC_SOL_ADDRESS!,
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS!,
  FUSDT: process.env.NEXT_PUBLIC_FUSDT_ADDRESS!,
  WBNB: process.env.NEXT_PUBLIC_WBNB_ADDRESS!,
  FSK: process.env.NEXT_PUBLIC_FSK_ADDRESS!,
};

// Required by Swap, FlashSwap, Router hooks
export const TOKEN_ADDRESS_MAP: Record<string, string> = {
  FSK: TOKENS.FSK,
  FUSDT: TOKENS.FUSDT,
  USDC: TOKENS.USDC,
  WBNB: TOKENS.WBNB,
  BTC: TOKENS.BTC,
  ETH: TOKENS.ETH,
  SOL: TOKENS.SOL,
};

export const TOKEN_LIST = [
  { symbol: "FSK", address: TOKENS.FSK, decimals: 18 },
  { symbol: "FUSDT", address: TOKENS.FUSDT, decimals: 18 },
  { symbol: "USDC", address: TOKENS.USDC, decimals: 18 },
  { symbol: "WBNB", address: TOKENS.WBNB, decimals: 18 },
  { symbol: "BTC", address: TOKENS.BTC, decimals: 8 },
  { symbol: "ETH", address: TOKENS.ETH, decimals: 18 },
  { symbol: "SOL", address: TOKENS.SOL, decimals: 18 },
];

export const TOKEN_COLORS = {
  FSK: "#f6c94d",
  FUSDT: "#e06b3a",
  USDC: "#2a9df4",
  WBNB: "#f3b33d",
  BTC: "#f7931a",
  ETH: "#627eea",
  SOL: "#66f9a1",
};

// ================= ABIS =================
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
};

// ================= MINIMAL ERC20 =================
export const MINIMAL_ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
];

// ================= APP =================
export const APP_CONSTANTS = {
  DEFAULT_DEADLINE_SECONDS: 1200,
  DEFAULT_SLIPPAGE_PERCENT: 0.5,
};
