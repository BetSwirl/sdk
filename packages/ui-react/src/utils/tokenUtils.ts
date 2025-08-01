import { Token } from "@betswirl/sdk-core"
import type { Token as OnchainKitToken } from "@coinbase/onchainkit/token"
import { type Address } from "viem"
import { TokenWithImage } from "../types/types"

export interface FilterTokensResult<T extends Token = Token> {
  filtered: T[]
  unmatched: Address[]
}

/**
 * Compares two token addresses for equality (case-insensitive)
 * @param address1 - First address to compare
 * @param address2 - Second address to compare
 * @returns True if addresses are equal (case-insensitive)
 */
function areAddressesEqual(address1: string, address2: string): boolean {
  return address1.toLowerCase() === address2.toLowerCase()
}

/**
 * Filters tokens based on allowed address list and returns both filtered tokens and unmatched addresses
 *
 * @param tokens - Array of available tokens to filter from
 * @param allowedTokenAddresses - Array of token addresses to allow (simplified API)
 * @returns Object with filtered tokens and unmatched addresses for validation
 *
 * @example
 * ```ts
 * const result = filterTokensByAllowed(availableTokens, [
 *   "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", // DEGEN
 *   "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
 * ])
 *
 * console.log(result.filtered) // Matched tokens
 * console.log(result.unmatched) // Addresses not found
 * ```
 */
export function filterTokensByAllowed<T extends Token>(
  tokens: T[],
  allowedTokenAddresses: Address[],
): FilterTokensResult<T> {
  const filteredTokens = tokens.filter((token) =>
    allowedTokenAddresses.some((allowedAddress) =>
      areAddressesEqual(token.address, allowedAddress),
    ),
  )

  const unmatchedAddresses = allowedTokenAddresses.filter(
    (allowedAddress) => !tokens.some((token) => areAddressesEqual(token.address, allowedAddress)),
  )

  return {
    filtered: filteredTokens,
    unmatched: unmatchedAddresses,
  }
}

/**
 * Converts BetSwirl token to OnchainKit token format
 */
export function convertToOnchainKitToken(token: TokenWithImage, chainId: number): OnchainKitToken {
  return {
    name: token.symbol,
    address: token.address || "",
    symbol: token.symbol,
    decimals: token.decimals,
    image: token.image,
    chainId,
  }
}
