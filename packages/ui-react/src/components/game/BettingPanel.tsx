import {
  BP,
  CASINO_GAME_TYPE,
  formatRawAmount,
  GAS_TOKEN_ADDRESS,
  SignedFreebet,
} from "@betswirl/sdk-core"
import { WalletModal } from "@coinbase/onchainkit/wallet"
import { Gift } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useChain } from "../../context/chainContext"
import { useFreebetsContext } from "../../context/FreebetsContext"
import { useBetRequirements } from "../../hooks/useBetRequirements"
import { cn, getTokenImage } from "../../lib/utils"
import { BetStatus, ChainTokenPanelView, TokenWithImage } from "../../types/types"
import { Button } from "../ui/button"
import { ChainIcon } from "../ui/ChainIcon"
import { Sheet } from "../ui/sheet"
import { TokenIcon } from "../ui/TokenIcon"
import { BetAmountInput } from "./BetAmountInput"
import { ChainAndTokenSheetPanel } from "./ChainAndTokenSheetPanel"
import { FreeBetInput } from "./FreeBetInput"
import { FreeBetSheetPanel } from "./FreeBetSheetPanel"
import { FreebetsHubSheetPanel } from "./FreebetsHubSheetPanel"

interface BettingPanelProps {
  game: CASINO_GAME_TYPE
  balance: bigint
  isConnected: boolean
  isWalletConnecting: boolean
  token: TokenWithImage
  betStatus: BetStatus | null
  betAmount: bigint | undefined
  betCount: number
  grossMultiplier: BP
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
  portalContainer: HTMLElement | null
  isMounted: boolean
  invalidSelectionMessage?: string
}

