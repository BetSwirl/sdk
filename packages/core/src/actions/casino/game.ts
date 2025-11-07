import {
  type Address,
  decodeEventLog,
  type EncodeAbiParametersReturnType,
  encodeFunctionData,
  type Hash,
  type Hex,
  type TransactionReceipt,
} from "viem";
import { coinTossAbi } from "../../abis/v2/casino/cointoss";
import { freebetAbi } from "../../abis/v2/casino/freebet";
import { GAS_TOKEN_ADDRESS } from "../../constants";
import type { SignedFreebet } from "../../data";
import {
  CASINO_GAME_PLACE_BET_ABI,
  CASINO_GAME_TYPE,
  type CasinoChainId,
  casinoChainById,
  MAX_SDK_HOUSE_EGDE,
  type NORMAL_CASINO_GAME_TYPE,
  type WEIGHTED_CASINO_GAME_TYPE,
} from "../../data/casino";
import type { KenoEncodedInput, WeightedGameEncodedInput } from "../../entities";
import type { CoinTossEncodedInput } from "../../entities/casino/cointoss";
import type { DiceEncodedInput } from "../../entities/casino/dice";
import type { RouletteEncodedInput } from "../../entities/casino/roulette";
import { ERROR_CODES } from "../../errors/codes";
import { ChainError, ConfigurationError, TransactionError } from "../../errors/types";
import type { BetSwirlEventData, BetSwirlFunctionData, GameAbi, Token } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider";
import { getChainlinkVrfCost } from "../../read/common/chainlinkVrfCost";
import { GAS_PRICE_TYPE, getGasPrices } from "../../read/common/gasPrice";
import { getTokenMetadata } from "../../read/common/tokenMetadata";
import { getCasinoChainId } from "../../utils";
import { ALLOWANCE_TYPE, type ApproveResult, approve } from "../common/approve";

export interface CasinoBetParams {
  betAmount: bigint;
  betCount?: number;
  tokenAddress?: Address;
  stopGain?: bigint;
  stopLoss?: bigint;
  vrfFees?: bigint;
  receiver?: Hex;
  affiliate?: Hex;
}

export const defaultCasinoGameParams = {
  betCount: 1,
  //token: zeroAddress, => chain.nativeCurrency
  stopGain: 0n,
  stopLoss: 0n,
  vrfFees: 0n, // When 0, VRF fees are calculated on the fly
  //pollingInterval: => data in casino.ts
};

export interface CasinoPlaceBetOptions {
  gasPriceType?: GAS_PRICE_TYPE;
  gasPrice?: bigint; // wei
  allowanceType?: ALLOWANCE_TYPE;
  pollingInterval?: number;
}

export const defaultCasinoPlaceBetOptions = {
  gasPriceType: GAS_PRICE_TYPE.NORMAL,
  gasPrice: 0n,
  allowanceType: ALLOWANCE_TYPE.AUTO,
};
// Game should not know the game implementation details, but well..  it helps developers
export type GameEncodedInput =
  | CoinTossEncodedInput
  | DiceEncodedInput
  | RouletteEncodedInput
  | KenoEncodedInput
  | WeightedGameEncodedInput;
export interface GenericCasinoBetParams extends CasinoBetParams {
  game: CASINO_GAME_TYPE;
  gameEncodedInput: GameEncodedInput;
}

interface CommonCasinoPlacedBet {
  id: bigint;
  betAmount: bigint;
  betCount: number;
  totalBetAmount: bigint;
  chargedVRFCost: bigint;
  token: Token;
  affiliate: Hex;
  receiver: Hex;
  stopGain: bigint;
  stopLoss: bigint;
  betTxnHash: Hash;
  betBlock: bigint;
  chainId: CasinoChainId;
}
export interface NormalCasinoPlacedBet extends CommonCasinoPlacedBet {
  game: NORMAL_CASINO_GAME_TYPE;
}
export interface WeightedCasinoPlacedBet extends CommonCasinoPlacedBet {
  game: WEIGHTED_CASINO_GAME_TYPE;
}

export type CasinoPlacedBet = NormalCasinoPlacedBet | WeightedCasinoPlacedBet;

