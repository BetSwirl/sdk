import {
  CASINO_GAME_TYPE,
  FORMAT_TYPE,
  formatRawAmount,
  Roulette,
  RouletteNumber,
} from "@betswirl/sdk-core"
import { useAccount } from "wagmi"
import rouletteBackground from "../../assets/game/game-background.jpg"
import { useGameLogic } from "../../hooks/useGameLogic"
import { GameDefinition } from "../../types/types"
import { GameFrame } from "./GameFrame"
import { RouletteGameControls } from "./RouletteGameControls"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/types"
import { useGameControls } from "./shared/useGameControls"

const DEFAULT_ROULETTE_SELECTION: RouletteNumber[] = []

const rouletteGameDefinition: GameDefinition<{
  game: CASINO_GAME_TYPE.ROULETTE
  choice: RouletteNumber[]
}> = {
  gameType: CASINO_GAME_TYPE.ROULETTE,
  defaultSelection: {
    game: CASINO_GAME_TYPE.ROULETTE,
    choice: DEFAULT_ROULETTE_SELECTION,
  },
  getMultiplier: (choice) => Roulette.getMultiplier(choice),
  encodeInput: (choice) => Roulette.encodeInput(choice),
  getWinChancePercent: (choice) => Roulette.getWinChancePercent(choice),
  formatDisplayResult: (rolledResult) => {
    return rolledResult.rolled.toString()
  },
}

export interface RouletteGameProps extends BaseGameProps {}

export function RouletteGame({
  theme = "system",
  customTheme,
  backgroundImage = rouletteBackground,
  ...props
}: RouletteGameProps) {
  const {
    isWalletConnected,
    balance,
    token,
    areChainsSynced,
    gameHistory,
    refreshHistory,
    betAmount,
    selection,
    setSelection,
    betStatus,
    gameResult,
    vrfFees,
    formattedVrfFees,
    gasPrice,
    targetPayoutAmount,
    formattedNetMultiplier,
    grossMultiplier,
    isInGameResultState,
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
  } = useGameLogic({
    gameDefinition: rouletteGameDefinition,
    backgroundImage,
  })

  const themeSettings = { ...baseThemeSettings, theme, customTheme }
  const isControlsDisabled = useGameControls(
    isWalletConnected,
    betStatus,
    isInGameResultState,
    isGamePaused,
  )

  const { status: walletStatus } = useAccount()

  const selectedNumbers = (
    selection as { game: CASINO_GAME_TYPE.ROULETTE; choice: RouletteNumber[] }
  ).choice

  const handleNumbersChange = (numbers: RouletteNumber[]) => {
    if (isControlsDisabled) {
      return
    }
    setSelection({ game: CASINO_GAME_TYPE.ROULETTE, choice: numbers })
  }

  return (
    <GameFrame themeSettings={themeSettings} variant="roulette" {...props}>
      <GameFrame.Header title="Roulette" connectWalletButton={<GameConnectWallet />} />
      <GameFrame.GameArea variant="roulette">
        <GameFrame.InfoButton
          winChance={Roulette.getWinChancePercent(selectedNumbers)}
          rngFee={formattedVrfFees}
          targetPayout={formatRawAmount(targetPayoutAmount, token.decimals, FORMAT_TYPE.PRECISE)}
          gasPrice={gasPrice}
          tokenDecimals={token.decimals}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
        <GameFrame.HistoryButton historyData={gameHistory} onHistoryOpen={refreshHistory} />
        <GameFrame.GameControls>
          <RouletteGameControls
            selectedNumbers={selectedNumbers}
            onNumbersChange={handleNumbersChange}
            multiplier={formattedNetMultiplier}
            isDisabled={isControlsDisabled}
            token={token}
          />
        </GameFrame.GameControls>
        <GameFrame.ResultWindow gameResult={gameResult} currency={token.symbol} />
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        game={CASINO_GAME_TYPE.ROULETTE}
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
        isGamePaused={isGamePaused}
        hasValidSelection={selectedNumbers.length > 0}
        needsTokenApproval={needsTokenApproval}
        isApprovePending={isApprovePending}
        isApproveConfirming={isApproveConfirming}
        isRefetchingAllowance={isRefetchingAllowance}
        approveError={approveError}
      />
    </GameFrame>
  )
}
