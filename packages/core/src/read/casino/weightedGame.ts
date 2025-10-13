import { encodeFunctionData } from "viem";
import { weightedGameAbi } from "../../abis";
import { chainByKey } from "../../data";
import {
  CASINO_GAME_TYPE,
  type CasinoChainId,
  casinoChainById,
  type WEIGHTED_CASINO_GAME_TYPE,
} from "../../data/casino";
import { ChainError, ERROR_CODES, TransactionError } from "../../errors";
import type { BetSwirlFunctionData, BP_bigint } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider/wallet";
import { getCasinoChainId } from "../../utils/chains";
import type { CasinoRolledBet } from "./game";

const normalWheelConfiguration = {
  configId: 0,
  weights: [1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n],
  multipliers: [0n, 14580n, 0n, 18760n, 0n, 20830n, 0n, 14580n, 0n, 31250n],
  colors: [
    "#29384C",
    "#55DC36",
    "#29384C",
    "#15A2D8",
    "#29384C",
    "#7340F4",
    "#29384C",
    "#55DC36",
    "#29384C",
    "#EC9E3C",
  ],
  label: "Normal",
  game: CASINO_GAME_TYPE.WHEEL,
};

const safePlinkoConfiguration = {
  configId: 1,
  weights: [3n, 30n, 120n, 350n, 1055n, 2231n, 2422n, 2231n, 1055n, 350n, 120n, 30n, 3n],
  multipliers: [
    104167n,
    31250n,
    16667n,
    14584n,
    11459n,
    10417n,
    5209n,
    10417n,
    11459n,
    14584n,
    16667n,
    31250n,
    104167n,
  ],
  colors: [
    "#ff003f",
    "#ff2035",
    "#ff402a",
    "#ff6020",
    "#ff8015",
    "#ffa00b",
    "#ffc000",
    "#ffa00b",
    "#ff8015",
    "#ff6020",
    "#ff402a",
    "#ff2035",
    "#ff003f",
  ],
  label: "Safe",
  game: CASINO_GAME_TYPE.PLINKO,
};
const volatilePlinkoConfiguration = {
  configId: 2,
  weights: [3n, 30n, 120n, 350n, 1055n, 2231n, 2422n, 2231n, 1055n, 350n, 120n, 30n, 3n],
  multipliers: [
    1041667n,
    156250n,
    52083n,
    20833n,
    12500n,
    5209n,
    3125n,
    5209n,
    12500n,
    20833n,
    52083n,
    156250n,
    1041667n,
  ],
  colors: [
    "#ff003f",
    "#ff2035",
    "#ff402a",
    "#ff6020",
    "#ff8015",
    "#ffa00b",
    "#ffc000",
    "#ffa00b",
    "#ff8015",
    "#ff6020",
    "#ff402a",
    "#ff2035",
    "#ff003f",
  ],
  label: "Volatile",
  game: CASINO_GAME_TYPE.PLINKO,
};
const ZERO_SYMBOL_URL = "https://www.betswirl.com/img/sdk/casino/slot/null.png";
const baseSafeSlotConfigurationSymbolUrl =
  "https://www.betswirl.com/img/sdk/casino/slot/betswirl_safe/";
const safeSlotConfiguration = {
  configId: 4,
  weights: [1850n, 1984n, 1844n, 1740n, 1416n, 599n, 417n, 125n, 25n],
  multipliers: [0n, 5208n, 8021n, 10417n, 15625n, 20833n, 31250n, 52083n, 104167n],
  symbolUrls: [
    ZERO_SYMBOL_URL,
    `${baseSafeSlotConfigurationSymbolUrl}1.png`,
    `${baseSafeSlotConfigurationSymbolUrl}2.png`,
    `${baseSafeSlotConfigurationSymbolUrl}3.png`,
    `${baseSafeSlotConfigurationSymbolUrl}4.png`,
    `${baseSafeSlotConfigurationSymbolUrl}5.png`,
    `${baseSafeSlotConfigurationSymbolUrl}6.png`,
    `${baseSafeSlotConfigurationSymbolUrl}7.png`,
    `${baseSafeSlotConfigurationSymbolUrl}8.png`,
  ],
  label: "Safe",
  game: CASINO_GAME_TYPE.SLOT,
};
const baseVolatileSlotConfigurationSymbolUrl =
  "https://www.betswirl.com/img/sdk/casino/slot/betswirl_volatile/";
