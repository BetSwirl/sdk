import { ApolloClient, HttpLink } from "@apollo/client";
import { type Address, getAddress, type Hash, zeroAddress } from "viem";
import type { NORMAL_CASINO_GAME_TYPE, WeightedGameConfiguration } from "../../../..";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "../../../../constants";
import { ERROR_CODES } from "../../../../errors";
import { SubgraphError } from "../../../../errors/types";
import type { CasinoBet, Token } from "../../../../interfaces";
import {
  chainNativeCurrencyToToken,
  decodeNormalCasinoInput,
  decodeNormalCasinoRolled,
  decodeWeightedCasinoInput,
  decodeWeightedCasinoRolled,
} from "../../../../utils";
import { FORMAT_TYPE, formatRawAmount } from "../../../../utils/format";
import {
  CASINO_GAME_SUBGRAPH_TYPE,
  CASINO_GAME_TYPE,
  type CasinoChainId,
  casinoChainById,
  subgraphGameByType,
  typeBySubgraphCasinoGame,
} from "../../../casino";
import { BetDocument, type BetQuery, type BetQueryVariables } from "../documents/bet";
import { BetsDocument, type BetsQuery, type BetsQueryVariables } from "../documents/bets";
import type { BetFragment } from "../documents/fragments/bet";
import { Bet_OrderBy, OrderDirection } from "../documents/types";
import {
  defaultSubgraphCasinoClient,
  getGraphqlEndpoint,
  type SubgraphCasinoClient,
} from "./common";

export function formatCasinoBet(
  bet: BetFragment,
  chainId: CasinoChainId,
  formatType: FORMAT_TYPE = FORMAT_TYPE.STANDARD,
): CasinoBet {
  const casinoChain = casinoChainById[chainId];
  const betAmount = bet.betAmount ? BigInt(bet.betAmount) : 0n;
  const nativeCurrency = casinoChain.viemChain.nativeCurrency;
  const token =
    bet.gameToken.token.address === zeroAddress
      ? chainNativeCurrencyToToken(nativeCurrency)
      : {
          address: getAddress(bet.gameToken.token.address),
          symbol: bet.gameToken.token.symbol,
          decimals: bet.gameToken.token.decimals,
        };
  const game = typeBySubgraphCasinoGame[bet.gameId as CASINO_GAME_SUBGRAPH_TYPE];
  const totalBetAmount = betAmount * BigInt(bet.betCount);
  const rollTotalBetAmount = bet.rollTotalBetAmount ? BigInt(bet.rollTotalBetAmount) : undefined;
  const benefit =
    rollTotalBetAmount && bet.payout ? BigInt(bet.payout) - BigInt(rollTotalBetAmount) : undefined;
  const encodedRolled = bet.encodedRolled ? bet.encodedRolled : undefined;
  const isWin =
    rollTotalBetAmount && bet.payout ? BigInt(bet.payout) >= rollTotalBetAmount : undefined;
  const isStopTriggered = encodedRolled ? encodedRolled.length !== Number(bet.betCount) : undefined;

  const weightedGameConfiguration: WeightedGameConfiguration | undefined = bet.weightedGameBet
    ? {
        configId: Number(bet.weightedGameBet.config.id),
        multipliers: bet.weightedGameBet.config.multipliers.map((multiplier) => BigInt(multiplier)),
        weights: bet.weightedGameBet.config.weights.map((weight) => BigInt(weight)),
        game,
        chainId,
      }
    : undefined;
  return {
    id: BigInt(bet.id),
    token,
    nativeCurrency: chainNativeCurrencyToToken(nativeCurrency),
    chainId,
    game,
    gameAddress: getAddress(bet.gameAddress),
    bettor: getAddress(bet.user.address),
    betAmount,
    formattedBetAmount: formatRawAmount(betAmount, token.decimals, formatType),
    betCount: Number(bet.betCount),
    totalBetAmount: totalBetAmount,
    formattedTotalBetAmount: formatRawAmount(totalBetAmount, token.decimals, formatType),
    stopLoss: BigInt(bet.stopLoss),
    formattedStopLoss: formatRawAmount(BigInt(bet.stopLoss), token.decimals, formatType),
    stopGain: BigInt(bet.stopGain),
    formattedStopGain: formatRawAmount(BigInt(bet.stopGain), token.decimals, formatType),
    houseEdge: bet.houseEdge, // BP
    betTimestampSecs: Number(bet.betTimestamp), // secs
    betDate: new Date(Math.round(Number(bet.betTimestamp) * 1000)),
    chargedVRFFees: BigInt(bet.chargedVRFFees),
    formattedChargedVRFFees: formatRawAmount(
      BigInt(bet.chargedVRFFees),
      nativeCurrency.decimals,
      formatType,
    ),
    betTxnHash: bet.betTxnHash,
    encodedInput: bet.encodedInput,
    decodedInput: weightedGameConfiguration
      ? decodeWeightedCasinoInput(bet.encodedInput, weightedGameConfiguration, bet.houseEdge)
      : decodeNormalCasinoInput(bet.encodedInput, game as NORMAL_CASINO_GAME_TYPE),
    payout: bet.payout ? BigInt(bet.payout) : undefined,
    formattedPayout: bet.payout
      ? formatRawAmount(BigInt(bet.payout), token.decimals, formatType)
      : undefined,
    formattedPayoutMultiplier: bet.payoutMultiplier ? Number(bet.payoutMultiplier) : undefined,
    benefit,
    formattedBenefit: benefit ? formatRawAmount(benefit, token.decimals, formatType) : undefined,
    rollTxnHash: bet.rollTxnHash,
    rollTimestampSecs: bet.rollTimestamp ? Number(bet.rollTimestamp) : undefined, // secs
    rollDate: bet.rollTimestamp
      ? new Date(Math.round(Number(bet.rollTimestamp) * 1000))
      : undefined,
    isResolved: bet.isResolved,
    isRefunded: bet.isRefunded,
    rollTotalBetAmount,
    fomattedRollTotalBetAmount: rollTotalBetAmount
      ? formatRawAmount(rollTotalBetAmount, token.decimals, formatType)
      : undefined,
    rollBetCount: encodedRolled?.length,
    encodedRolled,
    decodedRolled: encodedRolled?.map((encoded) =>
      weightedGameConfiguration
        ? decodeWeightedCasinoRolled(encoded, weightedGameConfiguration, bet.houseEdge)
        : decodeNormalCasinoRolled(encoded, game as NORMAL_CASINO_GAME_TYPE),
    ),
    affiliate: bet.affiliate?.address ? bet.affiliate.address : undefined,
    isWin,
    isLost: isWin === undefined ? undefined : !isWin,
    isStopLossTriggered: isStopTriggered === undefined ? undefined : isStopTriggered && !isWin,
    isStopGainTriggered: isStopTriggered === undefined ? undefined : isStopTriggered && isWin,
  };
}

