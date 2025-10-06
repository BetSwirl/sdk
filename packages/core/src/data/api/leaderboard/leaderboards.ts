import { type Address, formatUnits, type Hash } from "viem";
import type { Token } from "../../../interfaces";
import { getBetSwirlApiUrl } from "../../../utils";
import type { ChainId } from "../../chains";

export enum LEADERBOARD_STATUS {
  NOT_STARTED = "not_started",
  PENDING = "pending",
  ENDED = "ended",
  FINALIZED = "finalized",
  EXPIRED = "expired",
}

export enum LEADERBOARD_TYPE {
  CASINO = "casino",
  SPORTS = "sports",
}

export enum LEADERBOARD_CASINO_RULES_SOURCE {
  BET_AMOUNT = "BET_AMOUNT",
  PAYOUT = "PAYOUT",
  BET_AMOUNT_USD = "BET_AMOUNT_USD",
  PAYOUT_USD = "PAYOUT_USD",
}
export enum LEADERBOARD_CASINO_RULES_GAME {
  ALL = "ALL",
  DICE = "DICE",
  COINTOSS = "COINTOSS",
  ROULETTE = "ROULETTE",
  KENO = "KENO",
  WHEEL = "WHEEL",
  PLINKO = "PLINKO",
  SLOT = "SLOT",
}

export enum LEADERBOARD_SPORT_RULES_SOURCE {
  BET_AMOUNT = "BET_AMOUNT",
}
export enum LEADERBOARD_SPORT_RULES_BET_TYPE {
  SINGLE = "SINGLE",
  COMBO = "COMBO",
}

export type RawCasinoRules = {
  tokens: Token[];
  source: LEADERBOARD_CASINO_RULES_SOURCE;
  interval: string;
  points_per_interval: number;
  min_value?: string;
  max_value?: string;
  games: LEADERBOARD_CASINO_RULES_GAME[];
};

export type CasinoRules = {
  tokens: Token[];
  source: LEADERBOARD_CASINO_RULES_SOURCE;
  interval: bigint;
  formattedInterval: string;
  pointsPerInterval: number;
  minValue?: bigint;
  formattedMinValue?: string;
  maxValue?: bigint;
  formattedMaxValue?: string;
  games: LEADERBOARD_CASINO_RULES_GAME[];
};

export type RawSportRules = {
  tokens: Token[];
  source: LEADERBOARD_SPORT_RULES_SOURCE;
  interval: string;
  points_per_interval: number;
  min_value?: string;
  max_value?: string;
  bet_types: LEADERBOARD_SPORT_RULES_BET_TYPE[];
};

export type SportRules = {
  tokens: Token[];
  source: LEADERBOARD_SPORT_RULES_SOURCE;
  interval: bigint;
  formattedInterval: string;
  pointsPerInterval: number;
  minValue?: bigint;
  formattedMinValue?: string;
  maxValue?: bigint;
  formattedMaxValue?: string;
  betTypes: LEADERBOARD_SPORT_RULES_BET_TYPE[];
};

export type RawLeaderboardRanking = {
  bettor_address: Address;
  leaderboard_id: number;
  bet_count: number;
  rank: number;
  total_points: string;
  total_wagered: string;
};

export type LeaderboardRanking = {
  bettorAddress: Address;
  leaderboardId: number;
  betCount: number;
  rank: number;
  totalPoints: bigint;
  totalWagered: bigint;
  formattedTotalWagered: string;
};

export type RawCompleteLeaderboard = {
  affiliate_address: Address;
  chain_id: ChainId;
  created_at: string; // iso date
  description?: string;
  end_date: string; // iso date
  expiration_time: number; // secs
  expiration_date?: string; // iso date
  frontend_url: string;
  id: number;
  on_chain_id: number; // ID of the leaderboard in the smart contract
  is_bankroll_mode: boolean;
  is_finalized: boolean;
  last_refresh_date?: string; // iso date
  leaderboard_address: Address;
  //points: Json | null
  start_date: string; // iso date
  status: LEADERBOARD_STATUS;
  title: string;
  token: Token;
  winners?: Address[];
  total_shares: string;
  shares: string[];
  casino_rules?: RawCasinoRules;
  sport_rules?: RawSportRules;
  effective_rules: RawCasinoRules | RawSportRules;
  is_usd_rules_source: boolean;
  rankings: RawLeaderboardRanking[];
  player_rank?: RawLeaderboardRanking;
  total_bettors: number;
  total_bets: number;
  total_wagered: string;
  wagered_symbol: string; // "$" if USD source, else token symbol
  wagered_decimals: number; // 2 if USD source, else token decimals
};

