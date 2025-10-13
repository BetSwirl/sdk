import {
  CASINO_GAME_TYPE,
  chainById,
  FORMAT_TYPE,
  formatRawAmount,
  getChainlinkVrfCostFunctionData,
  Token,
  wrappedGasTokenById,
} from "@betswirl/sdk-core"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useCall, usePublicClient } from "wagmi"
import { CHAINLINK_VRF_FEES_BUFFER_PERCENT } from "../consts"
import { useChain } from "../context/chainContext"
import { useGasPrice } from "./useGasPrice"

const VRF_ESTIMATION_GAS_LIMIT = 1000000n

type UseEstimateVRFFeesProps = {
  game: CASINO_GAME_TYPE | undefined
  token: Token | undefined
  betCount: number
}

/**
 * Estimates Chainlink VRF fees for random number generation.
 * VRF ensures provably fair randomness in gambling applications.
 *
 * @param props.game - Type of casino game
 * @param props.token - Token used for betting
 * @param props.betCount - Number of bets (affects gas consumption)
 * @returns VRF fee estimates with buffer, gas price, and formatted values
 *
 * @example
 * ```ts
 * const { vrfFees, formattedVrfFees } = useEstimateVRFFees({
 *   game: CASINO_GAME_TYPE.DICE,
 *   token: ethToken,
 *   betCount: 1
 * })
 * ```
 */
export function useEstimateVRFFees(props: UseEstimateVRFFeesProps) {
  const { appChainId } = useChain()
  const { data: gasPriceData, refetch: refetchGasPrice } = useGasPrice()
  const [vrfFees, setVrfFees] = useState<bigint>(0n)
  const publicClient = usePublicClient({ chainId: appChainId })

  const functionData = useMemo(() => {
    if (!props.game || !props.token) return null
    return getChainlinkVrfCostFunctionData(
      props.game,
      props.token.address,
      props.betCount,
      appChainId,
    )
  }, [props.game, props.token, props.betCount, appChainId])

  const vrfEstimateQuery = useCall({
    account: wrappedGasTokenById[appChainId], // Trick to avoid insufficient funds for gas error
    to: functionData?.data.to,
    data: functionData?.encodedData,
    gasPrice: gasPriceData.optimalGasPrice,
    gas: VRF_ESTIMATION_GAS_LIMIT, // Trick to avoid insufficient funds for gas error
    chainId: appChainId,
    query: {
      enabled: !!functionData && !!functionData.encodedData && gasPriceData.optimalGasPrice > 0n,
    },
  })

  const calculateVrfFeesWithBuffer = useCallback((rawVrfFees: string): bigint => {
    const vrfFeesBigInt = BigInt(rawVrfFees)
    const bufferMultiplier = BigInt(CHAINLINK_VRF_FEES_BUFFER_PERCENT + 100)
    return (vrfFeesBigInt * bufferMultiplier) / 100n
  }, [])

  useEffect(() => {
    // Trick to always have a value in vrfFees (because when useCall is refetched, it resets the data)
    if (vrfEstimateQuery.data?.data) {
      // Add a 26% buffer to the Chainlink VRF fees to cover gas price peaks
      setVrfFees(calculateVrfFeesWithBuffer(vrfEstimateQuery.data.data))
    }
  }, [vrfEstimateQuery.data?.data, calculateVrfFeesWithBuffer])

  const formattedVrfFees = useMemo(() => {
    return Number.parseFloat(
      formatRawAmount(vrfFees, chainById[appChainId].nativeCurrency.decimals, FORMAT_TYPE.PRECISE),
    )
  }, [vrfFees, appChainId])

  async function getVrfFeesAndGasPrice(): Promise<{ vrfFees: bigint; gasPrice: bigint }> {
    if (!functionData || !publicClient) {
      return { vrfFees, gasPrice: gasPriceData.optimalGasPrice }
    }

    try {
      const gasPriceResult = await refetchGasPrice()
      const freshGasPrice = gasPriceResult.data?.optimalGasPrice || gasPriceData.optimalGasPrice

      if (!freshGasPrice) {
        return { vrfFees, gasPrice: gasPriceData.optimalGasPrice }
      }

      const vrfFeesResult = await publicClient.call({
        account: wrappedGasTokenById[appChainId],
        to: functionData.data.to,
        data: functionData.encodedData,
        gasPrice: freshGasPrice,
        gas: VRF_ESTIMATION_GAS_LIMIT,
      })

      if (vrfFeesResult.data) {
        const freshVrfFees = calculateVrfFeesWithBuffer(vrfFeesResult.data)
        return { vrfFees: freshVrfFees, gasPrice: freshGasPrice }
      }

      return { vrfFees, gasPrice: freshGasPrice }
    } catch (error) {
      console.log("getVrfFeesAndGasPrice failed: ", error)
      return { vrfFees, gasPrice: gasPriceData.optimalGasPrice }
    }
  }

  return {
    wagmiHook: vrfEstimateQuery,
    vrfFees,
    gasPrice: gasPriceData.optimalGasPrice,
    formattedVrfFees,
    getVrfFeesAndGasPrice,
  }
}
