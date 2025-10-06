import type { ApolloCache, DefaultOptions } from "@apollo/client/core/index.js";
import type { Address, Hash, Hex, TransactionReceipt } from "viem";
import type {
  PlinkoBetParams,
  PlinkoFreebetParams,
  PlinkoPlacedBet,
  WeightedGameBetParams,
  WeightedGameFreebetParams,
  WeightedGamePlacedBet,
} from "../actions";
import { refreshLeaderboardsWithBets } from "../actions/api/leaderboard/leaderboards";
import type {
  CoinTossBetParams,
  CoinTossFreebetParams,
  CoinTossPlacedBet,
} from "../actions/casino/cointoss";
import type { DiceBetParams, DiceFreebetParams, DicePlacedBet } from "../actions/casino/dice";
import type {
  CasinoPlaceBetOptions,
  NormalCasinoPlacedBet,
  PlaceBetCallbacks,
  PlaceFreebetCallbacks,
  WeightedCasinoPlacedBet,
} from "../actions/casino/game";
import type { KenoBetParams, KenoFreebetParams, KenoPlacedBet } from "../actions/casino/keno";
import type {
  RouletteBetParams,
  RouletteFreebetParams,
  RoulettePlacedBet,
} from "../actions/casino/roulette";
import type { WheelBetParams, WheelFreebetParams, WheelPlacedBet } from "../actions/casino/wheel";
import type { ALLOWANCE_TYPE } from "../actions/common/approve";
import type { LeaderboardClaimRewardsResult } from "../actions/leaderboard/leaderboard";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "../constants";
import {
  type AffiliateLeaderboardWithClaimDetails,
  type ChainId,
  FREEBET_CAMPAIGN_STATUS,
  type FreebetCampaign,
  type FreebetCodeCampaign,
  fetchAffiliateLeaderboard,
  fetchAffiliateLeaderboards,
  fetchFreebetCampaign,
  fetchFreebetCampaigns,
  fetchFreebetCodeCampaign,
  fetchFreebetCodeCampaigns,
  fetchFreebets,
  fetchLeaderboard,
  fetchLeaderboards,
  LEADERBOARD_STATUS,
  LEADERBOARD_TYPE,
  type Leaderboard,
  type SignedFreebet,
} from "../data";
import type { CASINO_GAME_TYPE, CasinoChainId } from "../data/casino";
import {
  type CasinoBetFilterStatus,
  fetchBet,
  fetchBetByHash,
  fetchBets,
} from "../data/subgraphs/protocol/clients/bet";
import { fetchToken, fetchTokens } from "../data/subgraphs/protocol/clients/token";
import {
  Bet_OrderBy,
  OrderDirection,
  Token_OrderBy,
} from "../data/subgraphs/protocol/documents/types";
import type { SubgraphError } from "../errors";
import type {
  BetRequirements,
  BP,
  CasinoBet,
  CasinoGame,
  CasinoGameToken,
  CasinoToken,
  SubgraphToken,
  Token,
} from "../interfaces";
import type {
  CasinoRolledBet,
  CasinoWaitRollOptions,
  CoinTossRolledBet,
  DiceRolledBet,
  GAS_PRICE_TYPE,
  KenoConfiguration,
  KenoRolledBet,
  PlinkoRolledBet,
  RouletteRolledBet,
} from "../read";
import type { WeightedGameConfiguration } from "../read/casino/weightedGame";
import type { WheelRolledBet } from "../read/casino/wheel";
import { FORMAT_TYPE, getCasinoChainId } from "../utils";
import type { BetSwirlWallet } from "./wallet";
export interface BetSwirlClientOptions {
  gasPriceType?: GAS_PRICE_TYPE;
  gasPrice?: bigint;
  chainId?: ChainId;
  affiliate?: Hex;
  allowanceType?: ALLOWANCE_TYPE;
  pollingInterval?: number;
  formatType?: FORMAT_TYPE;
  subgraphClient?: {
    graphqlKey?: string;
    cache?: ApolloCache<any>;
    defaultOptions?: DefaultOptions;
  };
  api?: {
    testMode?: boolean;
  };
}

export abstract class BetSwirlClient {
  public betSwirlWallet: BetSwirlWallet;
  public betSwirlDefaultOptions: BetSwirlClientOptions;

