import {
  BP,
  CASINO_GAME_TYPE,
  casinoChainById,
  chainById,
  chainNativeCurrencyToToken,
} from "@betswirl/sdk-core"
import React, { useEffect, useMemo, useState } from "react"
import { formatGwei, zeroAddress } from "viem"
import { useAccount } from "wagmi"
import { useBalanceRefresh, useBalances } from "../context/BalanceContext"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"
import { useFreebetsContext } from "../context/FreebetsContext"
import { useTokenContext } from "../context/tokenContext"
import { createFreebetStrategy, createPaidBetStrategy } from "../strategies/betStrategies"
import {
  BetStatus,
  GameChoice,
  GameDefinition,
  GameResult,
  HistoryEntry,
  Theme,
  TokenWithImage,
} from "../types/types"
import { useBetCalculations } from "./useBetCalculations"
import { useGameHistory } from "./useGameHistory"
import { useIsGamePaused } from "./useIsGamePaused"
import { useLeaderboardRefresher } from "./useLeaderboardRefresher"
import { usePlaceBet } from "./usePlaceBet"
import { useTokenAllowance } from "./useTokenAllowance"

interface UseGameLogicProps<T extends GameChoice> {
  gameDefinition?: GameDefinition<T>
  backgroundImage: string
}

interface UseGameLogicResult<T extends GameChoice = GameChoice> {
  isConfigurationLoading: boolean
  gameDefinition: GameDefinition<T> | undefined
  isWalletConnected: boolean
  address: string | undefined
  balance: bigint
  token: TokenWithImage
  areChainsSynced: boolean
  gameHistory: HistoryEntry[]
  refreshHistory: () => void
  refetchBalance: () => void
  betAmount: bigint | undefined
  setBetAmount: (amount: bigint | undefined) => void
  selection: T | undefined
  setSelection: (selection: T) => void
  betStatus: BetStatus
  gameResult: GameResult | null
  resetBetState: () => void
  vrfFees: bigint
  formattedVrfFees: number | string
  gasPrice: string
  targetPayoutAmount: bigint
  formattedNetMultiplier: number
  grossMultiplier: BP
  isInGameResultState: boolean
  isGamePaused: boolean
  nativeCurrencySymbol: string
  themeSettings: {
    theme: Theme
    customTheme?: {
      "--primary"?: string
      "--play-btn-font"?: string
      "--connect-btn-font"?: string
      "--game-window-overlay"?: string
    } & React.CSSProperties
    backgroundImage: string
  }
  handlePlayButtonClick: () => void
  handleBetAmountChange: (amount: bigint | undefined) => void
  placeBet: (betAmount: bigint, choice: T) => void
  needsTokenApproval: boolean
  isApprovePending: boolean
  isApproveConfirming: boolean
  approveToken: () => Promise<void>
  isRefetchingAllowance: boolean
  approveError: Error | null
}

/**
 * Centralizes casino game logic including bet placement, result tracking, and UI state.
 * Manages the complete game flow from selection to payout calculation.
 *
 * @param gameType - Type of casino game (coin toss or dice)
 * @param defaultSelection - Initial game selection
 * @param backgroundImage - Game background image URL
 * @returns Complete game state and control functions
 *
 * @example
 * ```ts
 * const gameLogic = useGameLogic({
 *   gameType: CASINO_GAME_TYPE.DICE,
 *   defaultSelection: 1,
 *   backgroundImage: '/assets/dice-bg.png'
 * })
 *
 * // Place bet when ready
 * gameLogic.handlePlayButtonClick()
 * ```
 */
