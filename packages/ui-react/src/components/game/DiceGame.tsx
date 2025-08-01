import {
  CASINO_GAME_TYPE,
  Dice,
  DiceNumber,
  FORMAT_TYPE,
  formatRawAmount,
} from "@betswirl/sdk-core"
import { useAccount } from "wagmi"
import diceBackground from "../../assets/game/game-background.jpg"
import { useGameLogic } from "../../hooks/useGameLogic"
import { GameDefinition } from "../../types/types"
import { DiceGameControls } from "./DiceGameControls"
import { GameFrame } from "./GameFrame"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/types"
import { useGameControls } from "./shared/useGameControls"

const DEFAULT_DICE_NUMBER = 20 as DiceNumber

const diceGameDefinition: GameDefinition<{ game: CASINO_GAME_TYPE.DICE; choice: DiceNumber }> = {
  gameType: CASINO_GAME_TYPE.DICE,
  defaultSelection: {
    game: CASINO_GAME_TYPE.DICE,
    choice: DEFAULT_DICE_NUMBER,
  },
  getMultiplier: (choice) => Dice.getMultiplier(choice),
  encodeInput: (choice) => Dice.encodeInput(choice),
  getWinChancePercent: (choice) => Dice.getWinChancePercent(choice),
  formatDisplayResult: (rolledResult) => {
    return rolledResult.rolled.toString()
  },
}

export interface DiceGameProps extends BaseGameProps {}

export function DiceGame({
  theme = "system",
  customTheme,
  backgroundImage = diceBackground,
  ...props
}: DiceGameProps) {
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
    gameDefinition: diceGameDefinition,
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

  const selectedDiceNumber = (selection as { game: CASINO_GAME_TYPE.DICE; choice: DiceNumber })
    .choice

  const handleNumberChange = (value: number) => {
    if (isControlsDisabled) {
      return
    }
    setSelection({ game: CASINO_GAME_TYPE.DICE, choice: value as DiceNumber })
  }

  return (
    <GameFrame themeSettings={themeSettings} {...props}>
      <GameFrame.Header title="Dice" connectWalletButton={<GameConnectWallet />} />
      <GameFrame.GameArea>
        <GameFrame.InfoButton
          winChance={Dice.getWinChancePercent(selectedDiceNumber)}
          rngFee={formattedVrfFees}
          targetPayout={formatRawAmount(targetPayoutAmount, token.decimals, FORMAT_TYPE.PRECISE)}
          gasPrice={gasPrice}
          tokenDecimals={token.decimals}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
        <GameFrame.HistoryButton historyData={gameHistory} onHistoryOpen={refreshHistory} />
        <GameFrame.GameControls>
          <DiceGameControls
            selectedNumber={selectedDiceNumber}
            onNumberChange={handleNumberChange}
            multiplier={formattedNetMultiplier}
            isDisabled={isControlsDisabled}
          />
        </GameFrame.GameControls>
        <GameFrame.ResultWindow gameResult={gameResult} currency={token.symbol} />
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        game={CASINO_GAME_TYPE.DICE}
        betCount={1} // TODO: Dynamic bet count support (#64)
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
        needsTokenApproval={needsTokenApproval}
        isApprovePending={isApprovePending}
        isApproveConfirming={isApproveConfirming}
        isRefetchingAllowance={isRefetchingAllowance}
        approveError={approveError}
      />
    </GameFrame>
  )
}