  constructor(betSwirlWallet: BetSwirlWallet, betSwirlDefaultOptions: BetSwirlClientOptions) {
    this.betSwirlWallet = betSwirlWallet;
    this.betSwirlDefaultOptions = betSwirlDefaultOptions;
  }

  /* Casino games */

  abstract waitRolledBet(
    placedBet: NormalCasinoPlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: CasinoRolledBet; receipt: TransactionReceipt }>;

  abstract waitRolledBet(
    placedBet: WeightedCasinoPlacedBet,
    options: CasinoWaitRollOptions | undefined,
    weightedGameConfiguration: WeightedGameConfiguration,
    houseEdge: BP,
  ): Promise<{ rolledBet: CasinoRolledBet; receipt: TransactionReceipt }>;

  abstract playCoinToss(
    params: CoinTossBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: CoinTossPlacedBet; receipt: TransactionReceipt }>;

  abstract playFreebetCoinToss(
    params: CoinTossFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: CoinTossPlacedBet; receipt: TransactionReceipt }>;

  abstract waitCoinToss(
    placedBet: CoinTossPlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: CoinTossRolledBet; receipt: TransactionReceipt }>;

  abstract playDice(
    params: DiceBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: DicePlacedBet; receipt: TransactionReceipt }>;

  abstract playFreebetDice(
    params: DiceFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: DicePlacedBet; receipt: TransactionReceipt }>;

  abstract waitDice(
    placedBet: DicePlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: DiceRolledBet; receipt: TransactionReceipt }>;

  abstract playRoulette(
    params: RouletteBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: RoulettePlacedBet; receipt: TransactionReceipt }>;

  abstract playFreebetRoulette(
    params: RouletteFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: RoulettePlacedBet; receipt: TransactionReceipt }>;

  abstract waitRoulette(
    placedBet: RoulettePlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: RouletteRolledBet; receipt: TransactionReceipt }>;

  abstract playKeno(
    params: KenoBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: KenoPlacedBet; receipt: TransactionReceipt }>;

  abstract playFreebetKeno(
    params: KenoFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: KenoPlacedBet; receipt: TransactionReceipt }>;

  abstract waitKeno(
    placedBet: KenoPlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: KenoRolledBet; receipt: TransactionReceipt }>;

  abstract playWheel(
    params: WheelBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: WheelPlacedBet; receipt: TransactionReceipt }>;

  abstract playFreebetWheel(
    params: WheelFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: WheelPlacedBet; receipt: TransactionReceipt }>;

  abstract waitWheel(
    placedBet: WheelPlacedBet,
    weightedGameConfiguration: WeightedGameConfiguration,
    houseEdge: BP,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: WheelRolledBet; receipt: TransactionReceipt }>;

  abstract playPlinko(
    params: PlinkoBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: PlinkoPlacedBet; receipt: TransactionReceipt }>;

  abstract playFreebetPlinko(
    params: PlinkoFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: PlinkoPlacedBet; receipt: TransactionReceipt }>;

  abstract waitPlinko(
    placedBet: PlinkoPlacedBet,
    weightedGameConfiguration: WeightedGameConfiguration,
    houseEdge: BP,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: PlinkoRolledBet; receipt: TransactionReceipt }>;

  abstract playWeightedGame(
    params: WeightedGameBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: WeightedGamePlacedBet; receipt: TransactionReceipt }>;

  abstract playFreebetWeightedGame(
    params: WeightedGameFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: WeightedGamePlacedBet; receipt: TransactionReceipt }>;

  /* Casino utilities */

  abstract getCasinoGames(onlyActive?: boolean): Promise<CasinoGame[]>;

  abstract getCasinoTokens(onlyActive?: boolean): Promise<CasinoToken[]>;

  abstract getCasinoGameToken(
    casinoToken: CasinoToken,
    game: CASINO_GAME_TYPE,
    affiliate?: Hex,
  ): Promise<CasinoGameToken>;

  abstract getBetRequirements(
    token: Token,
    multiplier: BP,
    game: CASINO_GAME_TYPE,
  ): Promise<BetRequirements>;