export type RawAffiliateCompleteLeaderboard = RawCompleteLeaderboard & {
  creation_tx: Hash;
  creator_address: Address;
};
export type RawAffiliateCompleteLeaderboardWithClaimDetails = RawAffiliateCompleteLeaderboard & {
  claim_details: RawLeaderboardClaimDetails;
};

export type RawLeaderboardClaimDetails = {
  are_winners_claimed_shares: boolean[];
  is_affiliate_claimed: boolean;
  is_affiliate_claimable: boolean;
  affiliate_claimed_amount: string;
  winners_claimed_amount: string;
  affiliate_claimable_amount: string;
};

export type Leaderboard = {
  affiliateAddress: Address;
  chainId: ChainId;
  createdAt: Date;
  description?: string;
  endDate: Date;
  expirationTimeSecs: number;
  expirationDate?: Date;
  frontendUrl: string;
  id: number;
  onChainId: number; // ID of the leaderboard in the smart contract
  isBankrollMode: boolean;
  isFinalized: boolean;
  lastRefreshDate?: Date;
  leaderboardAddress: Address;
  startDate: Date;
  status: LEADERBOARD_STATUS;
  title: string;
  token: Token;
  winners?: Address[];
  totalShares: bigint;
  formattedTotalShares: string;
  shares: bigint[];
  formattedShares: string[];
  casinoRules?: CasinoRules;
  sportRules?: SportRules;
  effectiveRules: CasinoRules | SportRules;
  isUsdRulesSource: boolean;
  type: LEADERBOARD_TYPE;
  rankings: LeaderboardRanking[];
  player_rank?: LeaderboardRanking;
  totalBettors: number;
  totalBets: number;
  totalWagered: bigint;
  formattedTotalWagered: string;
  wageredSymbol: string;
  wageredDecimals: number;
};

export type AffiliateLeaderboard = Leaderboard & {
  creationTxnHash: Hash;
  creatorAddress: Address;
};
export type AffiliateLeaderboardWithClaimDetails = AffiliateLeaderboard & {
  claimDetails: LeaderboardClaimDetails;
};

export type LeaderboardClaimDetails = {
  areWinnersClaimedShares: boolean[];
  isAffiliateClaimed: boolean;
  isAffiliateClaimable: boolean;
  affiliateClaimedAmount: bigint;
  formattedAffiliateClaimedAmount: string;
  winnersClaimedAmount: bigint;
  formattedWinnersClaimedAmount: string;
  affiliateClaimableAmount: bigint;
  formattedAffiliateClaimableAmount: string;
};

export type GetLeaderboardsRawResponse = {
  leaderboards: RawCompleteLeaderboard[];
  total: number;
  offset: number;
  limit: number;
};

/**
 * Fetches leaderboards from the Betswirl API
 * @param limit - The number of leaderboards to fetch
 * @param offset - The offset of the leaderboards to fetch
 * @param playerAddress - Player address to get the leaderboard ranking (useful if the player is not in the top 100 ranking)
 * @param affiliate - Affiliate address to filter leaderboards
 * @param chainId - The chain id of the leaderboards to fetch
 * @param withExternalBankrollLeaderboards - Whether to include external bankroll leaderboards (default: false). If true, it means some returned leaderboards could have a different affiliate address than the one provided in affiliate param.
 * @param endDateDirection - The direction of the end date to sort the leaderboards
 * @param statuses - Array of statuses to filter the leaderboards
 * @param testMode - Whether to use test mode API endpoint (default: false)
 * @returns Promise<Leaderboard[]> - Array of leaderboards
 * @throws Returns empty array if the API request fails
 */
