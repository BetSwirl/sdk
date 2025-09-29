import { fetchFreebets, SignedFreebet } from "@betswirl/sdk-core"
import { useQuery } from "@tanstack/react-query"
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { zeroAddress } from "viem"
import { useAccount } from "wagmi"
import { getTokenImage } from "../lib/utils"
import { useChain } from "./chainContext"
import { useBettingConfig } from "./configContext"
import { useTokenContext } from "./tokenContext"

interface FreebetsContextValue {
  freebets: SignedFreebet[]
  selectedFreebet: SignedFreebet | null
  selectFreebetById: (id: number | null) => void
  currentChainFreebets: SignedFreebet[]
  isUsingFreebet: boolean
  refetchFreebets: () => void
  freebetsError: Error | null
}

const FreebetsContext = createContext<FreebetsContextValue | undefined>(undefined)

interface FreebetsProviderProps {
  children: ReactNode
}

export function FreebetsProvider({ children }: FreebetsProviderProps) {
  const { address: accountAddress } = useAccount()
  const { appChainId, switchAppChain, availableChainIds } = useChain()
  const { setSelectedToken } = useTokenContext()
  const { affiliates, withExternalBankrollFreebets, filteredTokens, testMode } = useBettingConfig()
  const [selectedFreebet, setSelectedFreebet] = useState<SignedFreebet | null>(null)
  const [isUsingFreebet, setIsUsingFreebet] = useState(true)
  // Track pending freebet selection for chain switches
  const [pendingFreebetId, setPendingFreebetId] = useState<number | null>(null)

  const {
    data: freebetsData = [],
    refetch: refetchFreebets,
    error: freebetsError,
  } = useQuery<SignedFreebet[], Error, SignedFreebet[]>({
    queryKey: [
      "freebets",
      accountAddress,
      [...affiliates].sort((a, b) => a.localeCompare(b)),
      withExternalBankrollFreebets,
      filteredTokens,
    ],
    queryFn: fetchFreebetsTokens,
    enabled: !!accountAddress,
    refetchInterval: 30000,
  })

  const currentChainFreebets = useMemo(() => {
    if (!freebetsData.length || !appChainId) {
      return []
    }

    const filteredFreebets = freebetsData.filter((freebet) => freebet.chainId === appChainId)

    return filteredFreebets
  }, [freebetsData, appChainId])

  const deselectFreebet = useCallback(() => {
    setIsUsingFreebet(false)
    setSelectedFreebet(null)
    setPendingFreebetId(null) // Clear any pending selection
  }, [])

  const selectFreebetById = useCallback(
    (id: number | null) => {
      if (!id) {
        deselectFreebet()
        setPendingFreebetId(null)
        return
      }

      const freebet = freebetsData.find((freebet) => freebet.id === id) || null

      if (!freebet) {
        deselectFreebet()
        setPendingFreebetId(null)
        return
      }

      // If freebet is on different chain, switch chain and defer selection
      if (freebet.chainId !== appChainId) {
        console.log(`Switching chain from ${appChainId} to ${freebet.chainId} for freebet ${id}`)
        setPendingFreebetId(id) // Store pending selection
        switchAppChain(freebet.chainId) // This will trigger re-render with new appChainId
        // Don't set token/freebet yet - wait for chain to actually switch
        return
      }

      // Chain is correct, safe to select immediately
      setSelectedToken({
        ...freebet.token,
        image: getTokenImage(freebet.token.symbol),
      })
      setSelectedFreebet(freebet)
      setIsUsingFreebet(true)
      setPendingFreebetId(null) // Clear any pending selection
    },
    [freebetsData, appChainId, switchAppChain, setSelectedToken, deselectFreebet],
  )

  // Handle pending freebet selection after chain switch
  useEffect(() => {
    if (pendingFreebetId && appChainId) {
      const freebet = freebetsData.find((fb) => fb.id === pendingFreebetId)

      if (freebet && freebet.chainId === appChainId) {
        // Chain has switched successfully, now select the freebet
        console.log(
          `Chain switched to ${appChainId}, selecting pending freebet ${pendingFreebetId}`,
        )
        setSelectedToken({
          ...freebet.token,
          image: getTokenImage(freebet.token.symbol),
        })
        setSelectedFreebet(freebet)
        setIsUsingFreebet(true)
        setPendingFreebetId(null) // Clear pending selection
      }
    }
  }, [appChainId, pendingFreebetId, freebetsData, setSelectedToken])

  useEffect(() => {
    // Skip auto-selection if there's a pending freebet waiting for chain switch
    if (pendingFreebetId) {
      return
    }

    const isFreebetsInCurrentChain = currentChainFreebets.length > 0
    const isSelectedFreebet = selectedFreebet !== null

    const getFirstFreebet = () => {
      const freebet = freebetsData.find(
        (freebet) => freebet.chainId === currentChainFreebets[0].chainId,
      )
      if (!freebet) {
        return null
      }

      return freebet
    }

    // If no freebets available in current chain, clear selection
    if (!isFreebetsInCurrentChain && isSelectedFreebet) {
      deselectFreebet()
      return
    }

    // If freebets available, user wants to use freebets, but none selected - select first
    if (isFreebetsInCurrentChain && isUsingFreebet && !isSelectedFreebet) {
      selectFreebetById(getFirstFreebet()?.id || null)
      return
    }

    // If selected freebet is no longer valid, try to select another one if using freebets
    if (isFreebetsInCurrentChain && isSelectedFreebet) {
      const isSelectedStillValid = currentChainFreebets.some(
        (freebet) => freebet.id === selectedFreebet.id,
      )

      if (!isSelectedStillValid) {
        const firstFreebet = getFirstFreebet()
        const isFirstFreebetSameTokenAndChain =
          firstFreebet &&
          firstFreebet.token.symbol === selectedFreebet.token.symbol &&
          firstFreebet.chainId === selectedFreebet.chainId

        if (isUsingFreebet && firstFreebet && isFirstFreebetSameTokenAndChain) {
          selectFreebetById(firstFreebet.id)
        } else {
          deselectFreebet()
        }
      }
    }
  }, [
    currentChainFreebets,
    isUsingFreebet,
    freebetsData,
    selectedFreebet,
    deselectFreebet,
    selectFreebetById,
    pendingFreebetId,
  ])

  async function fetchFreebetsTokens(): Promise<SignedFreebet[]> {
    if (!accountAddress) {
      return []
    }

    const allFreebets = await fetchFreebets(
      accountAddress,
      affiliates,
      availableChainIds,
      withExternalBankrollFreebets,
      testMode,
    )

    const filteredFreebets = allFreebets.filter((freebet) => {
      if (filteredTokens && filteredTokens.length > 0) {
        if (freebet.token.address === zeroAddress) {
          return true
        }
        return filteredTokens.includes(freebet.token.address)
      }

      return true
    })

    return filteredFreebets
  }

  const contextValue = useMemo(
    () => ({
      freebets: freebetsData,
      selectedFreebet,
      selectFreebetById,
      currentChainFreebets,
      isUsingFreebet: isUsingFreebet && !!selectedFreebet,
      refetchFreebets,
      freebetsError,
    }),
    [
      freebetsData,
      selectedFreebet,
      selectFreebetById,
      currentChainFreebets,
      refetchFreebets,
      freebetsError,
      isUsingFreebet,
    ],
  )

  return <FreebetsContext.Provider value={contextValue}>{children}</FreebetsContext.Provider>
}

export function useFreebetsContext() {
  const context = useContext(FreebetsContext)
  if (!context) {
    throw new Error("useFreebets must be used within a FreebetsProvider")
  }
  return context
}