const volatileSlotConfiguration = {
  configId: 3,
  weights: [3180n, 3265n, 1714n, 826n, 600n, 310n, 102n, 3n],
  multipliers: [0n, 5209n, 10417n, 20833n, 31250n, 52083n, 104167n, 802083n],
  symbolUrls: [
    ZERO_SYMBOL_URL,
    `${baseVolatileSlotConfigurationSymbolUrl}1.png`,
    `${baseVolatileSlotConfigurationSymbolUrl}2.png`,
    `${baseVolatileSlotConfigurationSymbolUrl}3.png`,
    `${baseVolatileSlotConfigurationSymbolUrl}4.png`,
    `${baseVolatileSlotConfigurationSymbolUrl}5.png`,
    `${baseVolatileSlotConfigurationSymbolUrl}6.png`,
    `${baseVolatileSlotConfigurationSymbolUrl}7.png`,
  ],
  label: "Volatile",
  game: CASINO_GAME_TYPE.SLOT,
};

type WeightedGameCachedConfigurationsPerChain<T extends CachedWeightedGameConfiguration> = {
  [chainId in CasinoChainId]: T[];
};

export const wheelCachedConfigurations: WeightedGameCachedConfigurationsPerChain<CachedWeightedGameConfigurationWithColors> =
  {
    [chainByKey.arbitrumSepolia.id]: [
      { ...normalWheelConfiguration, chainId: chainByKey.arbitrumSepolia.id },
    ],
    [chainByKey.avalancheFuji.id]: [
      { ...normalWheelConfiguration, chainId: chainByKey.avalancheFuji.id },
    ],
    [chainByKey.polygonAmoy.id]: [
      { ...normalWheelConfiguration, chainId: chainByKey.polygonAmoy.id },
    ],
    [chainByKey.baseSepolia.id]: [
      { ...normalWheelConfiguration, chainId: chainByKey.baseSepolia.id },
    ],
    [chainByKey.arbitrum.id]: [{ ...normalWheelConfiguration, chainId: chainByKey.arbitrum.id }],
    [chainByKey.avalanche.id]: [{ ...normalWheelConfiguration, chainId: chainByKey.avalanche.id }],
    [chainByKey.polygon.id]: [{ ...normalWheelConfiguration, chainId: chainByKey.polygon.id }],
    [chainByKey.bsc.id]: [{ ...normalWheelConfiguration, chainId: chainByKey.bsc.id }],
    [chainByKey.base.id]: [{ ...normalWheelConfiguration, chainId: chainByKey.base.id }],
  };

