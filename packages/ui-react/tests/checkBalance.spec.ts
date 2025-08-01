import { testWithSynpress } from "@synthetixio/synpress"
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright"
import { testConfig } from "../test/spec.config"
import basicSetup from "../test/wallet-setup/basic.setup"

const test = testWithSynpress(metaMaskFixtures(basicSetup))
const { expect } = test

test("check wallet balance on Base", async ({ context, page, metamaskPage, extensionId }) => {
  const password = testConfig.walletPassword
  const metamask = new MetaMask(context, metamaskPage, password, extensionId)

  // Navigate to app
  await page.goto("/")
  await page.waitForLoadState("networkidle")

  // Connect wallet
  console.log("Connecting wallet...")
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

  // Wait for balance to load
  await page.waitForTimeout(5000)

  // Check balance - look for the balance button next to the "Balance:" span
  const balanceSection = page.locator("text=Balance:").locator("..")
  await expect(balanceSection).toBeVisible({ timeout: 30000 })

  const balanceButton = balanceSection.locator("button").first()
  await expect(balanceButton).toBeVisible()

  const balanceText = await balanceButton.textContent()
  console.log("\n========================================")
  console.log("🎮 BETSWIRL E2E TEST WALLET INFO")
  console.log("========================================")
  console.log("Wallet Address:", address)
  console.log("Current Balance:", balanceText)

  // Check if we're on Base chain
  const chainIcon = balanceButton.locator(".mask-overlap-cutout")
  const chainIconVisible = await chainIcon.isVisible()
  if (chainIconVisible) {
    const chainIconSrc = await chainIcon.evaluate((el) => {
      const bgImage = window.getComputedStyle(el).backgroundImage
      return bgImage.match(/url\("(.+)"\)/)?.[1] || ""
    })
    const currentChainName = chainIconSrc.match(/chains\/(.+)\.svg/)?.[1] || "unknown"
    console.log("Current chain:", currentChainName)
  }

  // Check balance amount
  const balanceMatch = balanceText?.match(/([\d.]+)\s*ETH/)
  const balanceAmount = balanceMatch ? Number.parseFloat(balanceMatch[1]) : 0
  console.log("Balance amount:", balanceAmount, "ETH")

  if (balanceAmount === 0) {
    console.log("\n⚠️  WALLET NEEDS FUNDING")
    console.log(`Please send at least 0.001 ETH to ${address} on Base chain`)
    console.log(`Check balance at: https://basescan.org/address/${address}`)
  } else {
    console.log("\n✅ Wallet has sufficient balance for testing")
  }

  console.log("========================================\n")
})
