import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useAccount, usePublicClient } from "wagmi"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"
import {
  type EnrichedLeaderboard,
  fetchAndEnrichSingleLeaderboard,
} from "../data/leaderboardQueries"
import { type LeaderboardOverviewData } from "../types/types"
import { mapLeaderboardToOverviewData } from "../utils/leaderboardUtils"

/**
 * Hook to fetch detailed leaderboard data including user stats and rules
 * Uses TanStack Query for caching and automatic refetching
 */
export function useLeaderboardDetails(leaderboardId: string | null): {
  data: { overview: LeaderboardOverviewData; enriched: EnrichedLeaderboard } | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
} {
  const { appChainId } = useChain()
  const { getAffiliateForChain, testMode } = useBettingConfig()
  const { address } = useAccount()
  const publicClient = usePublicClient({ chainId: appChainId })

  const {
    data: enrichedLeaderboard,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["leaderboard-details", leaderboardId, appChainId, address],
    queryFn: async (): Promise<EnrichedLeaderboard | null> => {
      if (!leaderboardId || !publicClient) {
        return null
      }

      const fetchedLeaderboard = await fetchAndEnrichSingleLeaderboard(leaderboardId, {
        publicClient,
        chainId: appChainId,
        address,
        affiliate: getAffiliateForChain(appChainId),
        testMode,
      })

      return fetchedLeaderboard
    },
    enabled: !!leaderboardId && !!publicClient,
    refetchInterval: 30000,
  })

  const combinedData = useMemo(() => {
    return enrichedLeaderboard
      ? {
          overview: mapLeaderboardToOverviewData(enrichedLeaderboard, address, {
            claimableAmount: enrichedLeaderboard.claimableAmount,
          }),
          enriched: enrichedLeaderboard,
        }
      : null
  }, [enrichedLeaderboard, address])

  return {
    data: combinedData,
    isLoading,
    error: error as Error | null,
    refetch,
  }
}
