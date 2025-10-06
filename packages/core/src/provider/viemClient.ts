import type { Address, Hash, Hex, PublicClient, TransactionReceipt, WalletClient } from "viem";
import {
  type BetRequirements,
  type BetSwirlClientOptions,
  type BP,
  type CasinoGameToken,
  type CasinoPlaceBetOptions,
  type CasinoPlacedBet,
  type CasinoRolledBet,
  type CasinoToken,
  type CasinoWaitRollOptions,
  type CoinTossRolledBet,
  casinoChainById,
  type DiceBetParams,
  type DiceFreebetParams,
  type DicePlacedBet,
  type DiceRolledBet,
  type GAS_PRICE_TYPE,
  getBetRequirements,
  getCasinoGames,
  getCasinoGameToken,
  getCasinoTokens,
  getChainlinkVrfCost,
  getKenoConfiguration,
  getLeaderboardClaimableAmount,
  type KenoConfiguration,
  type KenoRolledBet,
  type NormalCasinoPlacedBet,
  type PlaceBetCallbacks,
  type PlaceFreebetCallbacks,
  type PlinkoBetParams,
  type PlinkoFreebetParams,
  type PlinkoPlacedBet,
  type PlinkoRolledBet,
  placeDiceBet,
  placeDiceFreebet,
  placePlinkoBet,
  placePlinkoFreebet,
  placeRouletteBet,
  placeRouletteFreebet,
  placeWeightedGameBet,
  placeWeightedGameFreebet,
  type RouletteBetParams,
  type RouletteFreebetParams,
  type RoulettePlacedBet,
  type RouletteRolledBet,
  type Token,
  WEIGHTED_CASINO_GAME_TYPES,
  type WeightedCasinoPlacedBet,
  type WeightedGameBetParams,
  type WeightedGameFreebetParams,
  type WeightedGamePlacedBet,
  waitCoinTossRolledBet,
  waitDiceRolledBet,
  waitKenoRolledBet,
  waitPlinkoRolledBet,
  waitRolledBet,
  waitRouletteRolledBet,
} from "..";
import type { CoinTossBetParams, CoinTossFreebetParams } from "../actions/casino/cointoss";
import {
  type CoinTossPlacedBet,
  placeCoinTossBet,
  placeCoinTossFreebet,
} from "../actions/casino/cointoss";
import {
  type KenoBetParams,
  type KenoFreebetParams,
  type KenoPlacedBet,
  placeKenoBet,
  placeKenoFreebet,
} from "../actions/casino/keno";
import {
  placeSlotBet,
  placeSlotFreebet,
  type SlotBetParams,
  type SlotFreebetParams,
  type SlotPlacedBet,
} from "../actions/casino/slot";
import {
  placeWheelBet,
  placeWheelFreebet,
  type WheelBetParams,
  type WheelFreebetParams,
  type WheelPlacedBet,
} from "../actions/casino/wheel";
import {
  claimLeaderboardRewards,
  type LeaderboardClaimRewardsResult,
} from "../actions/leaderboard/leaderboard";
import type { CASINO_GAME_TYPE, ChainId, Leaderboard } from "../data";
import { type SlotRolledBet, waitSlotRolledBet } from "../read/casino/slot";
import {
  getWeightedGameConfiguration,
  type WeightedGameConfiguration,
} from "../read/casino/weightedGame";
import { type WheelRolledBet, waitWheelRolledBet } from "../read/casino/wheel";
import { BetSwirlClient } from "./client";
import { ViemBetSwirlWallet } from "./viemWallet";

export class ViemBetSwirlClient extends BetSwirlClient {
  public publicClient: PublicClient;

  constructor(
    publicClient: PublicClient,
    walletClient?: WalletClient,
    betSwirlDefaultOptions: BetSwirlClientOptions = {},
  ) {
    super(new ViemBetSwirlWallet(publicClient, walletClient), betSwirlDefaultOptions);
    this.publicClient = publicClient;
  }

  /* Casino Games */

  async waitRolledBet(
    placedBet: NormalCasinoPlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: CasinoRolledBet; receipt: TransactionReceipt }>;

  async waitRolledBet(
    placedBet: WeightedCasinoPlacedBet,
    options: CasinoWaitRollOptions | undefined,
    weightedGameConfiguration: WeightedGameConfiguration,
    houseEdge: BP,
  ): Promise<{ rolledBet: CasinoRolledBet; receipt: TransactionReceipt }>;