export const fetchLeaderboards = async (
  limit = 10,
  offset = 0,
  playerAddress?: Address,
  affiliates?: Address[],
  chainIds?: ChainId[],
  withExternalBankrollLeaderboards = false,
  endDateDirection?: "asc" | "desc",
  statuses?: LEADERBOARD_STATUS[],
  testMode = false,
): Promise<{ leaderboards: Leaderboard[]; total: number; offset: number; limit: number }> => {
  try {
    const params = new URLSearchParams();
    params.set("limit", limit.toString());
    params.set("offset", offset.toString());
    if (playerAddress) {
      params.set("player_address", playerAddress);
    }
    if (affiliates) {
      for (const affiliate of affiliates) {
        params.append("affiliates", affiliate);
      }
    }
    if (chainIds) {
      for (const chainId of chainIds) {
        params.append("chain_ids", chainId.toString());
      }
    }
    if (withExternalBankrollLeaderboards) {
      params.set("with_external_bankroll", withExternalBankrollLeaderboards.toString());
    }
    if (endDateDirection) {
      params.set("end_date_direction", endDateDirection);
    }
    if (statuses) {
      for (const status of statuses) {
        params.append("statuses", status);
      }
    }
    const res = await fetch(
      `${getBetSwirlApiUrl(testMode)}/public/v2/leaderboards?${params.toString()}`,
    );
    if (!res.ok) {
      throw new Error(`Status ${res.status}: ${res.statusText}`);
    }

    const response: GetLeaderboardsRawResponse = await res.json();
    return {
      leaderboards: response.leaderboards.map((leaderboard) => formatRawLeaderboard(leaderboard)),
      total: response.total,
      offset: response.offset,
      limit: response.limit,
    };
  } catch (error) {
    console.error("An error occured while fetching leaderboards", error);
    return {
      leaderboards: [],
      total: 0,
      offset,
      limit,
    };
  }
};

export type GetAffiliateLeaderboardsRawResponse = {
  leaderboards: RawAffiliateCompleteLeaderboardWithClaimDetails[];
  total: number;
  offset: number;
  limit: number;
};

/**
 * Fetches leaderboards for the affiliates from the Betswirl API
 * @param affiliate - Affiliate address to filter leaderboards
 * @param limit - The number of leaderboards to fetch
 * @param offset - The offset of the leaderboards to fetch
 * @param chainId - The chain id of the leaderboards to fetch
 * @param endDateDirection - The direction of the end date to sort the leaderboards
 * @param statuses - Array of statuses to filter the leaderboards
 * @param testMode - Whether to use test mode API endpoint (default: false)
 * @returns Promise<AffiliateLeaderboardWithClaimDetails[]> - Array of affiliate leaderboards with claim details
 * @throws Returns empty array if the API request fails
 */
export const fetchAffiliateLeaderboards = async (
  affiliate: Address,
  limit = 10,
  offset = 0,
  chainId?: ChainId,
  endDateDirection?: "asc" | "desc",
  statuses?: LEADERBOARD_STATUS[],
  testMode = false,
): Promise<{
  leaderboards: AffiliateLeaderboardWithClaimDetails[];
  total: number;
  offset: number;
  limit: number;
}> => {
  try {
    const params = new URLSearchParams();
    params.set("affiliate", affiliate);
    params.set("limit", limit.toString());
    params.set("offset", offset.toString());
    if (chainId) {
      params.set("chain_id", chainId.toString());
    }

    if (endDateDirection) {
      params.set("end_date_direction", endDateDirection);
    }
    if (statuses) {
      for (const status of statuses) {
        params.append("statuses", status);
      }
    }
    const res = await fetch(
      `${getBetSwirlApiUrl(testMode)}/affiliate/v1/leaderboards?${params.toString()}`,
      // This is needed to get the JWT cookie from the browser
      { credentials: "include" },
    );
    if (!res.ok) {
      throw new Error(`Status ${res.status}: ${res.statusText}`);
    }

    const response: GetAffiliateLeaderboardsRawResponse = await res.json();
    return {
      leaderboards: response.leaderboards.map((leaderboard) =>
        formatRawAffiliateLeaderboard(leaderboard),
      ),
      total: response.total,
      offset: response.offset,
      limit: response.limit,
    };
  } catch (error) {
    console.error("An error occured while fetching affiliate leaderboards", error);
    return {
      leaderboards: [],
      total: 0,
      offset,
      limit,
    };
  }
};

export type GetLeaderboardRawResponse = RawCompleteLeaderboard | null;

/**
 * Fetches leaderboard by id from the Betswirl API
 * @param id - The leaderboard id (not the on chain one)
 * @param playerAddress - Player address to get the leaderboard ranking (useful if the player is not in the top 100 ranking)
 * @param testMode - Whether to use test mode API endpoint (default: false)
 * @returns Promise<Leaderboard> - The leaderboard
 * @throws Returns null if the API request fails or the leaderboard is not found
 */
