import type { Address, Hash, TypedDataDomain } from "viem";
import type { BetSwirlWallet } from "../../provider/wallet";

export interface ClaimFreebetCodeData extends Record<string, unknown> {
  code: string;
  user_address: `0x${string}`;
  claim_timestamp: number;
}

export interface ClaimFreebetCodeTypedData {
  domain: TypedDataDomain;
  types: {
    ClaimFreebetCode: [
      { name: "code"; type: "string" },
      { name: "user_address"; type: "address" },
      { name: "claim_timestamp"; type: "uint32" },
    ];
  };
  primaryType: "ClaimFreebetCode";
  message: ClaimFreebetCodeData;
}

/**
 * Generates EIP712 data for claiming a freebet code
 * @param code - The freebet code (string)
 * @param userAddress - The user's wallet address (Hex)
 * @returns Typed EIP712 data for signing
 */
export function getClaimFreebetCodeTypedData(
  code: string,
  userAddress: Address,
): ClaimFreebetCodeTypedData {
  const data: ClaimFreebetCodeData = {
    code: code.toLowerCase(),
    user_address: userAddress,
    claim_timestamp: Math.floor(Date.now() / 1000),
  };

  return {
    types: {
      ClaimFreebetCode: [
        { name: "code", type: "string" },
        { name: "user_address", type: "address" },
        { name: "claim_timestamp", type: "uint32" },
      ],
    },
    primaryType: "ClaimFreebetCode",
    message: data,
    domain: {
      name: "BetSwirl Freebet Code",
    },
  };
}

/**
 * Signs EIP712 data for claiming a freebet code
 * @param wallet - The BetSwirl wallet (Viem or Wagmi)
 * @param code - The freebet code (string)
 * @returns The EIP712 signature and typed data for the claim
 */
export async function signFreebetCode(
  wallet: BetSwirlWallet,
  code: string,
): Promise<{ signature: Hash; typedData: ClaimFreebetCodeTypedData }> {
  const account = wallet.getAccount();
  if (!account) {
    throw new Error("Account is not initialized");
  }

  const typedData = getClaimFreebetCodeTypedData(code, account.address);
  const signature = await wallet.signTypedData(typedData);

  return { signature, typedData };
}