export enum CasinoBetFilterStatus {
  RESOLVED = "RESOLVED",
  PENDING = "PENDING",
}

export async function fetchBets(
  client: SubgraphCasinoClient,
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
  const apolloClient = new ApolloClient({
    link: new HttpLink({ uri: getGraphqlEndpoint(client) }),
    cache: client.cache ?? defaultSubgraphCasinoClient.cache,
    defaultOptions: client.defaultOptions ?? defaultSubgraphCasinoClient.defaultOptions,
  });

  const variables: BetsQueryVariables = {
    first: itemsPerPage,
    skip: itemsPerPage * (page - 1),
    where: {
      ...(filter?.bettor && { user: filter.bettor.toLowerCase() }),
      ...(filter?.game && { gameId: subgraphGameByType[filter.game] }),
      ...(filter?.token && {
        gameToken_: { token: filter.token.address.toLowerCase() },
      }),
      ...(filter?.status !== undefined && {
        resolved: filter.status === CasinoBetFilterStatus.RESOLVED,
      }),
      ...(filter?.affiliates?.length && {
        affiliate_in: filter.affiliates.map((a) => a.toLowerCase()),
      }),
    },
    orderBy: sortBy?.key,
    orderDirection: sortBy?.order,
  };

  const { data, error } = await apolloClient.query<BetsQuery, BetsQueryVariables>({
    query: BetsDocument,
    variables,
  });

  return {
    bets:
      data?.bets.map((bet) =>
        formatCasinoBet(
          bet,
          client.chainId,
          client.formatType ?? defaultSubgraphCasinoClient.formatType,
        ),
      ) ?? [],
    error: error
      ? new SubgraphError("Error fetching bets", ERROR_CODES.SUBGRAPH.FETCH_BETS_ERROR, error)
      : undefined,
  };
}

export async function fetchBet(
  id: string | bigint,
  client: SubgraphCasinoClient,
): Promise<{ bet: CasinoBet | undefined; error: SubgraphError | undefined }> {
  const apolloClient = new ApolloClient({
    link: new HttpLink({ uri: getGraphqlEndpoint(client) }),
    cache: client.cache ?? defaultSubgraphCasinoClient.cache,
  });

  const { data, error } = await apolloClient.query<BetQuery, BetQueryVariables>({
    query: BetDocument,
    variables: {
      id: id.toString(),
    },
  });

  return {
    bet: data?.bet
      ? formatCasinoBet(
          data.bet,
          client.chainId,
          client.formatType ?? defaultSubgraphCasinoClient.formatType,
        )
      : undefined,
    error: error
      ? new SubgraphError("Error fetching bet", ERROR_CODES.SUBGRAPH.FETCH_BET_ERROR, error)
      : undefined,
  };
}

export async function fetchBetByHash(
  placeBetHash: Hash,
  client: SubgraphCasinoClient,
): Promise<{ bet: CasinoBet | undefined; error: SubgraphError | undefined }> {
  const apolloClient = new ApolloClient({
    link: new HttpLink({ uri: getGraphqlEndpoint(client) }),
    cache: client.cache ?? defaultSubgraphCasinoClient.cache,
    defaultOptions: client.defaultOptions ?? defaultSubgraphCasinoClient.defaultOptions,
  });

  const variables: BetsQueryVariables = {
    first: 1,
    where: {
      betTxnHash: placeBetHash.toLowerCase(),
    },
  };

  const { data, error } = await apolloClient.query<BetsQuery, BetsQueryVariables>({
    query: BetsDocument,
    variables,
  });
  return {
    bet: data?.bets[0]
      ? formatCasinoBet(
          data.bets[0],
          client.chainId,
          client.formatType ?? defaultSubgraphCasinoClient.formatType,
        )
      : undefined,
    error: error
      ? new SubgraphError("Error fetching bet", ERROR_CODES.SUBGRAPH.FETCH_BET_ERROR, error)
      : undefined,
  };
}
