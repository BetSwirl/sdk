import { type Config as WagmiConfig } from "@wagmi/core";
import { type TransactionReceipt } from "viem";
import {
  waitRolledBet,
  type CasinoRolledBet,
  type CasinoWaitRollOptions,
} from "./game.ts";
import { type CoinTossPlacedBet } from "../../actions/casino/coinToss.ts";
import {
  CoinToss,
  type COINTOSS_FACE,
} from "../../entities/casino/coinToss.ts";

export interface CoinTossRolledBet extends CasinoRolledBet {
  rolled: COINTOSS_FACE[];
}

export async function waitCoinTossRolledBet(
  wagmiConfig: WagmiConfig,
  placedBet: CoinTossPlacedBet,
  options?: CasinoWaitRollOptions
): Promise<{
  rolledBet: CoinTossRolledBet;
  receipt: TransactionReceipt;
}> {
  const { rolledBet, receipt } = await waitRolledBet(
    wagmiConfig,
    placedBet,
    options
  );
  return {
    rolledBet: {
      ...rolledBet,
      rolled: rolledBet.encodedRolled.map(CoinToss.decodeRolled),
    },
    receipt,
  };
}
