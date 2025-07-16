import { CASINO_GAME_TYPE, getAffiliateHouseEdgeFunctionData, Token } from "@betswirl/sdk-core"
import { useMemo } from "react"
import { useReadContract } from "wagmi"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"

type UseHouseEdgeProps = {
  game: CASINO_GAME_TYPE
  token: Token
  query?: { enabled?: boolean }
}

/**
 * Fetches the house edge for a specific game and token.
 * House edge is the casino's mathematical advantage over players (e.g., 100 = 1%).
 *
 * @param props.game - Type of casino game
 * @param props.token - Token used for betting
 * @returns House edge in basis points and as percentage
 * @returns houseEdge - Raw value in basis points (100 = 1%)
 * @returns houseEdgePercent - Percentage value (1 = 1%)
 *
 * @example
 * ```ts
 * const { houseEdge, houseEdgePercent } = useHouseEdge({
 *   game: CASINO_GAME_TYPE.COINTOSS,
 *   token: ethToken
 * })
 * // houseEdge: 100n (basis points)
 * // houseEdgePercent: 1 (percent)
 * ```
 */
export function useHouseEdge(props: UseHouseEdgeProps) {
  const { appChainId } = useChain()
  const { affiliate } = useBettingConfig()
  const isEnabled = props.query?.enabled ?? true

  const functionData = useMemo(() => {
    if (!isEnabled || !props.game) {
      return null
    }
    return getAffiliateHouseEdgeFunctionData(props.game, props.token.address, affiliate, appChainId)
  }, [props.game, props.token.address, affiliate, appChainId, isEnabled])

  const wagmiHook = useReadContract({
    abi: functionData?.data.abi || [],
    address: functionData?.data.to,
    functionName: functionData?.data.functionName || "getAffiliateHouseEdge",
    args: functionData?.data.args,
    chainId: appChainId,
    query: {
      enabled: isEnabled && !!functionData,
    },
  })

  const houseEdge = wagmiHook.data ?? 0

  const houseEdgePercent = useMemo(() => {
    return houseEdge / 100
  }, [houseEdge])

  return {
    wagmiHook,
    houseEdge,
    houseEdgePercent,
  }
}
