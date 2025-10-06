import { type TransactionReceipt } from "viem";
import { CASINO_GAME_TYPE, type CasinoChainId } from "../../data/casino";
import type { Token } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider";
import type { WeightedGameConfiguration } from "../../read";
import { type CasinoPlaceBetOptions, type PlaceBetCallbacks } from "./game";
import {
  getWeightedGamePlacedBetFromReceipt,
  placeWeightedGameBet,
  placeWeightedGameFreebet,
  type WeightedGameBetParams,
  type WeightedGameFreebetParams,
  type WeightedGamePlacedBet,
} from "./weightedGame";

export interface SlotBetParams extends Omit<WeightedGameBetParams, "game"> {}

export interface SlotFreebetParams extends Omit<WeightedGameFreebetParams, "game"> {}

export interface SlotPlacedBet extends WeightedGamePlacedBet {}

export async function placeSlotBet(
  wallet: BetSwirlWallet,
  slotParams: SlotBetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks,
): Promise<{ placedBet: SlotPlacedBet; receipt: TransactionReceipt }> {
  return await placeWeightedGameBet(
    wallet,
    {
      ...slotParams,
      game: CASINO_GAME_TYPE.SLOT,
    },
    options,
    callbacks,
  );
}

export async function placeSlotFreebet(
  wallet: BetSwirlWallet,
  slotParams: SlotFreebetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks,
): Promise<{ placedFreebet: SlotPlacedBet; receipt: TransactionReceipt }> {
  return await placeWeightedGameFreebet(
    wallet,
    {
      ...slotParams,
      game: CASINO_GAME_TYPE.SLOT,
    },
    options,
    callbacks,
  );
}

export async function getSlotPlacedBetFromReceipt(
  wallet: BetSwirlWallet,
  receipt: TransactionReceipt,
  chainId: CasinoChainId,
  usedToken?: Token,
  customSlotConfigs?: WeightedGameConfiguration[],
): Promise<SlotPlacedBet | null> {
  return await getWeightedGamePlacedBetFromReceipt(
    wallet,
    receipt,
    chainId,
    CASINO_GAME_TYPE.SLOT,
    usedToken,
    customSlotConfigs,
  );
}
