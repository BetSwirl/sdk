import { type TransactionReceipt } from "viem";
import type { SlotPlacedBet } from "../../actions/casino/slot";
import { Slot } from "../../entities/casino/slot";
import type { BetSwirlWallet } from "../../provider";
import { type CasinoWaitRollOptions, waitRolledBet } from "./game";
import type { WeightedGameConfiguration, WeightedGameRolledBet } from "./weightedGame";

export interface SlotRolledBet extends WeightedGameRolledBet {}
export async function waitSlotRolledBet(
  wallet: BetSwirlWallet,
  placedBet: SlotPlacedBet,
  weightedGameConfig: WeightedGameConfiguration,
  houseEdge: number,
  options?: CasinoWaitRollOptions,
): Promise<{
  rolledBet: SlotRolledBet;
  receipt: TransactionReceipt;
}> {
  const { rolledBet, receipt } = await waitRolledBet(
    wallet,
    placedBet,
    options,
    weightedGameConfig,
    houseEdge,
  );
  return {
    rolledBet: {
      ...rolledBet,
      rolled: rolledBet.encodedRolled.map((rolledBet) =>
        Slot.decodeRolled(rolledBet, weightedGameConfig, houseEdge),
      ),
    },
    receipt,
  };
}
