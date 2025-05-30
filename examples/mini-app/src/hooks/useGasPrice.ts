import { chainByKey, GAS_PRICE_TYPE, getGasPrices, RETURN_TYPE_GAS_PRICES } from "@betswirl/sdk-core";
import { useConfig } from "wagmi";
import { QueryParameter } from "../types";
import { useChain } from "../context/chainContext";
import { useQuery } from "@tanstack/react-query";
import { WagmiBetSwirlWallet } from "@betswirl/wagmi-provider";
type GetGasPriceResult = {
    detailledGasPrices: RETURN_TYPE_GAS_PRICES
    optimalGasPrice: bigint
}

type UseGasPriceProps = {
    query?: QueryParameter<GetGasPriceResult>
}

const defaultGasPriceResult: GetGasPriceResult = {
    detailledGasPrices: {
        [GAS_PRICE_TYPE.NORMAL]: 0n,
        [GAS_PRICE_TYPE.FAST]: 0n,
        [GAS_PRICE_TYPE.INSTANT]: 0n,
    },
    optimalGasPrice: 0n,
}

export function useGasPrice(props: UseGasPriceProps = {}) {
    const config = useConfig()
    const { query = {} } = props

    const { appChain } = useChain()


    const queryFn = async () => {
        const betswirlWallet = new WagmiBetSwirlWallet(config)
        const gasPrices = await getGasPrices(betswirlWallet, appChain.id)

        return {
            detailledGasPrices: {
                [GAS_PRICE_TYPE.NORMAL]: (gasPrices[GAS_PRICE_TYPE.NORMAL] * 105n / 100n), // 5% buffer
                [GAS_PRICE_TYPE.FAST]: gasPrices[GAS_PRICE_TYPE.FAST], // 20% buffer (already included from sdk)
                [GAS_PRICE_TYPE.INSTANT]: gasPrices[GAS_PRICE_TYPE.INSTANT], // 50% buffer (already included from sdk)
            },
            // From experience, Polygon & Avalanche works better with a fast gas price
            optimalGasPrice: [chainByKey.polygon.id, chainByKey.avalanche.id as number].includes(appChain.id) ? gasPrices[GAS_PRICE_TYPE.FAST] : gasPrices[GAS_PRICE_TYPE.NORMAL]
        };
    }

    let { data, ...rest } = useQuery({
        queryKey: ['/gas-price', appChain.id],
        queryFn,
        refetchOnWindowFocus: false,
        ...query,
    })


    return {
        data: data ?? defaultGasPriceResult,
        ...rest,
    }


}
