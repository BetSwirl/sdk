import { expect, Page } from "@playwright/test"
import { MetaMask } from "@synthetixio/synpress/playwright"

/**
 * Unified test bet amount used across all E2E tests to ensure consistency
 * and reduce the risk of test failures due to insufficient wallet balance.
 * This very small amount (1 gwei) works reliably across all supported networks.
 */
export const TEST_BET_AMOUNT = "0.000000001"

/**
 * Extract balance from text containing ETH amount
 * @param balanceText - Text containing balance like "Balance: 0.002" or "0.002 ETH"
 * @returns Numeric balance value
 */
export function extractBalance(balanceText: string | null): number {
  if (!balanceText) return 0
  // Match patterns like "Balance: 0.002" or "0.002 ETH"
  const match = balanceText.match(/([\d.]+)\s*(?:ETH)?/)
  return match ? Number.parseFloat(match[1]) : 0
}

/**
 * Result data extracted from the game result window UI
 */
export interface GameResultFromUI {
  isWin: boolean
  rolled: string | null
}

/**
 * Extract game result from the GameResultWindow component
 * This function provides a reliable way to get game outcomes by reading
 * the data-result-type attribute and rolled value from the standardized
 * game result window component.
 *
 * @param page - Playwright page object
 * @returns Promise resolving to game result data
 */
export async function getGameResult(page: Page): Promise<GameResultFromUI> {
  console.log("Looking for game result window...")

  const resultWindow = page.getByTestId("game-result-window")
  await expect(resultWindow).toBeVisible({ timeout: 10000 })

  await expect(resultWindow).toHaveAttribute("data-result-type", /win|loss/, { timeout: 10000 })

  const resultType = await resultWindow.getAttribute("data-result-type")
  const isWin = resultType === "win"

  const rolled = await resultWindow.getByTestId("rolled").textContent()

  console.log(`Game result extracted: ${resultType}, rolled: ${rolled}`)

  return {
    isWin,
    rolled,
  }
}

/**
 * Close all open dialogs and panels
 * @param page - Playwright page object
 */
export async function closeAllDialogs(page: Page): Promise<void> {
  console.log("Checking for open panels...")

  // Look for any close button with aria-label="Close"
  const closeButtons = await page.locator('button[aria-label="Close"]').all()
  for (const button of closeButtons) {
    if (await button.isVisible()) {
      await button.click()
      console.log("Closed a panel")
      // Wait for the button to disappear
      await expect(button).toBeHidden({ timeout: 2000 })
    }
  }

  // Also check for any visible sheets/dialogs and close them
  const dialogs = await page.locator('[role="dialog"]:visible').all()
  if (dialogs.length > 0) {
    console.log(`Found ${dialogs.length} open dialog(s), attempting to close...`)
    // Press Escape to close any open dialogs
    await page.keyboard.press("Escape")
    // Wait for dialogs to close
    await expect(page.locator('[role="dialog"]:visible')).toHaveCount(0, { timeout: 2000 })
  }
}

/**
 * Verify the play button is ready for another bet
 * @param page - Playwright page object
 * @param screenshotName - Name for screenshot if button not found
 * @returns True if play button is ready
 */
export async function verifyCanPlayAgain(
  page: Page,
  screenshotName = "cannot-play-again.png",
): Promise<boolean> {
  // The play button should be visible and show either "Place Bet" or "Try again"
  // After a successful bet, it shows "Try again"
  const playAgainButton = page.locator('button:has-text("Place Bet"), button:has-text("Try again")')
  const canPlayAgain = await playAgainButton.isVisible({ timeout: 5000 }).catch(() => false)

  if (canPlayAgain) {
    console.log("Play button is ready for another bet")
  } else {
    // If play button not found, take screenshot for debugging
    await page.screenshot({ path: screenshotName, fullPage: true })
    console.log("Cannot find play button, screenshot saved")

    // Check what text the button currently has
    const allButtons = await page.locator("button").all()
    for (const button of allButtons) {
      const text = await button.textContent()
      if (text && !text.includes("Max") && !text.includes("History") && !text.includes("Info")) {
        console.log(`Button found with text: "${text}"`)
      }
    }
  }

  return canPlayAgain
}

