import {
  CASINO_GAME_TYPE,
  COINTOSS_FACE,
  CasinoChainId,
  CoinToss,
  GenericCasinoBetParams,
  casinoChainById,
  chainById,
  chainNativeCurrencyToToken,
  getPlaceBetEventData,
  getPlaceBetFunctionData,
  getRollEventData,
} from "@betswirl/sdk-core"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Hex, decodeEventLog } from "viem"
import { useAccount, usePublicClient, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { createLogger } from "../lib/logger"
import type { WatchTarget } from "./types"
import { useBetResultWatcher } from "./useBetResultWatcher"
import { useChain } from "../context/chainContext"
import { useEstimateVRFFees } from "./useEstimateVRFFees"
import { BetStatus, GameResult } from "../types"

const logger = createLogger("usePlaceBet")


export function usePlaceBet(game: CASINO_GAME_TYPE) {
  const { appChainId } = useChain()
  const publicClient = usePublicClient({ chainId: appChainId })
  const { address: connectedAddress } = useAccount()
  const wagerWriteHook = useWriteContract();

  const wagerWaitingHook = useWaitForTransactionReceipt({
    hash: wagerWriteHook.data,
    chainId: appChainId,
  });
  const { vrfFees, wagmiHook: estimateVrfFeesWagmiHook, formattedVrfFees, gasPrice } = useEstimateVRFFees({
    game: CASINO_GAME_TYPE.COINTOSS,
    token: chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency), // TODO make this token dynamic when the token list is integrated
    betCount: 1, // TODO make this number dynamic when multi betting is integrated
  })
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [watchTarget, setWatchTarget] = useState<WatchTarget | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  // @Kinco advice. The goal is to never have an internal error. In the main frontend, it never happens due to retry system, etc (or maybe 1/100000)
  const [internalError, setInternalError] = useState<string | null>(null)

  const betStatus: BetStatus = useMemo(() => {
    if (internalError) return "internal-error"
    else if (wagerWriteHook.error) return "error"
    else if (wagerWaitingHook.error) return "waiting-error"
    else if (wagerWriteHook.isPending) return "pending"
    else if (wagerWaitingHook.isLoading) return "loading"
    else if (isRolling) return "rolling"
    else if (gameResult) return "success"
    return null
  }, [internalError, wagerWriteHook.error, wagerWaitingHook.error, wagerWriteHook.isPending, wagerWaitingHook.isLoading, isRolling, gameResult])

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
    } else if (watcherStatus === "error") {
      setInternalError("watcher error")
      logger.debug("watcher: Bet resolved: ERROR from watcher")
    }
  }, [watcherStatus, watcherGameResult])

  const placeBet = useCallback(
    async (betAmount: bigint, choice: COINTOSS_FACE) => {
      resetBetState()


      const betParams = {
        game,
        gameEncodedInput: CoinToss.encodeInput(choice),
        betAmount,
      }

      if (!publicClient || !appChainId || !connectedAddress || !wagerWriteHook.writeContract) {
        logger.error("placeBet: Wagmi/OnchainKit clients or address are not initialized.")
        setInternalError("clients or address are not initialized")
        return
      }
      logger.debug("placeBet: Starting bet process:", {
        betParams,
        connectedAddress,
      })

      await estimateVrfFeesWagmiHook.refetch()

      logger.debug("placeBet: VRF cost refetched:", formattedVrfFees)


      _submitBetTransaction(
        betParams,
        connectedAddress,
        vrfFees,
        gasPrice,
        appChainId,
        wagerWriteHook.writeContract
      )
    },
    [
      publicClient,
      appChainId,
      connectedAddress,
      wagerWriteHook.writeContract,
      wagerWriteHook.reset,
      resetWatcher,
      vrfFees
    ],
  )

  useEffect(() => {
    if (wagerWriteHook.error) {
      logger.debug("_usePlaceBet: An error occured:", wagerWriteHook.error)
    }
  }, [wagerWriteHook.error])

  useEffect(() => {
    if (wagerWaitingHook.error) {
      logger.debug("_usePlaceBet: An error occured:", wagerWaitingHook.error)
    }
  }, [wagerWaitingHook.error])

  useEffect(() => {
    if (wagerWaitingHook.isSuccess) {
      setIsRolling(true)
      const waitRoll = async () => {
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

        const { data: rollEventData } = getRollEventData(game, appChainId, betId)
        logger.debug("placeBet: Setting up Roll event listener...")
        setWatchTarget({
          betId,
          contractAddress: casinoChainById[appChainId].contracts.games[game]!.address,
          gameType: game,
          eventAbi: rollEventData.abi,
          eventName: rollEventData.eventName,
          eventArgs: rollEventData.args,
        })
        // TODO refetch balance
        // TODO refetch allowance
      }
      waitRoll()
    }
  }, [wagerWaitingHook.isSuccess])

  const resetBetState = useCallback(() => {
    wagerWriteHook.reset()
    setGameResult(null)
    setWatchTarget(null)
    resetWatcher()
  }, [resetWatcher])

  return { placeBet, betStatus, isWaiting, isError, gameResult, resetBetState, vrfFees, gasPrice, formattedVrfFees }
}

async function _submitBetTransaction(
  betParams: GenericCasinoBetParams,
  receiver: Hex,
  vrfCost: bigint,
  gasPrice: bigint,
  chainId: CasinoChainId,
  wagerWriteHook: ReturnType<typeof useWriteContract>["writeContract"],
) {
  logger.debug("_submitBetTransaction: Preparing and sending transaction...")
  const placeBetTxData = getPlaceBetFunctionData({ ...betParams, receiver }, chainId)
  wagerWriteHook({
    abi: placeBetTxData.data.abi,
    address: placeBetTxData.data.to,
    functionName: placeBetTxData.data.functionName,
    args: placeBetTxData.data.args,
    value: placeBetTxData.extraData.getValue(betParams.betAmount + vrfCost),
    gasPrice,
    chainId,
  })

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
    if (log.address.toLowerCase() !== casinoChainById[chainId].contracts.games[gameType]?.address.toLowerCase()) continue
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
