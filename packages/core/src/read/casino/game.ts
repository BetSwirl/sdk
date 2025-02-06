import { getTransactionReceipt, type Config as WagmiConfig } from "@wagmi/core";
import {
  CASINO_GAME_ROLL_ABI,
  CASINO_GAME_TYPE,
  casinoChainById,
  labelCasinoGameByType,
  type CasinoChainId,
} from "../../data/casino.ts";
import { ChainError } from "../../errors/types.ts";
import type { CasinoPlacedBet } from "../../actions/casino/game.ts";
import { watchContractEvent } from "@wagmi/core";
import { TransactionError } from "../../errors/types.ts";
import { abi as coinTossAbi } from "../../abis/v2/casino/coinToss.ts";
import { abi as gameAbi } from "../../abis/v2/casino/game.ts";
import {
  parseAbiItem,
  type Hash,
  type Hex,
  type TransactionReceipt,
} from "viem";
import { ERROR_CODES } from "../../errors/codes.ts";
import { getLogs } from "viem/actions";
import { readContracts } from "@wagmi/core";
import type {
  CasinoGame,
  CasinoGameToken,
  CasinoToken,
} from "../../interfaces.ts";

export interface CasinoRolledBet extends CasinoPlacedBet {
  isWin: boolean;
  isStopLossTriggered: boolean;
  isStopGainTriggered: boolean;
  rolledBetCount: number;
  rolledTotalBetAmount: bigint;
  payout: bigint;
  benefit: bigint;
  rollTx: Hash;
  encodedRolled: any[];
}

export interface CasinoWaitRollOptions {
  pollingInterval?: number;
  timeout?: number;
}

export const defaultCasinoWaiRollOptions = {
  timeout: 120000, // 2 mins
  //pollInterval: => data in casino.ts
};

interface RollEventArgs {
  id?: bigint;
  payout?: bigint;
  totalBetAmount?: bigint;
  rolled?: any[];
}

// Interface pour le log complet
interface RollEvent {
  args: RollEventArgs;
  transactionHash: Hash;
}

export async function waitRolledBet(
  wagmiConfig: WagmiConfig,
  placedBet: CasinoPlacedBet,
  options?: CasinoWaitRollOptions
): Promise<{
  rolledBet: CasinoRolledBet;
  receipt: TransactionReceipt;
}> {
  const casinoChain = casinoChainById[placedBet.chainId];
  const game = casinoChain.contracts.games[placedBet.game];
  if (!game) {
    throw new ChainError(
      `Game ${placedBet.game} not found for chain ${placedBet.chainId}`
    );
  }

  return new Promise(async (resolve, reject) => {
    let isResolved = false;

    const onRollEvent = async (log: RollEvent) => {
      if (isResolved) return;
      isResolved = true;
      unwatch?.();

      try {
        const args = log.args;
        const isWin = args.payout! >= args.totalBetAmount!;
        const isStopTriggered = args.rolled!.length != placedBet.betCount;
        const receipt = await getTransactionReceipt(wagmiConfig, {
          hash: log.transactionHash,
          chainId: placedBet.chainId,
        });

        resolve({
          rolledBet: {
            ...placedBet,
            isWin,
            rolledBetCount: args.rolled!.length,
            rolledTotalBetAmount: args.totalBetAmount!,
            payout: args.payout!,
            benefit: args.payout! - args.totalBetAmount!,
            rollTx: log.transactionHash,
            isStopGainTriggered: isStopTriggered && isWin,
            isStopLossTriggered: isStopTriggered && !isWin,
            encodedRolled: args.rolled! as any[],
          },
          receipt,
        });
      } catch (error) {
        reject(
          new TransactionError("Error processing Roll event", {
            errorCode: ERROR_CODES.GAME.ROLL_EVENT_ERROR,
            betId: placedBet.id,
            chainId: placedBet.chainId,
            cause: error,
          })
        );
      }
    };
    // Subcribe to Roll event
    const unwatch = watchContractEvent(wagmiConfig, {
      address: game.address,
      abi: coinTossAbi, // coinTossAbi is used because Roll event is the same for all games (expect rolled and input and params)
      eventName: "Roll",
      args: { id: placedBet.id },
      chainId: placedBet.chainId,
      pollingInterval:
        options?.pollingInterval || casinoChain.options.pollingInterval,
      onLogs: async (logs) => {
        const matchingLog = logs.find((log) => log.args.id === placedBet.id);
        if (matchingLog) {
          await onRollEvent(matchingLog as RollEvent);
        }
      },
      onError: (error) => {
        reject(
          new TransactionError("Error watching Roll event", {
            errorCode: ERROR_CODES.GAME.ROLL_EVENT_ERROR,
            betId: placedBet.id,
            chainId: placedBet.chainId,
            cause: error,
          })
        );
      },
    });

    const wagmiClient = wagmiConfig.getClient({ chainId: placedBet.chainId });
    const currentBlock = BigInt(
      await wagmiClient.request({
        method: "eth_blockNumber",
        chainId: placedBet.chainId,
      })
    );
    const fromBlock = currentBlock - placedBet.placeBetBlock;

    // Check in the past blocks if the bet has been rolled
    getLogs(wagmiClient, {
      address: game.address,
      event: parseAbiItem(CASINO_GAME_ROLL_ABI[placedBet.game]),
      args: { id: placedBet.id },
      fromBlock,
      toBlock: "latest",
    })
      .then((pastLogs) => {
        const matchingPastLog = pastLogs.find(
          (log) => log.args.id === placedBet.id
        );
        if (matchingPastLog) {
          onRollEvent(matchingPastLog as RollEvent);
        }
      })
      .catch((error) => {
        if (!isResolved) {
          reject(
            new TransactionError("Error checking past Roll events", {
              errorCode: ERROR_CODES.GAME.ROLL_EVENT_ERROR,
              betId: placedBet.id,
              chainId: placedBet.chainId,
              cause: error,
            })
          );
        }
      });

    setTimeout(() => {
      if (!isResolved) {
        unwatch?.();
        reject(
          new TransactionError("Timeout waiting for Roll event", {
            errorCode: ERROR_CODES.GAME.ROLL_EVENT_TIMEOUT,
            betId: placedBet.id,
            chainId: placedBet.chainId,
          })
        );
      }
    }, options?.timeout || defaultCasinoWaiRollOptions.timeout);
  });
}