  abstract getChainlinkVrfCost(
    game: CASINO_GAME_TYPE,
    tokenAddress: Hex,
    betCount: number,
    gasPrice?: bigint,
    gasPriceType?: GAS_PRICE_TYPE,
  ): Promise<bigint>;

  abstract getKenoConfiguration(token: Token): Promise<KenoConfiguration>;

  abstract getWeighedGameConfiguration(
    configId: number | string,
  ): Promise<WeightedGameConfiguration>;

  /* Leaderboard utilities */

  abstract getLeaderboardClaimableAmount(
    leaderboardOnChainId: number | bigint,
    playerAddress: Address,
    chainId?: ChainId,
  ): Promise<bigint>;

  abstract claimLeaderboardRewards(
    leaderboard: Leaderboard,
    receiver: Address,
    onClaimPending?: (tx: Hash, result: LeaderboardClaimRewardsResult) => void | Promise<void>,
  ): Promise<{ receipt: TransactionReceipt; result: LeaderboardClaimRewardsResult }>;

  /* Subgraph queries */

  async fetchBets(
    chainId?: CasinoChainId,
    filter?: {
      bettor?: Address;
      game?: CASINO_GAME_TYPE;
      token?: Token;
      status?: CasinoBetFilterStatus;
      affiliates?: Address[];
    },
    page = DEFAULT_PAGE,
    itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
    sortBy: { key: Bet_OrderBy; order: OrderDirection } = {
      key: Bet_OrderBy.BetTimestamp,
      order: OrderDirection.Desc,
    },
  ): Promise<{ bets: CasinoBet[]; error: SubgraphError | undefined }> {
    const casinoChainId = getCasinoChainId(this.betSwirlWallet, chainId);
    return fetchBets(
      {
        ...this.betSwirlDefaultOptions.subgraphClient,
        chainId: casinoChainId,
        formatType: this.betSwirlDefaultOptions.formatType,
      },
      filter,
      page,
      itemsPerPage,
      sortBy,
    );
  }

  async fetchBet(
    id: string | bigint,
    chainId?: CasinoChainId,
  ): Promise<{ bet: CasinoBet | undefined; error: SubgraphError | undefined }> {
    const casinoChainId = getCasinoChainId(this.betSwirlWallet, chainId);
    return fetchBet(id, {
      ...this.betSwirlDefaultOptions.subgraphClient,
      chainId: casinoChainId,
      formatType: this.betSwirlDefaultOptions.formatType,
    });
  }

  async fetchBetByHash(
    placeBetHash: Hash,
    chainId?: CasinoChainId,
  ): Promise<{ bet: CasinoBet | undefined; error: SubgraphError | undefined }> {
    const casinoChainId = getCasinoChainId(this.betSwirlWallet, chainId);
    return fetchBetByHash(placeBetHash, {
      ...this.betSwirlDefaultOptions.subgraphClient,
      chainId: casinoChainId,
      formatType: this.betSwirlDefaultOptions.formatType,
    });
  }

  async fetchTokens(
    chainId?: CasinoChainId,
    page = DEFAULT_PAGE,
    itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
    sortBy: { key: Token_OrderBy; order: OrderDirection } = {
      key: Token_OrderBy.Symbol,
      order: OrderDirection.Asc,
    },
  ): Promise<{ tokens: SubgraphToken[]; error: SubgraphError | undefined }> {
    const casinoChainId = getCasinoChainId(this.betSwirlWallet, chainId);
    return fetchTokens(
      {
        ...this.betSwirlDefaultOptions.subgraphClient,
        chainId: casinoChainId,
        formatType: this.betSwirlDefaultOptions.formatType,
      },
      page,
      itemsPerPage,
      sortBy,
    );
  }

  async fetchToken(
    address: Address,
    chainId?: CasinoChainId,
  ): Promise<{ token: SubgraphToken | undefined; error: SubgraphError | undefined }> {
    const casinoChainId = getCasinoChainId(this.betSwirlWallet, chainId);
    return fetchToken(address, {
      ...this.betSwirlDefaultOptions.subgraphClient,
      chainId: casinoChainId,
      formatType: this.betSwirlDefaultOptions.formatType,
    });
  }

