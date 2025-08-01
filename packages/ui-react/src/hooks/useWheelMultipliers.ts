import { WeightedGame, WeightedGameConfiguration } from "@betswirl/sdk-core"
import { useMemo } from "react"

/**
 * Hook to calculate unique multipliers for the Wheel game using SDK's getUniqueOutputs
 * This should be used by parent components to prepare data for WheelGameControls
 *
 * @param config - The weighted game configuration
 * @param houseEdge - The house edge in basis points (e.g., 100 = 1%)
 * @returns Array of unique multipliers formatted for UI display
 *
 * @example
 * ```tsx
 * const uniqueMultipliers = useWheelMultipliers(wheelConfig, houseEdge)
 *
 * <WheelGameControls
 *   config={wheelConfig}
 *   uniqueMultipliers={uniqueMultipliers}
 *   // ... other props
 * />
 * ```
 */
export function useWheelMultipliers(
  config: WeightedGameConfiguration | undefined,
  houseEdge: number,
) {
  return useMemo(() => {
    if (!config) return []

    const outputs = WeightedGame.getUniqueOutputs(config, houseEdge)

    return outputs.map((output) => ({
      multiplier: output.multiplier,
      formattedMultiplier: `${output.formattedMultiplier.toFixed(2)}x`,
      color: output.color,
    }))
  }, [config, houseEdge])
}
