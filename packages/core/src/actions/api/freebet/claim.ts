import type { Hash } from "viem";
import type { CasinoChainId } from "../../../data/casino";
import { bigIntFormatter, getBetSwirlApiUrl } from "../../../utils";
import type { ClaimFreebetCodeTypedData } from "../..";

export interface ClaimFreebetCodeRequest {
  signature: Hash;
  typedData: ClaimFreebetCodeTypedData;
  chainId: number;
}

export interface ClaimFreebetCodeResponse {
  success: boolean;
  error?: string;
}

/**
 * Claims a freebet code by sending the signature and typed data to the API
 * @param signature - The EIP712 signature
 * @param typedData - The typed data used for signing
 * @param chainId - The chain ID
 * @returns Promise with success status and optional error message
 */
export async function claimFreebetCode(
  signature: Hash,
  typedData: ClaimFreebetCodeTypedData,
  chainId: CasinoChainId,
  testMode = false,
): Promise<ClaimFreebetCodeResponse> {
  try {
    const response = await fetch(
      `${getBetSwirlApiUrl(testMode)}/public/v1/freebet/code-campaigns/claim`,
      {
        method: "POST",
        body: JSON.stringify(
          {
            user_signature: signature,
            chain_id: chainId,
            ...typedData.message,
          },
          bigIntFormatter,
        ),
      },
    );

    if (response.ok) {
      return { success: true };
    }
    const errorData = await response.json();
    return {
      success: false,
      error: errorData.error || "Failed to claim freebet code",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
