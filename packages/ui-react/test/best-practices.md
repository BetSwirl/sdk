# E2E Testing Best Practices for BetSwirl SDK

Best practices for writing E2E tests with Playwright and Synpress for the BetSwirl SDK UI components.

## General Playwright Best Practices

### 1. Test User-Visible Behavior
- Focus on testing what end users see and interact with
- Don't test implementation details
- Test the outcome, not the method

### 2. Test Isolation
- Each test should run independently with its own state
- Don't depend on test execution order
- Clean up after tests when necessary

### 3. Use Proper Locators
```typescript
// ❌ Bad - fragile CSS selectors
await page.click('.btn-primary')

// ✅ Good - user-facing locators
await page.getByRole('button', { name: 'Place Bet' }).click()
await page.getByTestId('bet-amount-input').fill('0.0001')
await page.getByLabel('Select heads').click()
```

Priority order for locators:
1. `getByRole()` - semantic HTML roles
2. `getByLabel()` - form elements with labels
3. `getByPlaceholder()` - input placeholders
4. `getByText()` - visible text content
5. `getByTestId()` - explicit test IDs
6. CSS/XPath selectors

### 4. Avoid Hard-Coded Waits
```typescript
// ❌ Bad - arbitrary waits
await page.waitForTimeout(5000)

// ✅ Good - wait for specific conditions
await expect(page.getByText('Balance:')).toBeVisible()
await page.waitForLoadState('networkidle')
await expect(playButton).toBeEnabled()
```

### 5. Use Web-First Assertions
```typescript
// Auto-waiting assertions that retry
await expect(page.getByRole('button', { name: 'Place Bet' })).toBeVisible()
await expect(page.getByText('Transaction confirmed')).toBeVisible({ timeout: 30000 })
```

## Synpress & MetaMask Best Practices

### 1. Wallet Setup
- Use `defineWalletSetup` in `test/wallet-setup/*.setup.ts`
- Cache wallet state for faster test execution
- Add required networks in setup, not in tests

```typescript
const basicSetup = defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, PASSWORD)
  await metamask.importWallet(SEED_PHRASE)
  
  // Add and switch to required network
  await metamask.addNetwork({
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    chainId: 8453,
    symbol: "ETH",
    blockExplorerUrl: "https://basescan.org"
  })
  await metamask.switchNetwork("Base")
})
```

### 2. Transaction Handling
```typescript
// Confirm transaction
await metamask.confirmTransaction()

// Wait for transaction to be mined
await expect(page.getByText('Transaction confirmed')).toBeVisible({ timeout: 30000 })
```

### 3. Balance Verification
```typescript
// Check balance before bet
const initialBalance = await getBalance(page)

// Place bet and wait for result
await placeBet(page, '0.0001')

// Verify balance changed
const finalBalance = await getBalance(page)
expect(finalBalance).not.toBe(initialBalance)
```

## BetSwirl-Specific Best Practices

### 1. Game State Management
- Always check wallet connection state first
- Verify correct network before testing
- Handle game-specific UI states (loading, rolling, results)

### 2. Button State Handling
```typescript
// The Place Bet button has many states
const playButtonStates = [
  "Place Bet",           // Ready to place bet
  "Connect Wallet",      // Wallet not connected
  "Switch chain",        // Wrong network
  "Approve Token",       // ERC20 approval needed
  "Placing Bet...",      // Transaction being submitted
  "Loading Bet...",      // Waiting for tx confirmation
  "Bet rolling...",      // Bet being resolved on-chain
  "Insufficient balance", // Not enough funds
  "Make your selection", // No game selection made
  "Loading...",          // Initial loading
  "Game paused",         // Game is paused
  "Error, try again"     // Error occurred
]

// Wait for correct state
await expect(playButton).toHaveText("Place Bet")
```

### 3. Dialog and Modal Handling
```typescript
// Close bet history if open
const historyCloseButton = page.locator('button[aria-label="Close"]')
if (await historyCloseButton.isVisible({ timeout: 2000 })) {
  await historyCloseButton.click()
}

// Handle result modals
const resultModal = page.locator('[role="dialog"]').filter({ hasText: /You (won|lost)/i })
if (await resultModal.isVisible()) {
  // Process result
  await page.getByRole('button', { name: 'Close' }).click()
}
```

