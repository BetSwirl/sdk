import type { ExtractAbiEvent } from "abitype";
import { type Abi, type Chain, type Hex } from "viem";
import { coinTossAbi } from "../abis/v2/casino/cointoss";
import { diceAbi } from "../abis/v2/casino/dice";
import { kenoAbi } from "../abis/v2/casino/keno";
import { rouletteAbi } from "../abis/v2/casino/roulette";
import { weightedGameAbi } from "../abis/v2/casino/weightedGame";
import { chainByKey } from "./chains";

export const MAX_HOUSE_EGDE = 3500;
export const MAX_SDK_HOUSE_EGDE = 1000;

export type CasinoChainId = keyof typeof casinoChainById;

export type CasinoChain = {
  id: CasinoChainId;
  viemChain: Chain;
  options: {
    pollingInterval: number;
  };
  contracts: {
    bank: Hex;
    games: {
      [key in CASINO_GAME_TYPE]?: { address: Hex; abi: Abi };
    };
    leaderboard?: Hex;
    freebet?: Hex;
  };
  graphql: {
    endpoint: string;
    defaultEndpoint: string;
  };
  defaultAffiliate: Hex;
};

export enum CASINO_GAME_TYPE {
  COINTOSS = "coin-toss",
  DICE = "dice",
  ROULETTE = "roulette",
  KENO = "keno",
  WHEEL = "wheel",
  PLINKO = "plinko",
  SLOT = "slot",
  CUSTOM_WEIGHTED_GAME = "custom-weighted-game",
}

export type NORMAL_CASINO_GAME_TYPE =
  | CASINO_GAME_TYPE.COINTOSS
  | CASINO_GAME_TYPE.DICE
  | CASINO_GAME_TYPE.ROULETTE
  | CASINO_GAME_TYPE.KENO;

export type WEIGHTED_CASINO_GAME_TYPE =
  | CASINO_GAME_TYPE.WHEEL
  | CASINO_GAME_TYPE.PLINKO
  | CASINO_GAME_TYPE.SLOT
  | CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME;

export const NORMAL_GAME_TYPES = [
  CASINO_GAME_TYPE.COINTOSS,
  CASINO_GAME_TYPE.DICE,
  CASINO_GAME_TYPE.ROULETTE,
  CASINO_GAME_TYPE.KENO,
];

export const WEIGHTED_CASINO_GAME_TYPES = [
  CASINO_GAME_TYPE.WHEEL,
  CASINO_GAME_TYPE.PLINKO,
  CASINO_GAME_TYPE.SLOT,
  CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME,
];

export enum CASINO_GAME_SUBGRAPH_TYPE {
  COINTOSS = "CoinToss",
  DICE = "Dice",
  ROULETTE = "Roulette",
  KENO = "Keno",
  WHEEL = "Wheel",
  PLINKO = "Plinko",
  SLOT = "Slot",
  CUSTOM_WEIGHTED_GAME = "CUSTOM_WEIGHTED_GAME",
}

export enum CASINO_GAME_LABEL_TYPE {
  COINTOSS = "Coin Toss",
  DICE = "Dice",
  ROULETTE = "Roulette",
  KENO = "Keno",
  WHEEL = "Wheel",
  PLINKO = "Plinko",
  SLOT = "Slot",
  CUSTOM_WEIGHTED_GAME = "Custom game",
}

const _extractRollEvent = <T extends Abi>(abi: T) =>
  [
    abi.find((e): e is ExtractAbiEvent<T, "Roll"> => e.type === "event" && e.name === "Roll")!,
  ] as const;

const COINTOSS_ROLL_ABI = _extractRollEvent(coinTossAbi);
const DICE_ROLL_ABI = _extractRollEvent(diceAbi);
const ROULETTE_ROLL_ABI = _extractRollEvent(rouletteAbi);
const KENO_ROLL_ABI = _extractRollEvent(kenoAbi);
const WEIGHTED_GAME_ROLL_ABI = _extractRollEvent(weightedGameAbi);

export const CASINO_GAME_ROLL_ABI: Record<
  CASINO_GAME_TYPE,
  | typeof COINTOSS_ROLL_ABI
  | typeof DICE_ROLL_ABI
  | typeof ROULETTE_ROLL_ABI
  | typeof KENO_ROLL_ABI
  | typeof WEIGHTED_GAME_ROLL_ABI