export interface PlaceBetCallbacks {
  onApprovePending?: (tx: Hash, result: ApproveResult) => void | Promise<void>;
  onApproved?: (receipt: TransactionReceipt, result: ApproveResult) => void | Promise<void>;
  onBetPlacedPending?: (tx: Hash) => void | Promise<void>;
}

export async function placeBet(
  wallet: BetSwirlWallet,
  betParams: GenericCasinoBetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks,
): Promise<{ placedBet: CasinoPlacedBet; receipt: TransactionReceipt }> {
  const casinoChainId = getCasinoChainId(wallet);
  const casinoChain = casinoChainById[casinoChainId];
  const game = casinoChain.contracts.games[betParams.game];

  if (!game) {
    throw new ChainError(
      `${betParams.game} is not available for chain ${casinoChain.viemChain.name} (${casinoChainId})`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
      {
        chainId: casinoChainId,
        supportedChains: Object.keys(casinoChainById),
      },
    );
  }

  const accountAddress = betParams.receiver || wallet.getAccount(casinoChainId)?.address;
  if (!accountAddress) {
    throw new ConfigurationError(
      `No configured account in the wallet for chain ${casinoChain.viemChain.name} (${casinoChainId})`,
      ERROR_CODES.WALLET.ACCOUNT_MISSING,
      {
        chainId: casinoChainId,
      },
    );
  }
  try {
    // Get gas price if needed
    const gasPrice =
      options?.gasPrice ||
      (await getGasPrices(wallet, casinoChainId))[
        options?.gasPriceType || defaultCasinoPlaceBetOptions.gasPriceType
      ];
    const tokenAddress = betParams.tokenAddress || GAS_TOKEN_ADDRESS;

    // Generate function data
    const receiver = betParams.receiver || accountAddress;
    const functionData = getPlaceBetFunctionData({ ...betParams, receiver }, casinoChainId);

    // Approve if needed

    const allowanceType = options?.allowanceType || defaultCasinoPlaceBetOptions.allowanceType;
    const pollingInterval = options?.pollingInterval || casinoChain.options.pollingInterval;

    const { receipt: approveReceipt, result: approveResult } = await approve(
      wallet,
      tokenAddress,
      accountAddress,
      game.address,
      functionData.extraData.totalBetAmount,
      gasPrice,
      pollingInterval,
      allowanceType,
      callbacks?.onApprovePending,
    );

    if (approveReceipt) await callbacks?.onApproved?.(approveReceipt, approveResult);

    // Get VRF fees
    const vrfFees =
      betParams.vrfFees ||
      (await getChainlinkVrfCost(
        wallet,
        betParams.game,
        tokenAddress,
        functionData.extraData.betCount,
        gasPrice,
      ));
    // Execute place bet tx
    const hash = await wallet.writeContract(
      functionData,
      functionData.extraData.getValue(vrfFees),
      gasPrice,
    );
    await callbacks?.onBetPlacedPending?.(hash);
    const receipt = await wallet.waitTransaction(hash, pollingInterval);

    const placedBet = await getPlacedBetFromReceipt(wallet, receipt, betParams.game);
    if (!placedBet) {
      throw new TransactionError(
        "PlaceBet event not found",
        ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
        {
          gameAddress: game.address,
          gameType: betParams.game,
          chainId: casinoChainId,
          tokenAddress,
        },
      );
    }

    return { placedBet, receipt };
  } catch (error) {
    throw new TransactionError(
      `An error occured while placing the bet: ${error}`,
      ERROR_CODES.GAME.PLACE_BET_ERROR,
      {
        gameAddress: game.address,
        gameType: betParams.game,
        chainId: casinoChainId,
        tokenAddress: betParams.tokenAddress,
        betAmount: betParams.betAmount,
        betCount: betParams.betCount,
        stopGain: betParams.stopGain,
        stopLoss: betParams.stopLoss,
      },
    );
  }
}

/* Previously was Omit<GenericCasinoBetParams, "receiver" | "vrfFees" | "token"> & {
    receiver: Hex;
    tokenAddress?: Hex;
  } */
