import {
  BetSwirlWallet,
  CASINO_GAME_TYPE,
  CasinoChainId,
  casinoChainById,
  getPlaceBetEventData,
  getPlacedBetFromReceipt,
  getRollEventData,
} from "@betswirl/sdk-core"
import { useCallback, useEffect, useMemo, useState } from "react"
import { decodeEventLog, Hex } from "viem"
import { useAccount, usePublicClient, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { useChain } from "../context/chainContext"
import { createLogger } from "../lib/logger"
import { IBetStrategy } from "../types/betStrategy"
import { BetStatus, GameChoice, GameDefinition, GameResult, TokenWithImage } from "../types/types"
import type { WatchTarget } from "./types"
import { useBetResultWatcher } from "./useBetResultWatcher"
import { useEstimateVRFFees } from "./useEstimateVRFFees"

const logger = createLogger("usePlaceBet")

export interface IUsePlaceBetReturn<T extends GameChoice = GameChoice> {
  placeBet: (betAmount: bigint, choice: T) => Promise<void>
  betStatus: BetStatus
  isWaiting: boolean
  isError: unknown
  gameResult: GameResult | null
  resetBetState: () => void
  vrfFees: bigint
  gasPrice: bigint
  formattedVrfFees: number
  wagerWriteHook: ReturnType<typeof useWriteContract>
  wagerWaitingHook: ReturnType<typeof useWaitForTransactionReceipt>
}

/**
 * Handles the complete bet placement flow from transaction to result.
 * Manages transaction submission, VRF fee estimation, and result monitoring.
 *
 * @internal This is a low-level hook used internally by useGameLogic.
 * For most use cases, use useGameLogic instead which handles strategy creation automatically.
 *
 * @param game - Type of casino game being played
 * @param token - Token being used for the bet (for display and balance purposes)
 * @param refetchBalance - Callback to refresh user balance after bet
 * @param gameDefinition - Game-specific configuration and encoding logic
 * @param strategy - Strategy object that handles bet transaction preparation
 * @returns Bet placement functions and state including status, VRF fees, and results
 *
 * @example
 * ```ts
 * // This hook is used internally by useGameLogic
 * // For typical usage, see useGameLogic documentation
 *
 * const betStrategy = useMemo(() => {
 *   if (!address) return undefined
 *
 *   return createPaidBetStrategy({
 *     token,
 *     affiliate: getAffiliateForChain(chainId),
 *     connectedAddress: address,
 *     chainId
 *   })
 * }, [token, address, chainId])
 *
 * const { placeBet, betStatus, gameResult } = usePlaceBet(
 *   CASINO_GAME_TYPE.DICE,
 *   token,
 *   refetchBalance,
 *   gameDefinition,
 *   betStrategy
 * )
 *
 * await placeBet(parseEther('0.1'), 3)
 *
 * if (betStatus === 'success') {
 *   console.log('You', gameResult.isWin ? 'won' : 'lost')
 * }
 * ```
 */
export function usePlaceBet<T extends GameChoice = GameChoice>(
  game: CASINO_GAME_TYPE | undefined,
  token: TokenWithImage | undefined,
  refetchBalance: () => void,
  gameDefinition?: GameDefinition<T>,
  strategy?: IBetStrategy<T>,
): IUsePlaceBetReturn<T> {
  const { appChainId } = useChain()
  const publicClient = usePublicClient({ chainId: appChainId })
  const { address: connectedAddress } = useAccount()
  const wagerWriteHook = useWriteContract()

  const wagerWaitingHook = useWaitForTransactionReceipt({
    hash: wagerWriteHook.data,
    chainId: appChainId,
  })
  const {
    vrfFees,
    wagmiHook: estimateVrfFeesWagmiHook,
    formattedVrfFees,
    gasPrice,
    getVrfFeesAndGasPrice,
  } = useEstimateVRFFees({
    game,
    token,
    betCount: 1, // TODO make this number dynamic when multi betting is integrated
  })
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [watchTarget, setWatchTarget] = useState<WatchTarget | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [currentBetAmount, setCurrentBetAmount] = useState<bigint | null>(null)
  // @Kinco advice. The goal is to never have an internal error. In the main frontend, it never happens due to retry system, etc (or maybe 1/100000)
  const [internalError, setInternalError] = useState<string | null>(null)

  const betStatus: BetStatus = useMemo(() => {
    if (internalError) return "internal-error"
    if (wagerWriteHook.error) return "error"
    if (wagerWaitingHook.error) return "waiting-error"
    if (wagerWriteHook.isPending) return "pending"
    if (wagerWaitingHook.isLoading) return "loading"
    if (isRolling) return "rolling"
    if (gameResult) return "success"
    return null
  }, [
    internalError,
    wagerWriteHook.error,
    wagerWaitingHook.error,
    wagerWriteHook.isPending,
    wagerWaitingHook.isLoading,
    isRolling,
    gameResult,
  ])

  const isWaiting = useMemo(() => {
    return wagerWaitingHook.isLoading || wagerWaitingHook.isPending || isRolling
  }, [wagerWaitingHook.isLoading, wagerWaitingHook.isPending, isRolling])

  const isError = useMemo(() => {
    return wagerWriteHook.error || wagerWaitingHook.error || internalError
  }, [wagerWriteHook.error, wagerWaitingHook.error, internalError])

  const {
    gameResult: watcherGameResult,
    status: watcherStatus,
    reset: resetWatcher,
  } = useBetResultWatcher({
    watchParams: watchTarget,
    publicClient,
    enabled: !!watchTarget,
  })

  useEffect(() => {
    if (watcherStatus === "success" && watcherGameResult) {
      setGameResult(watcherGameResult)
      setIsRolling(false)
      logger.debug("watcher: Bet resolved: SUCCESS", {
        gameResult: watcherGameResult,
      })

      refetchBalance()
    } else if (watcherStatus === "error") {
      setInternalError("watcher error")
      logger.debug("watcher: Bet resolved: ERROR from watcher")
    } else if (watcherStatus === "timeout") {
      setIsRolling(false)
      setInternalError("Result timeout - please check transaction history")
      logger.debug("watcher: Bet resolved: TIMEOUT - exceeded maximum wait time")
    }
  }, [watcherStatus, watcherGameResult, refetchBalance])

  const resetBetState = useCallback(() => {
    wagerWriteHook.reset()
    setGameResult(null)
    setWatchTarget(null)
    setCurrentBetAmount(null)
    setInternalError(null)
    setIsRolling(false)
    resetWatcher()
  }, [resetWatcher, wagerWriteHook.reset])

  const placeBet = useCallback(
    async (betAmount: bigint, choice: T) => {
      if (!gameDefinition || !game) {
        logger.error("placeBet: Game definition is not loaded yet")
        setInternalError("Game configuration is not loaded")
        return
      }

      if (!publicClient || !appChainId || !connectedAddress || !wagerWriteHook.writeContract) {
        logger.error("placeBet: Wagmi/OnchainKit clients or address are not initialized.")
        setInternalError("clients or address are not initialized")
        return
      }

      if (!token) {
        logger.error("placeBet: token is required for bets")
        setInternalError("token is required")
        return
      }

      if (!strategy) {
        logger.error("placeBet: betting strategy is required")
        setInternalError("betting strategy is required")
        return
      }

      resetBetState()

      const { vrfFees: freshVrfFees, gasPrice: freshGasPrice } = await getVrfFeesAndGasPrice()

      logger.debug("placeBet: VRF cost refetched:", freshVrfFees)
      logger.debug("placeBet: gasPrice refetched:", freshGasPrice)

      setCurrentBetAmount(betAmount)

      try {
        logger.debug("placeBet: Starting bet process using strategy")

        const wagerWriteParams = await strategy.prepare({
          betAmount,
          choice,
          vrfFees: freshVrfFees,
          gasPrice: freshGasPrice,
          chainId: appChainId,
          gameDefinition,
          game,
        })

        logger.debug("placeBet: Submitting transaction", wagerWriteParams)
        wagerWriteHook.writeContract(wagerWriteParams)
      } catch (error) {
        logger.error("placeBet: Error preparing transaction", error)
        setInternalError(`Transaction preparation failed: ${error}`)
      }
    },
    [
      game,
      resetBetState,
      publicClient,
      appChainId,
      connectedAddress,
      wagerWriteHook.writeContract,
      estimateVrfFeesWagmiHook.refetch,
      formattedVrfFees,
      vrfFees,
      gasPrice,
      token,
      gameDefinition,
      strategy,
    ],
  )

  useEffect(() => {
    if (wagerWriteHook.error) {
      logger.debug("_usePlaceBet: An error occurred in wager write:", wagerWriteHook.error)
    }
  }, [wagerWriteHook.error])

  useEffect(() => {
    if (wagerWaitingHook.error) {
      logger.debug("_usePlaceBet: An error occurred in wager waiting:", wagerWaitingHook.error)
    }
  }, [wagerWaitingHook.error])

  useEffect(() => {
    if (wagerWaitingHook.isSuccess && game) {
      setIsRolling(true)
      const handleBetResult = async () => {
        const betId = await _extractBetIdFromReceipt(
          wagerWriteHook.data!,
          game,
          appChainId,
          connectedAddress!,
          publicClient,
        )

        if (!betId) {
          logger.error(
            "placeBet: Bet ID was not extracted. Roll event listener will not be started.",
          )
          setInternalError("bet id not found")
          return
        }

        const placedBet = await getPlacedBetFromReceipt(
          { publicClient } as unknown as BetSwirlWallet,
          wagerWaitingHook.data!,
          game,
          appChainId,
          token,
        )

        if (!placedBet) {
          logger.error("placeBet: PlacedBet could not be extracted from receipt.")
          setInternalError("placed bet not found")
          return
        }

        const { data: rollEventData } = getRollEventData(game, appChainId, betId)
        logger.debug("placeBet: Setting up Roll event listener...")
        setWatchTarget({
          betId,
          contractAddress: casinoChainById[appChainId].contracts.games[game]!.address,
          gameType: game,
          eventAbi: rollEventData.abi,
          eventName: rollEventData.eventName,
          eventArgs: rollEventData.args,
          betAmount: currentBetAmount!,
          placedBet,
          transactionBlockNumber: wagerWaitingHook.data!.blockNumber,
        })

        refetchBalance()
      }
      handleBetResult()
    }
  }, [
    wagerWaitingHook.isSuccess,
    wagerWaitingHook.data,
    wagerWriteHook.data,
    game,
    appChainId,
    connectedAddress,
    publicClient,
    refetchBalance,
    currentBetAmount,
    token,
  ])

  return {
    placeBet,
    betStatus,
    isWaiting,
    isError,
    gameResult,
    resetBetState,
    vrfFees,
    gasPrice,
    formattedVrfFees,
    wagerWriteHook,
    wagerWaitingHook,
  }
}

// @Kinco advice. Create a retry system
async function _extractBetIdFromReceipt(
  txHash: Hex,
  gameType: CASINO_GAME_TYPE,
  chainId: CasinoChainId,
  receiver: Hex,
  publicClient: ReturnType<typeof usePublicClient>,
): Promise<bigint | null> {
  if (!publicClient) {
    logger.error("_extractBetIdFromReceipt: publicClient is undefined")
    throw new Error("publicClient is undefined")
  }
  logger.debug("_extractBetIdFromReceipt: Waiting for receipt for", txHash)
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
  logger.debug("_extractBetIdFromReceipt: Receipt received.")

  const { data: placeBetEventData } = getPlaceBetEventData(gameType, chainId, receiver)

  for (const log of receipt.logs) {
    if (
      log.address.toLowerCase() !==
      casinoChainById[chainId].contracts.games[gameType]?.address.toLowerCase()
    )
      continue
    const decodedLog = decodeEventLog({
      abi: placeBetEventData.abi,
      data: log.data,
      topics: log.topics,
      strict: false,
    })
    if (decodedLog.eventName === placeBetEventData.eventName) {
      return (decodedLog.args as unknown as { id: bigint }).id
    }
  }
  logger.error("_extractBetIdFromReceipt: Bet ID not found in receipt.")
  return null
}
