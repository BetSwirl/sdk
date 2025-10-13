import { OnchainKitProvider } from "@coinbase/onchainkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { type Hex, http } from "viem"
import { createConfig, WagmiProvider } from "wagmi"
// Import mainnet chains
// Import testnet chains
import {
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  polygon,
  polygonAmoy,
} from "wagmi/chains"
import { QUERY_DEFAULTS } from "./constants/queryDefaults"
import { BalanceProvider } from "./context/BalanceContext"
import { BetSwirlSDKProvider } from "./context/BetSwirlSDKProvider"
import { FreebetsProvider } from "./context/FreebetsContext"
import { LeaderboardProvider } from "./context/LeaderboardContext"
import { TokenProvider } from "./context/tokenContext"
import { PlayNowEvent } from "./types/types"

interface AppProvidersProps {
  children: ReactNode
  onLeaderboardPlayNow?: (event: PlayNowEvent) => void
}

// Define supported chains lists
const MAINNET_CHAINS = [base, polygon, avalanche] as const
const TESTNET_CHAINS = [baseSepolia, polygonAmoy, avalancheFuji, arbitrumSepolia] as const

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_DEFAULTS.STALE_TIME,
      refetchOnWindowFocus: QUERY_DEFAULTS.REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: QUERY_DEFAULTS.REFETCH_ON_RECONNECT,
      retry: QUERY_DEFAULTS.RETRY_COUNT,
      structuralSharing: true,
    },
  },
})

export function AppProviders({ children, onLeaderboardPlayNow }: AppProvidersProps) {
  const affiliate = import.meta.env.VITE_AFFILIATE_ADDRESS as Hex
  const testMode = import.meta.env.VITE_TEST_MODE === "true"

  // --- Dynamic network configuration ---

  // 1. Choose active chains and default chain based on testMode
  const activeChains = testMode ? TESTNET_CHAINS : MAINNET_CHAINS
  const defaultChain = testMode ? baseSepolia : base

  // 2. Define transports for all possible chains
  const transports = {
    // Mainnet chains
    [base.id]: http(import.meta.env.VITE_BASE_RPC_URL || "https://mainnet.base.org"),
    [polygon.id]: http(import.meta.env.VITE_POLYGON_RPC_URL || "https://polygon-rpc.com"),
    [avalanche.id]: http(
      import.meta.env.VITE_AVALANCHE_RPC_URL || "https://api.avax.network/ext/bc/C/rpc",
    ),
    // Testnet chains
    [baseSepolia.id]: http(import.meta.env.VITE_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"),
    [polygonAmoy.id]: http(
      import.meta.env.VITE_POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/",
    ),
    [avalancheFuji.id]: http(
      import.meta.env.VITE_AVALANCHE_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
    ),
    [arbitrumSepolia.id]: http(
      import.meta.env.VITE_ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
    ),
  }

  // 3. Create Wagmi config with dynamic chains
  const config = createConfig({
    chains: activeChains,
    transports: transports,
  })

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          chain={defaultChain}
          apiKey={import.meta.env.VITE_ONCHAINKIT_API_KEY}
          config={{
            wallet: {
              display: "modal",
              termsUrl: "https://example.com/terms",
              privacyUrl: "https://example.com/privacy",
            },
            appearance: {
              name: "CoinToss Game",
              mode: "auto",
            },
          }}
        >
          <BetSwirlSDKProvider
            initialChainId={defaultChain.id}
            affiliate={affiliate}
            supportedChains={activeChains.map((chain) => chain.id)}
            withExternalBankrollFreebets={true}
            testMode={testMode}
          >
            <TokenProvider>
              <BalanceProvider>
                <FreebetsProvider>
                  <LeaderboardProvider onPlayNow={onLeaderboardPlayNow}>
                    {children}
                  </LeaderboardProvider>
                </FreebetsProvider>
              </BalanceProvider>
            </TokenProvider>
          </BetSwirlSDKProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