export function BettingPanel({
  game,
  balance,
  isConnected,
  isWalletConnecting,
  token,
  betStatus,
  betAmount,
  betCount,
  grossMultiplier,
  vrfFees,
  onBetAmountChange,
  onPlayBtnClick,
  areChainsSynced,
  isGamePaused,
  needsTokenApproval = false,
  isApprovePending = false,
  isApproveConfirming = false,
  hasValidSelection = true,
  isRefetchingAllowance = false,
  approveError,
  portalContainer,
  isMounted,
  invalidSelectionMessage,
}: BettingPanelProps) {
  const { appChainId, switchWalletChain } = useChain()
  const [isChainTokenSheetOpen, setIsChainTokenSheetOpen] = useState<boolean>(false)
  const [panelInitialView, setPanelInitialView] = useState<ChainTokenPanelView>("main")
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isFreeBetSheetOpen, setIsFreeBetSheetOpen] = useState(false)
  const [isFreebetsHubOpen, setIsFreebetsHubOpen] = useState(false)
  const [wasFreebetsHubOpenBeforeWallet, setWasFreebetsHubOpenBeforeWallet] = useState(false)
  const { freebets, selectedFreebet, selectFreebetById, isUsingFreebet, currentChainFreebets } =
    useFreebetsContext()
  const [isBetInputValid, setIsBetInputValid] = useState<boolean>(true)

  // Track previous values to detect actual changes
  const prevChainIdRef = useRef(appChainId)
  const prevTokenAddressRef = useRef(token.address)
  const prevIsConnectedRef = useRef(isConnected)

  // Reopen freebets hub if it was open before wallet connection
  useEffect(() => {
    if (!prevIsConnectedRef.current && isConnected && wasFreebetsHubOpenBeforeWallet) {
      setIsFreebetsHubOpen(true)
      setWasFreebetsHubOpenBeforeWallet(false)
    }
    prevIsConnectedRef.current = isConnected
  }, [isConnected, wasFreebetsHubOpenBeforeWallet])

  // Clear bet amount when chain or token actually changes
  useEffect(() => {
    const chainChanged = prevChainIdRef.current !== appChainId
    const tokenChanged = prevTokenAddressRef.current !== token.address

    if (chainChanged || tokenChanged) {
      onBetAmountChange(undefined)
    }

    prevChainIdRef.current = appChainId
    prevTokenAddressRef.current = token.address
  }, [appChainId, token.address, onBetAmountChange]) // eslint-disable-line react-hooks/exhaustive-deps

  const {
    isAllowed: isTokenAllowed,
    maxBetAmount,
    formattedMaxBetAmount,
    maxBetCount,
    isLoading: isBetRequirementsLoading,
  } = useBetRequirements({
    game,
    token,
    grossMultiplier,
  })

  const effectiveBetAmount = isUsingFreebet && selectedFreebet ? selectedFreebet.amount : betAmount

  const isBetAmountValid = betAmount && betAmount > 0n

  const effectiveBalance = token.address === GAS_TOKEN_ADDRESS ? balance - vrfFees : balance
  const isTotalbetAmountExceedsBalance =
    betAmount && BigInt(betCount) * betAmount > effectiveBalance
  const effectiveBetCount = isUsingFreebet ? 1 : betCount
  const isBetCountValid = effectiveBetCount > 0 && effectiveBetCount <= maxBetCount
  const isBetAmountExceedsMaxBetAmount = effectiveBetAmount && effectiveBetAmount > maxBetAmount

  const formattedBalance = formatRawAmount(balance, token.decimals)

  const isBetSuccess = betStatus === "success"
  const isWaiting = betStatus === "loading" || betStatus === "pending" || betStatus === "rolling"
  const isError =
    betStatus === "error" ||
    betStatus === "waiting-error" ||
    betStatus === "internal-error" ||
    !!approveError

  const canInitiateBet =
    isConnected &&
    areChainsSynced &&
    (isUsingFreebet || isBetAmountValid) &&
    (isUsingFreebet || !isTotalbetAmountExceedsBalance) &&
    !isWaiting &&
    !isGamePaused &&
    !isBetRequirementsLoading &&
    isTokenAllowed &&
    isBetCountValid &&
    !isBetAmountExceedsMaxBetAmount &&
    hasValidSelection

  const isApprovingToken = isApprovePending || isApproveConfirming
  const isInputDisabled =
    !isMounted || !isConnected || isWaiting || isBetSuccess || isApprovingToken
  const isChainSwitchingDisabled = !isMounted || isWaiting || isBetSuccess || isApprovingToken

  const isPlayButtonDisabled: boolean =
    !isBetSuccess &&
    (!isBetInputValid ||
      isWalletConnecting ||
      isWaiting ||
      (!canInitiateBet && !needsTokenApproval && areChainsSynced) ||
      isApprovingToken)

  let playButtonText: string
  if (!isBetInputValid) {
    playButtonText = "Invalid Amount"
  } else if (isApprovePending) {
    playButtonText = "Sign Approval..."
  } else if (isApproveConfirming || isRefetchingAllowance) {
    playButtonText = "Confirming Approval..."
  } else if (needsTokenApproval) {
    playButtonText = "Approve Token"
  } else if (isError) {
    playButtonText = "Error, try again"
  } else if (isBetSuccess) {
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
  } else if (isGamePaused) {
    playButtonText = "Game paused"
  } else if (!hasValidSelection) {
    playButtonText = invalidSelectionMessage || "Make your selection"
  } else if (isBetRequirementsLoading) {
    playButtonText = "Loading..."
  } else if (!isTokenAllowed) {
    playButtonText = "Token not allowed"
  } else if (isTotalbetAmountExceedsBalance) {
    playButtonText = "Insufficient balance"
  } else if (!isBetCountValid) {
    playButtonText = `Max bet count exceeded (${maxBetCount})`
  } else if (isBetAmountExceedsMaxBetAmount) {
    playButtonText = `Max bet amount exceeded (${formattedMaxBetAmount})`
  } else {
    playButtonText = "Place Bet"
  }

  const handlePlayBtnClick = () => {
    if (!isConnected) {
      setIsWalletModalOpen(true)
      return
    }
    // Handle chain switching when chains are not synced
    if (!areChainsSynced && isConnected) {
      switchWalletChain(appChainId)
      return
    }
    onPlayBtnClick()
  }

  const openSheetPanel = (view: ChainTokenPanelView) => {
    setPanelInitialView(view)
    setIsChainTokenSheetOpen(true)
  }

  const handleSheetClose = () => {
    setIsChainTokenSheetOpen(false)
    setPanelInitialView("main")
  }

  const handleBalanceClick = () => openSheetPanel("main")
  const handleTokenClick = () => openSheetPanel("token")

  const handleHalfBet = () => {
    const currentAmount = betAmount ?? 0n
    if (currentAmount > 0n) {
      const halfAmount = currentAmount / 2n
      onBetAmountChange(halfAmount)
    }
  }

  const handleDoubleBet = () => {
    const currentAmount = betAmount ?? 0n
    const doubledAmount = currentAmount * 2n
    if (isConnected) {
      const maxAmount = balance
      const finalAmount = doubledAmount > maxAmount ? maxAmount : doubledAmount
      onBetAmountChange(finalAmount)
    } else {
      onBetAmountChange(doubledAmount)
    }
  }

  const handleMaxBet = () => {
    if (isConnected) {
      const maxBalance = token.address === GAS_TOKEN_ADDRESS ? balance - vrfFees : balance

      const maxBetAmount = maxBalance > 0n ? maxBalance : 0n
      onBetAmountChange(maxBetAmount)
    }
  }

  const handleFreeBetSelect = (freeBet: SignedFreebet) => {
    selectFreebetById(freeBet.id)
    setIsFreeBetSheetOpen(false)
    setIsFreebetsHubOpen(false)
  }

  const handleRemoveFreeBet = () => {
    selectFreebetById(null)
  }

  const handleFreeBetClick = () => {
    setIsFreeBetSheetOpen(true)
  }

  return (
    <div className="bg-control-panel-background p-4 rounded-[16px] flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium flex items-center ">
            <span className="text-text-on-surface-variant">Balance:&nbsp;</span>
            <Button
              variant="ghost"
              onClick={handleBalanceClick}
              disabled={isChainSwitchingDisabled || isUsingFreebet}
              className={cn(
                "text-sm font-medium flex items-center w-fit h-auto p-0",
                "bg-secondary rounded-[8px] px-2 py-1",
                "hover:opacity-80 hover:bg-secondary transition-opacity",
              )}
            >
              <span className="font-semibold">{formattedBalance}</span>
              <div className="flex items-center ml-1">
                {isMounted && (
                  <ChainIcon
                    chainId={appChainId}
                    size={18}
                    className="-mr-[4px] mask-overlap-cutout"
                  />
                )}
                <TokenIcon token={token} size={18} />
              </div>
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => setIsFreebetsHubOpen(true)}
            disabled={isChainSwitchingDisabled}
            className="w-[60px] h-[27px] bg-game-win/20 border border-free-bet-border rounded-[8px] flex items-center gap-1 hover:bg-game-win/30 transition-colors"
          >
            <Gift size={20} className="text-game-win" />
            {freebets.length > 0 && (
              <span className="text-sm font-semibold text-free-bet-border">
                ({freebets.length})
              </span>
            )}
          </Button>
        </div>

        {isUsingFreebet && selectedFreebet ? (
          <FreeBetInput
            amount={selectedFreebet.formattedAmount}
            token={{
              ...selectedFreebet.token,
              image: getTokenImage(selectedFreebet.token.symbol),
            }}
            isDisabled={isInputDisabled}
            onClick={handleFreeBetClick}
            onRemoveFreebet={handleRemoveFreeBet}
          />
        ) : (
          <BetAmountInput
            betAmount={betAmount}
            onBetAmountChange={onBetAmountChange}
            onValidityChange={setIsBetInputValid}
            token={token}
            isDisabled={isInputDisabled}
            onTokenClick={handleTokenClick}
            formattedBalance={formattedBalance}
          />
        )}

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            onClick={handleHalfBet}
            className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
            disabled={isInputDisabled || !isBetAmountValid}
          >
            1/2
          </Button>
          <Button
            variant="secondary"
            onClick={handleDoubleBet}
            className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
            disabled={isInputDisabled || !isBetAmountValid}
          >
            2x
          </Button>
          <Button
            variant="secondary"
            className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
            onClick={handleMaxBet}
            disabled={isInputDisabled || !isBetAmountValid}
          >
            Max
          </Button>
        </div>
      </div>
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => {
          setIsWalletModalOpen(false)
        }}
      />
      <Button
        size="lg"
        className={cn("w-full", "border-0", "font-bold", "rounded-[16px]", "text-play-btn-font")}
        variant={isError ? "destructive" : "default"}
        onClick={handlePlayBtnClick}
        disabled={isPlayButtonDisabled}
      >
        {playButtonText}
      </Button>
      <Sheet
        open={isChainTokenSheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleSheetClose()
          }
        }}
      >
        {isMounted && portalContainer && (
          <ChainAndTokenSheetPanel
            portalContainer={portalContainer}
            initialView={panelInitialView}
          />
        )}
      </Sheet>
      <Sheet
        open={isFreeBetSheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsFreeBetSheetOpen(false)
          }
        }}
      >
        {isMounted && portalContainer && (
          <FreeBetSheetPanel
            portalContainer={portalContainer}
            freeBets={currentChainFreebets}
            selectedFreeBet={selectedFreebet}
            onSelect={handleFreeBetSelect}
          />
        )}
      </Sheet>
      <Sheet open={isFreebetsHubOpen} onOpenChange={setIsFreebetsHubOpen}>
        {isMounted && portalContainer && (
          <FreebetsHubSheetPanel
            portalContainer={portalContainer}
            isConnected={isConnected}
            freebets={freebets}
            onSelectFreebet={handleFreeBetSelect}
            onConnectWallet={() => {
              setWasFreebetsHubOpenBeforeWallet(true)
              setIsFreebetsHubOpen(false)
              // Small delay to ensure sheet closes before opening wallet modal
              setTimeout(() => setIsWalletModalOpen(true), 100)
            }}
          />
        )}
      </Sheet>
    </div>
  )
}
