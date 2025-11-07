import { ApolloClient, HttpLink } from "@apollo/client";
import { type Address } from "viem";
import { DEFAULT_ITEMS_PER_PAGE, SubgraphError } from "../../../..";
import { DEFAULT_PAGE } from "../../../../constants";
import { ERROR_CODES } from "../../../../errors";
import type { SubgraphToken } from "../../../../interfaces";
import { FORMAT_TYPE, formatRawAmount } from "../../../../utils/format";
import { type CasinoChainId } from "../../../casino";
import type { TokenFragment } from "../documents/fragments/token";
import { TokenDocument, type TokenQuery, type TokenQueryVariables } from "../documents/token";
import { TokensDocument, type TokensQuery, type TokensQueryVariables } from "../documents/tokens";
import { OrderDirection, Token_OrderBy } from "../documents/types";
import type { SubgraphCasinoClient } from "./common";
import { defaultSubgraphCasinoClient, getGraphqlEndpoint } from "./common";

export function formatToken(
  token: TokenFragment,
  chainId: CasinoChainId,
  formatType: FORMAT_TYPE = FORMAT_TYPE.STANDARD,
): SubgraphToken {
  return {
    id: token.id as Address,
    address: token.address as Address,
    chainId,
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    betTxnCount: Number(token.betTxnCount),
    betCount: Number(token.betCount),
    winTxnCount: Number(token.winTxnCount),
    userCount: Number(token.userCount),
    totalWagered: BigInt(token.totalWagered),
    formattedTotalWagered: formatRawAmount(BigInt(token.totalWagered), token.decimals, formatType),
    totalPayout: BigInt(token.totalPayout),
    formattedTotalPayout: formatRawAmount(BigInt(token.totalPayout), token.decimals, formatType),
    dividendAmount: BigInt(token.dividendAmount),
    formattedDividendAmount: formatRawAmount(
      BigInt(token.dividendAmount),
      token.decimals,
      formatType,
    ),
    bankAmount: BigInt(token.bankAmount),
    formattedBankAmount: formatRawAmount(BigInt(token.bankAmount), token.decimals, formatType),
    affiliateAmount: BigInt(token.affiliateAmount),
    formattedAffiliateAmount: formatRawAmount(
      BigInt(token.affiliateAmount),
      token.decimals,
      formatType,
    ),
    treasuryAmount: BigInt(token.treasuryAmount),
    formattedTreasuryAmount: formatRawAmount(
      BigInt(token.treasuryAmount),
      token.decimals,
      formatType,
    ),
    teamAmount: BigInt(token.teamAmount),
    formattedTeamAmount: formatRawAmount(BigInt(token.teamAmount), token.decimals, formatType),
  };
}

export async function fetchTokens(
  client: SubgraphCasinoClient,
  page = DEFAULT_PAGE,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  sortBy: { key: Token_OrderBy; order: OrderDirection } = {
    key: Token_OrderBy.Symbol,
    order: OrderDirection.Asc,
  },
): Promise<{ tokens: SubgraphToken[]; error: SubgraphError | undefined }> {
  const apolloClient = new ApolloClient({
    link: new HttpLink({ uri: getGraphqlEndpoint(client) }),
    cache: client.cache ?? defaultSubgraphCasinoClient.cache,
    defaultOptions: client.defaultOptions ?? defaultSubgraphCasinoClient.defaultOptions,
  });

  const variables: TokensQueryVariables = {
    first: itemsPerPage,
    skip: itemsPerPage * (page - 1),
    //where: {},
    orderBy: sortBy?.key,
    orderDirection: sortBy?.order,
  };

  const { data, error } = await apolloClient.query<TokensQuery, TokensQueryVariables>({
    query: TokensDocument,
    variables,
  });

  return {
    tokens:
      data?.tokens.map((token) =>
        formatToken(
          token,
          client.chainId,
          client.formatType ?? defaultSubgraphCasinoClient.formatType,
        ),
      ) ?? [],
    error: error
      ? new SubgraphError("Error fetching tokens", ERROR_CODES.SUBGRAPH.FETCH_TOKENS_ERROR, error)
      : undefined,
  };
}

export async function fetchToken(
  address: Address,
  client: SubgraphCasinoClient,
): Promise<{ token: SubgraphToken | undefined; error: SubgraphError | undefined }> {
  const apolloClient = new ApolloClient({
    link: new HttpLink({ uri: getGraphqlEndpoint(client) }),
    cache: client.cache ?? defaultSubgraphCasinoClient.cache,
  });

  const { data, error } = await apolloClient.query<TokenQuery, TokenQueryVariables>({
    query: TokenDocument,
    variables: {
      id: address.toLowerCase(),
    },
  });

  return {
    token: data?.token
      ? formatToken(
          data.token,
          client.chainId,
          client.formatType ?? defaultSubgraphCasinoClient.formatType,
        )
      : undefined,
    error: error
      ? new SubgraphError("Error fetching token", ERROR_CODES.SUBGRAPH.FETCH_TOKEN_ERROR, error)
      : undefined,
  };
}
