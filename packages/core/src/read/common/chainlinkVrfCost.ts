import { type Config as WagmiConfig, call } from "@wagmi/core";
import { casinoGameAbi } from "../../abis/v2/casino/game";

import { encodeFunctionData, type Hex } from "viem";
import { ChainError, TransactionError } from "../../errors/types";
import { ERROR_CODES } from "../../errors/codes";
import {
  casinoChainById,
  type CASINO_GAME_TYPE,
  type CasinoChainId,
} from "../../data/casino";
import { getCasinoChainId } from "../../utils";
import { GAS_PRICE_TYPE, getGasPrices } from "./gasPrice";
import { defaultCasinoPlaceBetOptions } from "../../actions";

export async function getChainlinkVrfCost(
  wagmiConfig: WagmiConfig,
  game: CASINO_GAME_TYPE, // TODO allow to pass PVP_GAME_TYPE
  tokenAddress: Hex,
  betCount: number,
  chainId?: CasinoChainId,
  gasPrice?: bigint,
  gasPriceType?: GAS_PRICE_TYPE
): Promise<bigint> {
  const casinoChainId = getCasinoChainId(wagmiConfig, chainId);
  const casinoChain = casinoChainById[casinoChainId];
  const gameAddress = casinoChain.contracts.games[game]?.address;

  if (!gameAddress) {
    throw new ChainError(
      `${game} is not available for chain ${casinoChain.viemChain.name} (${casinoChainId})`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
      {
        chainId: casinoChainId,
        supportedChains: Object.keys(casinoChainById),
      }
    );
  }
  // Get default gas price if gas price is not passed
  const effectiveGasPrice =
    gasPrice ||
    (await getGasPrices(wagmiConfig, casinoChainId))[
      gasPriceType || defaultCasinoPlaceBetOptions.gasPriceType
    ];
  try {
    const { data: vrfCost } = await call(wagmiConfig, {
      to: gameAddress,
      data: generateGetChainlinkVrfCostFunctionData(tokenAddress, betCount),
      chainId,
      gasPrice: effectiveGasPrice,
    });

    if (!vrfCost) {
      console.warn(
        `[getChainlinkVrfCost] vrfCost is 0 for tokenAddress: ${tokenAddress}, betCount: ${betCount}, gameAddress: ${gameAddress}, chainId: ${chainId}`
      );
      return 0n;
    }
    return BigInt(vrfCost || 0n);
  } catch (error) {
    throw new TransactionError(
      `An error occured while getting the chainlink vrf cost: ${error}`,
      ERROR_CODES.READ.CHAINLINK_VRF_COST_ERROR,
      {
        gameAddress,
        tokenAddress,
        betCount,
        chainId,
        gasPrice: effectiveGasPrice,
      }
    );
  }
}

export function generateGetChainlinkVrfCostFunctionData(
  tokenAddress: Hex,
  betCount: number
) {
  return encodeFunctionData({
    abi: casinoGameAbi,
    functionName: "getChainlinkVRFCost",
    args: [tokenAddress, betCount],
  });
}