> = {
  [CASINO_GAME_TYPE.COINTOSS]: COINTOSS_ROLL_ABI,
  [CASINO_GAME_TYPE.DICE]: DICE_ROLL_ABI,
  [CASINO_GAME_TYPE.ROULETTE]: ROULETTE_ROLL_ABI,
  [CASINO_GAME_TYPE.KENO]: KENO_ROLL_ABI,
  [CASINO_GAME_TYPE.WHEEL]: WEIGHTED_GAME_ROLL_ABI,
  [CASINO_GAME_TYPE.PLINKO]: WEIGHTED_GAME_ROLL_ABI,
  [CASINO_GAME_TYPE.SLOT]: WEIGHTED_GAME_ROLL_ABI,
  [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: WEIGHTED_GAME_ROLL_ABI,
};

const _extractPlaceBetEvent = <T extends Abi>(abi: T) =>
  [
    abi.find(
      (e): e is ExtractAbiEvent<T, "PlaceBet"> => e.type === "event" && e.name === "PlaceBet",
    )!,
  ] as const;

const COINTOSS_PLACE_BET_ABI = _extractPlaceBetEvent(coinTossAbi);
const DICE_PLACE_BET_ABI = _extractPlaceBetEvent(diceAbi);
const ROULETTE_PLACE_BET_ABI = _extractPlaceBetEvent(rouletteAbi);
const KENO_PLACE_BET_ABI = _extractPlaceBetEvent(kenoAbi);
const WEIGHTED_GAME_PLACE_BET_ABI = _extractPlaceBetEvent(weightedGameAbi);

export const CASINO_GAME_PLACE_BET_ABI: Record<
  CASINO_GAME_TYPE,
  | typeof COINTOSS_PLACE_BET_ABI
  | typeof DICE_PLACE_BET_ABI
  | typeof ROULETTE_PLACE_BET_ABI
  | typeof KENO_PLACE_BET_ABI
  | typeof WEIGHTED_GAME_PLACE_BET_ABI
> = {
  [CASINO_GAME_TYPE.COINTOSS]: COINTOSS_PLACE_BET_ABI,
  [CASINO_GAME_TYPE.DICE]: DICE_PLACE_BET_ABI,
  [CASINO_GAME_TYPE.ROULETTE]: ROULETTE_PLACE_BET_ABI,
  [CASINO_GAME_TYPE.KENO]: KENO_PLACE_BET_ABI,
  [CASINO_GAME_TYPE.WHEEL]: WEIGHTED_GAME_PLACE_BET_ABI,
  [CASINO_GAME_TYPE.PLINKO]: WEIGHTED_GAME_PLACE_BET_ABI,
  [CASINO_GAME_TYPE.SLOT]: WEIGHTED_GAME_PLACE_BET_ABI,
  [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: WEIGHTED_GAME_PLACE_BET_ABI,
};

const arbitrumSepoliaData: CasinoChain = {
  id: chainByKey.arbitrumSepolia.id,
  viemChain: chainByKey.arbitrumSepolia,
  options: {
    pollingInterval: 200,
  },
  contracts: {
    bank: "0x3ca54e047aE5f9141b49c6817aa7994CDc589d19",
    games: {
      [CASINO_GAME_TYPE.DICE]: {
        address: "0xF68762683515f6670Fe661bff4Fe469A1A459904",
        abi: diceAbi,
      },
      [CASINO_GAME_TYPE.COINTOSS]: {
        address: "0x0Ff6EEfc86a79aE2239399ceC4C826099391B046",
        abi: coinTossAbi,
      },
      [CASINO_GAME_TYPE.ROULETTE]: {
        address: "0x044c7E3Cd069d3e12D37686E92B85799E36fa7e4",
        abi: rouletteAbi,
      },
      [CASINO_GAME_TYPE.KENO]: {
        address: "0xA78465DE64F302568cbb869698413a60681d2Fe8",
        abi: kenoAbi,
      },
      [CASINO_GAME_TYPE.WHEEL]: {
        address: "0xd021018E82eE105Feb7f50a0534DC0a3e6776F32",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.PLINKO]: {
        address: "0xd021018E82eE105Feb7f50a0534DC0a3e6776F32",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.SLOT]: {
        address: "0xd021018E82eE105Feb7f50a0534DC0a3e6776F32",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: {
        address: "0xd021018E82eE105Feb7f50a0534DC0a3e6776F32",
        abi: weightedGameAbi,
      },
    },
    leaderboard: "0xf8e7EE248BE53C8b428542E9bc498D78fea09Ee4",
    freebet: "0xBf34537E0648724713740267c72826A8f08ECadA",
  },
  graphql: {
    endpoint: "https://api.studio.thegraph.com/query/80936/betswirl-arbitrum-sepolia-v2/v0.1.3",
    defaultEndpoint:
      "https://api.studio.thegraph.com/query/80936/betswirl-arbitrum-sepolia-v2/v0.1.3",
  },
  defaultAffiliate: "0x057BcBF736DADD774A8A45A185c1697F4cF7517D",
};

const avalancheFujiData: CasinoChain = {
  id: chainByKey.avalancheFuji.id,
  viemChain: chainByKey.avalancheFuji,
  options: {
    pollingInterval: 500,
  },
  contracts: {
    bank: "0x25bED5A341218Df801a64951d02d3c968E84a6d4",
    games: {
      [CASINO_GAME_TYPE.DICE]: {
        address: "0xE25b810B1A3d7DCff051abcdc109466d32b4F2a1",
        abi: diceAbi,
      },
      [CASINO_GAME_TYPE.COINTOSS]: {
        address: "0x5856B199ae1c51296cB17d29D65Da702FE0DA12a",
        abi: coinTossAbi,
      },
      [CASINO_GAME_TYPE.ROULETTE]: {
        address: "0x91f6A418E2B4535f1828836d2DEa93E99d49836e",
        abi: rouletteAbi,
      },
      [CASINO_GAME_TYPE.KENO]: {
        address: "0xEC5800455EeFE3A193778747EeAfF38221bFdFe4",
        abi: kenoAbi,
      },
      [CASINO_GAME_TYPE.WHEEL]: {
        address: "0xEaFBA4d8a062b4C41775FED9Ced52633c89DFca0",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.PLINKO]: {
        address: "0xEaFBA4d8a062b4C41775FED9Ced52633c89DFca0",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.SLOT]: {
        address: "0xEaFBA4d8a062b4C41775FED9Ced52633c89DFca0",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: {
        address: "0xEaFBA4d8a062b4C41775FED9Ced52633c89DFca0",
        abi: weightedGameAbi,
      },
    },
    leaderboard: "0xbB613c35D539eE86AB600e376117887A006d028f",
    freebet: "0xf341aa5e54E9536BDac0928d4Dbba3E09A8f774E",
  },
  graphql: {
    endpoint: "https://api.studio.thegraph.com/query/80936/betswirl-fuji-v2/v0.1.3",
    defaultEndpoint: "https://api.studio.thegraph.com/query/80936/betswirl-fuji-v2/v0.1.3",
  },
  defaultAffiliate: "0x057BcBF736DADD774A8A45A185c1697F4cF7517D",
};

const polygonAmoyData: CasinoChain = {
  id: chainByKey.polygonAmoy.id,
  viemChain: chainByKey.polygonAmoy,
  options: {
    pollingInterval: 500,
  },
  contracts: {
    bank: "0x89D47048152581633579450DC4888C931CD4c28C",
    games: {
      [CASINO_GAME_TYPE.DICE]: {
        address: "0xE14E752c6Ef78fB54da5A28ff7C9f808534603e9",
        abi: diceAbi,
      },
      [CASINO_GAME_TYPE.COINTOSS]: {
        address: "0xC2fc743768A1a842dD2CfA121359b8545B9876cA",
        abi: coinTossAbi,
      },
      [CASINO_GAME_TYPE.ROULETTE]: {
        address: "0x5F628ccd0D5929B16fF6E239D8BB8C81F1b0feD9",
        abi: rouletteAbi,
      },
      [CASINO_GAME_TYPE.KENO]: {
        address: "0x77A654D0895baF09c42314FBb4b18822Ec3c1DD0",
        abi: kenoAbi,
      },
      [CASINO_GAME_TYPE.WHEEL]: {
        address: "0xd300a3757dDBb3Eafb8fb3e401a5eb60e4a571b1",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.PLINKO]: {
        address: "0xd300a3757dDBb3Eafb8fb3e401a5eb60e4a571b1",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.SLOT]: {
        address: "0xd300a3757dDBb3Eafb8fb3e401a5eb60e4a571b1",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: {
        address: "0xd300a3757dDBb3Eafb8fb3e401a5eb60e4a571b1",
        abi: weightedGameAbi,
      },
    },
    leaderboard: "0x143DB52C913143345B6a24D8f22f1a8BEaC19e16",
    freebet: "0xfBE92f62bd32B3b6c2335D757049f190752f5292",
  },
  graphql: {
    endpoint: "https://api.studio.thegraph.com/query/80936/betswirl-amoy-v2/v0.1.3",
    defaultEndpoint: "https://api.studio.thegraph.com/query/80936/betswirl-amoy-v2/v0.1.3",
  },
  defaultAffiliate: "0x057BcBF736DADD774A8A45A185c1697F4cF7517D",
};

const baseSepoliaData: CasinoChain = {
  id: chainByKey.baseSepolia.id,
  viemChain: chainByKey.baseSepolia,
  options: {
    pollingInterval: 200,
  },
  contracts: {
    bank: "0x637D401554875a330264e910A3778DAf549F2021",
    games: {
      [CASINO_GAME_TYPE.DICE]: {
        address: "0x76e982a4823bEd3ed77d8E0b4c3FAa616385a286",
        abi: diceAbi,
      },
      [CASINO_GAME_TYPE.COINTOSS]: {
        address: "0x431c7E0856C0DEf20e50A809cBDdEcF5F8dD6142",
        abi: coinTossAbi,
      },
      [CASINO_GAME_TYPE.ROULETTE]: {
        address: "0x441b191bc9253ab4E16D7d90E99650bb71D0E4f4",
        abi: rouletteAbi,
      },
      [CASINO_GAME_TYPE.KENO]: {
        address: "0xb5C9f183C1E5D2e9d0CA0679D7149ea075E0e82F",
        abi: kenoAbi,
      },
      [CASINO_GAME_TYPE.WHEEL]: {
        address: "0x011e537eB2313fc0096a87AA4ACC3750f712Ce2D",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.PLINKO]: {
        address: "0x011e537eB2313fc0096a87AA4ACC3750f712Ce2D",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.SLOT]: {
        address: "0x011e537eB2313fc0096a87AA4ACC3750f712Ce2D",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: {
        address: "0x011e537eB2313fc0096a87AA4ACC3750f712Ce2D",
        abi: weightedGameAbi,
      },
    },
    leaderboard: "0xd60Fac02E78e2a4E37501053ab3E822E330dd970",
    freebet: "0xcBa83991C4D6A8c75FA7Aac02AAE202Ed0E44224",
  },
  graphql: {
    endpoint: "https://api.studio.thegraph.com/query/80936/betswirl-base-sepolia-v2/v0.1.3",
    defaultEndpoint: "https://api.studio.thegraph.com/query/80936/betswirl-base-sepolia-v2/v0.1.3",
  },
  defaultAffiliate: "0x057BcBF736DADD774A8A45A185c1697F4cF7517D",
};

const arbitrumData: CasinoChain = {
  id: chainByKey.arbitrum.id,
  viemChain: chainByKey.arbitrum,
  options: {
    pollingInterval: 200,
  },
  contracts: {
    bank: "0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA",
    games: {
      [CASINO_GAME_TYPE.DICE]: {
        address: "0xAa4D2931a9fE14c3dec8AC3f12923Cbb535C0e5f",
        abi: diceAbi,
      },
      [CASINO_GAME_TYPE.COINTOSS]: {
        address: "0xC3Dff2489F8241729B824e23eD01F986fcDf8ec3",
        abi: coinTossAbi,
      },
      [CASINO_GAME_TYPE.ROULETTE]: {
        address: "0x6678e3B4AB2a8C8Cdd068F132C21293CcBda33cb",
        abi: rouletteAbi,
      },
      [CASINO_GAME_TYPE.KENO]: {
        address: "0xc3428E4FEb5C770Db51DCb9B1C08223B10994a89",
        abi: kenoAbi,
      },
      [CASINO_GAME_TYPE.PLINKO]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.WHEEL]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.SLOT]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
    },
    freebet: "0x7a1EFD33f41150E3247F14209b2a733bc6B1cb7a",
    leaderboard: "0x0E5C8EA20a1EB26e5dDE5AFab5279F546dB92a79",
  },
  graphql: {
    endpoint:
      "https://gateway.thegraph.com/api/{key}/deployments/id/QmYMwfki8kR9LwJ2Jv9BFdr938Js8THGS1J3PSd38W7jQF",
    defaultEndpoint: "https://api.studio.thegraph.com/query/1726/betswirl-arbitrum-one/v2.3.3",
  },
  defaultAffiliate: "0xf14C79a7fA22c1f97C779F573c9bF39b6b43381c",
};

const avalancheData: CasinoChain = {
  id: chainByKey.avalanche.id,
  viemChain: chainByKey.avalanche,
  options: {
    pollingInterval: 500,
  },
  contracts: {
    bank: "0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA",
    games: {
      [CASINO_GAME_TYPE.DICE]: {
        address: "0xAa4D2931a9fE14c3dec8AC3f12923Cbb535C0e5f",
        abi: diceAbi,
      },
      [CASINO_GAME_TYPE.COINTOSS]: {
        address: "0xC3Dff2489F8241729B824e23eD01F986fcDf8ec3",
        abi: coinTossAbi,
      },
      [CASINO_GAME_TYPE.ROULETTE]: {
        address: "0x6678e3B4AB2a8C8Cdd068F132C21293CcBda33cb",
        abi: rouletteAbi,
      },
      [CASINO_GAME_TYPE.KENO]: {
        address: "0xc3428E4FEb5C770Db51DCb9B1C08223B10994a89",
        abi: kenoAbi,
      },
      [CASINO_GAME_TYPE.WHEEL]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.PLINKO]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.SLOT]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
    },
    freebet: "0x7a1EFD33f41150E3247F14209b2a733bc6B1cb7a",
    leaderboard: "0x0E5C8EA20a1EB26e5dDE5AFab5279F546dB92a79",
  },
  graphql: {
    endpoint:
      "https://gateway.thegraph.com/api/{key}/deployments/id/Qmf3KfduW97R5zFUNV5fBcFQJ9P48EnhHsdJeKzkTQiUBz",
    defaultEndpoint: "https://api.studio.thegraph.com/query/1726/betswirl-avalanche/v2.3.3",
  },
  defaultAffiliate: "0x1a75280F832280Af93f588f715a5Fb4Ca7918430",
};

const polygonData: CasinoChain = {
  id: chainByKey.polygon.id,
  viemChain: chainByKey.polygon,
  options: {
    pollingInterval: 1000,
  },
  contracts: {
    bank: "0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA",
    games: {
      [CASINO_GAME_TYPE.DICE]: {
        address: "0xAa4D2931a9fE14c3dec8AC3f12923Cbb535C0e5f",
        abi: diceAbi,
      },
      [CASINO_GAME_TYPE.COINTOSS]: {
        address: "0xC3Dff2489F8241729B824e23eD01F986fcDf8ec3",
        abi: coinTossAbi,
      },
      [CASINO_GAME_TYPE.ROULETTE]: {
        address: "0x6678e3B4AB2a8C8Cdd068F132C21293CcBda33cb",
        abi: rouletteAbi,
      },
      [CASINO_GAME_TYPE.KENO]: {
        address: "0xc3428E4FEb5C770Db51DCb9B1C08223B10994a89",
        abi: kenoAbi,
      },
      [CASINO_GAME_TYPE.WHEEL]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.PLINKO]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.SLOT]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
    },
    freebet: "0x7a1EFD33f41150E3247F14209b2a733bc6B1cb7a",
    leaderboard: "0x0E5C8EA20a1EB26e5dDE5AFab5279F546dB92a79",
  },
  graphql: {
    endpoint:
      "https://gateway.thegraph.com/api/{key}/deployments/id/QmUa6b7voVS4kuERGo3bEDvRsW2FdTogSLeztnvtsi5DB2",
    defaultEndpoint: "https://api.studio.thegraph.com/query/1726/betswirl-polygon/v2.3.3",
  },
  defaultAffiliate: "0xfA695010bF9e757a1abCd2703259F419217aa756",
};