export async function getCasinoGamesForChain(
  wagmiConfig: WagmiConfig,
  chainId: CasinoChainId,
  onlyActive = false
): Promise<CasinoGame[]> {
  const casinoChain = casinoChainById[chainId];

  const games = casinoChain.contracts.games;

  const pausedStates = await readContracts(wagmiConfig, {
    contracts: Object.values(games).map((game) => ({
      address: game.address,
      abi: gameAbi,
      functionName: "paused",
      chainId,
    })),
  });

  if (
    pausedStates.some((state) => state.status === "failure" || !state.result)
  ) {
    throw new TransactionError("Error getting paused states", {
      errorCode: ERROR_CODES.GAME.GET_PAUSED_ERROR,
      chainId,
      cause: pausedStates.find((state) => state.status === "failure")?.error,
    });
  }

  return Object.entries(games)
    .map(([gameType, game], index) => ({
      gameAddress: game.address,
      abi: game.abi,
      paused: Boolean(pausedStates[index]?.result),
      chainId,
      game: gameType as CASINO_GAME_TYPE,
      label: labelCasinoGameByType[gameType as CASINO_GAME_TYPE],
      bankAddress: casinoChain.contracts.bank,
    }))
    .filter((game) => !onlyActive || !game.paused);
}

export async function getCasinoGameToken(
  wagmiConfig: WagmiConfig,
  casinoToken: CasinoToken,
  game: CASINO_GAME_TYPE,
  affiliate: Hex
): Promise<CasinoGameToken> {
  const chainId = casinoToken.chainId;
  const casinoChain = casinoChainById[chainId];
  const casinoGame = casinoChain.contracts.games[game];
  if (!casinoGame) {
    throw new ChainError(`Game ${game} not found for chain ${chainId}`);
  }
  const [rawTokenData, rawAffiliateHouseEdge] = await readContracts(
    wagmiConfig,
    {
      contracts: [
        {
          address: casinoGame.address,
          abi: gameAbi,
          functionName: "tokens",
          chainId,
          args: [casinoToken.address],
        },
        {
          address: casinoGame.address,
          abi: gameAbi,
          functionName: "getAffiliateHouseEdge",
          chainId,
          args: [affiliate, casinoToken.address],
        },
      ],
    }
  );

  if (rawTokenData.status === "failure" || !rawTokenData.result) {
    throw new TransactionError("Error getting token data", {
      errorCode: ERROR_CODES.GAME.GET_TOKEN_ERROR,
      chainId,
      cause: rawTokenData.error,
    });
  }

  if (
    rawAffiliateHouseEdge.status === "failure" ||
    !rawAffiliateHouseEdge.result
  ) {
    throw new TransactionError("Error getting affiliate house edge", {
      errorCode: ERROR_CODES.GAME.GET_AFFILIATE_HOUSE_EDGE_ERROR,
      chainId,
      cause: rawAffiliateHouseEdge.error,
    });
  }

  return {
    ...casinoToken,
    defaultHouseEdge: rawTokenData.result?.[0],
    chainlinkVrfSubscriptionId: rawTokenData.result?.[2],
    affiliateHouseEdge: rawAffiliateHouseEdge.result,
  };
}
