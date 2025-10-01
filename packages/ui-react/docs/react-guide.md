# React Integration Guide

## Create Demo Project

```shell
# node --version
# v24.2.0

npm create vite@latest betswirl-ui-react-demo -- --template react-ts
cd betswirl-ui-react-demo
npm install
```

## Verify Installation

```shell
npm run dev
# Open http://localhost:5173
```

## Add BetSwirl

### Install

```shell
npm i @betswirl/ui-react
```

Package: [npmjs.com/package/@betswirl/ui-react](https://www.npmjs.com/package/@betswirl/ui-react)

### Update main.tsx

Add all providers directly or create an AppProviders component:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { OnchainKitProvider, type AppConfig } from '@coinbase/onchainkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, type Hex } from 'viem'
import { WagmiProvider, createConfig } from 'wagmi'
import { base, polygon, arbitrum } from 'wagmi/chains'
import { 
  BalanceProvider, 
  BetSwirlSDKProvider, 
  FreebetsProvider, 
  TokenProvider, 
  type TokenWithImage 
} from '@betswirl/ui-react'
import './index.css'
import '@betswirl/ui-react/styles.css'
import App from './App.tsx'

const queryClient = new QueryClient()

// Create wagmi config
// http() without parameters = use default public RPC from wagmi
// http('your-url') = use your custom RPC
const config = createConfig({
  chains: [base, polygon, arbitrum],
  transports: {
    [base.id]: http(),     // uses wagmi's default RPC for Base
    [polygon.id]: http(),  // uses wagmi's default RPC for Polygon
    [arbitrum.id]: http(), // uses wagmi's default RPC for Arbitrum
  },
})

// For production with custom RPCs from .env file:
// const config = createConfig({
//   chains: [base, polygon, arbitrum],
//   transports: {
//     [base.id]: http(import.meta.env.VITE_BASE_RPC_URL),
//     [polygon.id]: http(import.meta.env.VITE_POLYGON_RPC_URL),
//     [arbitrum.id]: http(import.meta.env.VITE_ARBITRUM_RPC_URL),
//   },
// })

const onChainKitConfig: AppConfig = {
  wallet: {
    display: "modal",
  }
}

// Optional: Define tokens for your application
const DEGEN_TOKEN: TokenWithImage = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" as Hex,
  symbol: "DEGEN",
  decimals: 18,
  image: "https://www.betswirl.com/img/tokens/DEGEN.svg"
}

const ETH_TOKEN: TokenWithImage = {
  address: "0x0000000000000000000000000000000000000000" as Hex,
  symbol: "ETH",
  decimals: 18,
  image: "https://www.betswirl.com/img/tokens/ETH.svg"
}

// Optional: Limit available tokens to specific ones
const ALLOWED_TOKENS = [
  DEGEN_TOKEN.address,
  ETH_TOKEN.address,
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Hex, // USDC
]

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider chain={base} config={onChainKitConfig}>
          <BetSwirlSDKProvider
            initialChainId={base.id}
            supportedChains={[base.id, polygon.id, arbitrum.id]}
            bankrollToken={DEGEN_TOKEN}     // Optional: set default betting token
            filteredTokens={ALLOWED_TOKENS} // Optional: limit available tokens
          >
            <TokenProvider>
              <BalanceProvider>
                <FreebetsProvider>
                  <App />
                </FreebetsProvider>
              </BalanceProvider>
            </TokenProvider>
          </BetSwirlSDKProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
```

This code uses default public RPCs from wagmi. No environment variables needed.

### Add Game Component

In `src/App.tsx`:

```tsx
import { useState } from 'react'
import { CASINO_GAME_TYPE, LEADERBOARD_CASINO_RULES_GAME } from '@betswirl/sdk-core'
import { CoinTossGame, DiceGame, LeaderboardProvider, type PlayNowEvent } from '@betswirl/ui-react'

