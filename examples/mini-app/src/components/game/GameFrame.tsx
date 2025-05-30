import {
  BP_VALUE,
  CASINO_GAME_TYPE,
  chainById,
  chainNativeCurrencyToToken,
  CoinToss,
  COINTOSS_FACE,
  FORMAT_TYPE,
  formatRawAmount,
  Token,
} from "@betswirl/sdk-core"
import Decimal from "decimal.js"
import { History, Info } from "lucide-react"
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
import { parseUnits } from "viem"
import coinHeadsIcon from "../../assets/game/coin-heads.svg"
import coinTailsIcon from "../../assets/game/coin-tails.svg"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

import { TokenImage } from "@coinbase/onchainkit/token"

import { ETH_TOKEN } from "../../lib/tokens"
import { BetStatus, GameResult } from "../../types"
import { Sheet, SheetTrigger } from "../ui/sheet"
import { GameResultWindow } from "./GameResultWindow"
import { HistoryEntry, HistorySheetPanel } from "./HistorySheetPanel"
import { InfoSheetPanel } from "./InfoSheetPanel"
import { useChain } from "../../context/chainContext"
import { useHouseEdge } from "../../hooks/useHouseEdge"

interface IThemeSettings {
  theme?: "light" | "dark" | "system"
  customTheme?: {
    "--primary"?: string
    "--play-btn-font"?: string
    "--game-window-overlay"?: string
  } & React.CSSProperties
  backgroundImage: string
}

interface GameFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  themeSettings: IThemeSettings
  historyData: HistoryEntry[]
  balance: bigint
  connectWallletBtn: React.ReactNode
  isConnected: boolean
  onPlayBtnClick: (selectedSide: COINTOSS_FACE) => void
  token: Token
  gameResult: GameResult | null
  betStatus: BetStatus | null
  onHistoryOpen: () => void
  betAmount: bigint | undefined
  setBetAmount: (amount: bigint | undefined) => void
  onHalfBet: () => void
  onDoubleBet: () => void
  onMaxBet: () => void
  vrfFees: number | string // formatted
  gasPrice: number | string // gwei formatted
}

const STEP = 0.0001

