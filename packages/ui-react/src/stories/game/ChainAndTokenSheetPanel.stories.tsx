import { type CasinoChainId, chainById, chainNativeCurrencyToToken } from "@betswirl/sdk-core"
import type { Meta, StoryObj } from "@storybook/react"
import { ChevronDown, Settings } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { Button } from "../../components/ui/button"
import { ChainIcon } from "../../components/ui/ChainIcon"
import { ScrollArea } from "../../components/ui/scroll-area"
import {
  Sheet,
  SheetBottomPanelContent,
  SheetOverlay,
  SheetPortal,
  SheetTrigger,
} from "../../components/ui/sheet"
import { TokenIcon } from "../../components/ui/TokenIcon"
import { useChain } from "../../context/chainContext"
import { useTokenContext } from "../../context/tokenContext"
import { useTokens } from "../../hooks/useTokens"
import { cn, getTokenImage } from "../../lib/utils"
import { STORYBOOK_TOKENS, StorybookProviders } from "../../storybook/StorybookProviders"
import type { Theme, TokenWithImage } from "../../types/types"

// Additional mock tokens for variety
const USDC_TOKEN: TokenWithImage = {
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  symbol: "USDC",
  decimals: 6,
  image: getTokenImage("USDC"),
}

interface PanelStoryWrapperProps {
  children: (container: HTMLDivElement) => React.ReactNode
  theme?: Theme
}

const PanelStoryWrapper: React.FC<PanelStoryWrapperProps> = ({ children, theme = "system" }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const themeClass = theme === "system" ? undefined : theme

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-[328px] h-[512px] border rounded-[20px] p-3 relative overflow-hidden",
        "bg-card text-card-foreground",
        themeClass,
      )}
    >
      {isMounted && containerRef.current ? (
        children(containerRef.current)
      ) : (
        <p>Preparing story...</p>
      )}
    </div>
  )
}

// Custom wrapper component that allows controlling the initial view
const ChainAndTokenSheetWithWrapper = ({
  initialView = "main",
  theme = "light",
  selectedToken = STORYBOOK_TOKENS.ETH,
}: {
  initialView?: "main" | "chain" | "token"
  theme?: Theme
  selectedToken?: TokenWithImage
}) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <StorybookProviders token={selectedToken}>
      <PanelStoryWrapper theme={theme}>
        {(portalContainer) => (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="iconTransparent"
                size="iconRound"
                className="absolute bottom-2 right-2 text-primary border-primary data-[state=open]:text-primary data-[state=open]:border-primary"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <ChainAndTokenSheetPanelControlled
              portalContainer={portalContainer}
              initialView={initialView}
            />
          </Sheet>
        )}
      </PanelStoryWrapper>
    </StorybookProviders>
  )
}

// Controlled version of ChainAndTokenSheetPanel that accepts initialView
const ChainAndTokenSheetPanelControlled = ({
  portalContainer,
  initialView,
}: {
  portalContainer: HTMLElement
  initialView: "main" | "chain" | "token"
}) => {
  const { appChain, appChainId, switchAppChain } = useChain()
  const { selectedToken, setSelectedToken } = useTokenContext()
  const [activeView, setActiveView] = useState<"main" | "chain" | "token">(initialView)
  const { tokens, loading: tokensLoading } = useTokens({
    onlyActive: true,
  })

  const effectiveToken: TokenWithImage = selectedToken || {
    ...chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency),
    image: "",
  }

  const handleTokenSelect = (token: TokenWithImage) => {
    setSelectedToken(token)
    setActiveView("main")
  }

  const handleChainSelect = (chainId: CasinoChainId) => {
    switchAppChain(chainId)
    setActiveView("main")
  }

  return (
    <SheetPortal container={portalContainer}>
      <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
      <SheetBottomPanelContent
        className={cn(
          "!h-auto !max-h-[70%]",
          "p-5 sm:p-6",
          "data-[state=open]:animate-none data-[state=open]:translate-y-0",
        )}
      >
        {activeView === "main" && (
          <MainViewContent
            appChain={appChain}
            appChainId={appChainId}
            effectiveToken={effectiveToken}
            onChainClick={() => setActiveView("chain")}
            onTokenClick={() => setActiveView("token")}
          />
        )}

        {activeView === "chain" && (
          <ChainSelectionViewContent
            currentChainId={appChainId}
            onChainSelect={handleChainSelect}
            onBack={() => setActiveView("main")}
          />
        )}

        {activeView === "token" && (
          <TokenSelectionViewContent
            tokens={tokens}
            tokensLoading={tokensLoading}
            selectedToken={effectiveToken}
            onTokenSelect={handleTokenSelect}
            onBack={() => setActiveView("main")}
          />
        )}
      </SheetBottomPanelContent>
    </SheetPortal>
  )
}

const meta = {
  title: "Game/Components/ChainAndTokenSheetPanel",
  component: ChainAndTokenSheetWithWrapper,
  parameters: {
    layout: "centered",
    chromatic: { disable: true },
  },
  tags: ["autodocs"],
  argTypes: {
    initialView: {
      control: "radio",
      options: ["main", "chain", "token"],
    },
    theme: {
      control: "radio",
      options: ["light", "dark", "system"],
    },
    selectedToken: {
      control: "select",
      options: ["ETH", "DEGEN", "USDC"],
      mapping: {
        ETH: STORYBOOK_TOKENS.ETH,
        DEGEN: STORYBOOK_TOKENS.DEGEN,
        USDC: USDC_TOKEN,
      },
    },
  },
  args: {
    initialView: "main",
    theme: "light",
    selectedToken: STORYBOOK_TOKENS.ETH,
  },
} satisfies Meta<typeof ChainAndTokenSheetWithWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const MainView: Story = {
  args: {
    initialView: "main",
    theme: "light",
    selectedToken: STORYBOOK_TOKENS.ETH,
  },
  name: "Main View Light",
}

