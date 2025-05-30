import { COINTOSS_FACE } from "@betswirl/sdk-core"
import { type DefaultError, type QueryKey, type UseQueryOptions } from '@tanstack/react-query'

export type QueryParameter<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryKey extends QueryKey = QueryKey,
> = Omit<UseQueryOptions<queryFnData, error, data, queryKey>, 'queryFn' | 'queryHash' | 'queryKey' | 'queryKeyHashFn' | 'throwOnError' | 'select'> | undefined

export interface GameResult {
  isWin: boolean
  payout: bigint
  currency: string
  rolled: COINTOSS_FACE
}

export type BetStatus = "loading" | "pending" | "success" | "rolling" | "error" | "waiting-error" | "internal-error" | null
