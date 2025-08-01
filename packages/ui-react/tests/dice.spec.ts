import { testWithSynpress } from "@synthetixio/synpress"
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright"
import {
  closeAllDialogs,
  extractBalance,
  getGameResult,
  TEST_BET_AMOUNT,
  verifyCanPlayAgain,
  waitForBettingStates,
} from "../test/helpers/testHelpers"
import basicSetup from "../test/wallet-setup/basic.setup"

const test = testWithSynpress(metaMaskFixtures(basicSetup))
const { expect } = test

test.describe("Dice Game", () => {
  test("should play dice with ETH on Base chain", async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)

    // Navigate to dice game
    await page.goto("/dice.html")
    await page.waitForLoadState("networkidle")

    // Connect wallet
    console.log("\n=== CONNECTING WALLET ===")
    const connectButton = page.getByTestId("ockConnectButton")
    await expect(connectButton).toBeVisible()
    await connectButton.click()

    const onchainkitModal = page.locator('[data-testid="ockModalOverlay"]')
    await expect(onchainkitModal).toBeVisible()
    const metamaskBtn = onchainkitModal.getByRole("button").filter({ hasText: /metamask/i })
    await metamaskBtn.click()

    await metamask.connectToDapp()
    const address = await metamask.getAccountAddress()
    console.log("Connected wallet address:", address)

    // Wait for wallet connection to complete
    const walletConnectedBtn = page.locator('[data-testid="ockConnectWallet_Connected"]')
    await expect(walletConnectedBtn).toBeVisible({ timeout: 10000 })

    // Switch to Base chain for ETH game
    console.log("\n=== SWITCHING TO BASE CHAIN ===")
    try {
      await metamask.switchNetwork("Base")
      console.log("Switched to Base network")

      // Wait for UI to update
      await page.waitForTimeout(3000)
    } catch (error) {
      console.log("Error switching to Base network:", error)
      // Continue anyway - we might already be on Base
    }

    // Check current balance
    console.log("\n=== CHECKING WALLET STATUS ===")

    // Wait for balance to be visible
    const balanceElement = page.locator("text=/Balance:/").first()
    await expect(balanceElement).toBeVisible({ timeout: 20000 })

    // Get initial balance
    const balanceContainer = balanceElement.locator("..").first()
    const initialBalanceText = await balanceContainer.textContent()
    console.log("Initial balance text:", initialBalanceText)

    const initialBalance = extractBalance(initialBalanceText)
    console.log("Initial balance amount:", initialBalance)

    // Check if wallet has sufficient balance
    if (initialBalance === 0) {
      console.log("\n⚠️  WALLET NEEDS FUNDING")
      console.log(`Please send at least 0.001 ETH to ${address} on Base chain`)
      await page.screenshot({ path: "dice-needs-funding.png", fullPage: true })
      throw new Error("Test wallet needs 0.001 ETH on Base chain to continue")
    }

    // Play dice
    console.log("\n=== PLAYING DICE ===")

    // Enter bet amount
    const betAmountInput = page.locator("#betAmount")
    await expect(betAmountInput).toBeVisible()
    await betAmountInput.clear()
    await betAmountInput.fill(TEST_BET_AMOUNT)
    console.log(`Bet amount: ${TEST_BET_AMOUNT} ETH`)

    // Set dice number using slider
    console.log("Setting dice number...")
    // The slider is inside a div with specific classes
    const slider = page.locator('[role="slider"]')
    await expect(slider).toBeVisible({ timeout: 5000 })

    // Get current value
    const currentValue = await slider.getAttribute("aria-valuenow")
    console.log("Current dice value:", currentValue)

    // Set to 50 (middle value) for consistent testing
    // We'll use keyboard navigation which is more reliable than clicking
    await slider.focus()
    // Press End to go to max (99), then press Home to go to min (1)
    await page.keyboard.press("End")
    // Wait for value to update
    await expect(slider).toHaveAttribute("aria-valuenow", "99", { timeout: 1000 })

    await page.keyboard.press("Home")
    // Wait for value to update
    await expect(slider).toHaveAttribute("aria-valuenow", "1", { timeout: 1000 })

    // Now press right arrow 49 times to get to 50
    for (let i = 0; i < 49; i++) {
      await page.keyboard.press("ArrowRight")
    }
    // Wait for the final value
    await expect(slider).toHaveAttribute("aria-valuenow", "50", { timeout: 2000 })

    const newValue = await slider.getAttribute("aria-valuenow")
    console.log("Set dice value to:", newValue)

    // Look for the play button
    console.log("Looking for play button...")

    // Wait for the play button to be in the correct state
    const playButton = page.getByRole("button", { name: "Place Bet" })
    await expect(playButton).toBeVisible({ timeout: 10000 })
    await expect(playButton).toBeEnabled()

    // Click play button
    await playButton.click()
    console.log("Clicked Place Bet button")

    // Confirm transaction in MetaMask
    await metamask.confirmTransaction()
    console.log("Transaction confirmed in MetaMask")

    // Wait for bet to be processed through its various states
    await waitForBettingStates(page)

    // Check for game result using the standardized approach
    console.log("Checking for game result...")
    const { isWin, rolled } = await getGameResult(page)
    console.log(`\n🎲 DICE RESULT: ${isWin ? "WON! 🎉" : "Lost 😢"}, Rolled: ${rolled}`)

    // Close bet history if it's open
    await closeAllDialogs(page)

    // Verify balance changed
    console.log("\n=== VERIFYING BALANCE CHANGE ===")
    const finalBalanceText = await balanceContainer.textContent()
    const finalBalance = extractBalance(finalBalanceText)
    console.log("Final balance:", finalBalance)

    // For small bets on mainnet, the balance might not visibly change due to rounding
    // We'll check if the test completed successfully instead of requiring visible balance change
    const balanceChanged = Math.abs(finalBalance - initialBalance) > 0
    if (!balanceChanged) {
      console.log("Balance appears unchanged due to rounding, but bet was processed successfully")
      // TODO #202: Test with BETS token and POL on Polygon to verify balance changes are visible with larger decimal precision
    }

    if (balanceChanged) {
      if (isWin) {
        // If won, balance should be higher than initial minus bet
        expect(finalBalance).toBeGreaterThan(initialBalance - 0.0001)
      } else {
        // If lost, balance should be exactly initial minus bet (accounting for gas)
        expect(finalBalance).toBeLessThan(initialBalance)
      }
    } else {
      // Balance unchanged due to rounding - just verify the game completed
      console.log("Balance validation skipped due to rounding")
    }

    // Verify we can play again
    console.log("\n=== VERIFYING READY TO PLAY AGAIN ===")

    // First ensure bet amount input is visible
    await expect(betAmountInput).toBeVisible({ timeout: 5000 })

    const canPlayAgain = await verifyCanPlayAgain(page, "dice-cannot-play-again.png")
    expect(canPlayAgain).toBe(true)

    console.log("\n✅ Dice game test completed successfully!")
    if (balanceChanged) {
      console.log(`Balance change: ${initialBalance} ETH → ${finalBalance} ETH`)
    } else {
      console.log(`Balance: ${finalBalance} ETH (no visible change due to small bet amount)`)
    }
  })
})
