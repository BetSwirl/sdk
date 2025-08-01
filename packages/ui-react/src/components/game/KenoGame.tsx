import {
  CASINO_GAME_TYPE,
  chainById,
  chainNativeCurrencyToToken,
  FORMAT_TYPE,
  formatRawAmount,
  Keno,
  KenoBall,
  KenoConfiguration,
} from "@betswirl/sdk-core"
import { useEffect, useMemo, useState } from "react"
import { useAccount } from "wagmi"
import kenoBackground from "../../assets/game/game-background.jpg"
import { useChain } from "../../context/chainContext"
import { useTokenContext } from "../../context/tokenContext"
import { useGameLogic } from "../../hooks/useGameLogic"
import { useHouseEdge } from "../../hooks/useHouseEdge"
import { useKenoConfiguration } from "../../hooks/useKenoConfiguration"
import { useKenoMultipliers } from "../../hooks/useKenoMultipliers"
import { GameDefinition } from "../../types/types"
import { GameFrame } from "./GameFrame"
import { KenoGameControls } from "./KenoGameControls"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/types"
import { useGameControls } from "./shared/useGameControls"

const DEFAULT_KENO_SELECTION: KenoBall[] = []

export interface KenoGameProps extends BaseGameProps {}

function KenoGameContent({
  theme,
  customTheme,
  backgroundImage = kenoBackground,
  kenoConfig,
  ...props
}: KenoGameProps & { kenoConfig: KenoConfiguration }) {
  const [lastWinningNumbers, setLastWinningNumbers] = useState<KenoBall[]>([])

  const kenoGameDefinition = useMemo((): GameDefinition<{
    game: CASINO_GAME_TYPE.KENO
    choice: KenoBall[]
  }> => {
    return {
      gameType: CASINO_GAME_TYPE.KENO,
      defaultSelection: {
        game: CASINO_GAME_TYPE.KENO,
        choice: DEFAULT_KENO_SELECTION,
      },
      getMultiplier: (choice) => {
        const multipliers = kenoConfig.multiplierTable[choice.length] || []
        const maxMultiplierHits = multipliers.length > 0 ? multipliers.length - 1 : 0
        return Keno.getMultiplier(kenoConfig, choice.length, maxMultiplierHits)
      },
      encodeInput: (choice) => Keno.encodeInput(choice, kenoConfig),
      formatDisplayResult: (rolledResult) => {
        if (Array.isArray(rolledResult.rolled)) {
          return rolledResult.rolled.join(", ")
        }
        return rolledResult.rolled.toString()
      },
    }
  }, [kenoConfig])

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
    gameDefinition: kenoGameDefinition,
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

  const selectedNumbers = (selection as { game: CASINO_GAME_TYPE.KENO; choice: KenoBall[] }).choice

  const { houseEdge } = useHouseEdge({
    game: CASINO_GAME_TYPE.KENO,
    token,
  })
  const { multipliers } = useKenoMultipliers({
    kenoConfig,
    selectedNumbersCount: selectedNumbers.length,
    houseEdge,
  })

  useEffect(() => {
    if (gameResult?.rolled?.game === CASINO_GAME_TYPE.KENO) {
      setLastWinningNumbers(gameResult.rolled.rolled)
    }
  }, [gameResult])

  const handleNumbersChange = (numbers: KenoBall[]) => {
    if (isControlsDisabled) {
      return
    }
    setSelection({
      game: CASINO_GAME_TYPE.KENO,
      choice: numbers,
    })
  }

  return (
    <GameFrame themeSettings={themeSettings} variant="keno" {...props}>
      <GameFrame.Header title="Keno" connectWalletButton={<GameConnectWallet />} />
      <GameFrame.GameArea variant="keno">
        <GameFrame.InfoButton
          winChance={undefined}
          rngFee={formattedVrfFees}
          targetPayout={formatRawAmount(targetPayoutAmount, token.decimals, FORMAT_TYPE.PRECISE)}
          gasPrice={gasPrice}
          tokenDecimals={token.decimals}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
        <GameFrame.HistoryButton historyData={gameHistory} onHistoryOpen={refreshHistory} />
        <GameFrame.GameControls>
          <KenoGameControls
            selectedNumbers={selectedNumbers}
            onNumbersChange={handleNumbersChange}
            kenoConfig={kenoConfig}
            multipliers={multipliers}
            isDisabled={isControlsDisabled}
            lastGameWinningNumbers={lastWinningNumbers}
          />
        </GameFrame.GameControls>
        <GameFrame.ResultWindow gameResult={gameResult} currency={token.symbol} />
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        game={CASINO_GAME_TYPE.KENO}
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

export function KenoGame({
  theme = "system",
  customTheme,
  backgroundImage = kenoBackground,
  ...props
}: KenoGameProps) {
  const { selectedToken } = useTokenContext()
  const { appChainId } = useChain()
  const token = useMemo(() => {
    return (
      selectedToken || {
        ...chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency),
        image: "",
      }
    )
  }, [selectedToken, appChainId])

  const { config: kenoConfig, loading: kenoConfigLoading } = useKenoConfiguration({ token })

  if (kenoConfigLoading || !kenoConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-text-on-surface-variant border-t-transparent" />
      </div>
    )
  }

  return (
    <KenoGameContent
      theme={theme}
      customTheme={customTheme}
      backgroundImage={backgroundImage}
      kenoConfig={kenoConfig}
      {...props}
    />
  )
}
