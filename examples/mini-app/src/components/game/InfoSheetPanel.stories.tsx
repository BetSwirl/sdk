import type { Meta, StoryObj } from "@storybook/react"
import { Info } from "lucide-react"
import React, { useState, useEffect, useRef } from "react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Sheet, SheetTrigger } from "../ui/sheet"
import { InfoSheetPanel } from "./InfoSheetPanel"
import { chainByKey, chainNativeCurrencyToToken } from "@betswirl/sdk-core"

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

const InfoSheetWithWrapper = ({
  winChance,
  rngFee,
  targetPayout,
  gasPrice,
  theme = "light",
}: {
  winChance: number
  rngFee: string | number
  targetPayout: string
  gasPrice: string
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
              className="absolute top-2 left-2 text-primary border-primary data-[state=open]:text-primary data-[state=open]:border-primary"
            >
              <Info className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <InfoSheetPanel
            portalContainer={portalContainer}
            winChance={winChance}
            rngFee={rngFee}
            targetPayout={targetPayout}
            gasPrice={gasPrice}
            token={chainNativeCurrencyToToken(chainByKey.base.nativeCurrency)}
          />
        </Sheet>
      )}
    </PanelStoryWrapper>
  )
}

const meta = {
  title: "Game/Components/InfoSheetPanel",
  component: InfoSheetWithWrapper,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    winChance: { control: "number" },
    rngFee: { control: "text" },
    targetPayout: { control: "text" },
    gasPrice: { control: "text" },
    theme: {
      control: "radio",
      options: ["light", "dark", "system"],
    },
  },
  args: {
    winChance: 50,
    rngFee: "0",
    targetPayout: "1.94",
    gasPrice: "34.2123 gwei",
    theme: "light",
  },
} satisfies Meta<typeof InfoSheetWithWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    winChance: 50,
    rngFee: "0",
    targetPayout: "1.94",
    gasPrice: "34.2123 gwei",
    theme: "light",
  },
  name: "Light Theme",
}

export const DarkThemeInfoPanel: Story = {
  args: {
    winChance: 75,
    rngFee: "0.01",
    targetPayout: "3.50",
    gasPrice: "40 gwei",
    theme: "dark",
  },
  name: "Dark Theme",
  parameters: {
    backgrounds: { default: "dark" },
  },
}

export const HighValues: Story = {
  args: {
    winChance: 90,
    rngFee: "100.12345",
    targetPayout: "1999.99",
    gasPrice: "1000.00005 gwei",
    theme: "light",
  },
  name: "High Values",
}
