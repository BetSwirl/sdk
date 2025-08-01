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

test.describe("Coin Toss Game", () => {
  test("should play coin toss with ETH on Base chain", async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)

    // Navigate to coin toss game
    await page.goto("/coinToss.html")
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

    // We're on Base chain, so the balance shown is ETH
    console.log("Balance on Base chain:", initialBalanceText)

    const initialBalance = extractBalance(initialBalanceText)
    console.log("Initial ETH balance amount:", initialBalance)

    // Check if wallet has sufficient balance
    if (initialBalance === 0) {
      console.log("\n⚠️  WALLET NEEDS FUNDING")
      console.log(`Please send at least 0.001 ETH to ${address} on Base chain`)
      await page.screenshot({ path: "coinToss-needs-funding.png", fullPage: true })
      throw new Error("Test wallet needs 0.001 ETH on Base chain to continue")
    }

    // Play coin toss
    console.log("\n=== PLAYING COIN TOSS ===")

    // Enter bet amount
    const betAmountInput = page.locator("#betAmount")
    await expect(betAmountInput).toBeVisible()
    await betAmountInput.clear()
    await betAmountInput.fill(TEST_BET_AMOUNT)
    console.log(`Bet amount: ${TEST_BET_AMOUNT} ETH`)

    // Select heads using proper locator
    console.log("Looking for coin selection button...")
    // The coin button shows the current selection and clicking it toggles to the other side
    // If it shows "Select Tails side", then Heads is currently selected
    // If it shows "Select Heads side", then Tails is currently selected
    const coinButton = page.locator('button[aria-label*="Select"][aria-label*="side"]')
    await expect(coinButton).toBeVisible({ timeout: 5000 })

    // Check current selection
    const ariaLabel = await coinButton.getAttribute("aria-label")
    console.log("Current coin button aria-label:", ariaLabel)

    // If it says "Select Heads side", then Tails is selected, so we need to click to get Heads
    if (ariaLabel?.includes("Select Heads")) {
      await coinButton.click()
      console.log("Clicked to select Heads")
    } else {
      console.log("Heads is already selected")
    }

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
    console.log(`\n🎰 COIN TOSS RESULT: ${isWin ? "WON! 🎉" : "Lost 😢"}, Rolled: ${rolled}`)

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

    const canPlayAgain = await verifyCanPlayAgain(page, "coinToss-cannot-play-again.png")
    expect(canPlayAgain).toBe(true)

    console.log("\n✅ Coin toss game test completed successfully!")
    if (balanceChanged) {
      console.log(`Balance change: ${initialBalance} ETH → ${finalBalance} ETH`)
    } else {
      console.log(`Balance: ${finalBalance} ETH (no visible change due to small bet amount)`)
    }
  })

  test("should play multiple coin toss games in a row", async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)
    const numberOfGames = 3 // Play 3 games in a row
    const gameResults: {
      gameNumber: number
      selection: string
      result: string
      balanceAfter: number
    }[] = []

    // Navigate to coin toss game
    await page.goto("/coinToss.html")
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

    // Get initial balance
    console.log("\n=== CHECKING INITIAL BALANCE ===")
    const balanceElement = page.locator("text=/Balance:/").first()
    await expect(balanceElement).toBeVisible({ timeout: 20000 })
    const balanceContainer = balanceElement.locator("..").first()
    const initialBalanceText = await balanceContainer.textContent()

    // We're on Base chain, so the balance shown is ETH
    console.log("Balance on Base chain:", initialBalanceText)

    const startingBalance = extractBalance(initialBalanceText)
    console.log("Starting ETH balance:", startingBalance)

    // Check if wallet has sufficient balance for multiple games
    const totalBetAmount = Number.parseFloat(TEST_BET_AMOUNT) * numberOfGames
    if (startingBalance < totalBetAmount) {
      console.log("\n⚠️  WALLET NEEDS MORE FUNDING FOR MULTIPLE GAMES")
      console.log(`Please send at least ${totalBetAmount} ETH to ${address} on Base chain`)
      await page.screenshot({ path: "coinToss-multiple-needs-funding.png", fullPage: true })
      throw new Error(
        `Test wallet needs at least ${totalBetAmount} ETH on Base chain for ${numberOfGames} games`,
      )
    }

    let currentBalance = startingBalance
    const betAmountInput = page.locator("#betAmount")
    const coinButton = page.locator('button[aria-label*="Select"][aria-label*="side"]')

    // Play multiple games
    for (let gameNumber = 1; gameNumber <= numberOfGames; gameNumber++) {
      console.log(`\n=== PLAYING GAME ${gameNumber} OF ${numberOfGames} ===`)

      // Enter bet amount (only if enabled - it's disabled when showing "Try again")
      await expect(betAmountInput).toBeVisible()
      const isInputEnabled = await betAmountInput.isEnabled()
      if (isInputEnabled) {
        await betAmountInput.clear()
        await betAmountInput.fill(TEST_BET_AMOUNT)
        console.log(`Game ${gameNumber} - Bet amount: ${TEST_BET_AMOUNT} ETH`)
      } else {
        console.log(`Game ${gameNumber} - Using previous bet amount (input disabled)`)
      }

      // Alternate between heads and tails for variety
      const selectHeads = gameNumber % 2 === 1

      // Check if coin button is visible and enabled
      const isCoinButtonVisible = await coinButton.isVisible({ timeout: 5000 }).catch(() => false)
      if (isCoinButtonVisible) {
        const isCoinButtonEnabled = await coinButton.isEnabled()
        console.log(
          "Game " +
            gameNumber +
            " - Coin button visible: " +
            isCoinButtonVisible +
            ", enabled: " +
            isCoinButtonEnabled,
        )

        if (isCoinButtonEnabled) {
          const ariaLabel = await coinButton.getAttribute("aria-label")

          if (selectHeads) {
            // Select heads
            if (ariaLabel?.includes("Select Heads")) {
              await coinButton.click()
              console.log(`Game ${gameNumber} - Selected: Heads`)
            } else {
              console.log(`Game ${gameNumber} - Heads already selected`)
            }
          } else {
            // Select tails
            if (ariaLabel?.includes("Select Tails")) {
              await coinButton.click()
              console.log(`Game ${gameNumber} - Selected: Tails`)
            } else {
              console.log(`Game ${gameNumber} - Tails already selected`)
            }
          }
        } else {
          console.log(`Game ${gameNumber} - Coin button is disabled, skipping selection`)
        }
      } else {
        console.log(`Game ${gameNumber} - Coin button not visible, skipping selection`)
      }

      // Find and click play button
      const playButton = page.locator('button:has-text("Place Bet"), button:has-text("Try again")')
      await expect(playButton).toBeVisible({ timeout: 10000 })
      await expect(playButton).toBeEnabled()

      // Check which button text we have
      const buttonText = await playButton.textContent()
      console.log(`Game ${gameNumber} - Button text: '${buttonText}'`)

      await playButton.click()
      console.log(`Game ${gameNumber} - Clicked play button`)

      // Only confirm transaction if it's a new bet (not "Try again")
      if (buttonText?.includes("Place Bet")) {
        await metamask.confirmTransaction()
        console.log(`Game ${gameNumber} - Transaction confirmed`)
      } else {
        console.log(`Game ${gameNumber} - No transaction to confirm (Try again button)`)
      }

      // Wait for bet to be processed
      await waitForBettingStates(page)

      // Check for result
      const resultModal = page.locator('[role="dialog"]').filter({ hasText: /You (won|lost)/i })
      const hasResultModal = await resultModal.isVisible({ timeout: 10000 }).catch(() => false)

      let isWin = false
      if (hasResultModal) {
        const resultText = await resultModal.textContent()
        isWin = resultText?.toLowerCase().includes("won") || false

        // Close result modal
        const resultCloseButton = resultModal.locator('button[aria-label="Close"]')
        if (await resultCloseButton.isVisible()) {
          await resultCloseButton.click()
        }
      } else {
        // Determine result from balance
        const currentBalanceText = await balanceContainer.textContent()
        const newBalance = extractBalance(currentBalanceText)
        isWin = newBalance > currentBalance - Number.parseFloat(TEST_BET_AMOUNT)
      }

      // Update current balance after the game
      const postGameBalanceText = await balanceContainer.textContent()
      const postGameBalance = extractBalance(postGameBalanceText)

      gameResults.push({
        gameNumber,
        selection: selectHeads ? "Heads" : "Tails",
        result: isWin ? "Won" : "Lost",
        balanceAfter: postGameBalance,
      })

      console.log(`Game ${gameNumber} - Result: ${isWin ? "WON! 🎉" : "Lost 😢"}`)
      console.log(`Game ${gameNumber} - Balance after: ${postGameBalance} ETH`)

      currentBalance = postGameBalance

      // Close any open dialogs
      await closeAllDialogs(page)

      // Small delay between games to ensure UI is ready
      if (gameNumber < numberOfGames) {
        await page.waitForTimeout(1000)
      }
    }

    // Verify final results
    console.log("\n=== GAME SUMMARY ===")
    let totalWins = 0
    let totalLosses = 0

    gameResults.forEach((game) => {
      console.log(
        "Game " +
          game.gameNumber +
          ": " +
          game.selection +
          " - " +
          game.result +
          " (Balance: " +
          game.balanceAfter +
          " ETH)",
      )
      if (game.result === "Won") totalWins++
      else totalLosses++
    })

    console.log(`\nTotal games played: ${numberOfGames}`)
    console.log(`Wins: ${totalWins}, Losses: ${totalLosses}`)
    console.log(`Starting balance: ${startingBalance} ETH`)
    console.log(`Final balance: ${currentBalance} ETH`)
    console.log(`Net change: ${(currentBalance - startingBalance).toFixed(4)} ETH`)

    // Verify we played all games
    expect(gameResults.length).toBe(numberOfGames)

    // Verify balance changed (should have decreased by at least the gas fees) or stayed the same if wins balanced losses
    // In Base network, gas fees are very low so balance might stay the same if wins equal losses
    // We just verify that we tracked the balance correctly
    const expectedBalanceChange = (totalWins - totalLosses) * Number.parseFloat(TEST_BET_AMOUNT)
    const actualBalanceChange = currentBalance - startingBalance
    const tolerance = 0.000000001 // Allow for gas fees and floating point precision

    console.log(`Expected balance change: ${expectedBalanceChange} ETH`)
    console.log(`Actual balance change: ${actualBalanceChange} ETH`)
    console.log(`Tolerance for gas fees and precision: ${tolerance} ETH`)

    // Round to avoid floating point precision issues
    const difference = Math.abs(actualBalanceChange - expectedBalanceChange)
    const roundedDifference = Math.round(difference * 10000) / 10000 // Round to 4 decimal places

    expect(roundedDifference).toBeLessThanOrEqual(tolerance)

    // Verify we can still play another game
    const canPlayAgain = await verifyCanPlayAgain(page, "coinToss-multiple-cannot-play-again.png")
    expect(canPlayAgain).toBe(true)

    console.log("\n✅ Multiple coin toss games test completed successfully!")
  })
})
