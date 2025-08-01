import {
  CASINO_GAME_TYPE,
  type CasinoRolledBet,
  CasinoToken,
  COINTOSS_FACE,
  CoinTossEncodedInput,
  DiceEncodedInput,
  DiceNumber,
  KenoBall,
  KenoEncodedInput,
  RouletteEncodedInput,
  RouletteNumber,
  type Token,
  type WeightedGameConfiguration,
  type WeightedGameEncodedInput,
} from "@betswirl/sdk-core"
import { type DefaultError, type QueryKey, type UseQueryOptions } from "@tanstack/react-query"

export type Theme = "light" | "dark" | "system"

export const THEME_OPTIONS: Theme[] = ["light", "dark", "system"]

export type QueryParameter<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryKey extends QueryKey = QueryKey,
> =
  | Omit<
      UseQueryOptions<queryFnData, error, data, queryKey>,
      "queryFn" | "queryHash" | "queryKey" | "queryKeyHashFn" | "throwOnError" | "select"
    >
  | undefined

export type GameChoice =
  | { game: CASINO_GAME_TYPE.COINTOSS; choice: COINTOSS_FACE }
  | { game: CASINO_GAME_TYPE.DICE; choice: DiceNumber }
  | { game: CASINO_GAME_TYPE.ROULETTE; choice: RouletteNumber[] }
  | { game: CASINO_GAME_TYPE.KENO; choice: KenoBall[] }
  | { game: CASINO_GAME_TYPE.WHEEL; choice: WeightedGameConfiguration }

export type GameRolledResult =
  | { game: CASINO_GAME_TYPE.COINTOSS; rolled: COINTOSS_FACE }
  | { game: CASINO_GAME_TYPE.DICE; rolled: DiceNumber }
  | { game: CASINO_GAME_TYPE.ROULETTE; rolled: RouletteNumber }
  | { game: CASINO_GAME_TYPE.KENO; rolled: KenoBall[] }
  | { game: CASINO_GAME_TYPE.WHEEL; rolled: number }

export type GameEncodedInput =
  | { game: CASINO_GAME_TYPE.COINTOSS; encodedInput: CoinTossEncodedInput }
  | { game: CASINO_GAME_TYPE.DICE; encodedInput: DiceEncodedInput }
  | { game: CASINO_GAME_TYPE.ROULETTE; encodedInput: RouletteEncodedInput }
  | { game: CASINO_GAME_TYPE.KENO; encodedInput: KenoEncodedInput }
  | { game: CASINO_GAME_TYPE.WHEEL; encodedInput: WeightedGameEncodedInput }

export type GameResult = CasinoRolledBet & {
  rolled: GameRolledResult
  formattedRolled: string
}

export type BetStatus =
  | "loading"
  | "pending"
  | "success"
  | "rolling"
  | "error"
  | "waiting-error"
  | "internal-error"
  | null

export interface TokenWithImage extends Token {
  image: string
}

export interface CasinoTokenWithImage extends CasinoToken {
  image: string
}

export enum HistoryEntryStatus {
  WonBet = "Won bet",
  Busted = "Busted",
}

export interface HistoryEntry {
  id: string
  status: HistoryEntryStatus
  multiplier: number | string
  payoutAmount: number | string
  payoutCurrencyToken: TokenWithImage
  timestamp: string
}

export type ChainTokenPanelView = "main" | "chain" | "token"

export interface GameDefinition<T extends GameChoice> {
  gameType: T["game"]
  defaultSelection: T
  getMultiplier: (choice: T["choice"]) => number
  encodeInput: (choice: T["choice"]) => GameEncodedInput["encodedInput"]
  getWinChancePercent?: (choice: T["choice"]) => number | number[]
  formatDisplayResult: (rolled: GameRolledResult, choice: T["choice"]) => string
}