const bscData: CasinoChain = {
  id: chainByKey.bsc.id,
  viemChain: chainByKey.bsc,
  options: {
    pollingInterval: 500,
  },
  contracts: {
    bank: "0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA",
    games: {
      [CASINO_GAME_TYPE.DICE]: {
        address: "0xAa4D2931a9fE14c3dec8AC3f12923Cbb535C0e5f",
        abi: diceAbi,
      },
      [CASINO_GAME_TYPE.COINTOSS]: {
        address: "0xC3Dff2489F8241729B824e23eD01F986fcDf8ec3",
        abi: coinTossAbi,
      },
      [CASINO_GAME_TYPE.ROULETTE]: {
        address: "0x6678e3B4AB2a8C8Cdd068F132C21293CcBda33cb",
        abi: rouletteAbi,
      },
      [CASINO_GAME_TYPE.KENO]: {
        address: "0xc3428E4FEb5C770Db51DCb9B1C08223B10994a89",
        abi: kenoAbi,
      },
      [CASINO_GAME_TYPE.WHEEL]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.PLINKO]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.SLOT]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
    },
    freebet: "0x7a1EFD33f41150E3247F14209b2a733bc6B1cb7a",
    leaderboard: "0x0E5C8EA20a1EB26e5dDE5AFab5279F546dB92a79",
  },
  graphql: {
    endpoint:
      "https://gateway.thegraph.com/api/{key}/deployments/id/Qmd5oqyojVx5wWSFuWfKz3YVLPHdE3KU5458Qqq3SVeGEB",
    defaultEndpoint: "https://api.studio.thegraph.com/query/1726/betswirl-bnb-chain/v2.3.3",
  },
  defaultAffiliate: "0xCD25325a6eF20BC5dF9bceAc0cC22a48d2e8f6eF",
};