export function useGameLogic<T extends GameChoice>({
  gameDefinition,
  backgroundImage,
}: UseGameLogicProps<T>): UseGameLogicResult<T> {
  const { isConnected: isWalletConnected, address } = useAccount()
  const { data: gameHistoryData, refetch: refreshHistory } = useGameHistory({
    gameType: gameDefinition?.gameType as CASINO_GAME_TYPE,
    filter: {},
  })
  const { areChainsSynced, appChainId } = useChain()
  const { selectedToken } = useTokenContext()
  const { getBalance, refetch: refetchBalance } = useBalances()
  const triggerBalanceRefresh = useBalanceRefresh()
  const { selectedFreebet, refetchFreebets, isUsingFreebet } = useFreebetsContext()

  const isReady = !!gameDefinition
  const isConfigurationLoading = !isReady

  const token: TokenWithImage = useMemo(() => {
    return (
      selectedToken || {
        ...chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency),
        image: "",
      }
    )
  }, [selectedToken, appChainId])

  const balance = getBalance(token.address) || 0n
  const { isPaused: isGamePaused } = useIsGamePaused({
    game: gameDefinition?.gameType as CASINO_GAME_TYPE,
    query: { enabled: isReady },
  })

  const [betAmount, setBetAmount] = useState<bigint | undefined>(undefined)
  const [selection, setSelection] = useState<T | undefined>(() => {
    return gameDefinition?.defaultSelection as T | undefined
  })

  React.useEffect(() => {
    if (gameDefinition?.defaultSelection) {
      setSelection(gameDefinition.defaultSelection as T)
    }
  }, [gameDefinition])

  const { getAffiliateForChain } = useBettingConfig()

  const betStrategy = useMemo(() => {
    if (!address) return undefined

    if (isUsingFreebet && selectedFreebet) {
      return createFreebetStrategy<T>({
        freebet: selectedFreebet,
        chainId: appChainId,
      })
    }

    return createPaidBetStrategy<T>({
      token,
      affiliate: getAffiliateForChain(appChainId),
      connectedAddress: address,
      chainId: appChainId,
    })
  }, [isUsingFreebet, selectedFreebet, token, getAffiliateForChain, address, appChainId])

  const {
    placeBet,
    betStatus,
    gameResult: rawGameResult,
    resetBetState,
    vrfFees,
    formattedVrfFees,
    gasPrice,
  } = usePlaceBet<T>(
    gameDefinition?.gameType,
    token,
    triggerBalanceRefresh,
    gameDefinition,
    betStrategy,
  )

  // Refetch freebets when a freebet is successfully used
  useEffect(() => {
    if (betStatus === "success" && isUsingFreebet) {
      refetchFreebets()
    }
  }, [betStatus, isUsingFreebet, refetchFreebets])

  const gameResult = useMemo((): GameResult | null => {
    if (!rawGameResult || !gameDefinition || !selection) {
      return null
    }

    const displayResult = gameDefinition.formatDisplayResult(rawGameResult.rolled, selection.choice)

    return {
      ...rawGameResult,
      formattedRolled: displayResult,
    }
  }, [rawGameResult, gameDefinition, selection])

  useLeaderboardRefresher(gameResult, appChainId)

  const gameContractAddress = gameDefinition
    ? casinoChainById[appChainId]?.contracts.games[gameDefinition.gameType]?.address
    : undefined

  const {
    needsApproval: needsTokenApproval,
    approveWriteWagmiHook,
    approveWaitingWagmiHook,
    allowanceReadWagmiHook,
    approve: approveToken,
    resetApprovalState,
  } = useTokenAllowance({
    token,
    spender: gameContractAddress || zeroAddress,
    amount: betAmount || 0n,
    enabled: !!gameContractAddress && !!betAmount && betAmount > 0n,
  })

  const { netPayout, formattedNetMultiplier, grossMultiplier } = useBetCalculations({
    selection: selection || ({} as T),
    betAmount,
    betCount: 1,
    gameDefinition,
    token, // Pass the centralized effective token
  })

  const isInGameResultState = !!gameResult
  const nativeCurrencySymbol = chainById[appChainId].nativeCurrency.symbol

  const themeSettings = {
    theme: "system" as const,
    customTheme: undefined,
    backgroundImage,
  }

  const handlePlayButtonClick = async () => {
    // Don't allow play if we're in loading state or selection is not available
    if (!gameDefinition || !selection) return

    if (selectedFreebet && isUsingFreebet) {
      if (betStatus === "error") {
        resetBetState()
        if (isWalletConnected) {
          placeBet(selectedFreebet.amount, selection)
        }
      } else if (isInGameResultState) {
        resetBetState()
      } else if (isWalletConnected) {
        placeBet(selectedFreebet.amount, selection)
      }
      return
    }

    // Reset approval error if there is one
    if (approveWriteWagmiHook.error) {
      resetApprovalState()
      // Try approval again
      if (needsTokenApproval) {
        await approveToken()
      }
      return
    }

    if (betStatus === "error") {
      resetBetState()
      if (isWalletConnected && betAmount && betAmount > 0n) {
        if (needsTokenApproval) {
          await approveToken()
        } else {
          placeBet(betAmount, selection)
        }
      }
    } else if (isInGameResultState) {
      resetBetState()
    } else if (isWalletConnected && betAmount && betAmount > 0n) {
      if (needsTokenApproval) {
        await approveToken()
      } else {
        placeBet(betAmount, selection)
      }
    }
  }

  const handleBetAmountChange = (amount: bigint | undefined) => {
    setBetAmount(amount)
    // Reset error state when user changes bet amount
    if (betStatus === "error" || betStatus === "waiting-error" || betStatus === "internal-error") {
      resetBetState()
    }
  }

  return {
    isConfigurationLoading,
    gameDefinition,
    isWalletConnected,
    address,
    balance,
    token,
    areChainsSynced,
    gameHistory: gameHistoryData?.gameHistory ?? [],
    refreshHistory,
    refetchBalance,
    betAmount,
    setBetAmount,
    selection: selection || undefined,
    setSelection: setSelection,
    betStatus,
    gameResult,
    resetBetState,
    vrfFees,
    formattedVrfFees,
    gasPrice: formatGwei(gasPrice),
    targetPayoutAmount: netPayout,
    formattedNetMultiplier: formattedNetMultiplier,
    grossMultiplier,
    isInGameResultState,
    isGamePaused,
    nativeCurrencySymbol,
    themeSettings,
    handlePlayButtonClick,
    handleBetAmountChange,
    placeBet,
    needsTokenApproval,
    isApprovePending: approveWriteWagmiHook.isPending,
    isApproveConfirming: approveWaitingWagmiHook.isLoading,
    approveToken,
    isRefetchingAllowance: allowanceReadWagmiHook.isRefetching,
    approveError: approveWriteWagmiHook.error || approveWaitingWagmiHook.error,
  }
}
