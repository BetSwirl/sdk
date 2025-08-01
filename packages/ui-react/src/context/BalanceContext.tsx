import { FORMAT_TYPE, formatRawAmount } from "@betswirl/sdk-core"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createContext, type ReactNode, useContext, useEffect, useMemo } from "react"
import { erc20Abi, type Hex, zeroAddress } from "viem"
import { useAccount, useBalance, useReadContracts } from "wagmi"
import type { TokenWithImage } from "../types/types"
import { useChain } from "./chainContext"
import { useTokenContext } from "./tokenContext"

interface BalanceContextValue {
  balances: Map<string, bigint>
  chainId: number
  isLoading: boolean
  error: Error | null
  refetch: () => void
  getBalance: (tokenAddress: string) => bigint | undefined
  getFormattedBalance: (tokenAddress: string, decimals: number) => string
}

const BalanceContext = createContext<BalanceContextValue | undefined>(undefined)

const BALANCE_CACHE_CONFIG = {
  staleTime: 10_000, // 10 seconds fresh
  gcTime: 5 * 60_000, // 5 minutes cache
  refetchInterval: false, // No background refetch
  refetchOnWindowFocus: true,
} as const

interface BalanceProviderProps {
  children: ReactNode
}

function combineTokensWithBalances(
  nativeToken: TokenWithImage | undefined,
  nativeBalance: bigint | undefined,
  erc20Tokens: TokenWithImage[],
  erc20Balances: readonly { result?: unknown }[] | undefined,
): Map<string, bigint> {
  const balanceMap = new Map<string, bigint>()

  // Add native token balance
  if (nativeToken && nativeBalance !== undefined) {
    balanceMap.set(nativeToken.address, nativeBalance)
  }

  // Add ERC20 token balances
  erc20Tokens.forEach((token, index) => {
    const balance = (erc20Balances?.[index]?.result as bigint) || 0n
    balanceMap.set(token.address, balance)
  })

  return balanceMap
}

export function BalanceProvider({ children }: BalanceProviderProps) {
  const { appChainId, walletChainId } = useChain()
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const { activeTokens: tokens } = useTokenContext()

  const nativeToken = tokens.find((token) => token.address === zeroAddress)
  const erc20Tokens = tokens.filter((token) => token.address !== zeroAddress)

  // Use app chain for balance queries since we're showing tokens for the app chain
  // This ensures balances match the displayed tokens even when wallet is on a different chain
  const balanceChainId = appChainId

  // Fetch native token balance from app chain
  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({
    address: address as Hex,
    chainId: balanceChainId,
    query: {
      ...BALANCE_CACHE_CONFIG,
      enabled: !!address && !!nativeToken && !!balanceChainId,
    },
  })

  // Batch fetch ERC20 balances from app chain
  const { data: erc20Balances, isLoading: erc20Loading } = useReadContracts({
    contracts: erc20Tokens.map((token) => ({
      address: token.address as Hex,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address as Hex],
      chainId: balanceChainId,
    })),
    query: {
      ...BALANCE_CACHE_CONFIG,
      enabled: !!address && erc20Tokens.length > 0 && !!balanceChainId,
    },
  })

  // Combine all balances into a single query
  const {
    data: balances = new Map(),
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["balances", walletChainId, appChainId, address, tokens.map((t) => t.address)],
    queryFn: () => {
      return combineTokensWithBalances(
        nativeToken,
        nativeBalance?.value,
        erc20Tokens,
        erc20Balances,
      )
    },
    ...BALANCE_CACHE_CONFIG,
    enabled: !!address && tokens.length > 0 && !nativeLoading && !erc20Loading && !!balanceChainId,
  })

  // Clear balances when app chain switches since we're fetching from app chain
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need appChainId to trigger when chain switches
  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["balances"] })
    // Don't immediately refetch - let the query re-enable naturally when dependencies are ready
  }, [appChainId, queryClient])

  // Refetch balances when wallet connects/disconnects
  useEffect(() => {
    if (address) {
      refetch()
    } else {
      queryClient.removeQueries({ queryKey: ["balances"] })
    }
  }, [address, queryClient, refetch])

  const contextValue = useMemo<BalanceContextValue>(
    () => ({
      balances,
      chainId: appChainId, // Use app chain since we're fetching balances from app chain
      isLoading,
      error: error as Error | null,
      refetch,
      getBalance: (tokenAddress: string) => balances.get(tokenAddress),
      getFormattedBalance: (tokenAddress: string, decimals: number) => {
        const balance = balances.get(tokenAddress)
        if (balance === undefined) return "0"
        return formatRawAmount(balance, decimals, FORMAT_TYPE.PRECISE)
      },
    }),
    [balances, appChainId, isLoading, error, refetch],
  )

  return <BalanceContext.Provider value={contextValue}>{children}</BalanceContext.Provider>
}

export function useBalances() {
  const context = useContext(BalanceContext)
  if (!context) {
    throw new Error("useBalances must be used within a BalanceProvider")
  }
  return context
}

// Hook to trigger balance refresh after game events
export function useBalanceRefresh() {
  const { refetch } = useBalances()

  return useMemo(() => {
    let timeoutId: NodeJS.Timeout
    return () => {
      clearTimeout(timeoutId)
      // Delay refresh to allow blockchain state to update
      timeoutId = setTimeout(() => refetch(), 1000)
    }
  }, [refetch])
}
