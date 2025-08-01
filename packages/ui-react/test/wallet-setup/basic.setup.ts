// Detailed debug setup with network switching
import { defineWalletSetup } from "@synthetixio/synpress"
import { MetaMask } from "@synthetixio/synpress/playwright"
import { testConfig } from "../spec.config"

const { seedPhrase: SEED_PHRASE, walletPassword: PASSWORD } = testConfig

console.log("Using test credentials from environment variables")

const basicSetup = defineWalletSetup(PASSWORD, async (context, walletPage) => {
  console.log("=== STARTING WALLET SETUP ===")

  const metamask = new MetaMask(context, walletPage, PASSWORD)
  console.log("Created MetaMask instance")

  // Import the wallet using the seed phrase
  console.log("Importing wallet...")
  await metamask.importWallet(SEED_PHRASE)
  console.log("Wallet imported successfully")

  // Add Base network
  console.log("Adding Base network...")
  try {
    await metamask.addNetwork({
      name: "Base",
      rpcUrl: "https://mainnet.base.org",
      chainId: 8453,
      symbol: "ETH",
      blockExplorerUrl: "https://basescan.org",
    })
    console.log("Base network added")
  } catch (error) {
    console.log("Base network error:", error)
  }

  // Add Polygon network
  console.log("Adding Polygon network...")
  try {
    await metamask.addNetwork({
      name: "Polygon",
      rpcUrl: "https://polygon-rpc.com",
      chainId: 137,
      symbol: "MATIC",
      blockExplorerUrl: "https://polygonscan.com",
    })
    console.log("Polygon network added")
  } catch (error) {
    console.log("Polygon network error:", error)
  }

  // Add Avalanche network
  console.log("Adding Avalanche network...")
  try {
    await metamask.addNetwork({
      name: "Avalanche",
      rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      symbol: "AVAX",
      blockExplorerUrl: "https://snowtrace.io",
    })
    console.log("Avalanche network added")
  } catch (error) {
    console.log("Avalanche network error:", error)
  }

  // Don't switch networks during setup - let the tests handle network switching
  // The switchNetwork call in setup was causing the hanging issue

  console.log("=== WALLET SETUP COMPLETED - All networks added ===")
})

// Export with walletPassword property for tests to access
export default Object.assign(basicSetup, { walletPassword: PASSWORD })
