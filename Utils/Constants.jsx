// src/utils/constants.js
// Central place for contract addresses, ABIs, token list, colors, and RPC config.
// --- Corrected checksummed addresses and cleaned RPC fallback ---

// Import ABIs (ensure these files exist under src/utils/abis/*.json)
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

// ---------- RPC / Environment ----------
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  process.env.REACT_APP_RPC_URL ||
  // fallback public BSC testnet RPC (no trailing slash)
  "https://data-seed-prebsc-1-s1.binance.org:8545";

// Helpful environment / build-time constants (Netlify): set these in Netlify UI
export const ENV_KEYS = {
  RPC_URL: "NEXT_PUBLIC_RPC_URL",
  WALLET_CONNECT_PROJECT_ID: "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID",
  BSCSCAN_API_KEY: "NEXT_PUBLIC_BSCSCAN_API_KEY",
  // Add any other env keys you need
};

// ---------- Contract addresses (checksummed) ----------
export const CONTRACTS = {
  FSKMegaLocker: "0x949B162Cf291F42Bc04040357844E7BD2E5F07cC",
  FSKLaunchpadFactory: "0xB1E2Ae6DB2bDFe7AC5599e79Bdf997a9EBd2F581",
  FSKFeeCollector: "0x935412D3A9570F8B479D6A2eC2E586A26bE0Ae9C",
  FskFlashSwap: "0x461209c870760A1cF7C84aFEb2235F0C3e9e8EBA",
  FskHelpFundPool: "0x8F6eC84595Ef52B2eB16BA6D1960e0110fC1c5C3",
  FSKRouterV3: "0xF89671B5ac9DC671e941ace0171af22F9F0bfEFF",
  FskFactoryV2: "0xE3E00C0E1Aa234a81224bD9C6Ff13a625b45EF78",
  FSKSwapLPStaking: "0x746CA308a6d36E6634311fDCd45F2A0ED8C4E3AB",
};

// Shorthand top-level addresses for convenience
export const routerAddress = CONTRACTS.FSKRouterV3;
export const factoryAddress = CONTRACTS.FskFactoryV2;
export const launchpadFactoryAddress = CONTRACTS.FSKLaunchpadFactory;
export const feeCollectorAddress = CONTRACTS.FSKFeeCollector;
export const flashSwapAddress = CONTRACTS.FskFlashSwap;
export const lockerAddress = CONTRACTS.FSKMegaLocker;
export const stakingAddress = CONTRACTS.FSKSwapLPStaking;
export const helpFundPoolAddress = CONTRACTS.FskHelpFundPool;

// ---------- Token addresses & list (checksummed) ----------
export const TOKENS = {
  BTC: "0xD397b48D6FAf5311c166aEd21313f48e2A574525",
  ETH: "0x122cCA6190b40De4fd3EE28A97c995D8C6524921",
  SOL: "0x39C833e1f576d372E221E31cE82Dd52b520e970C",
  USDC: "0x1C5206eEB5DF5127204495969955000D15D1C0bE",
  FUSDT: "0x02F1303F087C6D78f4142bC2dE8430348982D549",
  WBNB: "0xae13d989dac2f0debff460ac112a837c89bBAa7cd",
  FSK: "0x784F97B0c8116727f8B6417b86975F77411e219B",
};

// Token list with decimals for UI/hooks
export const TOKEN_LIST = [
  { symbol: "FSK", address: TOKENS.FSK, decimals: 18 },
  { symbol: "FUSDT", address: TOKENS.FUSDT, decimals: 18 },
  { symbol: "USDC", address: TOKENS.USDC, decimals: 18 },
  { symbol: "WBNB", address: TOKENS.WBNB, decimals: 18 },
  { symbol: "BTC", address: TOKENS.BTC, decimals: 8 },
  { symbol: "ETH", address: TOKENS.ETH, decimals: 18 },
  { symbol: "SOL", address: TOKENS.SOL, decimals: 18 },
];

// Token colors and visual settings (FSK = yellow/gold, FUSDT = red gold)
export const TOKEN_COLORS = {
  FSK: "#f6c94d", // yellow gold
  FUSDT: "#e06b3a", // red-gold / warm red
  USDC: "#2a9df4",
  WBNB: "#f3b33d",
  BTC: "#f7931a",
  ETH: "#627eea",
  SOL: "#66f9a1",
};

// ---------- ABIs (imported above) ----------
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

// Convenience small ABIs for quick contract operations (if you prefer to avoid full ABI imports)
export const MINIMAL_ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
];

// Export common constants used in UI
export const APP_CONSTANTS = {
  DEFAULT_DEADLINE_SECONDS: 60 * 20, // 20 minutes
  DEFAULT_SLIPPAGE_PERCENT: 0.5,
};

// Exported default for easy import
const defaultExport = {
  RPC_URL,
  ENV_KEYS,
  CONTRACTS,
  routerAddress,
  factoryAddress,
  launchpadFactoryAddress,
  feeCollectorAddress,
  flashSwapAddress,
  lockerAddress,
  stakingAddress,
  helpFundPoolAddress,
  TOKENS,
  TOKEN_LIST,
  TOKEN_COLORS,
  ABIS,
  MINIMAL_ERC20_ABI,
  APP_CONSTANTS,
};

export default defaultExport;
```0
