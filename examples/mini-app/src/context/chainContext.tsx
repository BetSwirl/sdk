import React, {
  useState,
  useContext,
  createContext,
  useEffect,
  useMemo,
} from "react"
import { type Chain } from "viem"
import {
  CasinoChain,
  casinoChainById,
  CasinoChainId,
  casinoChainIds,
} from "@betswirl/sdk-core"
import { useSwitchChain } from "wagmi"
import { useAccount } from "wagmi"

export type ChainContextValue = {
  appChain: CasinoChain
  appChainId: CasinoChainId
  walletChain: Chain | undefined
  walletChainId: number | undefined
  areChainsSynced: boolean
  switchAppChain: (chainId: CasinoChainId) => void
  switchWalletChain: (chainId: CasinoChainId) => void
}

const ChainContext = createContext<ChainContextValue | null>(null)

export const useChain = () => {
  return useContext(ChainContext) as ChainContextValue
}

export type ChainProviderProps = {
  children: React.ReactNode
  initialChainId: CasinoChainId
}

export const ChainProvider: React.FC<ChainProviderProps> = (props) => {
  const { children, initialChainId } = props

  const [appChainId, setAppChainId] = useState<CasinoChainId>(initialChainId)
  const { chainId: walletChainId, chain: walletChain } = useAccount()
  const { switchChain: switchWalletChain } = useSwitchChain()

  // Allow to know if the connected wallet chain and the app chain are the same
  const areChainsSynced = useMemo(
    () => walletChainId === appChainId,
    [walletChainId, appChainId],
  )

  const switchAppChain = (chainId: CasinoChainId) => {
    // @Kinco advice: Here for example you could save the chain id in cookies to save user preferences

    // Try to switch the wallet chain
    switchWalletChain({ chainId })

    setAppChainId(chainId)
  }

  const appChain = useMemo(() => casinoChainById[appChainId], [appChainId])

  // Try to switch the app chain automatically each time the wallet chain changes
  useEffect(() => {
    // @Kinco advice. Instead of checking if the wallet chain is in the list of BetSwirlsupported chains, we should check if the wallet chain is supported by the authorized chains. The authorized chains could be passed via props for example.
    if (
      walletChainId &&
      casinoChainIds.includes(walletChainId as CasinoChainId)
    ) {
      switchAppChain(walletChainId as CasinoChainId)
    }
  }, [walletChainId])

  const context: ChainContextValue = {
    appChain,
    appChainId,
    walletChain,
    walletChainId,
    areChainsSynced,
    switchAppChain,
    switchWalletChain: (chainId: CasinoChainId) =>
      switchWalletChain({ chainId }),
  }

  return (
    <ChainContext.Provider value={context}>{children}</ChainContext.Provider>
  )
}
