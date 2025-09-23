import { type CasinoChainId, casinoChainById } from "@betswirl/sdk-core"
import { createContext, useContext, useMemo } from "react"
import { Address } from "viem"
import type { TokenWithImage } from "../types/types"
import { useChain } from "./chainContext"

export type ConfigContextValue = {
  affiliates: Address[]
  bankrollToken?: TokenWithImage
  filteredTokens?: Address[]
  withExternalBankrollFreebets?: boolean
  testMode: boolean
  getAffiliateForChain: (chainId: CasinoChainId) => Address
}

const ConfigContext = createContext<ConfigContextValue | null>(null)

export const useBettingConfig = () => {
  const configContext = useContext(ConfigContext) as ConfigContextValue
  if (!configContext) throw new Error("useBettingConfig must be used inside ConfigProvider")
  return configContext
}

export type ConfigProviderProps = {
  children: React.ReactNode
  affiliate?: Address
  bankrollToken?: TokenWithImage
  filteredTokens?: Address[]
  withExternalBankrollFreebets?: boolean
  testMode?: boolean
}

export const ConfigProvider: React.FC<ConfigProviderProps> = (props) => {
  const {
    children,
    affiliate: userAffiliate,
    bankrollToken,
    filteredTokens,
    withExternalBankrollFreebets = false,
    testMode = false,
  } = props
  const { availableChainIds } = useChain()

  // Build affiliates array for API calls
  const affiliates = useMemo(() => {
    if (userAffiliate) {
      // Single affiliate for all chains
      return [userAffiliate]
    }
    // Collect unique chain-specific affiliates
    const defaultAffiliates = availableChainIds
      .map((id) => {
        const chainConfig = casinoChainById[id]
        return chainConfig?.defaultAffiliate
      })
      .filter(Boolean) as Address[]
    return Array.from(new Set(defaultAffiliates))
  }, [userAffiliate, availableChainIds])

  const getAffiliateForChain = useMemo(
    () => (chainId: CasinoChainId) => {
      // User affiliate: same for all chains
      if (userAffiliate) {
        return userAffiliate
      }
      // Chain-specific default affiliate
      const chainConfig = casinoChainById[chainId]
      if (!chainConfig?.defaultAffiliate) {
        throw new Error(`No default affiliate found for chain: ${chainId}`)
      }
      return chainConfig.defaultAffiliate
    },
    [userAffiliate],
  )

  const context: ConfigContextValue = useMemo(
    () => ({
      affiliates,
      bankrollToken,
      filteredTokens,
      withExternalBankrollFreebets,
      testMode,
      getAffiliateForChain,
    }),
    [
      affiliates,
      bankrollToken,
      filteredTokens,
      withExternalBankrollFreebets,
      testMode,
      getAffiliateForChain,
    ],
  )

  return <ConfigContext.Provider value={context}>{children}</ConfigContext.Provider>
}
