import { CASINO_GAME_TYPE, chainById, getChainlinkVrfCostFunctionData, Token, wrappedGasTokenById } from "@betswirl/sdk-core"
import { useChain } from "../context/chainContext"
import { useEffect, useMemo, useState } from "react"
import { useCall } from "wagmi"
import { useGasPrice } from "./useGasPrice"
import { CHAINLINK_VRF_FEES_BUFFER_PERCENT } from "../consts"
import { formatUnits } from "viem"

type UseEstimateVRFFeesProps = {
    game: CASINO_GAME_TYPE,
    token: Token,
    betCount: number
}
export function useEstimateVRFFees(props: UseEstimateVRFFeesProps) {
    const { appChainId } = useChain()
    const { data: gasPriceData } = useGasPrice({ query: { refetchInterval: 10000 } })
    const [vrfFees, setVrfFees] = useState<bigint>(0n)
    const functionData = useMemo(() => {
        return getChainlinkVrfCostFunctionData(props.game, props.token.address, props.betCount, appChainId)
    }, [props.game, props.token.address, props.betCount, appChainId])

    const wagmiHook = useCall({
        account: wrappedGasTokenById[appChainId], // Trick to avoid insufficient funds for gas error
        to: functionData.data.to,
        data: functionData.encodedData,
        gasPrice: gasPriceData.optimalGasPrice,
        gas: 1000000n, // Trick to avoid insufficient funds for gas error
        chainId: appChainId,
        query: {
            enabled: functionData.encodedData && gasPriceData.optimalGasPrice > 0n,
        },
    })

    useEffect(() => {
        // Trick to always have a value in vrfFees (because when useCall is refetched, it resets the data )
        if (wagmiHook.data?.data) {
            // Add a 26% buffer to the Chainlink VRF fees to cover gas price peaks
            setVrfFees((BigInt(wagmiHook.data.data) * BigInt(CHAINLINK_VRF_FEES_BUFFER_PERCENT + 100)) / 100n)
        }
    }, [wagmiHook.data?.data])


    const formattedVrfFees = useMemo(() => {
        return Number(formatUnits(vrfFees, chainById[appChainId].nativeCurrency.decimals))
    }, [vrfFees, appChainId])

    return {
        // @Kinco, if you have a better name for "wagmiHook" please change it
        wagmiHook, // @Kinco advice. Always useful to share the entire wagmi hook result to be able to get states, call refetch, etc
        vrfFees,
        gasPrice: gasPriceData.optimalGasPrice,
        formattedVrfFees
    }

}