export function GameFrame({
  themeSettings,
  historyData,
  balance,
  connectWallletBtn,
  isConnected,
  onPlayBtnClick,
  token,
  gameResult,
  betStatus,
  onHistoryOpen,
  betAmount,
  setBetAmount,
  onHalfBet,
  onDoubleBet,
  onMaxBet,
  vrfFees,
  gasPrice,
  ...props
}: GameFrameProps) {
  const [betAmountError, setBetAmountError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState<string>("")
  const [isValidInput, setIsValidInput] = useState<boolean>(true)
  const [isUserTyping, setIsUserTyping] = useState<boolean>(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false)
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false)
  const [selectedSide, setSelectedSide] = useState<COINTOSS_FACE>(
    COINTOSS_FACE.HEADS,
  )
  const { areChainsSynced, appChainId } = useChain()
  const cardRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const { theme } = themeSettings
  const [betCount, _] = useState(1)

  const themeClass = theme === "system" ? undefined : theme

  useEffect(() => {
    setIsMounted(true)

    // Cleanup timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Sync inputValue with external betAmount changes from buttons (but not when user is typing)
  useEffect(() => {
    if (isUserTyping) return

    if (betAmount === undefined) {
      setInputValue("")
      setIsValidInput(true)
    } else {
      const formatted = formatRawAmount(
        betAmount,
        token.decimals,
        FORMAT_TYPE.PRECISE,
      )
      setInputValue(formatted)
      setIsValidInput(true)
    }
  }, [betAmount, token.decimals, isUserTyping])

  const isBetAmountValid = betAmount && betAmount > 0n
  const { houseEdge } = useHouseEdge({
    game: CASINO_GAME_TYPE.COINTOSS,
    token: chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency),
  })
  const grossMultiplier = CoinToss.getMultiplier(selectedSide)
  const winChance = CoinToss.getWinChancePercent(selectedSide)

  const targetPayout = useMemo(() => {
    if (!betAmount) return 0n
    return getNetPayout(betAmount, betCount)
  }, [betAmount, betCount])

  const formattedTargetPayout = useMemo(() => {
    if (!targetPayout) return "0"
    return formatRawAmount(targetPayout, token.decimals)
  }, [targetPayout, token.decimals])

  const multiplier = Number(
    Number(getNetPayout(1000000000000000000n, 1)) / 1e18,
  ).toFixed(2)

  /*const houseEdgeFees = useMemo(
    () => getFees(getGrossPayout(betAmount ?? 0n, betCount)),
    [betAmount, betCount],
  ) */
  const formattedBalance = formatRawAmount(balance, token.decimals)

  const isBetSuccees = betStatus === "success"
  // Redundant with isWaiting from usePlaceBet
  const isWaiting =
    betStatus === "loading" ||
    betStatus === "pending" ||
    betStatus === "rolling"
  const isError =
    betStatus === "error" ||
    betStatus === "waiting-error" ||
    betStatus === "internal-error"

  const canInitiateBet =
    isConnected && areChainsSynced && isBetAmountValid && !isWaiting

  const isPlayButtonDisabled: boolean = isError || isWaiting || !canInitiateBet

  let playButtonText: string
  if (isError) {
    playButtonText = "Error, try again"
  } else if (isBetSuccees) {
    playButtonText = "Try again"
  } else if (betStatus === "pending") {
    playButtonText = "Placing Bet..."
  } else if (betStatus === "loading") {
    playButtonText = "Loading Bet..."
  } else if (betStatus === "rolling") {
    playButtonText = "Bet rolling..."
  } else if (!isConnected) {
    playButtonText = "Connect Wallet"
  } else if (!areChainsSynced) {
    playButtonText = "Switch chain"
  } else {
    playButtonText = "Place Bet"
  }

  function getFees(payout: bigint) {
    return (payout * BigInt(houseEdge)) / BigInt(BP_VALUE)
  }
  function getGrossPayout(amount: bigint, numBets: number) {
    return (
      (amount * BigInt(numBets) * BigInt(grossMultiplier)) / BigInt(BP_VALUE)
    )
  }
  function getNetPayout(amount: bigint, numBets: number) {
    const grossPayout = getGrossPayout(amount, numBets)
    return grossPayout - getFees(grossPayout)
  }

  const handlePlayBtnClick = () => {
    if (isBetSuccees) {
      setBetAmount(0n)
      setInputValue("")
      setSelectedSide(COINTOSS_FACE.HEADS)
    }
    onPlayBtnClick(selectedSide)
  }

  const handleCoinClick = () => {
    if (!isConnected || betStatus === "pending" || !!gameResult) {
      return
    }
    setSelectedSide((prevSide) =>
      prevSide === COINTOSS_FACE.HEADS
        ? COINTOSS_FACE.TAILS
        : COINTOSS_FACE.HEADS,
    )
  }

  const handleHistoryOpen = (open: boolean) => {
    if (open) {
      onHistoryOpen()
    }
    setIsHistorySheetOpen(open)
  }

  const currentCoinIcon =
    selectedSide === COINTOSS_FACE.HEADS ? coinHeadsIcon : coinTailsIcon
  const isCoinClickable = isConnected && betStatus !== "pending" && !gameResult

  return (
    <div
      className={cn(
        "cointoss-game-wrapper game-global-styles",
        themeClass,
        props.className,
      )}
      style={themeSettings.customTheme as React.CSSProperties}
      {...props}
    >
      <Card
        ref={cardRef}
        className={cn(
          "relative overflow-hidden",
          "bg-card text-card-foreground border",
        )}
      >
        <CardHeader className="flex flex-row justify-between items-center h-[44px]">
          <CardTitle className="text-lg text-title-color font-bold">
            CoinToss
          </CardTitle>
          {connectWallletBtn}
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div
            className={cn(
              "h-[160px] rounded-[16px] flex flex-col justify-end items-center relative bg-cover bg-center bg-no-repeat",
              "bg-muted overflow-hidden",
            )}
            style={{
              backgroundImage: `url(${themeSettings.backgroundImage})`,
            }}
          >
            <div
              className={cn(
                "absolute inset-0 rounded-[16px]",
                "bg-game-window-overlay",
              )}
            />

            <Sheet open={isInfoSheetOpen} onOpenChange={setIsInfoSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="iconTransparent"
                  size="iconRound"
                  className={cn(
                    "absolute top-2 left-2 z-10",
                    "text-white border border-border-stroke",
                    isInfoSheetOpen && "text-primary border-primary",
                  )}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              {isMounted && cardRef.current && (
                <InfoSheetPanel
                  portalContainer={cardRef.current}
                  winChance={winChance}
                  rngFee={vrfFees}
                  targetPayout={formattedTargetPayout}
                  gasPrice={gasPrice}
                  token={token}
                />
              )}
            </Sheet>

            <Sheet open={isHistorySheetOpen} onOpenChange={handleHistoryOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="iconTransparent"
                  size="iconRound"
                  className={cn(
                    "absolute top-2 right-2 z-5",
                    "text-white border border-border-stroke bg-neutral-background",
                    isHistorySheetOpen && "text-primary border-primary",
                  )}
                >
                  <History className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              {isMounted && cardRef.current && (
                <HistorySheetPanel
                  portalContainer={cardRef.current}
                  historyData={historyData}
                />
              )}
            </Sheet>

            <div className="absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[26px] font-extrabold leading-[34px] text-white">
              {multiplier} x
            </div>
            <Button
              variant="coinButton"
              size="coin"
              onClick={handleCoinClick}
              disabled={!isCoinClickable}
              aria-label={`Select ${
                selectedSide === COINTOSS_FACE.HEADS ? "Tails" : "Heads"
              } side`}
              className="absolute top-[62px] left-1/2 transform -translate-x-1/2 mt-2"
            >
              <img
                src={currentCoinIcon}
                alt={selectedSide === COINTOSS_FACE.HEADS ? "Heads" : "Tails"}
                className="h-full w-auto pointer-events-none"
              />
            </Button>
            <GameResultWindow
              isVisible={!!gameResult}
              isWin={gameResult?.isWin}
              amount={betAmount || 0n}
              payout={gameResult?.payout}
              currency="ETH"
              rolled={gameResult?.rolled || ""}
            />
          </div>

          <div className="bg-control-panel-background p-4 rounded-[16px] flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium flex items-center">
                <span className="text-text-on-surface-variant">
                  Balance:&nbsp;
                </span>
                <span className="font-semibold">{formattedBalance}</span>
                <TokenImage token={ETH_TOKEN} size={18} className="ml-1" />
              </div>

              <Label
                htmlFor="betAmount"
                className="text-sm font-medium -mb-1 text-text-on-surface-variant"
              >
                Bet amount
              </Label>
              <Input
                id="betAmount"
                type="number"
                placeholder="0"
                min={0}
                // Note: The real maximum is set by CoinTossGame and operates on the balance amount in bigint.
                // Converting formattedBalance to a float here may lose precision for large values;
                // however, a bigint-compatible approach is not required here because the actual maximum, if enforced,
                // is handled by CoinTossGame using the balance amount as bigint.
                max={Number.parseFloat(formattedBalance)}
                step={STEP}
                value={inputValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newInputValue = e.target.value
                  setInputValue(newInputValue)
                  setIsUserTyping(true)

                  // Clear existing timeout
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current)
                  }

                  // Set new timeout to stop typing state after 1 second
                  typingTimeoutRef.current = setTimeout(() => {
                    setIsUserTyping(false)
                  }, 1000)

                  if (newInputValue === "") {
                    setBetAmount(undefined)
                    setIsValidInput(true)
                    setBetAmountError(null)
                    return
                  }

                  try {
                    new Decimal(newInputValue)

                    try {
                      const weiValue = parseUnits(newInputValue, token.decimals)
                      setBetAmount(weiValue)
                      setIsValidInput(true)
                      setBetAmountError(null)
                    } catch {
                      setIsValidInput(false)
                      setBetAmountError(null)
                    }
                  } catch {
                    setIsValidInput(false)
                    setBetAmountError(null)
                  }
                }}
                className={cn(
                  "relative",
                  !isValidInput && "[&_input]:text-muted-foreground",
                )}
                token={{
                  icon: <TokenImage token={ETH_TOKEN} size={18} />,
                  symbol: "ETH",
                }}
                disabled={
                  !isConnected || betStatus === "pending" || !!gameResult
                }
              />
              {betAmountError && (
                <div className="text-red-500 text-xs mt-1">
                  {betAmountError}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="secondary"
                  onClick={onHalfBet}
                  className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
                  disabled={!isConnected || isWaiting || !isBetAmountValid}
                >
                  1/2
                </Button>
                <Button
                  variant="secondary"
                  onClick={onDoubleBet}
                  className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
                  disabled={!isConnected || isWaiting || !isBetAmountValid}
                >
                  2x
                </Button>
                <Button
                  variant="secondary"
                  className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
                  onClick={onMaxBet}
                  disabled={!isConnected || isWaiting || !isBetAmountValid}
                >
                  Max
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className={cn(
                "w-full",
                "border-0",
                "font-bold",
                "rounded-[16px]",
                "text-play-btn-font",
              )}
              variant={isError ? "destructive" : "default"}
              onClick={handlePlayBtnClick}
              disabled={isPlayButtonDisabled}
            >
              {playButtonText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
