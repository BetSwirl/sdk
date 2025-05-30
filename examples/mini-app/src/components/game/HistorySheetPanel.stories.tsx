import { TokenImage } from "@coinbase/onchainkit/token"
import type { Meta, StoryObj } from "@storybook/react"
import { History as HistoryIcon } from "lucide-react"
import React, { useState, useEffect, useRef } from "react"
import { ETH_TOKEN } from "../../lib/tokens"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Sheet, SheetTrigger } from "../ui/sheet"
import { type HistoryEntry, HistorySheetPanel } from "./HistorySheetPanel"

interface PanelStoryWrapperProps {
  children: (container: HTMLDivElement) => React.ReactNode
  theme?: "light" | "dark" | "system"
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
      <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground text-center">
        This is a mock card container. <br /> Click the button to open the panel.
      </p>
    </div>
  )
}

const mockHistoryDataDefault: HistoryEntry[] = [
  {
    id: "1",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: "1.94675",
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={18} />,
    timestamp: "~24h ago",
  },
  {
    id: "2",
    status: "Busted",
    multiplier: 1.2,
    payoutAmount: 0.0,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={18} />,
    timestamp: "~2h ago",
  },
]

const mockHistoryDataExtended: HistoryEntry[] = [
  ...mockHistoryDataDefault,
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `ext-${i + 3}`,
    status: Math.random() > 0.5 ? ("Won bet" as const) : ("Busted" as const),
    multiplier: (Math.random() * 5 + 1).toFixed(2),
    payoutAmount: (Math.random() * 10).toFixed(4),
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={18} />,
    timestamp: `~${i * 5 + 10}m ago`,
  })),
]

const HistorySheetWithWrapper = ({
  historyData,
  theme = "light",
}: {
  historyData: HistoryEntry[]
  theme?: "light" | "dark" | "system"
}) => {
  const [isOpen, setIsOpen] = useState(false)

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
          <HistorySheetPanel portalContainer={portalContainer} historyData={historyData} />
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
