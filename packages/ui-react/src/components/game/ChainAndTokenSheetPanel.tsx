import { type CasinoChainId, chainById, chainNativeCurrencyToToken } from "@betswirl/sdk-core"
import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { useBalances } from "../../context/BalanceContext"
import { useChain } from "../../context/chainContext"
import { useTokenContext } from "../../context/tokenContext"
import { cn } from "../../lib/utils"
import { type ChainTokenPanelView, type TokenWithImage } from "../../types/types"
import { Button } from "../ui/button"
import { ChainIcon } from "../ui/ChainIcon"
import { ScrollArea } from "../ui/scroll-area"
import { SheetBottomPanelContent, SheetOverlay, SheetPortal } from "../ui/sheet"
import { TokenIcon } from "../ui/TokenIcon"

interface ChainAndTokenSheetPanelProps {
  portalContainer: HTMLElement
  initialView?: ChainTokenPanelView
}

export function ChainAndTokenSheetPanel({
  portalContainer,
  initialView = "main",
}: ChainAndTokenSheetPanelProps) {
  const { appChain, appChainId, switchAppChain } = useChain()
  const {
    selectedToken,
    setSelectedToken,
    activeTokens: tokens,
    loading: tokensLoading,
  } = useTokenContext()
  const [currentView, setCurrentView] = useState<ChainTokenPanelView>(initialView)

  useEffect(() => {
    setCurrentView(initialView)
  }, [initialView])

  // Get native token from the tokens list to ensure we have the image
  const nativeToken = tokens.find(
    (token) =>
      token.address === chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency).address,
  )

  const effectiveToken: TokenWithImage = selectedToken ||
    nativeToken || {
      ...chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency),
      image: "",
    }

  const handleTokenSelect = (token: TokenWithImage) => {
    setSelectedToken(token)
    setCurrentView("main")
  }

  const handleChainSelect = (chainId: CasinoChainId) => {
    switchAppChain(chainId)
    setCurrentView("token")
  }

  return (
    <SheetPortal container={portalContainer}>
      <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
      <SheetBottomPanelContent className={cn("!h-auto !max-h-[70%]", "p-4")}>
        {currentView === "main" && (
          <div className="flex flex-col gap-6">
            {/* Current chain section */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-text-on-surface-variant">Current chain</p>
              <Button
                variant="ghost"
                onClick={() => setCurrentView("chain")}
                className={cn(
                  "flex items-center justify-between w-full p-3 rounded-[8px] h-auto",
                  "bg-surface-selected border-0",
                  "text-foreground font-medium",
                  "hover:bg-token-hovered-bg transition-colors",
                )}
              >
                <div className="flex items-center gap-2">
                  <ChainIcon chainId={appChainId} size={18} />
                  <span>{appChain.viemChain.name}</span>
                </div>
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Button>
            </div>

            {/* Balance used section */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-text-on-surface-variant">Balance used</p>
              <Button
                variant="ghost"
                onClick={() => setCurrentView("token")}
                className={cn(
                  "flex items-center justify-between w-full p-3 rounded-[8px] h-auto",
                  "bg-surface-selected border-0",
                  "text-foreground font-medium",
                  "hover:bg-token-hovered-bg transition-colors",
                )}
              >
                <div className="flex items-center gap-2">
                  <TokenIcon token={effectiveToken} size={18} />
                  <span>{effectiveToken.symbol}</span>
                </div>
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Button>
            </div>
          </div>
        )}

        {currentView === "chain" && (
          <ChainSelectionView
            currentChainId={appChainId}
            onChainSelect={handleChainSelect}
            onBack={() => setCurrentView("main")}
          />
        )}

        {currentView === "token" && (
          <TokenSelectionView
            key={`token-view-${appChainId}`}
            tokens={tokens}
            tokensLoading={tokensLoading}
            selectedToken={effectiveToken}
            onTokenSelect={handleTokenSelect}
            onBack={() => setCurrentView("main")}
          />
        )}
      </SheetBottomPanelContent>
    </SheetPortal>
  )
}

interface ChainSelectionViewProps {
  currentChainId: CasinoChainId
  onChainSelect: (chainId: CasinoChainId) => void
  onBack: () => void
}

function ChainSelectionView({ currentChainId, onChainSelect, onBack }: ChainSelectionViewProps) {
  const { availableChains } = useChain()

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-[8px] hover:bg-surface-hover transition-colors p-0"
        >
          <ChevronDown className="h-4 w-4 !rotate-90" />
        </Button>
        <h2 className="text-base font-semibold">Select Chain</h2>
      </div>

      <ScrollArea className="h-60 [&>[data-slot=scroll-area-scrollbar]]:w-[6px] [&>[data-slot=scroll-area-scrollbar]]:border-l-0 [&>[data-slot=scroll-area-scrollbar]]:z-10 [&>[data-slot=scroll-area-scrollbar]]:-translate-x-[1px] [&_[data-slot=scroll-area-thumb]]:bg-scrollbar-thumb">
        <div className="flex flex-col gap-1 p-1">
          {availableChains.map((chain) => (
            <Button
              key={chain.viemChain.id}
              variant="ghost"
              onClick={() => onChainSelect(chain.viemChain.id as CasinoChainId)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-[8px] w-full text-left h-auto justify-start",
                "hover:bg-surface-hover transition-colors",
                chain.viemChain.id === currentChainId && "bg-surface-selected",
              )}
            >
              <ChainIcon chainId={chain.viemChain.id as CasinoChainId} size={18} />
              <span className="font-medium text-foreground">{chain.viemChain.name}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

interface TokenSelectionViewProps {
  tokens: TokenWithImage[]
  tokensLoading: boolean
  selectedToken: TokenWithImage
  onTokenSelect: (token: TokenWithImage) => void
  onBack: () => void
}

function TokenSelectionView({
  tokens,
  tokensLoading,
  selectedToken,
  onTokenSelect,
  onBack,
}: TokenSelectionViewProps) {
  const { getBalance, getFormattedBalance } = useBalances()

  // No need for useMemo here - balances are already memoized in BalanceContext
  const tokensWithBalances = tokens.map((token) => ({
    ...token,
    balance: getBalance(token.address) || 0n,
    formattedBalance: getFormattedBalance(token.address, token.decimals),
  }))

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-[8px] hover:bg-surface-hover transition-colors p-0"
        >
          <ChevronDown className="h-4 w-4 !rotate-90" />
        </Button>
        <h2 className="text-base font-semibold">Select Token</h2>
      </div>

      <ScrollArea className="h-60 [&>[data-slot=scroll-area-scrollbar]]:w-[6px] [&>[data-slot=scroll-area-scrollbar]]:border-l-0 [&>[data-slot=scroll-area-scrollbar]]:z-10 [&>[data-slot=scroll-area-scrollbar]]:-translate-x-[1px] [&_[data-slot=scroll-area-thumb]]:bg-scrollbar-thumb ">
        {/* biome-ignore lint/a11y/useSemanticElements: Native <select> cannot display token icons, balances, and loading states. Custom listbox provides rich UI while maintaining accessibility through ARIA roles. */}
        <div className="flex flex-col gap-1 p-1" role="listbox" aria-label="Available tokens">
          {tokensLoading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Loading tokens...
            </div>
          ) : tokens.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No tokens available
            </div>
          ) : (
            tokensWithBalances.map((token) => (
              /* biome-ignore lint/a11y/useSemanticElements: Button with role="option" provides interactive token selection with icon, balance display, and custom styling that <option> cannot support */
              <Button
                variant="ghost"
                key={token.address}
                onClick={() => onTokenSelect(token)}
                role="option"
                aria-selected={token.address === selectedToken.address}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-[8px] w-full text-left h-auto",
                  "hover:bg-surface-hover transition-colors",
                  token.address === selectedToken.address && "bg-surface-selected",
                )}
              >
                <div className="flex items-center gap-3">
                  <TokenIcon token={token} size={18} />
                  <span className="font-medium text-foreground">{token.symbol}</span>
                </div>
                <TokenBalance formattedBalance={token.formattedBalance} />
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface TokenBalanceProps {
  formattedBalance: string
}

function TokenBalance({ formattedBalance }: TokenBalanceProps) {
  return <span className="text-sm text-muted-foreground">{formattedBalance}</span>
}