export const plinkoCachedConfigurations: WeightedGameCachedConfigurationsPerChain<CachedWeightedGameConfigurationWithColors> =
  {
    [chainByKey.arbitrumSepolia.id]: [
      { ...safePlinkoConfiguration, chainId: chainByKey.arbitrumSepolia.id },
      { ...volatilePlinkoConfiguration, chainId: chainByKey.arbitrumSepolia.id },
    ],
    [chainByKey.avalancheFuji.id]: [
      { ...safePlinkoConfiguration, chainId: chainByKey.avalancheFuji.id },
      { ...volatilePlinkoConfiguration, chainId: chainByKey.avalancheFuji.id },
    ],
    [chainByKey.polygonAmoy.id]: [
      { ...safePlinkoConfiguration, chainId: chainByKey.polygonAmoy.id },
      { ...volatilePlinkoConfiguration, chainId: chainByKey.polygonAmoy.id },
    ],
    [chainByKey.baseSepolia.id]: [
      { ...safePlinkoConfiguration, chainId: chainByKey.baseSepolia.id },
      { ...volatilePlinkoConfiguration, chainId: chainByKey.baseSepolia.id },
    ],
    [chainByKey.arbitrum.id]: [
      { ...safePlinkoConfiguration, chainId: chainByKey.arbitrum.id },
      { ...volatilePlinkoConfiguration, chainId: chainByKey.arbitrum.id },
    ],
    [chainByKey.avalanche.id]: [
      { ...safePlinkoConfiguration, chainId: chainByKey.avalanche.id },
      { ...volatilePlinkoConfiguration, chainId: chainByKey.avalanche.id },
    ],
    [chainByKey.polygon.id]: [
      { ...safePlinkoConfiguration, chainId: chainByKey.polygon.id },
      { ...volatilePlinkoConfiguration, chainId: chainByKey.polygon.id },
    ],
    [chainByKey.bsc.id]: [
      { ...safePlinkoConfiguration, chainId: chainByKey.bsc.id },
      { ...volatilePlinkoConfiguration, chainId: chainByKey.bsc.id },
    ],
    [chainByKey.base.id]: [
      { ...safePlinkoConfiguration, chainId: chainByKey.base.id },
      { ...volatilePlinkoConfiguration, chainId: chainByKey.base.id },
    ],
  };

export const slotCachedConfigurations: WeightedGameCachedConfigurationsPerChain<CachedWeightedGameConfigurationWithSymbols> =
  {
    [chainByKey.arbitrumSepolia.id]: [
      { ...safeSlotConfiguration, chainId: chainByKey.arbitrumSepolia.id },
      { ...volatileSlotConfiguration, chainId: chainByKey.arbitrumSepolia.id },
    ],
    [chainByKey.avalancheFuji.id]: [
      { ...safeSlotConfiguration, chainId: chainByKey.avalancheFuji.id },
      { ...volatileSlotConfiguration, chainId: chainByKey.avalancheFuji.id },
    ],
    [chainByKey.polygonAmoy.id]: [
      { ...safeSlotConfiguration, chainId: chainByKey.polygonAmoy.id },
      { ...volatileSlotConfiguration, chainId: chainByKey.polygonAmoy.id },
    ],
    [chainByKey.baseSepolia.id]: [
      { ...safeSlotConfiguration, chainId: chainByKey.baseSepolia.id },
      { ...volatileSlotConfiguration, chainId: chainByKey.baseSepolia.id },
    ],
    [chainByKey.arbitrum.id]: [
      { ...safeSlotConfiguration, chainId: chainByKey.arbitrum.id },
      { ...volatileSlotConfiguration, chainId: chainByKey.arbitrum.id },
    ],
    [chainByKey.avalanche.id]: [
      { ...safeSlotConfiguration, chainId: chainByKey.avalanche.id },
      { ...volatileSlotConfiguration, chainId: chainByKey.avalanche.id },
    ],
    [chainByKey.polygon.id]: [
      { ...safeSlotConfiguration, chainId: chainByKey.polygon.id },
      { ...volatileSlotConfiguration, chainId: chainByKey.polygon.id },
    ],
    [chainByKey.bsc.id]: [
      { ...safeSlotConfiguration, chainId: chainByKey.bsc.id },
      { ...volatileSlotConfiguration, chainId: chainByKey.bsc.id },
    ],
    [chainByKey.base.id]: [
      { ...safeSlotConfiguration, chainId: chainByKey.base.id },
      { ...volatileSlotConfiguration, chainId: chainByKey.base.id },
    ],
  };

export const weightedGameCachedConfigurationsByGame: Record<
  WEIGHTED_CASINO_GAME_TYPE,
  WeightedGameCachedConfigurationsPerChain<CachedWeightedGameConfiguration> | undefined