### 4. Error Handling
```typescript
try {
  await metamask.confirmTransaction()
} catch (error) {
  // Take screenshot for debugging
  await page.screenshot({ path: 'error-state.png' })
  throw error
}
```

### 5. Test Data Management
- Use environment variables for sensitive data
- Store test credentials in `.env` file (git-ignored)
- Use consistent test amounts (e.g., 0.0001 ETH)

### 6. Page Object Pattern (Optional)
For complex tests, consider using Page Objects:

```typescript
class CoinTossPage {
  constructor(private page: Page) {}
  
  async selectHeads() {
    await this.page.getByLabel('Select heads').click()
  }
  
  async setBetAmount(amount: string) {
    await this.page.getByTestId('bet-amount-input').fill(amount)
  }
  
  async placeBet() {
    await this.page.getByRole('button', { name: 'Place Bet' }).click()
  }
}
```

## Running Tests

### Prerequisites (MUST be done before first run)

1. **Create test wallet configuration**:
   ```bash
   cd packages/ui-react  # Navigate to ui-react directory
   cp .env.example .env  # Create .env file from example
   ```
   
   Edit the `.env` file and add your test wallet credentials:
   ```
   SEED_PHRASE=your twelve word test wallet seed phrase here
   WALLET_PASSWORD=YourTestPassword123
   ```
   
   **To generate a new test wallet seed phrase** (if you don't have one):
   ```bash
   python3 -c "from mnemonic import Mnemonic; m = Mnemonic('english'); print('Generated seed phrase:', m.generate(strength=128))"  # Generate new seed phrase
   ```
   
   ⚠️ **CRITICAL**: 
   - Use a TEST wallet only - NEVER your main wallet!
   - **Default public wallet ("test test test...") is shared** - everyone has access to it and any funds deposited will be immediately stolen
   - If you see "Using default test credentials", you MUST create .env file with your private test wallet credentials
   - **Tests require real funds** - they place 0.0001 ETH bets and confirm transactions
   - Wallet needs funds on Base, Polygon, and Avalanche networks

2. **Build SDK packages**:
   ```bash
   pnpm build    # From SDK root directory
   ```

3. **Install Playwright browsers**:
   ```bash
   cd packages/ui-react           # Return to ui-react directory
   pnpm exec playwright install   # Install browsers
   ```

### Development

```bash
pnpm dev                   # 1. Start dev server (keep running in separate terminal)
pnpm test:e2e-setup        # 2. Setup MetaMask wallet cache (first time only)
pnpm test:e2e              # 3. Run all tests

# Or run specific game tests
pnpm test:cointoss
pnpm test:dice
pnpm test:roulette
pnpm test:keno

SLOW_MO=2000 pnpm test:cointoss    # Run with slow motion (for debugging/screenshots)
pnpm test:clear-cache               # Clear cache if wallet setup changed
```

### CI/CD
```bash
HEADLESS=true pnpm test:e2e         # Run all tests in headless mode
pnpm test:e2e --reporter=list,html  # Run with detailed reporter
```

## Debugging

### 1. Use Playwright Inspector
```bash
PWDEBUG=1 pnpm test:cointoss
```

### 2. Take Screenshots on Failure
```typescript
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    await page.screenshot({ path: `failure-${Date.now()}.png` })
  }
})
```

### 3. Use Trace Viewer
```bash
pnpm exec playwright show-trace test-results/*/trace.zip  # Show trace for failed tests
```

## Common Pitfalls to Avoid

1. **Don't use index-based button selection** - UI might change
2. **Don't hardcode wait times** - Use proper wait conditions
3. **Don't test third-party services** - Focus on your app
4. **Don't share state between tests** - Keep tests isolated
5. **Don't ignore flaky tests** - Fix the root cause
6. **Don't use production wallets** - Use test accounts only
7. **Don't commit sensitive data** - Use environment variables