  async waitRolledBet(
    placedBet: CasinoPlacedBet,
    options?: CasinoWaitRollOptions,
    weightedGameConfiguration?: WeightedGameConfiguration,
    houseEdge?: BP,
  ): Promise<{ rolledBet: CasinoRolledBet; receipt: TransactionReceipt }> {
    const isWeighted = WEIGHTED_CASINO_GAME_TYPES.includes(placedBet.game);
    if (isWeighted) {
      return waitRolledBet(
        this.betSwirlWallet,
        placedBet as WeightedCasinoPlacedBet,
        { ...this.betSwirlDefaultOptions, ...options },
        weightedGameConfiguration!,
        houseEdge!,
      );
    }
    return waitRolledBet(this.betSwirlWallet, placedBet as NormalCasinoPlacedBet, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  async playCoinToss(
    params: CoinTossBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: CoinTossPlacedBet; receipt: TransactionReceipt }> {
    return placeCoinTossBet(
      this.betSwirlWallet,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async playFreebetCoinToss(
    params: CoinTossFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: CoinTossPlacedBet; receipt: TransactionReceipt }> {
    return placeCoinTossFreebet(
      this.betSwirlWallet,
      params,
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async waitCoinToss(
    placedBet: CoinTossPlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: CoinTossRolledBet; receipt: TransactionReceipt }> {
    return waitCoinTossRolledBet(this.betSwirlWallet, placedBet, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  async playDice(
    params: DiceBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: DicePlacedBet; receipt: TransactionReceipt }> {
    return placeDiceBet(
      this.betSwirlWallet,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async playFreebetDice(
    params: DiceFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: DicePlacedBet; receipt: TransactionReceipt }> {
    return placeDiceFreebet(
      this.betSwirlWallet,
      params,
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async waitDice(
    placedBet: DicePlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: DiceRolledBet; receipt: TransactionReceipt }> {
    return waitDiceRolledBet(this.betSwirlWallet, placedBet, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  async playRoulette(
    params: RouletteBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: RoulettePlacedBet; receipt: TransactionReceipt }> {
    return placeRouletteBet(
      this.betSwirlWallet,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async playFreebetRoulette(
    params: RouletteFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: RoulettePlacedBet; receipt: TransactionReceipt }> {
    return placeRouletteFreebet(
      this.betSwirlWallet,
      params,
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async waitRoulette(
    placedBet: RoulettePlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: RouletteRolledBet; receipt: TransactionReceipt }> {
    return waitRouletteRolledBet(this.betSwirlWallet, placedBet, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  async playKeno(
    params: KenoBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: KenoPlacedBet; receipt: TransactionReceipt }> {
    return placeKenoBet(
      this.betSwirlWallet,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async playFreebetKeno(
    params: KenoFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: KenoPlacedBet; receipt: TransactionReceipt }> {
    return placeKenoFreebet(
      this.betSwirlWallet,
      params,
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async waitKeno(
    placedBet: KenoPlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: KenoRolledBet; receipt: TransactionReceipt }> {
    return waitKenoRolledBet(this.betSwirlWallet, placedBet, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  async playWheel(
    params: WheelBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: WheelPlacedBet; receipt: TransactionReceipt }> {
    return placeWheelBet(
      this.betSwirlWallet,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async playFreebetWheel(
    params: WheelFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: WheelPlacedBet; receipt: TransactionReceipt }> {
    return placeWheelFreebet(
      this.betSwirlWallet,
      params,
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async waitWheel(
    placedBet: WheelPlacedBet,
    weightedGameConfiguration: WeightedGameConfiguration,
    houseEdge: BP,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: WheelRolledBet; receipt: TransactionReceipt }> {
    return waitWheelRolledBet(
      this.betSwirlWallet,
      placedBet,
      weightedGameConfiguration,
      houseEdge,
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
    );
  }

  async playPlinko(
    params: PlinkoBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: PlinkoPlacedBet; receipt: TransactionReceipt }> {
    return placePlinkoBet(
      this.betSwirlWallet,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async playFreebetPlinko(
    params: PlinkoFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: PlinkoPlacedBet; receipt: TransactionReceipt }> {
    return placePlinkoFreebet(
      this.betSwirlWallet,
      params,
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async waitPlinko(
    placedBet: PlinkoPlacedBet,
    weightedGameConfiguration: WeightedGameConfiguration,
    houseEdge: BP,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: PlinkoRolledBet; receipt: TransactionReceipt }> {
    return waitPlinkoRolledBet(
      this.betSwirlWallet,
      placedBet,
      weightedGameConfiguration,
      houseEdge,
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
    );
  }

  async playSlot(
    params: SlotBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: SlotPlacedBet; receipt: TransactionReceipt }> {
    return placeSlotBet(
      this.betSwirlWallet,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async playFreebetSlot(
    params: SlotFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: SlotPlacedBet; receipt: TransactionReceipt }> {
    return placeSlotFreebet(
      this.betSwirlWallet,
      params,
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async waitSlot(
    placedBet: SlotPlacedBet,
    weightedGameConfiguration: WeightedGameConfiguration,
    houseEdge: BP,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: SlotRolledBet; receipt: TransactionReceipt }> {
    return waitSlotRolledBet(this.betSwirlWallet, placedBet, weightedGameConfiguration, houseEdge, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  async playWeightedGame(
    params: WeightedGameBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: WeightedGamePlacedBet; receipt: TransactionReceipt }> {
    return placeWeightedGameBet(
      this.betSwirlWallet,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async playFreebetWeightedGame(
    params: WeightedGameFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: WeightedGamePlacedBet; receipt: TransactionReceipt }> {
    return placeWeightedGameFreebet(
      this.betSwirlWallet,
      params,
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  /* Casino Utilities */

  async getCasinoGames(onlyActive = false) {
    return getCasinoGames(this.betSwirlWallet, onlyActive);
  }

  async getCasinoTokens(onlyActive = false): Promise<CasinoToken[]> {
    return getCasinoTokens(this.betSwirlWallet, onlyActive);
  }

  async getCasinoGameToken(
    casinoToken: CasinoToken,
    game: CASINO_GAME_TYPE,
    affiliate?: Hex,
  ): Promise<CasinoGameToken> {
    const casinoChain = casinoChainById[casinoToken.chainId];
    return getCasinoGameToken(
      this.betSwirlWallet,
      casinoToken,
      game,
      affiliate || casinoChain.defaultAffiliate,
    );
  }

  async getBetRequirements(
    token: Token,
    multiplier: BP | BP[],
    game: CASINO_GAME_TYPE,
  ): Promise<BetRequirements> {
    return getBetRequirements(this.betSwirlWallet, token, multiplier, game);
  }

  async getChainlinkVrfCost(
    game: CASINO_GAME_TYPE,
    tokenAddress: Hex,
    betCount: number,
    gasPrice?: bigint,
    gasPriceType?: GAS_PRICE_TYPE,
  ) {
    return getChainlinkVrfCost(
      this.betSwirlWallet,
      game,
      tokenAddress,
      betCount,
      gasPrice || this.betSwirlDefaultOptions.gasPrice,
      gasPriceType || this.betSwirlDefaultOptions.gasPriceType,
    );
  }

  async getKenoConfiguration(token: Token): Promise<KenoConfiguration> {
    return getKenoConfiguration(this.betSwirlWallet, token);
  }

  async getWeighedGameConfiguration(configId: number | string): Promise<WeightedGameConfiguration> {
    return getWeightedGameConfiguration(this.betSwirlWallet, configId);
  }

  /* Leaderboard utilities */

  async getLeaderboardClaimableAmount(
    leaderboardOnChainId: number | bigint,
    playerAddress: Address,
    chainId: ChainId,
  ): Promise<bigint> {
    return getLeaderboardClaimableAmount(
      this.betSwirlWallet,
      leaderboardOnChainId,
      playerAddress,
      chainId,
    );
  }

  async claimLeaderboardRewards(
    leaderboard: Leaderboard,
    receiver: Address,
    onClaimPending?: (tx: Hash, result: LeaderboardClaimRewardsResult) => void | Promise<void>,
  ): Promise<{ receipt: TransactionReceipt; result: LeaderboardClaimRewardsResult }> {
    return claimLeaderboardRewards(
      this.betSwirlWallet,
      leaderboard,
      receiver,
      this.betSwirlDefaultOptions.pollingInterval,
      onClaimPending,
    );
  }

  /* Private */

  static init(
    viemPublicClient: PublicClient,
    viemWalletClient?: WalletClient,
    options?: BetSwirlClientOptions,
  ): ViemBetSwirlClient {
    return new ViemBetSwirlClient(viemPublicClient, viemWalletClient, options);
  }
}

export function initViemBetSwirlClient(
  viemPublicClient: PublicClient,
  viemWalletClient?: WalletClient,
  options?: BetSwirlClientOptions,
): ViemBetSwirlClient {
  return ViemBetSwirlClient.init(viemPublicClient, viemWalletClient, options);
}
