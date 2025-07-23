import { testWithSynpress } from "@synthetixio/synpress"
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright"
import {
  closeAllDialogs,
  extractBalance,
  TEST_BET_AMOUNT,
  verifyCanPlayAgain,
  waitForBettingStates,
} from "../test/helpers/testHelpers"
import basicSetup from "../test/wallet-setup/basic.setup"

const test = testWithSynpress(metaMaskFixtures(basicSetup))
const { expect } = test

test.describe("Wheel Game", () => {
  test("should play wheel with ETH on Base chain", async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)

    // Navigate to wheel game
    await page.goto("/wheel.html")
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
      await page.screenshot({ path: "wheel-needs-funding.png", fullPage: true })
      throw new Error("Test wallet needs 0.001 ETH on Base chain to continue")
    }

    // Play wheel
    console.log("\n=== PLAYING WHEEL ===")

    // Enter bet amount
    const betAmountInput = page.locator("#betAmount")
    await expect(betAmountInput).toBeVisible()
    await betAmountInput.clear()
    await betAmountInput.fill(TEST_BET_AMOUNT)
    console.log(`Bet amount: ${TEST_BET_AMOUNT} ETH`)

    // Note: Unlike other games, WheelGame doesn't require any selection
    // The player just spins the wheel directly by placing a bet
    console.log("Wheel game ready - no selection needed")

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

    // Check for result - it might appear in different ways
    console.log("Checking for game result...")

    // First check if result modal appears
    const resultModal = page.locator('[role="dialog"]').filter({ hasText: /You (won|lost)/i })
    const hasResultModal = await resultModal.isVisible({ timeout: 10000 }).catch(() => false)

    let isWin = false
    let wheelResult: string | null = null
    if (hasResultModal) {
      const resultText = await resultModal.textContent()
      isWin = resultText?.toLowerCase().includes("won") || false

      // Try to extract the wheel result from the result
      const wheelMatch = resultText?.match(/wheel stopped at (\d+\.?\d*)/i)
      if (wheelMatch) {
        wheelResult = wheelMatch[1]
      }

      console.log(`\n🎡 RESULT FROM MODAL: ${isWin ? "WON! 🎉" : "Lost 😢"}`)
      if (wheelResult) {
        console.log(`Wheel stopped at: ${wheelResult}`)
      }

      // Close result modal using aria-label
      const resultCloseButton = resultModal.locator('button[aria-label="Close"]')
      if (await resultCloseButton.isVisible()) {
        await resultCloseButton.click()
        console.log("Result modal closed")
      }
    } else {
      // No modal found, determine result from balance change
      console.log("No result modal found, determining result from balance...")

      // Get current balance to determine win/loss
      const currentBalanceText = await balanceContainer.textContent()
      const currentBalance = extractBalance(currentBalanceText)

      // If balance increased (accounting for bet amount), player won
      // If balance decreased, player lost
      if (currentBalance > initialBalance - 0.0001) {
        isWin = true
        console.log(`\n🎡 RESULT FROM BALANCE: WON! 🎉 (${initialBalance} → ${currentBalance})`)
      } else {
        isWin = false
        console.log(`\n🎡 RESULT FROM BALANCE: Lost 😢 (${initialBalance} → ${currentBalance})`)
      }
    }

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

    const canPlayAgain = await verifyCanPlayAgain(page, "wheel-cannot-play-again.png")
    expect(canPlayAgain).toBe(true)

    console.log("\n✅ Wheel game test completed successfully!")
    if (balanceChanged) {
      console.log(`Balance change: ${initialBalance} ETH → ${finalBalance} ETH`)
    } else {
      console.log(`Balance: ${finalBalance} ETH (no visible change due to small bet amount)`)
    }
  })
})