export default function App() {
  const [currentGame, setCurrentGame] = useState(CASINO_GAME_TYPE.COINTOSS)

  // Optional: Handle "Play now" button clicks from leaderboards
  const handlePlayNow = (event: PlayNowEvent) => {
    // Switch to the appropriate game
    if (event.games.includes(LEADERBOARD_CASINO_RULES_GAME.COINTOSS)) {
      setCurrentGame(CASINO_GAME_TYPE.COINTOSS)
    } else if (event.games.includes(LEADERBOARD_CASINO_RULES_GAME.DICE)) {
      setCurrentGame(CASINO_GAME_TYPE.DICE)
    }
    // You can also handle chain/token switching here
  }

  return (
    <LeaderboardProvider onPlayNow={handlePlayNow}>
      <div>
        {currentGame === CASINO_GAME_TYPE.COINTOSS && (
          <CoinTossGame />
        )}
        {currentGame === CASINO_GAME_TYPE.DICE && (
          <DiceGame />
        )}
      </div>
    </LeaderboardProvider>
  )
}
```

### Run

```shell
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deploy

### Push to GitHub

```shell
git init
git add .
git commit -m "Add BetSwirl casino game"
```

### Deploy to Vercel

* Sign in to [vercel.com](https://vercel.com) with GitHub
* Click "Add New..." → "Project"
* Select your repository
* Click "Import" → "Deploy"
* Get public URL after ~2 minutes

## Leaderboard Integration

### onPlayNow Callback

The `onPlayNow` callback allows your app to respond when users click "Play now" in leaderboard components. It receives a `PlayNowEvent` with leaderboard details:

```tsx
type PlayNowEvent = {
  chainId: CasinoChainId           // Required network for the leaderboard
  games: LEADERBOARD_CASINO_RULES_GAME[]  // Allowed games
  tokens: Token[]                  // Accepted tokens
}
```

**Usage:** Pass the callback to any game component to enable automatic game switching from leaderboards.

**Note:** The callback is optional. Without it, "Play now" only closes the leaderboard panel.

## Configuration

### BetSwirlSDKProvider Props

| Prop | Type | Description |
|------|------|-------------|
| `initialChainId` | `number` | **Required.** Chain ID to initialize the SDK with |
| `supportedChains` | `number[]` | **Required.** Array of chain IDs to enable multi-chain support. Must include at least one supported chain ID |
| `affiliate` | `string` | Optional. Your wallet address to receive affiliate commissions. If not provided, default affiliate will be used |
| `bankrollToken` | `TokenWithImage` | Optional. Default token for betting. Must include `address`, `symbol`, `decimals`, and `image` properties. [See available tokens →](https://documentation-betswirl.vercel.app/developer-hub/demos/miniapp/checking-available-tokens) |
| `filteredTokens` | `string[]` | Optional. Array of token addresses to limit which tokens are available for selection. If not provided, all supported tokens will be available. [Learn more about token filtering →](https://documentation-betswirl.vercel.app/developer-hub/demos/miniapp/checking-available-tokens#token-filtering) |

### Multi-Chain Support

To enable multiple chains, you need to:
1. Configure the chains in wagmi config
2. Pass the same chain IDs to `supportedChains` prop

#### Supported Chains

BetSwirl protocol is deployed on the following chains:

**Mainnet:**
- Base (8453)
- Polygon (137)
- Avalanche (43114)
- Arbitrum (42161)
- BSC/BNB Chain (56)

**Testnet:**
- Base Sepolia (84532)
- Polygon Amoy (80002)
- Avalanche Fuji (43113)
- Arbitrum Sepolia (421614)

When multiple chains are configured:
- Players can switch between chains using the chain selector in the betting panel
- Chain preferences are persisted per wallet address
- Token balances update automatically when switching chains

**⚠️ IMPORTANT:** You must configure the same chains in both wagmi and BetSwirlSDKProvider!

#### Simple Setup (Using Default RPCs)

```tsx
import { createConfig, WagmiProvider, http } from 'wagmi'
import { base, polygon, arbitrum } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { BetSwirlSDKProvider, TokenProvider, BalanceProvider } from '@betswirl/ui-react'

// 1. Choose your chains
const chains = [base, polygon, arbitrum]

// 2. Create wagmi config (uses default public RPCs)
const config = createConfig({
  chains,
  transports: {
    [base.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
})

// 3. Create query client
const queryClient = new QueryClient()

// 4. Setup providers
<WagmiProvider config={config}>
  <QueryClientProvider client={queryClient}>
    <OnchainKitProvider chain={base}>
      <BetSwirlSDKProvider
        initialChainId={base.id}
        supportedChains={chains.map(chain => chain.id)} // Same chains!
      >
        <TokenProvider>
          <BalanceProvider>
            <App />
          </BalanceProvider>
        </TokenProvider>
      </BetSwirlSDKProvider>
    </OnchainKitProvider>
  </QueryClientProvider>
</WagmiProvider>
```

#### Production Setup (Custom RPCs)

If you need your own RPC endpoints (recommended for production), use environment variables:

```tsx
const config = createConfig({
  chains,
  transports: {
    [base.id]: http(import.meta.env.VITE_BASE_RPC_URL),
    [polygon.id]: http(import.meta.env.VITE_POLYGON_RPC_URL),
    [arbitrum.id]: http(import.meta.env.VITE_ARBITRUM_RPC_URL),
  },
})
```

Create `.env` file in your project root:

```bash
VITE_BASE_RPC_URL=https://your-base-rpc.com
VITE_POLYGON_RPC_URL=https://your-polygon-rpc.com
VITE_ARBITRUM_RPC_URL=https://your-arbitrum-rpc.com
```

**Why custom RPCs?** Default public RPCs have rate limits and can be slow or unreliable.

⚠️ **Warning:** If you include a chain in `supportedChains` that is not configured in wagmi, users will see the chain option but it won't work when selected.


#### TokenWithImage Interface

```tsx
interface TokenWithImage {
  address: string      // Token contract address (use "0x0000000000000000000000000000000000000000" for native token)
  symbol: string       // Token symbol (e.g., "ETH", "DEGEN", "USDC")
  decimals: number     // Token decimals (18 for most tokens, 6 for USDC)
  image: string        // URL to token icon image
}
```

## Common Issues and Solutions

### TypeScript Errors

**Problem:** `Type 'string' is not assignable to type 'TokenWithImage'`

```tsx
// ❌ Wrong - missing required properties
<BetSwirlSDKProvider bankrollToken="DEGEN" />

// ✅ Correct - complete TokenWithImage object
const DEGEN_TOKEN: TokenWithImage = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
  symbol: "DEGEN",
  decimals: 18,
  image: "https://www.betswirl.com/img/tokens/DEGEN.svg"
}
<BetSwirlSDKProvider bankrollToken={DEGEN_TOKEN} />
```

**Problem:** `Property 'initialChainId' is missing`

```tsx
// ❌ Wrong - missing required prop
<BetSwirlSDKProvider>
  <App />
</BetSwirlSDKProvider>

// ✅ Correct - include required initialChainId
<BetSwirlSDKProvider initialChainId={base.id}>
  <App />
</BetSwirlSDKProvider>
```

### Token Configuration Issues

**Problem:** Token not appearing in the selection list

- Verify the token address is correct and matches the Bank contract
- Check that `allowed = true` and `paused = false` in the Bank contract
- Ensure the token is not filtered out by `filteredTokens` prop
- If using `filteredTokens`, make sure the token address is included in the array

**Problem:** Too many tokens in the selection list

Use `filteredTokens` to limit available options:
```tsx
// ✅ Limit to specific tokens for better UX
<BetSwirlSDKProvider
  initialChainId={base.id}
  filteredTokens={["0x0000000000000000000000000000000000000000", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"]}
>
  <App />
</BetSwirlSDKProvider>
```

**Problem:** Token icon not displaying

- Verify the `image` URL is accessible and returns a valid image
- Use the standard BetSwirl token image pattern: `https://www.betswirl.com/img/tokens/{SYMBOL}.svg`
- Ensure the image URL supports CORS for web applications

## Example Result

* **GitHub Repository**: [github.com/BetSwirl/betswirl-ui-react-demo](https://github.com/BetSwirl/betswirl-ui-react-demo)
* **Live Demo**: [betswirl-ui-react-demo.vercel.app](https://betswirl-ui-react-demo.vercel.app)