export interface PlaceBetFunctionDataGameParams {
  receiver: Address;
  game: CASINO_GAME_TYPE;
  gameEncodedInput: GameEncodedInput;
  betAmount: bigint;
  tokenAddress?: Address;
  betCount?: number;
  stopGain?: bigint;
  stopLoss?: bigint;
  affiliate?: Address;
}

export interface PlaceBetExtraData {
  totalBetAmount: bigint;
  tokenAddress: Address;
  betCount: number;
  stopGain: bigint;
  stopLoss: bigint;
  maxHouseEdge: number;
  affiliate: Address;
  getValue: (vrfFees: bigint) => bigint;
}

export function getPlaceBetFunctionData(
  gameParams: PlaceBetFunctionDataGameParams,
  chainId: CasinoChainId,
): BetSwirlFunctionData<
  GameAbi<typeof gameParams.game>,
  "wager",
  readonly [
    ...GameEncodedInput[],
    Hex,
    Hex,
    {
      readonly token: Hex;
      readonly betAmount: bigint;
      readonly betCount: number;
      readonly stopGain: bigint;
      readonly stopLoss: bigint;
      readonly maxHouseEdge: number;
    },
  ]
> & {
  extraData: PlaceBetExtraData;
} {
  const casinoChain = casinoChainById[chainId];
  const game = casinoChain.contracts.games[gameParams.game];

  if (!game) {
    throw new ChainError(
      `${gameParams.game} is not available for chain ${casinoChain.viemChain.name} (${chainId})`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
      {
        chainId,
        supportedChains: Object.keys(casinoChainById),
      },
    );
  }

  const affiliate = gameParams.affiliate || casinoChain.defaultAffiliate;
  const tokenAddress = gameParams.tokenAddress || GAS_TOKEN_ADDRESS;
  const betCount = gameParams.betCount || defaultCasinoGameParams.betCount;
  const stopGain = gameParams.stopGain || defaultCasinoGameParams.stopGain;
  const stopLoss = gameParams.stopLoss || defaultCasinoGameParams.stopLoss;
  const maxHouseEdge = MAX_SDK_HOUSE_EGDE;

  const abi = game.abi;
  const functionName = "wager" as const;
  const args = [
    ...(Array.isArray(gameParams.gameEncodedInput)
      ? gameParams.gameEncodedInput
      : [gameParams.gameEncodedInput]),
    gameParams.receiver,
    affiliate,
    {
      token: tokenAddress,
      betAmount: gameParams.betAmount,
      betCount,
      stopGain,
      stopLoss,
      maxHouseEdge,
    },
  ] as const;

  const totalBetAmount = gameParams.betAmount * BigInt(betCount);
  return {
    data: { to: game.address, abi, functionName, args },
    encodedData: encodeFunctionData({ abi, functionName, args }),
    extraData: {
      totalBetAmount,
      tokenAddress,
      betCount,
      stopGain,
      stopLoss,
      maxHouseEdge,
      affiliate,
      getValue: (vrfFees: bigint) =>
        tokenAddress === GAS_TOKEN_ADDRESS ? totalBetAmount + vrfFees : vrfFees,
    },
  };
}

/* Freebet section */

export interface CasinoFreebetParams {
  freebet: SignedFreebet;
  vrfFees?: bigint;
}

export interface GenericCasinoFreebetParams extends CasinoFreebetParams {
  game: CASINO_GAME_TYPE;
  gameEncodedAbiParametersInput: EncodeAbiParametersReturnType;
}

export type CasinoPlacedFreebet = CasinoPlacedBet;

export interface PlaceFreebetCallbacks {
  onBetPlacedPending?: (tx: Hash) => void | Promise<void>;
}