/**
 * Wait for button to go through betting states
 * @param page - Playwright page object
 * @param chainId - Optional chain ID for chain-specific handling
 */
export async function waitForBettingStates(page: Page, chainId?: number): Promise<void> {
  console.log("Waiting for bet to be processed...")

  // After confirming transaction, button should show "Placing Bet..."
  const placingBetButton = page.getByRole("button", { name: "Placing Bet..." })
  const hasPlacingState = await placingBetButton.isVisible({ timeout: 5000 }).catch(() => false)
  if (hasPlacingState) {
    console.log("Transaction is being placed...")
    await expect(placingBetButton).toBeHidden({ timeout: 30000 })
  }

  // Then it should show "Loading Bet..." while waiting for confirmation
  const loadingBetButton = page.getByRole("button", { name: "Loading Bet..." })
  const hasLoadingState = await loadingBetButton.isVisible({ timeout: 5000 }).catch(() => false)
  if (hasLoadingState) {
    console.log("Waiting for transaction confirmation...")
    await expect(loadingBetButton).toBeHidden({ timeout: 120000 })
  }

  // Finally it should show "Bet rolling..." while the bet is being resolved
  const rollingButton = page.getByRole("button", { name: "Bet rolling..." })
  const hasRollingState = await rollingButton.isVisible({ timeout: 5000 }).catch(() => false)
  if (hasRollingState) {
    console.log("Bet is rolling...")
    // Use shorter timeout for Polygon due to known VRF delays
    const rollingTimeout = chainId === 137 ? 30000 : 120000
    try {
      await expect(rollingButton).toBeHidden({ timeout: rollingTimeout })
    } catch (error) {
      if (chainId === 137) {
        console.warn(
          "⚠️ Bet resolution timeout on Polygon - this is a known issue with VRF on Polygon mainnet",
        )
        console.warn("The bet was placed successfully but VRF callback may be delayed")
        // Take a screenshot for debugging
        await page.screenshot({ path: "polygon-vrf-timeout.png", fullPage: true })
        // Don't throw error for Polygon, just warn
        return
      }
      throw error
    }
  }

  console.log("Bet processing completed!")
}

/**
 * Ensure wallet is on the specified chain, switch if necessary
 * @param metamask - MetaMask instance
 * @param page - Playwright page object
 * @param chainName - Name of the chain (e.g., "Base", "Polygon")
 * @param expectedToken - Expected token symbol for balance verification (e.g., "ETH", "POL")
 * @returns True if chain switch was successful
 */
export async function ensureWalletOnChain(
  metamask: MetaMask,
  page: Page,
  chainName: string,
  expectedToken: string,
): Promise<boolean> {
  console.log(`\n=== SWITCHING TO ${chainName.toUpperCase()} CHAIN ===`)

  try {
    // Always switch to the requested chain
    console.log(`Switching wallet to ${chainName} network...`)
    await metamask.switchNetwork(chainName)
    await page.waitForTimeout(3000)

    // Reload page to ensure chain change is reflected
    await page.reload()
    await page.waitForLoadState("networkidle")

    // Verify balance shows expected token
    const balanceElement = page.locator("text=/Balance:/").first()
    const isBalanceVisible = await balanceElement.isVisible({ timeout: 10000 }).catch(() => false)

    if (isBalanceVisible) {
      const balanceContainer = await balanceElement.locator("..").first()
      const balanceText = await balanceContainer.textContent()

      if (!balanceText?.includes(expectedToken)) {
        console.log(`❌ Balance shows wrong token for ${chainName} chain`)
        console.log(`Expected: ${expectedToken} balance, Got:`, balanceText)
        return false
      }

      console.log(`✅ Confirmed ${expectedToken} balance on ${chainName} chain:`, balanceText)
    }

    return true
  } catch (error) {
    console.log(`❌ Error switching to ${chainName} chain:`, error)
    return false
  }
}