  // API calls
  async fetchFreebets(
    player: Address,
    affiliates?: Address[],
    chainIds?: CasinoChainId[],
    withExternalBankrollFreebets = false,
  ): Promise<SignedFreebet[]> {
    return fetchFreebets(
      player,
      affiliates,
      chainIds,
      withExternalBankrollFreebets,
      Boolean(this.betSwirlDefaultOptions.api?.testMode),
    );
  }

  async fetchFreebetCampaigns(
    limit = 10,
    offset = 0,
    status?: FREEBET_CAMPAIGN_STATUS,
    affiliate?: Address,
    chainId?: CasinoChainId,
  ): Promise<{ campaigns: FreebetCampaign[]; total: number; offset: number; limit: number }> {
    return fetchFreebetCampaigns(
      limit,
      offset,
      status,
      affiliate,
      chainId,
      Boolean(this.betSwirlDefaultOptions.api?.testMode),
    );
  }

  async fetchFreebetCampaign(id: number): Promise<FreebetCampaign | null> {
    return fetchFreebetCampaign(id, Boolean(this.betSwirlDefaultOptions.api?.testMode));
  }

  abstract signAndClaimFreebetCode(
    code: string,
    chainId?: CasinoChainId,
  ): Promise<{ success: boolean; error?: string }>;

  async fetchFreebetCodeCampaigns(
    limit = 10,
    offset = 0,
    status?: FREEBET_CAMPAIGN_STATUS,
    affiliate?: Address,
    chainId?: CasinoChainId,
  ): Promise<{ campaigns: FreebetCodeCampaign[]; total: number; offset: number; limit: number }> {
    return fetchFreebetCodeCampaigns(
      limit,
      offset,
      status,
      affiliate,
      chainId,
      Boolean(this.betSwirlDefaultOptions.api?.testMode),
    );
  }

  async fetchFreebetCodeCampaign(id: number): Promise<FreebetCodeCampaign | null> {
    return fetchFreebetCodeCampaign(id, Boolean(this.betSwirlDefaultOptions.api?.testMode));
  }

  async fetchLeaderboards(
    limit = 10,
    offset = 0,
    playerAddress?: Address,
    affiliates?: Address[],
    chainIds?: ChainId[],
    withExternalBankrollLeaderboards = false,
    endDateDirection?: "asc" | "desc",
    statuses?: LEADERBOARD_STATUS[],
  ): Promise<{ leaderboards: Leaderboard[]; total: number; offset: number; limit: number }> {
    return fetchLeaderboards(
      limit,
      offset,
      playerAddress,
      affiliates,
      chainIds,
      withExternalBankrollLeaderboards,
      endDateDirection,
      statuses,
      Boolean(this.betSwirlDefaultOptions.api?.testMode),
    );
  }

  async fetchLeaderboard(id: number, playerAddress?: Address): Promise<Leaderboard | null> {
    return fetchLeaderboard(id, playerAddress, Boolean(this.betSwirlDefaultOptions.api?.testMode));
  }

  async fetchAffiliateLeaderboards(
    affiliate: Address,
    limit = 10,
    offset = 0,
    chainId?: ChainId,
    endDateDirection?: "asc" | "desc",
    statuses?: LEADERBOARD_STATUS[],
  ): Promise<{
    leaderboards: AffiliateLeaderboardWithClaimDetails[];
    total: number;
    offset: number;
    limit: number;
  }> {
    return fetchAffiliateLeaderboards(
      affiliate,
      limit,
      offset,
      chainId,
      endDateDirection,
      statuses,
      Boolean(this.betSwirlDefaultOptions.api?.testMode),
    );
  }

  async fetchAffiliateLeaderboard(
    id: number,
  ): Promise<AffiliateLeaderboardWithClaimDetails | null> {
    return fetchAffiliateLeaderboard(id, Boolean(this.betSwirlDefaultOptions.api?.testMode));
  }

  async refreshLeaderboardsWithBets(
    betIds: string[],
    chainId: ChainId,
    betType: LEADERBOARD_TYPE,
  ): Promise<boolean> {
    return refreshLeaderboardsWithBets(
      betIds,
      chainId,
      betType,
      Boolean(this.betSwirlDefaultOptions.api?.testMode),
    );
  }
}
