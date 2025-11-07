import { type ApolloCache, ApolloClient, type FetchPolicy, InMemoryCache } from "@apollo/client";
import { FORMAT_TYPE } from "../../../../utils/format";
import { replaceGraphQlKey } from "../../../../utils/subgraphs";
import { type CasinoChainId, casinoChainById } from "../../../casino";

export interface SubgraphCasinoClient {
  chainId: CasinoChainId;
  theGraphKey?: string;
  cache?: ApolloCache;
  defaultOptions?: ApolloClient.DefaultOptions;
  formatType?: FORMAT_TYPE;
}

export const defaultSubgraphCasinoClient = {
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: "network-only" as FetchPolicy,
    },
  },
  formatType: FORMAT_TYPE.STANDARD,
};

export function getGraphqlEndpoint(subgraphClient: SubgraphCasinoClient) {
  const casinoChain = casinoChainById[subgraphClient.chainId];
  const graphQlKey = subgraphClient.theGraphKey;
  if (graphQlKey) {
    return replaceGraphQlKey(casinoChain.graphql.endpoint, graphQlKey);
  }
  return casinoChain.graphql.defaultEndpoint;
}
