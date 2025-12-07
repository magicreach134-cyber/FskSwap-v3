// src/utils/constants.js

// Import ABIs
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
import FSKSwapLPStaking from "./abis/FSKSwapLPStaking.json";
import IFSKRouter from "./abis/IFSKRouter.json";

// Contract Addresses (checksummed)
export const contracts = {
  FSKMegaLocker: "0x949B162Cf291F42Bc04040357844e7bD2e5F07cC",
  FSKLaunchpadFactory: "0xB1E2AE6db2bDFE7aC5599e79bdF997A9EbD2F581",
  FSKFeeCollector: "0x935412d3a9570F8B479D6A2eC2E586A26bE0AE9C",
  FskFlashSwap: "0x461209c870760A1cf7C84aFeB2235F0C3e9E8EbA",
  FskHelpFundPool: "0x8F6eC84595eF52B2Eb16BA6D1960E0110FC1c5c3",
  FSKRouterV3: "0xF89671B5AC9dC671E941AcE0171AF22f9F0bFEfF",
  FskFactoryV2: "0xE3E00C0E1AA234a81224bD9c6ff13a625b45EF78",
  FSKSwapLPStaking: "0x746cA308A6d36e6634311fDcd45f2a0ED8C4E3Ab",
};

// Token Addresses
export const tokens = {
  BTC: "0xD397B48d6Faf5311C166AeD21313F48E2a574525",
  ETH: "0x122cCA6190B40DE4FD3Ee28A97C995D8C6524921",
  SOL: "0x39C833E1f576D372E221E31cE82dd52B520e970c",
  USDC: "0x1C5206Eeb5Df5127204495969955000D15D1C0bE",
  FUSDT: "0x02F1303F087c6D78f4142BC2dE8430348982D549",
  WBNB: "0xAe13d989DaC2f0dEbFf460aC112a837C89BAa7cd",
  FSK: "0x784F97b0C8116727F8b6417b86975F77411E219B",
};

// Export ABIs
export const ABIs = {
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
  FSKSwapLPStaking,
  IFSKRouter,
};
