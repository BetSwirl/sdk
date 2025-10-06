import { encodeAbiParameters, parseAbiParameters } from "viem";
import type { EncodeAbiParametersReturnType } from "viem/_types/utils/abi/encodeAbiParameters";
import {
  type BP,
  type CasinoChainId,
  generateRandomHexColor,
  getFormattedNetMultiplier,
  getNetMultiplier,
  type WEIGHTED_CASINO_GAME_TYPE,
  type WeightedGameConfiguration,
  weightedGameCachedConfigurations,
  weightedGameCachedConfigurationsByGame,
} from "../..";
import { BP_VALUE } from "../../constants";
import { AbstractCasinoGame, type ChoiceInput } from "./game";

export type WeightedGameConfigId = number;

export interface WeightedGameChoiceInput extends ChoiceInput<WEIGHTED_CASINO_GAME_TYPE> {
  value: WeightedGameConfigId;
  config: WeightedGameConfiguration;
  id: WeightedGameConfigId;
}

export type WeightedGameEncodedInput = number; // configId
export type WeightedGameEncodedRolled = number; // the position of the rolled multiplier

export class WeightedGame extends AbstractCasinoGame<
  string,
  WeightedGameEncodedInput,
  string,
  WeightedGameEncodedRolled
> {
  static getWinChancePercent(
    weightedGameConfig: WeightedGameConfiguration,
    position: number,
  ): number {
    /*const multipliersPositions = weightedGameConfig.multipliers.map((w, i) => w === multiplier ? i : null).filter(m => m !== null)

    const weights = weightedGameConfig.weights.filter((_, i) => multipliersPositions.includes(i))
    const totalWeight = weightedGameConfig.weights.reduce((acc, curr) => acc + curr, 0n)
    const totalWeightForMultiplier = weights.reduce((acc, curr) => acc + curr, 0n)

    return Number(totalWeightForMultiplier) / Number(totalWeight) * 100 */

    const weight = weightedGameConfig.weights[position];
    const totalWeight = weightedGameConfig.weights.reduce((acc, curr) => acc + curr, 0n);
    return (Number(weight) / Number(totalWeight)) * 100;
  }

  static getMultiplier(weightedGameConfig: WeightedGameConfiguration, position: number): BP {
    return Number(weightedGameConfig.multipliers[position] ?? 0);
  }

  protected static _formatMultiplier(multiplier: BP): number {
    return Number((multiplier / BP_VALUE).toFixed(3));
  }

  static getFormattedMultiplier(
    weightedGameConfig: WeightedGameConfiguration,
    position: number,
  ): number {
    return WeightedGame._formatMultiplier(WeightedGame.getMultiplier(weightedGameConfig, position));
  }

  static encodeInput(configId: WeightedGameConfigId): WeightedGameEncodedInput {
    return configId;
  }

  static encodeAbiParametersInput(configId: WeightedGameConfigId): EncodeAbiParametersReturnType {
    return encodeAbiParameters(parseAbiParameters("uint40"), [WeightedGame.encodeInput(configId)]);
  }

  static decodeInput(configId: WeightedGameEncodedInput | string): WeightedGameConfigId {
    return Number(configId);
  }

  static decodeRolled(
    encodedRolled: WeightedGameEncodedRolled | string,
    weightedGameConfiguration: WeightedGameConfiguration,
    houseEdge: number,
  ): string {
    const multiplier = weightedGameConfiguration.multipliers[Number(encodedRolled)];
    const netMultiplier = (Number(multiplier) * (1 - houseEdge / BP_VALUE)) / BP_VALUE;
    return `x${netMultiplier.toFixed(2)}`;
  }

  /**
   * Determines if a single decoded roll is a winning roll for Weighted Games (Wheel, Plinko, Slot).
   *
   * This method is particularly useful for multibetting scenarios where you need to:
   * - Identify which individual rolls are winners
   * - Color-code winning multipliers in the UI
   *
   * @param decodedRolled - The decoded roll result in format "multiplierx" (e.g., "2.5x", "0.5x")
   * @returns true if the multiplier is >= 1 (win), false otherwise (loss)
   *
   */

  static isSingleRolledWin(decodedRolled: string): boolean {
    const multiplier = decodedRolled.split("x")[1];
    return Number(multiplier) >= 1;
  }

  static getChoiceInputs(
    chainId: CasinoChainId,
    game: WEIGHTED_CASINO_GAME_TYPE,
    houseEdge?: BP,
    customWeightedGameConfigs?: WeightedGameConfiguration[],
  ): WeightedGameChoiceInput[] {
    const weightedGameConfigs = [
      ...(weightedGameCachedConfigurationsByGame[game]?.[chainId] ?? []),
      ...(customWeightedGameConfigs ?? []),
    ];
    return weightedGameConfigs.map((config) => {
      const multipliers = config.multipliers;
      return {
        value: config.configId,
        config: config,
        id: config.configId,
        game: config.game,
        label: WeightedGame.getWeightedGameConfigLabel(
          config.configId,
          chainId,
          customWeightedGameConfigs,
        ),
        winChancePercent: multipliers.map((_, index) =>
          WeightedGame.getWinChancePercent(config, index),
        ),
        multiplier: multipliers.map((_, index) => WeightedGame.getMultiplier(config, index)),
        formattedMultiplier: multipliers.map((_, index) =>
          WeightedGame.getFormattedMultiplier(config, index),
        ),
        netMultiplier: houseEdge
          ? multipliers.map((_, index) =>
              getNetMultiplier(WeightedGame.getMultiplier(config, index), houseEdge),
            )
          : undefined,
        formattedNetMultiplier: houseEdge
          ? multipliers.map((_, index) =>
              getFormattedNetMultiplier(WeightedGame.getMultiplier(config, index), houseEdge),
            )
          : undefined,
      };
    });
  }

  // Weighted game utilities
  static getWeightedGameConfigLabel(
    configId: WeightedGameConfigId,
    chainId: CasinoChainId,
    customWeightedGameConfigs?: WeightedGameConfiguration[],
  ): string {
    const existingCachedConfig = weightedGameCachedConfigurations[chainId].find(
      (c) => c.configId === configId,
    );
    const existingCustomConfig = customWeightedGameConfigs?.find((c) => c.configId === configId);
    return existingCachedConfig?.label ?? existingCustomConfig?.label ?? `Config #${configId}`;
  }

  /**
   * Computes and returns the list of unique outputs for a given weighted game configuration.
   * It is particularly useful to display all the unique possible outputs above/below the wheel in the UI.
   *
   * This function groups segments that have the same net multiplier (netMultiplier),
   * sums their weights, and returns for each unique multiplier:
   *   - the net multiplier (rounded to 2 decimals)
   *   - the raw multiplier (before house edge)
   *   - the chance to win this multiplier (as a percentage)
   *   - the color associated with this segment (or a randomly generated color if not provided)
   *
   * @param weightedGameConfig The configuration (weights, multipliers, colors, etc.)
   * @param houseEdge The house edge to apply for net multiplier calculation
   * @returns An array of objects representing each unique output:
   *   - multiplier: the raw multiplier (before house edge, BP)
   *   - formattedMultiplier: the raw multiplier formatted (rounded to 3 decimals)
   *   - netMultiplier: the net multiplier (after house edge, BP)
   *   - formattedNetMultiplier: the net multiplier formatted (rounded to 3 decimals)
   *   - chanceToWin: the probability of landing on this multiplier (in %)
   *   - color: the color associated with this segment
   *
   * @example
   * const outputs = Wheel.getUniqueOutputs(config, 200);
   * // [
   * //   { multiplier: 1.95, rawMultiplier: 19500, chanceToWin: 10.5, color: "#29384C" },
   * //   ...
   * // ]
   */
  static getUniqueOutputs(
    weightedGameConfig: WeightedGameConfiguration,
    houseEdge: BP,
  ): {
    multiplier: BP;
    formattedMultiplier: number;
    netMultiplier: BP;
    formattedNetMultiplier: number;
    chanceToWin: number;
    color: string;
  }[] {
    const uniqueMultipliers = new Map<number, { color: string; weight: bigint }>();
    const totalWeight = weightedGameConfig.weights.reduce((acc, curr) => acc + curr, 0n);
    weightedGameConfig.multipliers.forEach((_, index) => {
      const multiplier = WeightedGame.getMultiplier(weightedGameConfig, index);
      if (!uniqueMultipliers.has(multiplier)) {
        uniqueMultipliers.set(multiplier, {
          color: weightedGameConfig.colors?.[index] || generateRandomHexColor(),
          weight: weightedGameConfig.weights[index]!,
        });
      } else {
        uniqueMultipliers.get(multiplier)!.weight =
          uniqueMultipliers.get(multiplier)!.weight + weightedGameConfig.weights[index]!;
      }
    });

    return Array.from(uniqueMultipliers.entries())
      .map(([multiplier, config]) => ({
        multiplier: multiplier,
        formattedMultiplier: WeightedGame._formatMultiplier(multiplier),
        netMultiplier: getNetMultiplier(multiplier, houseEdge),
        formattedNetMultiplier: WeightedGame._formatMultiplier(
          getNetMultiplier(multiplier, houseEdge),
        ),
        chanceToWin: Number(((Number(config.weight) / Number(totalWeight)) * 100).toFixed(2)),
        color: config.color,
      }))
      .sort((a, b) => a.multiplier - b.multiplier);
  }
}
