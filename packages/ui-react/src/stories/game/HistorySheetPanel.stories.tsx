import type { Meta, StoryObj } from "@storybook/react"
import { History as HistoryIcon } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { HistorySheetPanel } from "../../components/game/HistorySheetPanel"
import { Button } from "../../components/ui/button"
import { Sheet, SheetTrigger } from "../../components/ui/sheet"
import { cn } from "../../lib/utils"
import type { TokenWithImage } from "../../types/types"
import { HistoryEntry, HistoryEntryStatus, Theme } from "../../types/types"

// Mock token for stories
const ETH_TOKEN: TokenWithImage = {
  address: "0x0000000000000000000000000000000000000000",
  symbol: "ETH",
  decimals: 18,
  image: "https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png",
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

const mockHistoryDataDefault: HistoryEntry[] = [
  {
    id: "1",
    status: HistoryEntryStatus.WonBet,
    multiplier: 1.94,
    payoutAmount: "1.94675",
    payoutCurrencyToken: ETH_TOKEN,
    timestamp: "~24h ago",
  },
  {
    id: "2",
    status: HistoryEntryStatus.Busted,
    multiplier: 1.2,
    payoutAmount: 0.0,
    payoutCurrencyToken: ETH_TOKEN,
    timestamp: "~2h ago",
  },
]

const mockHistoryDataExtended: HistoryEntry[] = [
  ...mockHistoryDataDefault,
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `ext-${i + 3}`,
    status: Math.random() > 0.5 ? HistoryEntryStatus.WonBet : HistoryEntryStatus.Busted,
    multiplier: (Math.random() * 5 + 1).toFixed(2),
    payoutAmount: (Math.random() * 10).toFixed(4),
    payoutCurrencyToken: ETH_TOKEN,
    timestamp: `~${i * 5 + 10}m ago`,
  })),
]

const HistorySheetWithWrapper = ({
  historyData,
  theme = "light",
}: {
  historyData: HistoryEntry[]
  theme?: Theme
}) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <PanelStoryWrapper theme={theme}>
      {(portalContainer) => (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="iconTransparent"
              size="iconRound"
              className="absolute top-2 right-2 text-primary border-primary data-[state=open]:text-primary data-[state=open]:border-primary"
            >
              <HistoryIcon className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <HistorySheetPanel
            portalContainer={portalContainer}
            historyData={historyData}
            className="data-[state=open]:animate-none data-[state=open]:translate-y-0"
          />
        </Sheet>
      )}
    </PanelStoryWrapper>
  )
}

const meta = {
  title: "Game/Components/HistorySheetPanel",
  component: HistorySheetWithWrapper,
  parameters: {
    layout: "centered",
    chromatic: { disable: true },
  },
  tags: ["autodocs"],
  argTypes: {
    historyData: { control: "object" },
    theme: {
      control: "radio",
      options: ["light", "dark", "system"],
    },
  },
  args: {
    historyData: mockHistoryDataDefault,
    theme: "light",
  },
} satisfies Meta<typeof HistorySheetWithWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    historyData: mockHistoryDataDefault,
    theme: "light",
  },
  name: "Light Theme",
}

export const DarkThemeHistoryPanel: Story = {
  args: {
    historyData: mockHistoryDataDefault,
    theme: "dark",
  },
  name: "Dark Theme",
  parameters: {
    backgrounds: { default: "dark" },
  },
}

export const ExtendedHistory: Story = {
  args: {
    historyData: mockHistoryDataExtended,
    theme: "light",
  },
  name: "Extended List",
}

export const EmptyHistory: Story = {
  args: {
    historyData: [],
    theme: "light",
  },
  name: "Empty",
}
