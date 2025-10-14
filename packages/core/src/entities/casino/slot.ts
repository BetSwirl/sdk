import type { WeightedGameConfiguration } from "../../read";
import {
  WeightedGame,
  type WeightedGameChoiceInput,
  type WeightedGameEncodedRolled,
} from "./weightedGame";

export interface SlotChoiceInput extends WeightedGameChoiceInput {}

export enum COLUMN_RANDOMIZATION_TYPE {
  /**
   * Realistic mode: symbols are displayed proportionally
   * based on their weight in the game configuration.
   * Symbols with higher weight will appear more frequently.
   */
  REALISTIC = 0,
  /**
   * Random mode: symbol weights are not taken into account
   * in the random draw. All symbols have an equal probability
   * of appearing, regardless of their weight.
   */
  RANDOM = 1,
}

/**
 * Randomization types for slot machines
 */
export enum PAYLINE_RANDOMIZATION_TYPE {
  /**
   * Realistic mode: symbols are displayed proportionally
   * based on their weight in the game configuration.
   * Symbols with higher weight will appear more frequently.
   */
  REALISTIC = 0,
  /**
   * Random mode: symbol weights are not taken into account
   * in the random draw. All symbols have an equal probability
   * of appearing, regardless of their weight.
   */
  RANDOM = 1,
  /**
   * Boosted random mode: similar to random mode but with a 50% chance
   * of having columnCount - 1 symbols be the same. This creates
   * more frequent near-miss scenarios for enhanced player engagement.
   */
  BOOSTED_RANDOM = 2,
}

export interface Symbol {
  url: string;
}

export const DEFAULT_SYMBOL_URL: string =
  "https://www.betswirl.com/img/sdk/casino/slot/default.png";

export class Slot extends WeightedGame {
  // Slot utilities

  /**
   * Generates a deterministic random number based on nonce and seed
   * @param nonce - The nonce value (recommended: betTimestamp or other immutable bet-related value)
   * @param seed - Additional seed for randomization
   * @returns A pseudo-random number between 0 and 1
   */
  private static deterministicRandom(nonce: number, seed = 0): number {
    // Simple hash-based approach for deterministic randomness
    // Combines nonce and seed into a single value, then normalizes to 0-1 range
    const combined = (nonce * 2654435761 + seed * 1664525) % 2147483647;
    return combined / 2147483647;
  }

  /**
   * Generates a payline based on the randomization type
   * @param encodedRolled - The encoded rolled result
   * @param weightedGameConfiguration - Game configuration with weights and symbols
   * @param nonce - Nonce for deterministic generation (recommended: betTimestamp or other immutable bet-related value)
   * @param columnCount - Number of columns in the slot machine
   * @param randomType - Type of randomization to apply
   * @returns Array of symbols for the payline
   */
  static generatePayline(
    encodedRolled: WeightedGameEncodedRolled | string,
    weightedGameConfiguration: WeightedGameConfiguration,
    nonce: number,
    columnCount = 3,
    randomType: PAYLINE_RANDOMIZATION_TYPE = PAYLINE_RANDOMIZATION_TYPE.RANDOM,
  ): Symbol[] {
    const multiplier = weightedGameConfiguration.multipliers[Number(encodedRolled)];

    // If the multiplier is 0, generates random combination of symbols
    if (!multiplier || multiplier === 0n) {
      return Slot.generateRandomPayline(weightedGameConfiguration, columnCount, nonce, randomType);
    }

    // If the multiplier is not 0, generates a payline of the won symbols
    return Array.from({ length: columnCount }, () => {
      return {
        url: weightedGameConfiguration.symbolUrls?.[Number(encodedRolled)] ?? DEFAULT_SYMBOL_URL,
      };
    });
  }

