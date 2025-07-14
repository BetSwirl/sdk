# How to Check Available Tokens

This guide explains how to find which tokens are available for betting in the BetSwirl protocol on different blockchain networks.

> **Note:** Currently, this library only supports **Base network**. Multi-chain support is coming soon.

## Bank Contract Addresses

The Bank contract manages all available tokens. Here are the addresses by network:

### Mainnet Networks (Same Address)
All mainnet networks use the same Bank contract address: `0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA`

- **Base** (8453): [0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA](https://basescan.org/address/0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA#readContract)
- **Arbitrum** (42161): [0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA](https://arbiscan.io/address/0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA#readContract)
- **Polygon** (137): [0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA](https://polygonscan.com/address/0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA#readContract)
- **Avalanche** (43114): [0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA](https://snowtrace.io/address/0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA#readContract)
- **BSC** (56): [0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA](https://bscscan.com/address/0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA#readContract)


## Step-by-Step Guide to Check Tokens

### 1. Open the Block Explorer

For Base network (currently the only supported network):
- **Base**: https://basescan.org

For other networks (when multi-chain support is added):
- **Arbitrum**: https://arbiscan.io
- **Polygon**: https://polygonscan.com
- **Avalanche**: https://snowtrace.io
- **BSC**: https://bscscan.com

### 2. Navigate to the Bank Contract

1. Paste the Bank contract address in the search bar
2. Click on the address to open the contract page
3. Click on the **"Contract"** tab
4. Click on **"Read Contract"** (not Write Contract)

### 3. Find and Call getTokens()

1. Look for the function called **`getTokens`** in the list
2. Click on it to expand
3. Click the **"Query"** button (no wallet connection needed)

### 4. Understanding the Response

You'll get an array of tuples. Each tuple represents a token with this structure:

```
[decimals, address, name, symbol, allowed, paused, balanceRisk, ...]
```

Example response from Base:
```
[
  [18, 0x0000000000000000000000000000000000000000, "ETH", "ETH", true, false, 200, ...],
  [18, 0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed, "Degen", "DEGEN", true, false, 1000, ...],
  [6, 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913, "USD Coin", "USDC", true, false, 200, ...]
]
```

### Field Explanation

| Index | Field | Description |
|-------|-------|-------------|
| 0 | decimals | Token decimals (18 for most, 6 for USDC) |
| 1 | address | Token contract address |
| 2 | name | Full token name |
| 3 | symbol | Token symbol |
| 4 | allowed | `true` if token is allowed for betting |
| 5 | paused | `true` if token is temporarily disabled |
| 6 | balanceRisk | Risk percentage in basis points |

## Using Tokens in Your Code

Once you know which tokens are available, you can use them in your app:

```tsx
import type { TokenWithImage } from '@betswirl/ui'
import { base } from 'wagmi/chains'

// Example token configuration
const DEGEN_TOKEN: TokenWithImage = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
  symbol: "DEGEN",
  decimals: 18,
  image: "https://www.betswirl.com/img/tokens/DEGEN.svg"
}

// Native token (ETH on Base)
const ETH_TOKEN: TokenWithImage = {
  address: "0x0000000000000000000000000000000000000000",
  symbol: "ETH",
  decimals: 18,
  image: "https://www.betswirl.com/img/tokens/ETH.svg"
}

// USDC token
const USDC_TOKEN: TokenWithImage = {
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  symbol: "USDC",
  decimals: 6,
  image: "https://www.betswirl.com/img/tokens/USDC.svg"
}

// Use in BetSwirlSDKProvider
<BetSwirlSDKProvider
  initialChainId={base.id}
  bankrollToken={DEGEN_TOKEN}
  filteredTokens={[DEGEN_TOKEN.address, ETH_TOKEN.address]} // Optional: limit available tokens
>
  <YourApp />
</BetSwirlSDKProvider>
```

## Token Filtering

The `filteredTokens` prop allows you to control which tokens are available for users to select in your application.

### How Token Filtering Works

1. **Without filtering** - All active tokens from the Bank contract are available
2. **With filtering** - Only tokens whose addresses are in the `filteredTokens` array are available
3. **Invalid addresses** - Tokens not found in the Bank contract are automatically excluded

### Common Use Cases

**Limit to specific tokens for your application:**
```tsx
// Example: Only allow ETH, USDC, and DEGEN
const ALLOWED_TOKENS = [
  "0x0000000000000000000000000000000000000000", // ETH
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
  "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", // DEGEN
]

<BetSwirlSDKProvider
  initialChainId={base.id}
  filteredTokens={ALLOWED_TOKENS}
>
  <App />
</BetSwirlSDKProvider>
```

### Dynamic Token Filtering

You can change the filtered tokens dynamically based on application state:

```tsx
const [filteredTokens, setFilteredTokens] = useState<string[]>([
  "0x0000000000000000000000000000000000000000", // ETH
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
])

// Update filtering based on user action
const showAllTokens = () => setFilteredTokens(undefined)
const showStableOnly = () => setFilteredTokens([
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
])

return (
  <BetSwirlSDKProvider
    initialChainId={base.id}
    filteredTokens={filteredTokens}
  >
    <App />
  </BetSwirlSDKProvider>
)
```

## Available Tokens by Network (as of July 2025)

### Base
- **ETH** - Native token
- **DEGEN** - `0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed`
- **USDC** - `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **BETS** - `0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5`
- **PEPE** - `0x52b492a33E447Cdb854c7FC19F1e57E8BfA1777D`

### Other Networks
Check using the steps above as token availability may vary by network.

## Important Notes

### Token Configuration
- **Token availability can change** - always check the Bank contract for the latest list
- **Active tokens** require both `allowed = true` and `paused = false`
- **Native token** always has address `0x0000000000000000000000000000000000000000`
- **Token images** follow the pattern: `https://www.betswirl.com/img/tokens/{SYMBOL}.svg`

### TypeScript Usage
- Import `TokenWithImage` type from `@betswirl/ui` for proper type safety
- Use `as const` for token addresses to ensure proper typing: `"0x..." as const`
- The `bankrollToken` prop is **optional** - if not provided, users can select from all available tokens
- The `filteredTokens` prop allows you to limit which tokens are available for selection

### Best Practices
- Always verify token addresses against the Bank contract before using them
- Use the exact decimals returned by the contract (18 for most tokens, 6 for USDC)
- Provide high-quality token images for better user experience
- Consider using `filteredTokens` to limit options if your app only supports specific tokens
