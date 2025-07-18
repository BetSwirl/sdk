import {
  Bet_OrderBy,
  CASINO_GAME_TYPE,
  CasinoBet,
  CasinoBetFilterStatus,
  CasinoChainId,
  FORMAT_TYPE,
  fetchBets,
  formatAmount,
  formatRawAmount,
  OrderDirection,
  Token,
} from "@betswirl/sdk-core"
import { type UseQueryResult, useQuery } from "@tanstack/react-query"
import React from "react"
import { Address } from "viem"
import { useAccount } from "wagmi"
import { TokenIcon } from "../components/ui/TokenIcon"
import { useTokenContext } from "../context/tokenContext"
import { createLogger } from "../lib/logger"
import { toLowerCase } from "../lib/utils"
import { HistoryEntryStatus, QueryParameter, TokenWithImage } from "../types/types"

const logger = createLogger("useGameHistory")

function formatRelativeTime(timestampSecs: number): string {
  const now = new Date()
  const then = new Date(timestampSecs * 1000)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 0) return "in the future"
  if (diffInSeconds < 5) return "just now"
  if (diffInSeconds < 60) return `~${diffInSeconds}s ago`

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `~${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `~${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  return `~${diffInDays}d ago`
}

export type GameHistoryEntry = {
  id: string
  status: HistoryEntryStatus
  multiplier: string
  payoutAmount: string
  payoutCurrencyIcon: React.ReactElement
  timestamp: string
}

export type UseGameHistoryProps = {
  gameType: CASINO_GAME_TYPE
  filter: {
    userChainId?: CasinoChainId
    userAddress?: Address
    token?: Token
    status?: CasinoBetFilterStatus
  }
  offset?: number
  limit?: number
  query?: QueryParameter<{
    gameHistory: GameHistoryEntry[]
    rawBets: CasinoBet[]
  }>
}

export type UseGameHistory = (props: UseGameHistoryProps) => UseQueryResult<{
  gameHistory: GameHistoryEntry[]
  rawBets: CasinoBet[]
}>

export const useGameHistory: UseGameHistory = ({ gameType, filter, offset, limit, query = {} }) => {
  const { address: activeAddress, chainId: activeChainId } = useAccount()
  // Get all tokens, not just the active ones
  const { allTokens: tokens } = useTokenContext()
  const address = filter.userAddress || activeAddress
  const chainId = filter.userChainId || activeChainId
  // I think affiliate should be accesible from a React context
  //const affiliate = import.meta.env.VITE_AFFILIATE_ADDRESS as Address

  return useQuery({
    queryKey: [
      "game-history",
      gameType,
      chainId,
      address?.toLowerCase(),
      filter.token,
      filter.status,
      offset,
      limit,
    ],
    queryFn: async () => {
      if (!address || !chainId) {
        return { gameHistory: [], rawBets: [] }
      }

      const result = await fetchBets(
        { chainId: chainId as CasinoChainId },
        {
          bettor: toLowerCase(address),
          game: gameType,
          token: filter.token,
          status: filter.status,
          //affiliates: [affiliate], To uncomment when we have a way to get the affiliate address from the context
        },
        offset,
        limit,
        { key: Bet_OrderBy.BetTimestamp, order: OrderDirection.Desc },
      )

      if (result.error) {
        throw result.error
      }

      logger.info("Raw bets fetched", { count: result.bets.length })

      const gameHistory = result.bets.map((bet: CasinoBet) => {
        const matchingToken = tokens.find(
          (token) => token.symbol === bet.token.symbol && token.address === bet.token.address,
        )

        const tokenWithImage: TokenWithImage = matchingToken || {
          ...bet.token,
          // Use BetSwirl's token image URL pattern as fallback
          image: `https://www.betswirl.com/img/tokens/${bet.token.symbol.toUpperCase()}.svg`,
        }

        return {
          id: bet.id.toString(),
          status: bet.isWin ? HistoryEntryStatus.WonBet : HistoryEntryStatus.Busted,
          multiplier: formatAmount(bet.formattedPayoutMultiplier, FORMAT_TYPE.MINIFY),
          payoutAmount: formatRawAmount(bet.payout, bet.token.decimals, FORMAT_TYPE.MINIFY),
          payoutCurrencyIcon: React.createElement(TokenIcon, {
            token: tokenWithImage,
            size: 18,
          }),
          timestamp: formatRelativeTime(Number(bet.rollTimestampSecs)),
        }
      })

      return { gameHistory, rawBets: result.bets }
    },
    refetchOnWindowFocus: false,
    ...query,
  })
}