export async function placeFreebet(
  wallet: BetSwirlWallet,
  freebetParams: GenericCasinoFreebetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceFreebetCallbacks,
): Promise<{ placedFreebet: CasinoPlacedFreebet; receipt: TransactionReceipt }> {
  const casinoChainId = getCasinoChainId(wallet);
  if (casinoChainId !== freebetParams.freebet.chainId) {
    throw new ChainError(
      `Chain id mismatch: ${casinoChainId} (wallet) !== ${freebetParams.freebet.chainId} (freebet)`,
      ERROR_CODES.CHAIN.CHAIN_ID_MISMATCH,
    );
  }
  const casinoChain = casinoChainById[casinoChainId];
  const game = casinoChain.contracts.games[freebetParams.game];

  if (!game) {
    throw new ChainError(
      `${freebetParams.game} is not available for chain ${casinoChain.viemChain.name} (${casinoChainId})`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
      {
        chainId: casinoChainId,
        supportedChains: Object.keys(casinoChainById),
      },
    );
  }

  try {
    // Get gas price if needed
    const gasPrice =
      options?.gasPrice ||
      (await getGasPrices(wallet, casinoChainId))[
        options?.gasPriceType || defaultCasinoPlaceBetOptions.gasPriceType
      ];
    const token = freebetParams.freebet.token;

    // Generate function data
    const functionData = getPlaceFreebetFunctionData(freebetParams, casinoChainId);

    // Get VRF fees
    const vrfFees =
      freebetParams.vrfFees ||
      (await getChainlinkVrfCost(
        wallet,
        freebetParams.game,
        token.address,
        functionData.extraData.betCount,
        gasPrice,
      ));
    // Execute place bet tx
    const hash = await wallet.writeContract(
      functionData,
      functionData.extraData.getValue(vrfFees),
      gasPrice,
    );
    await callbacks?.onBetPlacedPending?.(hash);
    const pollingInterval = options?.pollingInterval || casinoChain.options.pollingInterval;
    const receipt = await wallet.waitTransaction(hash, pollingInterval);

    const placedFreebet = await getPlacedBetFromReceipt(wallet, receipt, freebetParams.game);
    if (!placedFreebet) {
      throw new TransactionError(
        "PlaceBet event not found",
        ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
        {
          gameAddress: game.address,
          gameType: freebetParams.game,
          chainId: casinoChainId,
          token,
        },
      );
    }

    return { placedFreebet, receipt };
  } catch (error) {
    throw new TransactionError(
      `An error occured while placing the freebet: ${error}`,
      ERROR_CODES.GAME.PLACE_FREEBET_ERROR,
      {
        gameAddress: game.address,
        gameType: freebetParams.game,
        chainId: casinoChainId,
        token: freebetParams.freebet.token,
        input: freebetParams.gameEncodedAbiParametersInput,
        freebetId: freebetParams.freebet.id,
        playerAddress: freebetParams.freebet.playerAddress,
        amount: freebetParams.freebet.amount,
        tokenAddress: freebetParams.freebet.token.address,
        expiresAt: freebetParams.freebet.expirationDate,
        affiliateAddress: freebetParams.freebet.affiliateAddress,
        freebetAddress: freebetParams.freebet.freebetAddress,
      },
    );
  }
}

export interface PlaceFreebetFunctionDataGameParams {
  freebet: SignedFreebet;
  game: CASINO_GAME_TYPE;
  gameEncodedAbiParametersInput: EncodeAbiParametersReturnType;
}

export interface PlaceFreebetExtraData extends PlaceBetExtraData {}

export function getPlaceFreebetFunctionData(
  gameParams: PlaceFreebetFunctionDataGameParams,
  chainId: CasinoChainId,
): BetSwirlFunctionData<
  typeof freebetAbi,
  "wager",
  readonly [
    Hex,
    EncodeAbiParametersReturnType,
    {
      readonly chainId: bigint;
      readonly freeBetId: bigint;
      readonly player: Address;
      readonly amount: bigint;
      readonly token: Address;
      readonly expiresAt: bigint;
      readonly affiliate: Address;
      readonly freebetAddress: Address;
    },
    Hex, // signature
    number,
  ]