const baseData: CasinoChain = {
  id: chainByKey.base.id,
  viemChain: chainByKey.base,
  options: {
    pollingInterval: 200,
  },
  contracts: {
    bank: "0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA",
    games: {
      [CASINO_GAME_TYPE.DICE]: {
        address: "0xAa4D2931a9fE14c3dec8AC3f12923Cbb535C0e5f",
        abi: diceAbi,
      },
      [CASINO_GAME_TYPE.COINTOSS]: {
        address: "0xC3Dff2489F8241729B824e23eD01F986fcDf8ec3",
        abi: coinTossAbi,
      },
      [CASINO_GAME_TYPE.ROULETTE]: {
        address: "0x6678e3B4AB2a8C8Cdd068F132C21293CcBda33cb",
        abi: rouletteAbi,
      },
      [CASINO_GAME_TYPE.KENO]: {
        address: "0xc3428E4FEb5C770Db51DCb9B1C08223B10994a89",
        abi: kenoAbi,
      },
      [CASINO_GAME_TYPE.WHEEL]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.PLINKO]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.SLOT]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
      [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: {
        address: "0xdec2A4f75c5fAE4a09c83975681CE1Dd1dff764b",
        abi: weightedGameAbi,
      },
    },
    freebet: "0x7a1EFD33f41150E3247F14209b2a733bc6B1cb7a",
    leaderboard: "0x0E5C8EA20a1EB26e5dDE5AFab5279F546dB92a79",
  },
  graphql: {
    endpoint:
      "https://gateway.thegraph.com/api/{key}/deployments/id/QmZuY97Ai2EHqc3GmA26n3WzwrGJZ7orXvEi3SmqmSe11T",
    defaultEndpoint: "https://api.studio.thegraph.com/query/1726/betswirl-base/v2.3.3",
  },
  defaultAffiliate: "0xBf1998e1F1cD52fBfb63e7E646bb39c091A7B70A",
};

