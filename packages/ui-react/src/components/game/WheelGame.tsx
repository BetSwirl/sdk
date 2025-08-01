import {
  CASINO_GAME_TYPE,
  FORMAT_TYPE,
  formatRawAmount,
  WeightedGame,
  type WeightedGameConfiguration,
} from "@betswirl/sdk-core"
import { useEffect, useMemo, useRef, useState } from "react"
import { useAccount } from "wagmi"
import wheelBackground from "../../assets/game/game-background.jpg"
import { useChain } from "../../context/chainContext"
import { useTokenContext } from "../../context/tokenContext"
import { useGameLogic } from "../../hooks/useGameLogic"
import { useHouseEdge } from "../../hooks/useHouseEdge"
import { useWheelMultipliers } from "../../hooks/useWheelMultipliers"
import { GameDefinition, TokenWithImage } from "../../types/types"
import { GameFrame } from "./GameFrame"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/types"
import { WheelController, WheelGameControls } from "./WheelGameControls"

export interface WheelGameProps extends BaseGameProps {}

export function WheelGame({
  theme = "system",
  customTheme,
  backgroundImage = wheelBackground,
  ...props
}: WheelGameProps) {
  const gameFrameRef = useRef<HTMLDivElement>(null)
  const wheelControllerRef = useRef<WheelController>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const { selectedToken: token } = useTokenContext()
  console.log({ token })
  const { appChainId } = useChain()
  const { houseEdge } = useHouseEdge({
    game: CASINO_GAME_TYPE.WHEEL,
    token,
  })

  const wheelGameDefinition = useMemo(() => {
    const choiceInputs = WeightedGame.getChoiceInputs(appChainId, CASINO_GAME_TYPE.WHEEL, houseEdge)
    const wheelChoiceInput = choiceInputs?.[0]

    if (!wheelChoiceInput?.netMultiplier) return undefined

    const wheelConfig = {
      ...wheelChoiceInput.config,
      multipliers: (wheelChoiceInput.netMultiplier as number[]).map((m) => BigInt(Math.round(m))),
    }

    return {
      gameType: CASINO_GAME_TYPE.WHEEL,
      defaultSelection: { game: CASINO_GAME_TYPE.WHEEL, choice: wheelConfig },
      getMultiplier: (config: WeightedGameConfiguration) => {
        if (!config?.multipliers) return 0
        const maxMultiplier = Math.max(...config.multipliers.map((m) => Number(m)))
        return maxMultiplier
      },
      encodeInput: (config: WeightedGameConfiguration) => {
        if (!config) return 0
        return WeightedGame.encodeInput(config.configId)
      },
      getWinChancePercent: (config: WeightedGameConfiguration) => {
        if (!config?.multipliers) return []
        return config.multipliers.map((_, index) => WeightedGame.getWinChancePercent(config, index))
      },
      formatDisplayResult: (rolledResult) => {
        if (
          rolledResult.game !== CASINO_GAME_TYPE.WHEEL ||
          !wheelChoiceInput.formattedNetMultiplier
        ) {
          return ""
        }
        const winningIndex = rolledResult.rolled as number
        return `${wheelChoiceInput.formattedNetMultiplier[winningIndex].toFixed(3)}x`
      },
    } as GameDefinition<{
      game: CASINO_GAME_TYPE.WHEEL
      choice: WeightedGameConfiguration
    }>
  }, [appChainId, houseEdge])

  const {
    isWalletConnected,
    balance,
    areChainsSynced,
    gameHistory,
    refreshHistory,
    betAmount,
    betStatus,
    gameResult,
    vrfFees,
    formattedVrfFees,
    gasPrice,
    targetPayoutAmount,
    grossMultiplier,
    isGamePaused,
    nativeCurrencySymbol,
    themeSettings: baseThemeSettings,
    handlePlayButtonClick,
    handleBetAmountChange,
    needsTokenApproval,
    isApprovePending,
    isApproveConfirming,
    isRefetchingAllowance,
    approveError,
    isConfigurationLoading,
  } = useGameLogic({
    gameDefinition: wheelGameDefinition,
    backgroundImage,
  })

  const themeSettings = { ...baseThemeSettings, theme, customTheme }

  const { status: walletStatus } = useAccount()

  useEffect(() => {
    if (betStatus === "rolling") {
      wheelControllerRef.current?.startEndlessSpin()
    }
  }, [betStatus])

  useEffect(() => {
    if (gameResult && gameResult.rolled.game === CASINO_GAME_TYPE.WHEEL) {
      const winningSectorIndex = gameResult.rolled.rolled as number
      wheelControllerRef.current?.spinWheelWithResult(winningSectorIndex)
    }
  }, [gameResult])

  const wheelConfig = wheelGameDefinition?.defaultSelection.choice

  const uniqueMultipliers = useWheelMultipliers(wheelConfig, houseEdge)

  const tooltipContent = useMemo(() => {
    if (!wheelConfig || !betAmount || houseEdge === undefined) return undefined

    const choiceInputs = WeightedGame.getChoiceInputs(appChainId, CASINO_GAME_TYPE.WHEEL, houseEdge)
    if (!choiceInputs?.[0]) return undefined

    const { netMultiplier, formattedNetMultiplier, winChancePercent } = choiceInputs[0]
    if (!netMultiplier || !formattedNetMultiplier) return undefined

    const content: Record<number, { chance?: string; profit?: number; token: TokenWithImage }> = {}

    netMultiplier.forEach((multiplier, index) => {
      const roundedMultiplier = Math.round(multiplier)
      const chance = winChancePercent[index]
      const profit = (Number(betAmount) * formattedNetMultiplier[index]) / 10 ** token.decimals

      if (content[roundedMultiplier]) {
        content[roundedMultiplier].profit = (content[roundedMultiplier].profit || 0) + profit
      } else {
        content[roundedMultiplier] = {
          chance: `${chance}%`,
          profit,
          token,
        }
      }
    })

    return content
  }, [wheelConfig, betAmount, token, houseEdge, appChainId])

  // Show loading state while configuration is being fetched
  const gameArea =
    isConfigurationLoading || !wheelGameDefinition || !wheelConfig ? (
      <GameFrame.GameArea variant="wheel">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-text-on-surface-variant border-t-transparent mx-auto mb-4" />
          </div>
        </div>
      </GameFrame.GameArea>
    ) : (
      <GameFrame.GameArea variant="wheel">
        <GameFrame.InfoButton
          rngFee={formattedVrfFees}
          targetPayout={formatRawAmount(targetPayoutAmount, token.decimals, FORMAT_TYPE.PRECISE)}
          gasPrice={gasPrice}
          tokenDecimals={token.decimals}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
        <GameFrame.HistoryButton historyData={gameHistory} onHistoryOpen={refreshHistory} />
        <GameFrame.GameControls>
          <WheelGameControls
            ref={wheelControllerRef}
            config={wheelConfig}
            theme={theme}
            parent={gameFrameRef}
            tooltipContent={tooltipContent}
            onSpinningChange={setIsSpinning}
            uniqueMultipliers={uniqueMultipliers}
          />
        </GameFrame.GameControls>
        <GameFrame.ResultWindow
          gameResult={isSpinning ? null : gameResult}
          currency={token.symbol}
        />
      </GameFrame.GameArea>
    )

  return (
    <GameFrame ref={gameFrameRef} themeSettings={themeSettings} {...props} variant="wheel">
      <GameFrame.Header title="Wheel" connectWalletButton={<GameConnectWallet />} />
      {gameArea}
      <GameFrame.BettingSection
        game={CASINO_GAME_TYPE.WHEEL}
        betCount={1}
        grossMultiplier={grossMultiplier}
        balance={balance}
        isConnected={isWalletConnected}
        isWalletConnecting={walletStatus === "connecting"}
        token={token}
        betStatus={betStatus}
        betAmount={betAmount}
        vrfFees={vrfFees}
        onBetAmountChange={handleBetAmountChange}
        onPlayBtnClick={handlePlayButtonClick}
        areChainsSynced={areChainsSynced}
        isGamePaused={isGamePaused || isSpinning}
        needsTokenApproval={needsTokenApproval}
        isApprovePending={isApprovePending}
        isApproveConfirming={isApproveConfirming}
        isRefetchingAllowance={isRefetchingAllowance}
        approveError={approveError}
      />
    </GameFrame>
  )
}