export const ChainSelectionView: Story = {
  args: {
    initialView: "chain",
    theme: "light",
    selectedToken: STORYBOOK_TOKENS.ETH,
  },
  name: "Chain Selection Light",
}

export const TokenSelectionView: Story = {
  args: {
    initialView: "token",
    theme: "light",
    selectedToken: STORYBOOK_TOKENS.DEGEN,
  },
  name: "Token Selection Light",
}

export const MainViewDark: Story = {
  args: {
    initialView: "main",
    theme: "dark",
    selectedToken: STORYBOOK_TOKENS.ETH,
  },
  name: "Main View Dark",
}

export const ChainSelectionViewDark: Story = {
  args: {
    initialView: "chain",
    theme: "dark",
    selectedToken: STORYBOOK_TOKENS.ETH,
  },
  name: "Chain Selection Dark",
}

export const TokenSelectionViewDark: Story = {
  args: {
    initialView: "token",
    theme: "dark",
    selectedToken: STORYBOOK_TOKENS.DEGEN,
  },
  name: "Token Selection Dark",
}

// Individual view components for the controlled panel
interface MainViewContentProps {
  appChain: any
  appChainId: CasinoChainId
  effectiveToken: TokenWithImage
  onChainClick: () => void
  onTokenClick: () => void
}

const MainViewContent: React.FC<MainViewContentProps> = ({
  appChain,
  appChainId,
  effectiveToken,
  onChainClick,
  onTokenClick,
}) => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-text-on-surface-variant">Current chain</p>
      <Button
        variant="ghost"
        onClick={onChainClick}
        className={cn(
          "flex items-center justify-between w-full p-3 rounded-[8px] h-auto",
          "bg-surface-selected border-0",
          "text-foreground font-medium",
          "hover:bg-token-hovered-bg transition-colors",
        )}
      >
        <div className="flex items-center gap-2">
          <ChainIcon chainId={appChainId} size={20} />
          <span>{appChain.viemChain.name}</span>
        </div>
        <ChevronDown className="h-4 w-4 -rotate-90" />
      </Button>
    </div>

    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-text-on-surface-variant">Balance used</p>
      <Button
        variant="ghost"
        onClick={onTokenClick}
        className={cn(
          "flex items-center justify-between w-full p-3 rounded-[8px] h-auto",
          "bg-surface-selected border-0",
          "text-foreground font-medium",
          "hover:bg-token-hovered-bg transition-colors",
        )}
      >
        <div className="flex items-center gap-2">
          <TokenIcon token={effectiveToken} size={20} />
          <span>{effectiveToken.symbol}</span>
        </div>
        <ChevronDown className="h-4 w-4 -rotate-90" />
      </Button>
    </div>
  </div>
)

interface ChainSelectionViewContentProps {
  currentChainId: CasinoChainId
  onChainSelect: (chainId: CasinoChainId) => void
  onBack: () => void
}

const ChainSelectionViewContent: React.FC<ChainSelectionViewContentProps> = ({
  currentChainId,
  onChainSelect,
  onBack,
}) => {
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
        <h2 className="text-lg font-semibold">Select Chain</h2>
      </div>

      <ScrollArea className="h-60">
        <div className="flex flex-col gap-2">
          {availableChains.map((chain) => (
            <Button
              key={chain.viemChain.id}
              variant="ghost"
              onClick={() => onChainSelect(chain.viemChain.id as CasinoChainId)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-[8px] w-full text-left h-auto justify-start",
                "hover:bg-surface-hover transition-colors",
                chain.viemChain.id === currentChainId && "bg-surface-selected",
              )}
            >
              <ChainIcon chainId={chain.viemChain.id as CasinoChainId} size={24} />
              <span className="font-medium text-foreground">{chain.viemChain.name}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

interface TokenSelectionViewContentProps {
  tokens: TokenWithImage[]
  tokensLoading: boolean
  selectedToken: TokenWithImage
  onTokenSelect: (token: TokenWithImage) => void
  onBack: () => void
}

const TokenSelectionViewContent: React.FC<TokenSelectionViewContentProps> = ({
  tokens,
  tokensLoading,
  selectedToken,
  onTokenSelect,
  onBack,
}) => (
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
      <h2 className="text-lg font-semibold">Select Token</h2>
    </div>

    <ScrollArea className="h-60">
      <div className="flex flex-col gap-2 pr-4">
        {tokensLoading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Loading tokens...
          </div>
        ) : tokens.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No tokens available
          </div>
        ) : (
          tokens.map((token) => (
            <Button
              variant="ghost"
              key={token.address}
              onClick={() => onTokenSelect(token)}
              className={cn(
                "flex items-center justify-between p-3 rounded-[8px] w-full text-left h-auto",
                "hover:bg-surface-hover transition-colors",
                token.address === selectedToken.address && "bg-surface-selected",
              )}
            >
              <div className="flex items-center gap-3">
                <TokenIcon token={token} size={24} />
                <span className="font-medium text-foreground">{token.symbol}</span>
              </div>
              <span className="text-sm text-muted-foreground">0.00</span>
            </Button>
          ))
        )}
      </div>
    </ScrollArea>
  </div>
)