> = {
  [CASINO_GAME_TYPE.WHEEL]: wheelCachedConfigurations,
  [CASINO_GAME_TYPE.PLINKO]: plinkoCachedConfigurations,
  [CASINO_GAME_TYPE.SLOT]: slotCachedConfigurations,
  [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: undefined,
};

export const weightedGameCachedConfigurations: WeightedGameCachedConfigurationsPerChain<CachedWeightedGameConfiguration> =
  {
    [chainByKey.arbitrumSepolia.id]: [
      ...wheelCachedConfigurations[chainByKey.arbitrumSepolia.id],
      ...plinkoCachedConfigurations[chainByKey.arbitrumSepolia.id],
      ...slotCachedConfigurations[chainByKey.arbitrumSepolia.id],
    ],
    [chainByKey.avalancheFuji.id]: [
      ...wheelCachedConfigurations[chainByKey.avalancheFuji.id],
      ...plinkoCachedConfigurations[chainByKey.avalancheFuji.id],
      ...slotCachedConfigurations[chainByKey.avalancheFuji.id],
    ],
    [chainByKey.polygonAmoy.id]: [
      ...wheelCachedConfigurations[chainByKey.polygonAmoy.id],
      ...plinkoCachedConfigurations[chainByKey.polygonAmoy.id],
      ...slotCachedConfigurations[chainByKey.polygonAmoy.id],
    ],
    [chainByKey.baseSepolia.id]: [
      ...wheelCachedConfigurations[chainByKey.baseSepolia.id],
      ...plinkoCachedConfigurations[chainByKey.baseSepolia.id],
      ...slotCachedConfigurations[chainByKey.baseSepolia.id],
    ],
    [chainByKey.arbitrum.id]: [
      ...wheelCachedConfigurations[chainByKey.arbitrum.id],
      ...plinkoCachedConfigurations[chainByKey.arbitrum.id],
      ...slotCachedConfigurations[chainByKey.arbitrum.id],
    ],
    [chainByKey.avalanche.id]: [
      ...wheelCachedConfigurations[chainByKey.avalanche.id],
      ...plinkoCachedConfigurations[chainByKey.avalanche.id],
      ...slotCachedConfigurations[chainByKey.avalanche.id],
    ],
    [chainByKey.polygon.id]: [
      ...wheelCachedConfigurations[chainByKey.polygon.id],
      ...plinkoCachedConfigurations[chainByKey.polygon.id],
      ...slotCachedConfigurations[chainByKey.polygon.id],
    ],
    [chainByKey.bsc.id]: [
      ...wheelCachedConfigurations[chainByKey.bsc.id],
      ...plinkoCachedConfigurations[chainByKey.bsc.id],
      ...slotCachedConfigurations[chainByKey.bsc.id],
    ],
    [chainByKey.base.id]: [
      ...wheelCachedConfigurations[chainByKey.base.id],
      ...plinkoCachedConfigurations[chainByKey.base.id],
      ...slotCachedConfigurations[chainByKey.base.id],
    ],
  };

export const gameIdByWeightedGameId = {
  1: CASINO_GAME_TYPE.WHEEL,
  2: CASINO_GAME_TYPE.PLINKO,
  /*3: Mines,
  4: Diamonds,
  5: SLIDE,*/
  6: CASINO_GAME_TYPE.SLOT,
} as const;

/**
 * Raw weighted game config data returned by the smart contract
 * [0] - weightRanges: The weight of each segment (sorted by ranges). e.g. [100, 250, 300] means the first segment has 100 weight, the second one has 150 weight, and the last one has 50 weight.
 * [1] - multipliers: The multiplier of each segment (BP)
 * [2] - maxMultiplier: The highest multiplier of the configuration (BP)
 * [3] - gameId: The weighted game id (used to identify the weighted game the configuration has been created for)
 */
export type RawWeightedGameConfiguration = {
  weightRanges: bigint[];
  multipliers: BP_bigint[];
  maxMultiplier: BP_bigint;
  gameId: number;
};

export function parseRawWeightedGameConfiguration(
  rawConfiguration: RawWeightedGameConfiguration,
  configId: number | string,
  casinoChainId: CasinoChainId,
): WeightedGameConfiguration {
  return {
    chainId: casinoChainId,
    configId: Number(configId),
    // Convert weight ranges into weights
    weights: rawConfiguration.weightRanges.map((v, i) =>
      i === 0 ? v : v - rawConfiguration.weightRanges[i - 1]!,
    ),
    multipliers: rawConfiguration.multipliers,
    game: gameIdByWeightedGameId[rawConfiguration.gameId as keyof typeof gameIdByWeightedGameId],
  };
}

export interface WeightedGameConfiguration {
  configId: number;
  game: CASINO_GAME_TYPE;
  chainId: CasinoChainId;
  weights: BP_bigint[];
  multipliers: BP_bigint[];
  colors?: string[];
  symbolUrls?: string[];
  label?: string;
}

export interface CachedWeightedGameConfiguration extends WeightedGameConfiguration {
  label: string;
}

export interface CachedWeightedGameConfigurationWithColors extends CachedWeightedGameConfiguration {
  colors: string[];
}

export interface CachedWeightedGameConfigurationWithSymbols
  extends CachedWeightedGameConfiguration {
  symbolUrls: string[];
}

export async function getWeightedGameConfiguration(
  wallet: BetSwirlWallet,
  configId: number | string,
): Promise<WeightedGameConfiguration> {
  const casinoChainId = getCasinoChainId(wallet);

  try {
    // Check if the configuration is in the cached configurations to save a fetch is it is the case.
    const cachedConfigurations = weightedGameCachedConfigurations[casinoChainId];
    if (cachedConfigurations) {
      const existingCachedConfiguration = cachedConfigurations.find(
        (c) => c.configId === Number(configId),
      );
      if (existingCachedConfiguration) {
        return existingCachedConfiguration;
      }
    }
    const functionData = getWeightedGameConfigurationFunctionData(configId, casinoChainId);
    const rawConfiguration = await wallet.readContract<
      typeof functionData,
      RawWeightedGameConfiguration
    >(functionData);

    return parseRawWeightedGameConfiguration(rawConfiguration, configId, casinoChainId);
  } catch (error) {
    throw new TransactionError(
      "Error getting weighted game configuration",
      ERROR_CODES.GAME.GET_WEIGHTED_GAME_CONFIGURATION_ERROR,
      {
        chainId: casinoChainId,
        configId,
        cause: error,
      },
    );
  }
}

export function getWeightedGameConfigurationFunctionData(
  configId: number | string,
  casinoChainId: CasinoChainId,
): BetSwirlFunctionData<typeof weightedGameAbi, "gameConfigs", readonly [number]> {
  const casinoChain = casinoChainById[casinoChainId];
  // Use WHEEL address here because Wheel is the first created weighted game
  const gameAddress = casinoChain.contracts.games[CASINO_GAME_TYPE.WHEEL]?.address;
  if (!gameAddress) {
    throw new ChainError(
      `Weighted game contract not found for chain ${casinoChainId}`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
    );
  }

  const abi = weightedGameAbi;
  const functionName = "gameConfigs" as const;
  const args = [Number(configId)] as const;
  return {
    data: { to: gameAddress, abi, functionName, args },
    encodedData: encodeFunctionData({
      abi,
      functionName,
      args,
    }),
  };
}

export interface WeightedGameRolledBet extends Omit<CasinoRolledBet, "decodedRoll"> {
  rolled: string[]; // multipliers (eg. x3.24)
}

// waitRolledBet and formatCasinoRolledBet are in game.ts
