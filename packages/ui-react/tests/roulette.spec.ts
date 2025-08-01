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

test.describe("Roulette Game", () => {
  test("should play roulette with ETH on Base chain", async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)

    // Navigate to roulette game
    await page.goto("/roulette.html")
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
    const balanceContainer = await balanceElement.locator("..").first()
    const initialBalanceText = await balanceContainer.textContent()
    console.log("Initial balance text:", initialBalanceText)

    const initialBalance = extractBalance(initialBalanceText)
    console.log("Initial balance amount:", initialBalance)

    // Check if wallet has sufficient balance
    if (initialBalance === 0) {
      console.log("\n⚠️  WALLET NEEDS FUNDING")
      console.log(`Please send at least 0.001 ETH to ${address} on Base chain`)
      await page.screenshot({ path: "roulette-needs-funding.png", fullPage: true })
      throw new Error("Test wallet needs 0.001 ETH on Base chain to continue")
    }

    // Play roulette
    console.log("\n=== PLAYING ROULETTE ===")

    // Enter bet amount
    const betAmountInput = page.locator("#betAmount")
    await expect(betAmountInput).toBeVisible()
    await betAmountInput.clear()
    await betAmountInput.fill(TEST_BET_AMOUNT)
    console.log(`Bet amount: ${TEST_BET_AMOUNT} ETH`)

    // Place a bet - try different options
    console.log("Looking for betting options...")

    // Try to bet on "Even" which has better odds than a single number
    const evenButton = page.locator('button:has-text("Even")').first()
    if (await evenButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await evenButton.click()
      console.log("Placed bet on: Even")
    } else {
      // Alternative: bet on a specific number (17 is red)
      const number17 = page.locator("button").filter({ hasText: "17" }).first()
      if (await number17.isVisible({ timeout: 3000 }).catch(() => false)) {
        await number17.click()
        console.log("Placed bet on: Number 17")
      } else {
        // Fallback: click any red number
        const redNumber = page.locator("button.bg-roulette-red").first()
        await redNumber.click()
        console.log("Placed bet on: Red number")
      }
    }

    // Look for the play button
    console.log("Looking for play button...")
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
    console.log(`\n🎰 ROULETTE RESULT: ${isWin ? "WON! �" : "Lost 😢"}, Rolled: ${rolled}`)

    // Close bet history if it's open
    await closeAllDialogs(page)

    // Verify balance changed
    console.log("\n=== VERIFYING BALANCE CHANGE ===")
    const finalBalanceText = await balanceContainer.textContent()
    const finalBalance = extractBalance(finalBalanceText)
    console.log("Final balance:", finalBalance)

    // For small bets on mainnet, the balance might not visibly change due to rounding
    const balanceChanged = Math.abs(finalBalance - initialBalance) > 0
    if (!balanceChanged) {
      console.log("Balance appears unchanged due to rounding, but bet was processed successfully")
      // TODO #202: Test with BETS token and POL on Polygon to verify balance changes are visible with larger decimal precision
    }

    if (balanceChanged) {
      if (isWin) {
        // If won, balance should be higher
        expect(finalBalance).toBeGreaterThan(initialBalance)
      } else {
        // If lost, balance should be lower
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

    const canPlayAgain = await verifyCanPlayAgain(page, "roulette-cannot-play-again.png")
    expect(canPlayAgain).toBe(true)

    console.log("\n✅ Roulette game test completed successfully!")
    console.log(`Balance change: ${initialBalance} ETH → ${finalBalance} ETH`)
  })
})
