import BTC from "./abis/BTC";
import ETH from "./abis/ETH";
import SOL from "./abis/SOL";
import USDC from "./abis/USDC";
import FUSDT from "./abis/FUSDT";
import WBNB from "./abis/WBNB";
import Fressking from "./abis/Fressking";
import FSKFactory from "./abis/FSKFactory";
import FSKRouter from "./abis/FSKRouter";
import FSKFeeCollector from "./abis/FSKFeeCollector";
import FSKHelpFundAllPool from "./abis/FSKHelpFundAllPool";
import FSKLaunchpadFactory from "./abis/FSKLaunchpadFactory";
import FSKSwapLPStaking from "./abis/FSKSwapLPStaking";
import IFSKRouter from "./abis/IFSKRouter";
import FlashSwapABI from "./abis/FlashSwap"; // your flashswap ABI

export const TokenList = [
  { symbol: "BTC", address: "0xd397b48d6faf5311c166aed21313f48e2a574525", decimals: 8 },
  { symbol: "ETH", address: "0x122cca6190b40de4fd3ee28a97c995d8c6524921", decimals: 18 },
  { symbol: "SOL", address: "0x39c833e1f576d372e221e31ce82dd52b520e970c", decimals: 18 },
  { symbol: "USDC", address: "0x1c5206eeb5df5127204495969955000d15d1c0be", decimals: 18 },
  { symbol: "FUSDT", address: "0x02F1303f087C6D78F4142bc2dE8430348982d549", decimals: 18 },
  { symbol: "WBNB", address: "0xae13d989dac2f0debff460ac112a837c89baa7cd", decimals: 18 },
  { symbol: "Fressking", address: "0x784f97B0c8116727F8B6417b86975F77411e219B", decimals: 18 },
];

export const routerAddress = "0xYOUR_ROUTER_ADDRESS";
export const launchpadFactoryAddress = "0xYOUR_LAUNCHPAD_FACTORY";
export const FSKSwapLPStakingAddress = "0xYOUR_STAKING_ADDRESS";
export const flashSwapAddress = "0xYOUR_FLASHSWAP_ADDRESS";

export {
  BTC,
  ETH,
  SOL,
  USDC,
  FUSDT,
  WBNB,
  Fressking,
  FSKFactory,
  FSKRouter,
  FSKFeeCollector,
  FSKHelpFundAllPool,
  FSKLaunchpadFactory,
  FSKSwapLPStaking,
  IFSKRouter,
  FlashSwapABI
};