  /**
   * Generates a random payline based on the specified randomization type
   * @param weightedGameConfiguration - Game configuration with weights and symbols
   * @param columnCount - Number of columns in the slot machine
   * @param nonce - Nonce for deterministic generation
   * @param randomType - Type of randomization to apply
   * @returns Array of symbols for the payline
   */
  private static generateRandomPayline(
    weightedGameConfiguration: WeightedGameConfiguration,
    columnCount: number,
    nonce: number,
    randomType: PAYLINE_RANDOMIZATION_TYPE,
  ): Symbol[] {
    // Filter out symbols with multiplier 0 (losing symbols)
    const validSymbols = Slot.getValidSymbols(weightedGameConfiguration);

    if (validSymbols.symbolUrls.length === 0) {
      return Array.from({ length: columnCount }, () => ({ url: DEFAULT_SYMBOL_URL }));
    }

    switch (randomType) {
      case PAYLINE_RANDOMIZATION_TYPE.REALISTIC:
        return Slot.generateRealisticPayline(validSymbols, columnCount, nonce);

      case PAYLINE_RANDOMIZATION_TYPE.RANDOM:
        return Slot.generateRandomPaylineType(validSymbols, columnCount, nonce);

      case PAYLINE_RANDOMIZATION_TYPE.BOOSTED_RANDOM:
        return Slot.generateBoostedRandomPayline(validSymbols, columnCount, nonce);

      default:
        return Slot.generateRandomPaylineType(validSymbols, columnCount, nonce);
    }
  }

  /**
   * Filters out symbols with multiplier 0 (losing symbols) from the configuration
   * @param weightedGameConfiguration - Original game configuration
   * @returns Filtered configuration with only winning symbols
   */
  private static getValidSymbols(weightedGameConfiguration: WeightedGameConfiguration): {
    symbolUrls: string[];
    weights: bigint[];
  } {
    const multipliers = weightedGameConfiguration.multipliers || [];
    const symbolUrls = weightedGameConfiguration.symbolUrls || [];
    const weights = weightedGameConfiguration.weights || [];

    const validSymbolUrls: string[] = [];
    const validWeights: bigint[] = [];

    for (let i = 0; i < multipliers.length; i++) {
      // Only include symbols with multiplier > 0 (winning symbols)
      const multiplier = multipliers[i];
      if (multiplier !== undefined && multiplier > 0n) {
        const symbolUrl = symbolUrls[i];
        const weight = weights[i];
        if (symbolUrl !== undefined) validSymbolUrls.push(symbolUrl);
        if (weight !== undefined) validWeights.push(weight);
      }
    }

    return {
      symbolUrls: validSymbolUrls,
      weights: validWeights,
    };
  }

  /**
   * Generates a realistic payline where symbols appear proportionally to their weights
   */
  private static generateRealisticPayline(
    validSymbols: { symbolUrls: string[]; weights: bigint[] },
    columnCount: number,
    nonce: number,
  ): Symbol[] {
    const weights = validSymbols.weights;
    const symbolUrls = validSymbols.symbolUrls;

    if (weights.length === 0 || symbolUrls.length === 0) {
      return Array.from({ length: columnCount }, () => ({ url: DEFAULT_SYMBOL_URL }));
    }

    // Calculate total weight
    const totalWeight = weights.reduce((sum, weight) => sum + Number(weight), 0);

    return Array.from({ length: columnCount }, (_, index) => {
      const randomValue = Slot.deterministicRandom(nonce, index) * totalWeight;

      let cumulativeWeight = 0;
      for (let i = 0; i < weights.length; i++) {
        cumulativeWeight += Number(weights[i]);
        if (randomValue <= cumulativeWeight) {
          return { url: symbolUrls[i] || DEFAULT_SYMBOL_URL };
        }
      }

      return { url: symbolUrls[symbolUrls.length - 1] || DEFAULT_SYMBOL_URL };
    });
  }

  /**
   * Generates a random payline where all symbols have equal probability
   */
  private static generateRandomPaylineType(
    validSymbols: { symbolUrls: string[]; weights: bigint[] },
    columnCount: number,
    nonce: number,
  ): Symbol[] {
    const symbolUrls = validSymbols.symbolUrls;

    return Array.from({ length: columnCount }, (_, index) => {
      const randomIndex = Math.floor(Slot.deterministicRandom(nonce, index) * symbolUrls.length);
      return { url: symbolUrls[randomIndex] || DEFAULT_SYMBOL_URL };
    });
  }

