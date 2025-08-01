import { CASINO_GAME_TYPE } from "@betswirl/sdk-core"
import { History, Info } from "lucide-react"
import React, { createContext, forwardRef, useContext, useEffect, useRef, useState } from "react"
import { zeroAddress } from "viem"

import { cn } from "../../lib/utils"
import { BetStatus, GameResult, HistoryEntry, Theme, TokenWithImage } from "../../types/types"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Sheet, SheetTrigger } from "../ui/sheet"
import { BettingPanel } from "./BettingPanel"
import { GameResultWindow } from "./GameResultWindow"
import { HistorySheetPanel } from "./HistorySheetPanel"
import { InfoSheetPanel } from "./InfoSheetPanel"
import { getVariantConfig } from "./shared/gameVariants"
import { GameVariant } from "./shared/types"

interface ThemeSettings {
  theme?: Theme
  customTheme?: {
    "--primary"?: string
    "--play-btn-font"?: string
    "--connect-btn-font"?: string
    "--game-window-overlay"?: string
  } & React.CSSProperties
  backgroundImage: string
}

interface GameFrameContextValue {
  themeSettings: ThemeSettings
  portalContainer: HTMLElement | null
  isInfoSheetOpen: boolean
  setIsInfoSheetOpen: (open: boolean) => void
  isHistorySheetOpen: boolean
  setIsHistorySheetOpen: (open: boolean) => void
  isMounted: boolean
}

const GameFrameContext = createContext<GameFrameContextValue | null>(null)

const useGameFrameContext = () => {
  const context = useContext(GameFrameContext)
  if (!context) {
    throw new Error("GameFrame compound components must be used within GameFrame")
  }
  return context
}

interface GameFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  themeSettings: ThemeSettings
  children: React.ReactNode
  variant?: GameVariant
}

const GameFrameRoot = forwardRef<HTMLDivElement, GameFrameProps>(
  ({ themeSettings, children, variant = "default", ...props }, ref) => {
    const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false)
    const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)
    const [isMounted, setIsMounted] = useState(false)
    const { theme } = themeSettings

    const themeClass = theme === "system" ? undefined : theme
    const variantConfig = getVariantConfig(variant)

    const customTheme = themeSettings.customTheme
      ? {
          ...themeSettings.customTheme,
          "--connect-btn-font":
            themeSettings.customTheme["--connect-btn-font"] ??
            themeSettings.customTheme["--primary"],
        }
      : undefined

    useEffect(() => {
      setIsMounted(true)
    }, [])

    const contextValue: GameFrameContextValue = {
      themeSettings,
      portalContainer: cardRef.current,
      isInfoSheetOpen,
      setIsInfoSheetOpen,
      isHistorySheetOpen,
      setIsHistorySheetOpen,
      isMounted,
    }

    return (
      <GameFrameContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("cointoss-game-wrapper game-global-styles", themeClass, props.className)}
          style={customTheme as React.CSSProperties}
          {...props}
        >
          <Card
            ref={cardRef}
            className={cn(
              "relative overflow-hidden",
              "bg-card text-card-foreground border",
              variantConfig.card.height,
            )}
          >
            {children}
          </Card>
        </div>
      </GameFrameContext.Provider>
    )
  },
)

interface HeaderProps {
  title: string
  connectWalletButton: React.ReactNode
  tokenSelector?: React.ReactNode
}

function Header({ title, connectWalletButton, tokenSelector }: HeaderProps) {
  return (
    <CardHeader className="flex flex-row justify-between items-center h-[44px]">
      <div className="flex items-center gap-3">
        <CardTitle className="text-lg text-title-color font-bold">{title}</CardTitle>
        {tokenSelector}
      </div>
      {connectWalletButton}
    </CardHeader>
  )
}

interface GameAreaProps {
  children: React.ReactNode
  variant?: GameVariant
}

