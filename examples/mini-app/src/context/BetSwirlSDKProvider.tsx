import React from "react"
import { ChainProvider, ChainProviderProps } from "./chainContext"
import { ConfigProviderProps } from "./configContext"

type BetSwirlSDKProviderProps = ChainProviderProps & ConfigProviderProps
import { ConfigProvider } from "./configContext"

export const BetSwirlSDKProvider: React.FC<BetSwirlSDKProviderProps> = (
  props,
) => {
  const { children, initialChainId, affiliate } = props

  return (
    <ChainProvider initialChainId={initialChainId}>
      <ConfigProvider affiliate={affiliate}>{children}</ConfigProvider>
    </ChainProvider>
  )
}

export default BetSwirlSDKProviderProps