  /**
   * Generates a boosted random payline with 50% chance of having columnCount - 1 symbols be the same
   */
  private static generateBoostedRandomPayline(
    validSymbols: { symbolUrls: string[]; weights: bigint[] },
    columnCount: number,
    nonce: number,
  ): Symbol[] {
    const symbolUrls = validSymbols.symbolUrls;

    // 50% chance of having columnCount - 1 symbols be the same
    const shouldBoost = Slot.deterministicRandom(nonce, 0) < 0.5;

    if (shouldBoost && columnCount > 1 && symbolUrls.length > 1) {
      // Choose a random symbol for the majority
      const majoritySymbolIndex = Math.floor(
        Slot.deterministicRandom(nonce, 1) * symbolUrls.length,
      );
      const majoritySymbol = { url: symbolUrls[majoritySymbolIndex] || DEFAULT_SYMBOL_URL };

      // Choose a different symbol for the minority
      const minoritySymbolIndex = Math.floor(
        Slot.deterministicRandom(nonce, 2) * (symbolUrls.length - 1),
      );
      const adjustedIndex =
        minoritySymbolIndex >= majoritySymbolIndex ? minoritySymbolIndex + 1 : minoritySymbolIndex;
      const minoritySymbol = { url: symbolUrls[adjustedIndex] || DEFAULT_SYMBOL_URL };

      // Create payline with columnCount - 1 same symbols and 1 different
      const payline = Array.from({ length: columnCount - 1 }, () => ({ ...majoritySymbol }));
      payline.push({ ...minoritySymbol });

      return payline;
    }
    // Fall back to regular random generation
    return Slot.generateRandomPaylineType(validSymbols, columnCount, nonce);
  }

  /**
   * Generates a reserve of symbols for slot machine animation before showing the final payline
   * @param weightedGameConfiguration - Game configuration with weights and symbols
   * @param nonce - Nonce for deterministic generation (can be fixed for consistent reserves or random for varied reserves)
   * @param symbolCount - Number of symbols to generate in the reserve
   * @param randomType - Type of randomization to apply
   * @returns Array of symbols for the animation reserve
   */
  static generateColumnSymbols(
    weightedGameConfiguration: WeightedGameConfiguration,
    nonce: number,
    symbolCount = 100,
    randomType: COLUMN_RANDOMIZATION_TYPE = COLUMN_RANDOMIZATION_TYPE.RANDOM,
  ): Symbol[] {
    // Filter out symbols with multiplier 0 (losing symbols) for the reserve
    const validSymbols = Slot.getValidSymbols(weightedGameConfiguration);

    if (validSymbols.symbolUrls.length === 0) {
      return Array.from({ length: symbolCount }, () => ({ url: DEFAULT_SYMBOL_URL }));
    }

    switch (randomType) {
      case COLUMN_RANDOMIZATION_TYPE.REALISTIC:
        return Slot.generateRealisticColumnSymbols(validSymbols, symbolCount, nonce);

      case COLUMN_RANDOMIZATION_TYPE.RANDOM:
        return Slot.generateRandomColumnSymbols(validSymbols, symbolCount, nonce);

      default:
        return Slot.generateRandomColumnSymbols(validSymbols, symbolCount, nonce);
    }
  }

  /**
   * Generates realistic column symbols where symbols appear proportionally to their weights
   */
  private static generateRealisticColumnSymbols(
    validSymbols: { symbolUrls: string[]; weights: bigint[] },
    symbolCount: number,
    nonce: number,
  ): Symbol[] {
    // Reuse the payline function to generate the column symbols
    return Slot.generateRealisticPayline(validSymbols, symbolCount, nonce);
  }

  /**
   * Generates random column symbols where all symbols have equal probability
   */
  private static generateRandomColumnSymbols(
    validSymbols: { symbolUrls: string[]; weights: bigint[] },
    symbolCount: number,
    nonce: number,
  ): Symbol[] {
    // Reuse the payline function to generate the column symbols
    return Slot.generateRandomPaylineType(validSymbols, symbolCount, nonce);
  }
}
