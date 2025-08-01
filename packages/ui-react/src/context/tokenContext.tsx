import { chainById, chainNativeCurrencyToToken } from "@betswirl/sdk-core"
import { useQueryClient } from "@tanstack/react-query"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { type Address, zeroAddress } from "viem"
import { useTokens } from "../hooks/useTokens"
import { getTokenImage } from "../lib/utils"
import { TokenWithImage } from "../types/types"
import { useChain } from "./chainContext"

const STORAGE_KEY = "betswirl-selected-token-address"

interface TokenContextValue {
  selectedToken: TokenWithImage
  setSelectedToken: (token: TokenWithImage) => void
  activeTokens: TokenWithImage[]
  allTokens: TokenWithImage[]
  loading: boolean
  error: Error | null
}

const TokenContext = createContext<TokenContextValue | undefined>(undefined)

interface TokenProviderProps {
  children: ReactNode
  initialToken?: TokenWithImage
}

function getStoredTokenAddress(chainId: number): Address | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const stored = sessionStorage.getItem(`${STORAGE_KEY}-${chainId}`)
    return stored as Address | null
  } catch {
    return null
  }
}

function getNativeToken(chainId: number): TokenWithImage {
  const chain = chainById[chainId as keyof typeof chainById]
  const nativeToken = chainNativeCurrencyToToken(chain.nativeCurrency)
  return {
    ...nativeToken,
    image: getTokenImage(nativeToken.symbol),
  }
}

function storeTokenAddress(address: Address, chainId: number): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    sessionStorage.setItem(`${STORAGE_KEY}-${chainId}`, address)
  } catch {
    // Ignore storage errors
  }
}

export function TokenProvider({ children }: TokenProviderProps) {
  const { appChainId } = useChain()
  const queryClient = useQueryClient()
  const [selectedToken, setSelectedTokenInternal] = useState<TokenWithImage>(() => {
    return getNativeToken(appChainId)
  })
  const [previousChainId, setPreviousChainId] = useState<number | undefined>(appChainId)

  // Cancel and remove token queries when chain changes
  useEffect(() => {
    if (previousChainId !== undefined && previousChainId !== appChainId) {
      // Chain has changed, cancel all in-flight queries and remove from cache
      queryClient.cancelQueries({ queryKey: ["casino-tokens"] })
      queryClient.removeQueries({ queryKey: ["casino-tokens"] })

      // Clear selected token immediately to prevent showing old chain's token
      setSelectedTokenInternal(getNativeToken(appChainId))
    }
    setPreviousChainId(appChainId)
  }, [appChainId, previousChainId, queryClient])

  const {
    tokens: allTokens,
    loading: tokensLoading,
    error: tokenError,
  } = useTokens({ onlyActive: false })

  const activeTokens = allTokens.filter((token) => !token.paused)

  useEffect(() => {
    if (tokensLoading || activeTokens.length === 0) {
      return
    }

    // Check if selected token is valid for current chain
    if (selectedToken) {
      // For native tokens (zeroAddress), we must also check the symbol matches
      // because all native tokens share the same address
      const isTokenValidForChain = activeTokens.some((token) => {
        if (token.address === zeroAddress && selectedToken.address === zeroAddress) {
          // Both are native tokens - must have matching symbols
          return token.symbol === selectedToken.symbol
        }
        // For ERC20 tokens, address comparison is sufficient
        return token.address === selectedToken.address
      })

      if (isTokenValidForChain) {
        // Token is valid for this chain, keep it
        return
      }
      // Token is not valid for new chain, need to select a new one
    }

    const storedAddress = getStoredTokenAddress(appChainId)
    if (storedAddress) {
      const foundToken = activeTokens.find((token) => token.address === storedAddress)
      if (foundToken) {
        setSelectedTokenInternal(foundToken)
        return
      }
    }

    // Default to native token of the current chain if no stored token
    const nativeToken = activeTokens.find((token) => token.address === zeroAddress)
    if (!nativeToken) {
      console.warn(`No native token found for chain ${appChainId}`)
      return
    }
    setSelectedTokenInternal(nativeToken ?? selectedToken)
  }, [activeTokens, tokensLoading, appChainId, selectedToken])

  const setSelectedToken = (token: TokenWithImage) => {
    setSelectedTokenInternal(token)
    if (token) {
      storeTokenAddress(token.address, appChainId)
    }
  }

  return (
    <TokenContext.Provider
      value={{
        selectedToken,
        setSelectedToken,
        activeTokens,
        allTokens,
        loading: tokensLoading,
        error: tokenError,
      }}
    >
      {children}
    </TokenContext.Provider>
  )
}

export function useTokenContext() {
  const context = useContext(TokenContext)
  if (context === undefined) {
    throw new Error("useTokenContext must be used within a TokenProvider")
  }
  return context
}
