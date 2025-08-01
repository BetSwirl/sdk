import "dotenv/config"
import path from "node:path"
import dotenv from "dotenv"

// Load secrets from .secrets file in project root
dotenv.config({ path: path.resolve(process.cwd(), ".secrets") })

export interface TestConfig {
  seedPhrase: string
  walletPassword: string
}

if (!process.env.SEED_PHRASE || !process.env.WALLET_PASSWORD) {
  throw new Error(
    "SEED_PHRASE and WALLET_PASSWORD must be set in .secrets file for E2E tests. " +
      "Copy .secrets.example to .secrets and fill in your test wallet credentials.",
  )
}

export const testConfig: TestConfig = {
  seedPhrase:
    process.env.SEED_PHRASE || "test test test test test test test test test test test junk",
  walletPassword: process.env.WALLET_PASSWORD || "Tester@1234",
}
