import { CASINO_GAME_TYPE, getPayoutDetails } from "@betswirl/sdk-core"
import { useMemo } from "react"
import { useTokenContext } from "../context/tokenContext"
import { GameChoice, GameDefinition } from "../types/types"
import { useHouseEdge } from "./useHouseEdge"

interface UseBetCalculationsProps<T extends GameChoice> {
  selection: T
  betAmount: bigint | undefined
  betCount: number | undefined
  gameDefinition: GameDefinition<T> | undefined
}

interface UseBetCalculationsResult {
  totalBetAmount: bigint
  grossMultiplier: number
  netMultiplier: number
  grossPayout: bigint
  netPayout: bigint
  betSwirlFees: bigint
  formattedNetMultiplier: number
}

/**
 * Calculates payout amounts and multipliers for a bet on a casino game.
 * House edge represents the mathematical advantage the casino has over players.
 *
 * @param gameType - Type of casino game being played
 * @param selection - Player's choice (coin face or dice number)
 * @param houseEdge - Casino's edge in basis points (e.g., 100 = 1%)
 * @param betAmount - Amount wagered by the player
 * @param betCount - Number of bets to be placed
 * @returns Payout calculations including multipliers and target payout
 *
 * @example
 * ```ts
 * const { targetPayoutAmount, multiplier } = useBetCalculations({
 *   gameType: CASINO_GAME_TYPE.COINTOSS,
 *   selection: COINTOSS_FACE.HEADS,
 *   houseEdge: 100, // 1% house edge
 *   betAmount: parseEther('1')
 * })
 * ```
 */
export function useBetCalculations<T extends GameChoice>({
  selection,
  betAmount,
  betCount = 1,
  gameDefinition,
}: UseBetCalculationsProps<T>): UseBetCalculationsResult {
  const { selectedToken: token } = useTokenContext()
  const { houseEdge } = useHouseEdge({
    game: gameDefinition?.gameType as CASINO_GAME_TYPE,
    token,
  })

  const grossMultiplier = useMemo(() => {
    if (!gameDefinition || !selection) return 0
    return gameDefinition.getMultiplier(selection.choice)
  }, [selection, gameDefinition])

  const totalBetAmount = useMemo(
    () => (betAmount && betAmount > 0n ? betAmount * BigInt(betCount) : 0n),
    [betAmount, betCount],
  )

  const { grossPayout, netPayout, betSwirlFees, netMultiplier, formattedNetMultiplier } =
    getPayoutDetails(betAmount ?? 0n, betCount, grossMultiplier, houseEdge)

  return {
    totalBetAmount,
    grossMultiplier,
    netMultiplier,
    grossPayout,
    netPayout,
    betSwirlFees,
    formattedNetMultiplier,
  }
}
