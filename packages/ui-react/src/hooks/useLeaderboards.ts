import { LEADERBOARD_STATUS } from "@betswirl/sdk-core"
import { useQuery } from "@tanstack/react-query"
import { createPublicClient, http } from "viem"
import { useAccount } from "wagmi"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"
import {
  type EnrichedLeaderboard,
  fetchAndEnrichLeaderboardsForAllChains,
} from "../data/leaderboardQueries"
import { type LeaderboardItemWithEnriched } from "../types/types"
import { mapLeaderboardToItem } from "../utils/leaderboardUtils"

interface UseLeaderboardsResult {
  ongoingLeaderboards: LeaderboardItemWithEnriched[]
  endedLeaderboards: LeaderboardItemWithEnriched[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch and manage leaderboards data from all supported chains
 * Uses TanStack Query for caching and automatic refetching
 * This hook serves as the Single Source of Truth (SSoT) for all leaderboards data
 * @param showPartner - Whether to show partner leaderboards
 */
// TODO: This hook will be moved to the React SDK in the future and needs to be refactored
// to accept additional parameters like chainId, statuses, etc. for better flexibility
// instead of relying only on the current use case parameters
export function useLeaderboards(showPartner: boolean): UseLeaderboardsResult {
  const { availableChains } = useChain()
  const { getAffiliateForChain, testMode } = useBettingConfig()
  const { address } = useAccount()

  // Get supported chain IDs from available chains
  const supportedChains = availableChains.map((chain) => chain.id)

  const {
    data: enrichedLeaderboards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["leaderboards", "all-chains", address, showPartner],
    queryFn: async (): Promise<EnrichedLeaderboard[]> => {
      const publicClients = new Map()

      for (const chain of availableChains) {
        const publicClient = createPublicClient({
          chain: chain.viemChain,
          transport: http(),
        })
        publicClients.set(chain.id, publicClient)
      }

      return fetchAndEnrichLeaderboardsForAllChains({
        publicClients,
        supportedChains,
        address,
        getAffiliateForChain,
        showPartner,
        testMode,
      })
    },
    refetchInterval: 30000,
    enabled: supportedChains.length > 0,
  })

  if (!enrichedLeaderboards) {
    return {
      ongoingLeaderboards: [],
      endedLeaderboards: [],
      isLoading,
      error: error as Error | null,
    }
  }

  const itemsWithEnriched = enrichedLeaderboards.map(
    (enriched): LeaderboardItemWithEnriched => ({
      item: mapLeaderboardToItem(enriched, address, {
        claimableAmount: enriched.claimableAmount,
      }),
      enriched,
    }),
  )

  const ongoingLeaderboards = itemsWithEnriched.filter((item) =>
    [LEADERBOARD_STATUS.PENDING, LEADERBOARD_STATUS.NOT_STARTED].includes(item.item.status),
  )
  const endedLeaderboards = itemsWithEnriched.filter((item) =>
    [LEADERBOARD_STATUS.ENDED, LEADERBOARD_STATUS.FINALIZED, LEADERBOARD_STATUS.EXPIRED].includes(
      item.item.status,
    ),
  )

  return {
    ongoingLeaderboards,
    endedLeaderboards,
    isLoading,
    error: error as Error | null,
  }
}
