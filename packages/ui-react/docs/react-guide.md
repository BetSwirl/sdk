# React Integration Guide

bwonс## Create Demo Project

```shell
# node --version
# v24.2.0

pnpm create vite@latest betswirl-ui-react-demo -- --template react-ts
cd betswirl-ui-react-demo
pnpm install
```

## Verify Installation

```shell
pnpm dev
# Open http://localhost:5173
```

## Add BetSwirl

### Install

```shell
pnpm add @betswirl/ui-react
```

Package: [npmjs.com/package/@betswirl/ui-react](https://www.npmjs.com/package/@betswirl/ui-react)

### Update main.tsx

Add all providers directly or create an AppProviders component:

```tsx
import { createRoot } from 'react-dom/client'
import { OnchainKitProvider, type AppConfig } from '@coinbase/onchainkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, type Hex } from 'viem'
import { WagmiProvider, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { BalanceProvider, BetSwirlSDKProvider, TokenProvider, type TokenWithImage } from '@betswirl/ui-react'
import './index.css'
import '@betswirl/ui-react/styles.css'
import App from './App.tsx'

const queryClient = new QueryClient()
const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
})

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
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <OnchainKitProvider chain={base} config={onChainKitConfig}>
        <BetSwirlSDKProvider
          initialChainId={base.id}
          bankrollToken={DEGEN_TOKEN}     // Optional: set default betting token
          filteredTokens={ALLOWED_TOKENS} // Optional: limit available tokens
        >
          <TokenProvider>
            <BalanceProvider>
              <App />
            </BalanceProvider>
          </TokenProvider>
        </BetSwirlSDKProvider>
      </OnchainKitProvider>
    </QueryClientProvider>
  </WagmiProvider>,
)
```

### Add Game Component

In `src/App.tsx`:

```tsx
import { CoinTossGame, DiceGame, RouletteGame, KenoGame, WheelGame } from '@betswirl/ui-react'

// Add component (choose one or multiple)
<div style={{ margin: '2rem 0' }}>
  <CoinTossGame />
  {/* <DiceGame /> */}
  {/* <RouletteGame /> */}
  {/* <KenoGame /> */}
  {/* <WheelGame /> */}
</div>
```

### Run

```shell
pnpm dev
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

## Configuration

### BetSwirlSDKProvider Props

You can customize the SDK behavior with these optional props:

```tsx
<BetSwirlSDKProvider
  initialChainId={base.id}
  affiliate="0x1234567890123456789012345678901234567890"  // Your affiliate address
  bankrollToken={customToken}                            // Default betting token
  filteredTokens={["0x...", "0x..."]}                   // Limit available tokens
  supportedChains={[base.id, arbitrum.id, polygon.id]}  // Enable multi-chain support
>
  <App />
</BetSwirlSDKProvider>
```

| Prop | Type | Description |
|------|------|-------------|
| `initialChainId` | `number` | **Required.** Chain ID to initialize the SDK with |
| `affiliate` | `string` | Optional. Your wallet address to receive affiliate commissions. If not provided, default affiliate will be used |
| `bankrollToken` | `TokenWithImage` | Optional. Default token for betting. Must include `address`, `symbol`, `decimals`, and `image` properties. [See available tokens →](./checking-available-tokens.md) |
| `filteredTokens` | `string[]` | Optional. Array of token addresses to limit which tokens are available for selection. If not provided, all supported tokens will be available. [Learn more about token filtering →](./checking-available-tokens.md#token-filtering) |
| `supportedChains` | `number[]` | Optional. Array of chain IDs to enable multi-chain support. If not specified, all BetSwirl-supported chains are available |

### Multi-Chain Support

When multiple chains are configured:
- Players can switch between chains using the chain selector in the betting panel
- Chain preferences are persisted per wallet address
- Token balances update automatically when switching chains

#### TokenWithImage Interface

```tsx
interface TokenWithImage {
  address: string      // Token contract address (use "0x0000000000000000000000000000000000000000" for native token)
  symbol: string       // Token symbol (e.g., "ETH", "DEGEN", "USDC")
  decimals: number     // Token decimals (18 for most tokens, 6 for USDC)
  image: string        // URL to token icon image
}
```

### Environment Variables

**You do NOT need any environment variables** when using this library. All configuration is done through React props.

### Advanced Configuration (Optional)

If you want to use a custom RPC endpoint for better performance, you can set:

```env
VITE_RPC_URL=https://your-custom-base-rpc.com
```

This library currently supports **Base network only**. The custom RPC URL will be used instead of the default Base RPC (`https://mainnet.base.org`).

**When to use custom RPC:**
- You have a premium RPC provider (Alchemy, Infura, etc.)
- You want better reliability or speed
- You're hitting rate limits on the default public RPC

**When NOT needed:**
- For most applications the default RPC works fine
- If you're just testing or getting started

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

