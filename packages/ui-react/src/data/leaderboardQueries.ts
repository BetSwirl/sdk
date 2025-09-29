import {
  type CasinoChainId,
  fetchLeaderboard,
  fetchLeaderboards,
  getClaimableAmountFunctionData,
  LEADERBOARD_STATUS,
  LEADERBOARD_TYPE,
  type Leaderboard,
} from "@betswirl/sdk-core"
import type { Address, PublicClient } from "viem"

export type EnrichedLeaderboard = Leaderboard & {
  claimableAmount?: bigint
}

export interface LeaderboardQueryDeps {
  publicClient: PublicClient
  chainId: CasinoChainId
  address?: Address
  affiliate?: Address
  testMode: boolean
}

export interface FetchLeaderboardsParams extends LeaderboardQueryDeps {
  showPartner: boolean
}

export async function fetchAndEnrichLeaderboards({
  publicClient,
  chainId,
  address,
  affiliate,
  showPartner,
  testMode,
}: FetchLeaderboardsParams): Promise<EnrichedLeaderboard[]> {
  const result = await fetchLeaderboards(
    100,
    0,
    address,
    showPartner ? undefined : affiliate ? [affiliate] : undefined,
    chainId ? [chainId] : undefined,
    showPartner,
    "desc",
    undefined,
    testMode,
  )

  const casinoLeaderboards = result.leaderboards.filter((lb) => lb.type === LEADERBOARD_TYPE.CASINO)

  if (!address) {
    return casinoLeaderboards
  }

  const finalizedLeaderboards = casinoLeaderboards.filter(
    (lb) => lb.status === LEADERBOARD_STATUS.FINALIZED,
  )

  if (finalizedLeaderboards.length === 0) {
    return casinoLeaderboards
  }

  // Filter to only include leaderboards where the user is a winner
  const claimableLeaderboards = finalizedLeaderboards.filter((lb) => {
    const userRanking = lb.rankings?.find(
      (r) => r.bettorAddress.toLowerCase() === address.toLowerCase(),
    )
    return userRanking && lb.shares && userRanking.rank > 0 && userRanking.rank <= lb.shares.length
  })

  if (claimableLeaderboards.length === 0) {
    return casinoLeaderboards
  }

  const calls = claimableLeaderboards.map((lb) => {
    const functionData = getClaimableAmountFunctionData(
      address,
      lb.onChainId,
      chainId as CasinoChainId,
    )
    return {
      address: functionData.data.to as Address,
      abi: functionData.data.abi,
      functionName: functionData.data.functionName,
      args: functionData.data.args,
    }
  })

  const results = await publicClient.multicall({
    contracts: calls,
  })

  const enrichedLeaderboards: EnrichedLeaderboard[] = casinoLeaderboards.map((lb) => {
    const claimableIndex = claimableLeaderboards.findIndex(
      (claimableLb) => claimableLb.id === lb.id,
    )

    if (claimableIndex >= 0 && results[claimableIndex]?.status === "success") {
      return {
        ...lb,
        claimableAmount: results[claimableIndex].result as bigint,
      }
    }

    return lb
  })

  return enrichedLeaderboards
}

export async function fetchAndEnrichSingleLeaderboard(
  leaderboardId: string,
  deps: LeaderboardQueryDeps,
): Promise<EnrichedLeaderboard> {
  const { publicClient, chainId, address, testMode } = deps

  const leaderboard = await fetchLeaderboard(Number(leaderboardId), address, testMode)

  if (!leaderboard) {
    throw new Error(`Leaderboard ${leaderboardId} not found`)
  }

  if (!address || leaderboard.status !== LEADERBOARD_STATUS.FINALIZED) {
    return leaderboard
  }

  // Check if the user is a winner before fetching the claimable amount
  const userRanking = leaderboard.rankings?.find(
    (r) => r.bettorAddress.toLowerCase() === address.toLowerCase(),
  )

  const isWinner =
    userRanking &&
    leaderboard.shares &&
    userRanking.rank > 0 &&
    userRanking.rank <= leaderboard.shares.length

  if (!isWinner) {
    return leaderboard
  }

  try {
    const functionData = getClaimableAmountFunctionData(
      address,
      leaderboard.onChainId,
      chainId as CasinoChainId,
    )
    const claimableAmount = await publicClient.readContract({
      address: functionData.data.to as Address,
      abi: functionData.data.abi,
      functionName: functionData.data.functionName,
      args: functionData.data.args,
    })

    return {
      ...leaderboard,
      claimableAmount: claimableAmount as bigint,
    }
  } catch (error) {
    console.warn(`Failed to fetch claimable amount for leaderboard ${leaderboardId}:`, error)
    return leaderboard
  }
}

export interface FetchAllChainsLeaderboardsParams {
  publicClients: Map<CasinoChainId, PublicClient>
  supportedChains: CasinoChainId[]
  address?: Address
  getAffiliateForChain: (chainId: CasinoChainId) => Address
  showPartner: boolean
  testMode: boolean
}

/**
 * Fetches and enriches leaderboards from all supported chains
 * Uses Promise.allSettled to ensure that failure of one chain doesn't affect others
 * Results are aggregated and sorted by status and end date
 */
export async function fetchAndEnrichLeaderboardsForAllChains({
  publicClients,
  supportedChains,
  address,
  getAffiliateForChain,
  showPartner,
  testMode,
}: FetchAllChainsLeaderboardsParams): Promise<EnrichedLeaderboard[]> {
  const chainPromises = supportedChains.map(async (chainId) => {
    const publicClient = publicClients.get(chainId)
    if (!publicClient) {
      throw new Error(`Public client not found for chain ${chainId}`)
    }

    return fetchAndEnrichLeaderboards({
      publicClient,
      chainId,
      address,
      affiliate: getAffiliateForChain(chainId),
      showPartner,
      testMode,
    })
  })

  const results = await Promise.allSettled(chainPromises)

  const allLeaderboards: EnrichedLeaderboard[] = []

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      allLeaderboards.push(...result.value)
    } else {
      console.warn(
        `Failed to fetch leaderboards for chain ${supportedChains[index]}:`,
        result.reason,
      )
    }
  })

  return allLeaderboards.sort((a, b) => {
    const ongoingStatuses = [LEADERBOARD_STATUS.PENDING, LEADERBOARD_STATUS.NOT_STARTED]
    const aIsOngoing = ongoingStatuses.includes(a.status)
    const bIsOngoing = ongoingStatuses.includes(b.status)

    if (aIsOngoing && !bIsOngoing) return -1
    if (!aIsOngoing && bIsOngoing) return 1

    const aEndTime = new Date(a.endDate).getTime()
    const bEndTime = new Date(b.endDate).getTime()

    if (aIsOngoing) {
      return bEndTime - aEndTime
    }
    return aEndTime - bEndTime
  })
}