export const casinoChainById = {
  [chainByKey.arbitrumSepolia.id]: arbitrumSepoliaData,
  [chainByKey.avalancheFuji.id]: avalancheFujiData,
  [chainByKey.polygonAmoy.id]: polygonAmoyData,
  [chainByKey.baseSepolia.id]: baseSepoliaData,
  [chainByKey.arbitrum.id]: arbitrumData,
  [chainByKey.avalanche.id]: avalancheData,
  [chainByKey.polygon.id]: polygonData,
  [chainByKey.bsc.id]: bscData,
  [chainByKey.base.id]: baseData,
} as const;

export const casinoChains = Object.values(casinoChainById) as unknown as readonly [
  CasinoChain,
  ...CasinoChain[],
];

export const casinoChainIds: CasinoChainId[] = casinoChains.map(
  (chain) => chain.viemChain.id as CasinoChainId,
);

export const labelCasinoGameByType = {
  [CASINO_GAME_TYPE.COINTOSS]: CASINO_GAME_LABEL_TYPE.COINTOSS,
  [CASINO_GAME_TYPE.DICE]: CASINO_GAME_LABEL_TYPE.DICE,
  [CASINO_GAME_TYPE.ROULETTE]: CASINO_GAME_LABEL_TYPE.ROULETTE,
  [CASINO_GAME_TYPE.KENO]: CASINO_GAME_LABEL_TYPE.KENO,
  [CASINO_GAME_TYPE.WHEEL]: CASINO_GAME_LABEL_TYPE.WHEEL,
  [CASINO_GAME_TYPE.PLINKO]: CASINO_GAME_LABEL_TYPE.PLINKO,
  [CASINO_GAME_TYPE.SLOT]: CASINO_GAME_LABEL_TYPE.SLOT,
  [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: CASINO_GAME_LABEL_TYPE.CUSTOM_WEIGHTED_GAME,
} as const;

export const typeBySubgraphCasinoGame = {
  [CASINO_GAME_SUBGRAPH_TYPE.COINTOSS]: CASINO_GAME_TYPE.COINTOSS,
  [CASINO_GAME_SUBGRAPH_TYPE.DICE]: CASINO_GAME_TYPE.DICE,
  [CASINO_GAME_SUBGRAPH_TYPE.ROULETTE]: CASINO_GAME_TYPE.ROULETTE,
  [CASINO_GAME_SUBGRAPH_TYPE.KENO]: CASINO_GAME_TYPE.KENO,
  [CASINO_GAME_SUBGRAPH_TYPE.WHEEL]: CASINO_GAME_TYPE.WHEEL,
  [CASINO_GAME_SUBGRAPH_TYPE.PLINKO]: CASINO_GAME_TYPE.PLINKO,
  [CASINO_GAME_SUBGRAPH_TYPE.SLOT]: CASINO_GAME_TYPE.SLOT,
  [CASINO_GAME_SUBGRAPH_TYPE.CUSTOM_WEIGHTED_GAME]: CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME,
} as const;

export const subgraphGameByType = {
  [CASINO_GAME_TYPE.COINTOSS]: CASINO_GAME_SUBGRAPH_TYPE.COINTOSS,
  [CASINO_GAME_TYPE.DICE]: CASINO_GAME_SUBGRAPH_TYPE.DICE,
  [CASINO_GAME_TYPE.ROULETTE]: CASINO_GAME_SUBGRAPH_TYPE.ROULETTE,
  [CASINO_GAME_TYPE.KENO]: CASINO_GAME_SUBGRAPH_TYPE.KENO,
  [CASINO_GAME_TYPE.WHEEL]: CASINO_GAME_SUBGRAPH_TYPE.WHEEL,
  [CASINO_GAME_TYPE.PLINKO]: CASINO_GAME_SUBGRAPH_TYPE.PLINKO,
  [CASINO_GAME_TYPE.SLOT]: CASINO_GAME_SUBGRAPH_TYPE.SLOT,
  [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: CASINO_GAME_SUBGRAPH_TYPE.CUSTOM_WEIGHTED_GAME,
} as const;

// Could be increased in the future if we increase vrfCallbackGasExtraBet value in smart contracts
// This limit is a static limit, you need to Math.min(static limit, dynamic limit)
export const maxGameBetCountByType = {
  [CASINO_GAME_TYPE.COINTOSS]: 100,
  [CASINO_GAME_TYPE.DICE]: 200,
  [CASINO_GAME_TYPE.ROULETTE]: 200,
  [CASINO_GAME_TYPE.KENO]: 125,
  [CASINO_GAME_TYPE.WHEEL]: 100,
  [CASINO_GAME_TYPE.PLINKO]: 100,
  [CASINO_GAME_TYPE.SLOT]: 100,
  [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: 100,
} as const;