export const fetchLeaderboard = async (
  id: number,
  playerAddress?: Address,
  testMode = false,
): Promise<Leaderboard | null> => {
  try {
    const params = new URLSearchParams();
    if (playerAddress) {
      params.set("player_address", playerAddress);
    }
    const res = await fetch(
      `${getBetSwirlApiUrl(testMode)}/public/v1/leaderboards/${id}?${params.toString()}`,
    );
    if (!res.ok) {
      throw new Error(`Status ${res.status}: ${res.statusText}`);
    }

    const response: GetLeaderboardRawResponse = await res.json();
    return response ? formatRawLeaderboard(response) : null;
  } catch (error) {
    console.error("An error occured while fetching the leaderboard", error);
    return null;
  }
};

export type GetAffiliateLeaderboardRawResponse =
  RawAffiliateCompleteLeaderboardWithClaimDetails | null;

/**
 * Fetches leaderboard by id from the Betswirl API
 * @param id - The leaderboard id (not the on chain one)
 * @param testMode - Whether to use test mode API endpoint (default: false)
 * @returns Promise<AffiliateLeaderboardWithClaimDetails> - The affiliate leaderboard with claim details
 * @throws Returns null if the API request fails or the leaderboard is not found
 */
export const fetchAffiliateLeaderboard = async (
  id: number,
  testMode = false,
): Promise<AffiliateLeaderboardWithClaimDetails | null> => {
  try {
    const res = await fetch(`${getBetSwirlApiUrl(testMode)}/affiliate/v1/leaderboards/${id}`, {
      // This is needed to get the JWT cookie from the browser
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error(`Status ${res.status}: ${res.statusText}`);
    }

    const response: GetAffiliateLeaderboardRawResponse = await res.json();
    return response ? formatRawAffiliateLeaderboard(response) : null;
  } catch (error) {
    console.error("An error occured while fetching the affiliate leaderboard", error);
    return null;
  }
};

export const formatRawLeaderboard = (leaderboard: RawCompleteLeaderboard): Leaderboard => {
  const casinoRules = leaderboard.casino_rules
    ? {
        tokens: leaderboard.casino_rules.tokens,
        games: leaderboard.casino_rules.games,
        source: leaderboard.casino_rules.source,
        interval: BigInt(leaderboard.casino_rules.interval),
        formattedInterval: formatUnits(
          BigInt(leaderboard.casino_rules.interval),
          leaderboard.wagered_decimals,
        ),
        pointsPerInterval: leaderboard.casino_rules.points_per_interval,
        minValue: leaderboard.casino_rules.min_value
          ? BigInt(leaderboard.casino_rules.min_value)
          : undefined,
        formattedMinValue: leaderboard.casino_rules.min_value
          ? formatUnits(BigInt(leaderboard.casino_rules.min_value), leaderboard.wagered_decimals)
          : undefined,
      }
    : undefined;
  const sportRules = leaderboard.sport_rules
    ? {
        tokens: leaderboard.sport_rules.tokens,
        source: leaderboard.sport_rules.source,
        interval: BigInt(leaderboard.sport_rules.interval),
        formattedInterval: formatUnits(
          BigInt(leaderboard.sport_rules.interval),
          leaderboard.wagered_decimals,
        ),
        pointsPerInterval: leaderboard.sport_rules.points_per_interval,
        minValue: leaderboard.sport_rules.min_value
          ? BigInt(leaderboard.sport_rules.min_value)
          : undefined,
        formattedMinValue: leaderboard.sport_rules.min_value
          ? formatUnits(BigInt(leaderboard.sport_rules.min_value), leaderboard.wagered_decimals)
          : undefined,
        betTypes: leaderboard.sport_rules.bet_types,
      }
    : undefined;
  return {
    affiliateAddress: leaderboard.affiliate_address,
    chainId: leaderboard.chain_id,
    createdAt: new Date(leaderboard.created_at),
    description: leaderboard.description,
    endDate: new Date(leaderboard.end_date),
    expirationTimeSecs: leaderboard.expiration_time,
    expirationDate: leaderboard.expiration_date ? new Date(leaderboard.expiration_date) : undefined,
    frontendUrl: leaderboard.frontend_url,
    id: leaderboard.id,
    onChainId: leaderboard.on_chain_id,
    isBankrollMode: leaderboard.is_bankroll_mode,
    isFinalized: leaderboard.is_finalized,
    lastRefreshDate: leaderboard.last_refresh_date
      ? new Date(leaderboard.last_refresh_date)
      : undefined,
    leaderboardAddress: leaderboard.leaderboard_address,
    startDate: new Date(leaderboard.start_date),
    status: leaderboard.status,
    title: leaderboard.title,
    token: leaderboard.token,
    winners: leaderboard.winners,
    totalShares: BigInt(leaderboard.total_shares),
    formattedTotalShares: formatUnits(BigInt(leaderboard.total_shares), leaderboard.token.decimals),
    shares: leaderboard.shares.map((share) => BigInt(share)),
    formattedShares: leaderboard.shares.map((share) =>
      formatUnits(BigInt(share), leaderboard.token.decimals),
    ),
    casinoRules,
    sportRules,
    effectiveRules: casinoRules || sportRules!,
    isUsdRulesSource: leaderboard.is_usd_rules_source,
    type: leaderboard.casino_rules ? LEADERBOARD_TYPE.CASINO : LEADERBOARD_TYPE.SPORTS,
    rankings: leaderboard.rankings.map((ranking) => ({
      bettorAddress: ranking.bettor_address,
      leaderboardId: ranking.leaderboard_id,
      betCount: ranking.bet_count,
      rank: ranking.rank,
      totalPoints: BigInt(ranking.total_points),
      totalWagered: BigInt(ranking.total_wagered),
      formattedTotalWagered: formatUnits(BigInt(ranking.total_wagered), leaderboard.token.decimals),
    })),
    player_rank: leaderboard.player_rank
      ? {
          bettorAddress: leaderboard.player_rank.bettor_address,
          leaderboardId: leaderboard.player_rank.leaderboard_id,
          betCount: leaderboard.player_rank.bet_count,
          rank: leaderboard.player_rank.rank,
          totalPoints: BigInt(leaderboard.player_rank.total_points),
          totalWagered: BigInt(leaderboard.player_rank.total_wagered),
          formattedTotalWagered: formatUnits(
            BigInt(leaderboard.player_rank.total_wagered),
            leaderboard.token.decimals,
          ),
        }
      : undefined,
    totalBettors: leaderboard.total_bettors,
    totalBets: leaderboard.total_bets,
    totalWagered: BigInt(leaderboard.total_wagered),
    formattedTotalWagered: formatUnits(
      BigInt(leaderboard.total_wagered),
      leaderboard.wagered_decimals,
    ),
    wageredSymbol: leaderboard.wagered_symbol,
    wageredDecimals: leaderboard.wagered_decimals,
  };
};

export const formatRawAffiliateLeaderboard = (
  leaderboard: RawAffiliateCompleteLeaderboardWithClaimDetails,
): AffiliateLeaderboardWithClaimDetails => {
  return {
    ...formatRawLeaderboard(leaderboard),
    creationTxnHash: leaderboard.creation_tx,
    creatorAddress: leaderboard.creator_address,
    claimDetails: {
      areWinnersClaimedShares: leaderboard.claim_details.are_winners_claimed_shares,
      isAffiliateClaimed: leaderboard.claim_details.is_affiliate_claimed,
      isAffiliateClaimable: leaderboard.claim_details.is_affiliate_claimable,
      affiliateClaimedAmount: BigInt(leaderboard.claim_details.affiliate_claimed_amount),
      formattedAffiliateClaimedAmount: formatUnits(
        BigInt(leaderboard.claim_details.affiliate_claimed_amount),
        leaderboard.token.decimals,
      ),
      winnersClaimedAmount: BigInt(leaderboard.claim_details.winners_claimed_amount),
      formattedWinnersClaimedAmount: formatUnits(
        BigInt(leaderboard.claim_details.winners_claimed_amount),
        leaderboard.token.decimals,
      ),
      affiliateClaimableAmount: BigInt(leaderboard.claim_details.affiliate_claimable_amount),
      formattedAffiliateClaimableAmount: formatUnits(
        BigInt(leaderboard.claim_details.affiliate_claimable_amount),
        leaderboard.token.decimals,
      ),
    },
  };
};