> & {
  extraData: PlaceFreebetExtraData;
} {
  const casinoChain = casinoChainById[chainId];
  const game = casinoChain.contracts.games[gameParams.game];

  if (!game) {
    throw new ChainError(
      `${gameParams.game} is not available for chain ${casinoChain.viemChain.name} (${chainId})`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
      {
        chainId,
        supportedChains: Object.keys(casinoChainById),
      },
    );
  }

  const affiliate = gameParams.freebet.affiliateAddress;
  const tokenAddress = gameParams.freebet.token.address;
  const betCount = 1; // freebet is always 1 bet
  const stopGain = 0n;
  const stopLoss = 0n;
  const maxHouseEdge = MAX_SDK_HOUSE_EGDE;

  const abi = freebetAbi;
  const functionName = "wager" as const;
  const args = [
    game.address,
    gameParams.gameEncodedAbiParametersInput,
    {
      chainId: BigInt(gameParams.freebet.chainId),
      freeBetId: BigInt(gameParams.freebet.id),
      player: gameParams.freebet.playerAddress,
      amount: gameParams.freebet.amount,
      token: gameParams.freebet.token.address,
      expiresAt: BigInt(Math.floor(gameParams.freebet.expirationDate.getTime() / 1000)),
      affiliate: gameParams.freebet.affiliateAddress,
      freebetAddress: gameParams.freebet.freebetAddress,
    },
    gameParams.freebet.signature,
    maxHouseEdge,
  ] as const;

  const totalBetAmount = gameParams.freebet.amount;
  return {
    data: { to: gameParams.freebet.freebetAddress, abi, functionName, args },
    encodedData: encodeFunctionData({ abi, functionName, args }),
    extraData: {
      totalBetAmount,
      tokenAddress,
      betCount,
      stopGain,
      stopLoss,
      maxHouseEdge,
      affiliate,
      getValue: (vrfFees: bigint) =>
        tokenAddress === GAS_TOKEN_ADDRESS ? totalBetAmount + vrfFees : vrfFees,
    },
  };
}

export async function getPlacedBetFromReceipt(
  wallet: BetSwirlWallet,
  receipt: TransactionReceipt,
  game: CASINO_GAME_TYPE,
  chainId?: CasinoChainId,
  usedToken?: Token, // to avoid to fetch the token metadata from the chain if the token used is already known
): Promise<CasinoPlacedBet | null> {
  const casinoChainId = getCasinoChainId(wallet, chainId);
  const casinoChain = casinoChainById[casinoChainId];
  // Read the Placedbet event from logs
  const decodedPlaceBetEvent = receipt.logs
    .map((log) => {
      try {
        return decodeEventLog<typeof coinTossAbi>({
          //@ts-expect-error coinTossAbi is used because PlaceBet event is the same for all games (expect input param)
          abi: casinoChain.contracts.games[game]?.abi!,
          //@ts-expect-error
          data: log.data,
          topics: log.topics,
        });
      } catch {
        return null;
      }
    })
    .find((log) => log?.eventName === "PlaceBet");

  if (!decodedPlaceBetEvent) {
    return null;
  }

  const { args } = decodedPlaceBetEvent;

  let token = usedToken;
  if (!token) {
    token = await getTokenMetadata(wallet, args.token!, casinoChainId);
  }
  return {
    id: args.id,
    betAmount: args.amount,
    betCount: args.betCount,
    totalBetAmount: args.amount * BigInt(args.betCount),
    chargedVRFCost: args.chargedVRFCost,
    token,
    affiliate: args.affiliate,
    receiver: args.receiver,
    stopGain: args.stopGain,
    stopLoss: args.stopLoss,
    betTxnHash: receipt.transactionHash,
    betBlock: receipt.blockNumber,
    chainId: casinoChainId,
    game,
  };
}

export function getPlaceBetEventData(
  game: CASINO_GAME_TYPE,
  casinoChainId: CasinoChainId,
  receiver: Address,
): BetSwirlEventData<GameAbi<typeof game>, "PlaceBet", { receiver: Address }> & {
  event: { abiEvent: (typeof CASINO_GAME_PLACE_BET_ABI)[typeof game][number] };
} {
  const casinoChain = casinoChainById[casinoChainId];

  const gameData = casinoChain.contracts.games[game];
  if (!gameData) {
    throw new ChainError(
      `Game ${game} not found for chain ${casinoChainId}`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
    );
  }

  const abi = CASINO_GAME_PLACE_BET_ABI[game];
  const eventName = "PlaceBet" as const;
  const args = { receiver: receiver } as const;

  const placeBetEvent = CASINO_GAME_PLACE_BET_ABI[game]![0];

  return {
    data: { to: gameData.address, abi, eventName, args },
    event: {
      abiEvent: placeBetEvent,
    },
  };
}