function GameArea({ children, variant = "default" }: GameAreaProps) {
  const { themeSettings } = useGameFrameContext()
  const variantConfig = getVariantConfig(variant)

  return (
    <CardContent className={variantConfig.gameArea.contentClass}>
      <div
        className={cn(
          variantConfig.gameArea.height,
          variantConfig.gameArea.rounded,
          "flex flex-col justify-end items-center relative bg-cover bg-center bg-no-repeat",
          "bg-muted overflow-hidden",
        )}
        style={{
          backgroundImage: `url(${themeSettings.backgroundImage})`,
        }}
      >
        <div
          className={cn(
            "absolute inset-0",
            variantConfig.gameArea.rounded,
            "bg-game-window-overlay",
          )}
        />
        {children}
      </div>
    </CardContent>
  )
}

interface InfoButtonProps {
  winChance?: number
  rngFee: number | string
  targetPayout: string
  gasPrice: number | string
  tokenDecimals: number
  nativeCurrencySymbol: string
}

function InfoButton({
  winChance,
  rngFee,
  targetPayout,
  gasPrice,
  tokenDecimals,
  nativeCurrencySymbol,
}: InfoButtonProps) {
  const { isInfoSheetOpen, setIsInfoSheetOpen, portalContainer, isMounted } = useGameFrameContext()

  return (
    <Sheet open={isInfoSheetOpen} onOpenChange={setIsInfoSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant="iconTransparent"
          size="iconRound"
          className={cn(
            "absolute top-2 left-2 z-30",
            "text-text-color border border-border-stroke bg-neutral-background",
            isInfoSheetOpen && "text-primary border-primary",
          )}
        >
          <Info className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      {isMounted && portalContainer && (
        <InfoSheetPanel
          portalContainer={portalContainer}
          winChance={winChance}
          rngFee={rngFee}
          targetPayout={targetPayout}
          gasPrice={gasPrice}
          token={{
            symbol: "ETH",
            decimals: tokenDecimals,
            address: zeroAddress,
          }}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
      )}
    </Sheet>
  )
}

interface HistoryButtonProps {
  historyData: HistoryEntry[]
  onHistoryOpen: () => void
}

function HistoryButton({ historyData, onHistoryOpen }: HistoryButtonProps) {
  const { isHistorySheetOpen, setIsHistorySheetOpen, portalContainer, isMounted } =
    useGameFrameContext()

  const handleHistoryOpen = (open: boolean) => {
    if (open) {
      onHistoryOpen()
    }
    setIsHistorySheetOpen(open)
  }

  return (
    <Sheet open={isHistorySheetOpen} onOpenChange={handleHistoryOpen}>
      <SheetTrigger asChild>
        <Button
          variant="iconTransparent"
          size="iconRound"
          className={cn(
            "absolute top-2 right-2 z-30",
            "text-text-color border border-border-stroke bg-neutral-background",
            isHistorySheetOpen && "text-primary border-primary",
          )}
        >
          <History className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      {isMounted && portalContainer && (
        <HistorySheetPanel portalContainer={portalContainer} historyData={historyData} />
      )}
    </Sheet>
  )
}

interface GameControlsProps {
  children: React.ReactNode
}

function GameControls({ children }: GameControlsProps) {
  return <>{children}</>
}

interface ResultWindowProps {
  gameResult: GameResult | null
  currency?: string
}

function ResultWindow({ gameResult, currency = "ETH" }: ResultWindowProps) {
  return <GameResultWindow result={gameResult} currency={currency} />
}

interface BettingSectionProps {
  game: CASINO_GAME_TYPE
  balance: bigint
  isConnected: boolean
  isWalletConnecting: boolean
  token: TokenWithImage
  betStatus: BetStatus | null
  betAmount: bigint | undefined
  betCount: number
  grossMultiplier: number // BP
  vrfFees: bigint
  onBetAmountChange: (amount: bigint | undefined) => void
  onPlayBtnClick: () => void
  areChainsSynced: boolean
  isGamePaused: boolean
  needsTokenApproval?: boolean
  isApprovePending?: boolean
  isApproveConfirming?: boolean
  hasValidSelection?: boolean
  isRefetchingAllowance?: boolean
  approveError?: any
}

function BettingSection(props: BettingSectionProps) {
  const { portalContainer, isMounted } = useGameFrameContext()
  return <BettingPanel {...props} portalContainer={portalContainer} isMounted={isMounted} />
}

export const GameFrame = Object.assign(GameFrameRoot, {
  Header,
  GameArea,
  InfoButton,
  HistoryButton,
  GameControls,
  ResultWindow,
  BettingSection,
})
