import { SignedFreebet } from "@betswirl/sdk-core"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { Gift } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { FreebetsHubSheetPanel } from "../../components/game/FreebetsHubSheetPanel"
import { Button } from "../../components/ui/button"
import { Sheet, SheetTrigger } from "../../components/ui/sheet"
import { cn } from "../../lib/utils"
import { STORYBOOK_TOKENS, StorybookProviders } from "../../storybook/StorybookProviders"
import type { Theme, TokenWithImage } from "../../types/types"

// Mock tokens
const ETH_TOKEN: TokenWithImage = STORYBOOK_TOKENS.ETH
const DEGEN_TOKEN: TokenWithImage = STORYBOOK_TOKENS.DEGEN

// Mock free bets data
const mockFreeBets: SignedFreebet[] = [
  {
    id: 1,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: BigInt(10),
    formattedAmount: "10",
    token: ETH_TOKEN,
    chainId: 8453,
    campaign: {
      id: 1,
      label: "Welcome Bonus",
    },
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    signature: "0x",
  },
  {
    id: 2,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: BigInt(50),
    formattedAmount: "50",
    token: DEGEN_TOKEN,
    chainId: 8453,
    campaign: {
      id: 2,
      label: "Daily Bonus",
    },
    expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    signature: "0x",
  },
  {
    id: 3,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: BigInt(25),
    formattedAmount: "25",
    token: ETH_TOKEN,
    chainId: 8453,
    campaign: {
      id: 3,
      label: "Weekend Special",
    },
    expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    signature: "0x",
  },
  {
    id: 4,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: BigInt(100),
    formattedAmount: "100",
    token: DEGEN_TOKEN,
    chainId: 8453,
    campaign: {
      id: 4,
      label: "High Roller Bonus",
    },
    expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    signature: "0x",
  },
  {
    id: 5,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: BigInt(5),
    formattedAmount: "5",
    token: ETH_TOKEN,
    chainId: 8453,
    campaign: {
      id: 5,
      label: "Starter Bonus",
    },
    expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    signature: "0x",
  },
  {
    id: 6,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: BigInt(75),
    formattedAmount: "75",
    token: DEGEN_TOKEN,
    chainId: 8453,
    campaign: {
      id: 6,
      label: "Lucky Bonus",
    },
    expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    signature: "0x",
  },
  {
    id: 7,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: BigInt(20),
    formattedAmount: "20",
    token: ETH_TOKEN,
    chainId: 8453,
    campaign: {
      id: 7,
      label: "Loyalty Reward",
    },
    expirationDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
    signature: "0x",
  },
  {
    id: 8,
    playerAddress: "0x1234567890123456789012345678901234567890",
    affiliateAddress: "0x0000000000000000000000000000000000000000",
    freebetAddress: "0x0000000000000000000000000000000000000000",
    amount: BigInt(150),
    formattedAmount: "150",
    token: DEGEN_TOKEN,
    chainId: 8453,
    campaign: {
      id: 8,
      label: "VIP Bonus",
    },
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    signature: "0x",
  },
]

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

const FreebetsHubSheetWithWrapper = ({
  isConnected,
  freebets,
  theme = "light",
}: {
  isConnected: boolean
  freebets: SignedFreebet[]
  theme?: Theme
}) => {
  const [isOpen, setIsOpen] = useState(true)

  const handleConnectWallet = () => {
    console.log("Connect wallet clicked")
  }

  const handleSelectFreebet = (freebet: SignedFreebet) => {
    console.log("Select freebet: ", freebet)
  }

  return (
    <StorybookProviders>
      <PanelStoryWrapper theme={theme}>
        {(portalContainer) => (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="iconTransparent"
                size="iconRound"
                className="absolute top-2 right-2 text-primary border-primary data-[state=open]:text-primary data-[state=open]:border-primary"
              >
                <Gift className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <FreebetsHubSheetPanel
              portalContainer={portalContainer}
              isConnected={isConnected}
              freebets={freebets as unknown as SignedFreebet[]}
              onConnectWallet={handleConnectWallet}
              onSelectFreebet={handleSelectFreebet as any}
            />
          </Sheet>
        )}
      </PanelStoryWrapper>
    </StorybookProviders>
  )
}

const meta = {
  title: "Game/Components/FreebetsHubSheetPanel",
  component: FreebetsHubSheetWithWrapper,
  parameters: {
    layout: "centered",
    chromatic: { disable: true },
  },
  tags: ["autodocs"],
  argTypes: {
    isConnected: { control: "boolean" },
    freebets: { control: false },
    theme: {
      control: "radio",
      options: ["light", "dark", "system"],
    },
  },
  args: {
    isConnected: false,
    freebets: mockFreeBets,
    theme: "light",
  },
} satisfies Meta<typeof FreebetsHubSheetWithWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const Disconnected: Story = {
  args: {
    isConnected: false,
    freebets: mockFreeBets,
    theme: "light",
  },
  name: "Disconnected",
}

export const ConnectedWithFreebets: Story = {
  args: {
    isConnected: true,
    freebets: mockFreeBets,
    theme: "light",
  },
  name: "Connected With Freebets",
}

export const ConnectedEmpty: Story = {
  args: {
    isConnected: true,
    freebets: [],
    theme: "light",
  },
  name: "Connected Empty",
}

export const DisconnectedDark: Story = {
  args: {
    isConnected: false,
    freebets: mockFreeBets,
    theme: "dark",
  },
  name: "Disconnected Dark",
  parameters: {
    backgrounds: { default: "dark" },
  },
}

export const ConnectedDark: Story = {
  args: {
    isConnected: true,
    freebets: mockFreeBets,
    theme: "dark",
  },
  name: "Connected Dark",
  parameters: {
    backgrounds: { default: "dark" },
  },
}

export const ConnectedSingleFreebet: Story = {
  args: {
    isConnected: true,
    freebets: [mockFreeBets[0]],
    theme: "light",
  },
  name: "Connected Single Freebet",
}

export const ConnectedManyFreebets: Story = {
  args: {
    isConnected: true,
    freebets: [...mockFreeBets, ...mockFreeBets, ...mockFreeBets].map((fb, idx) => ({
      ...fb,
      id: fb.id + idx * 1000,
      campaign: {
        ...fb.campaign,
        label: `${fb.campaign.label} ${idx + 1}`,
      },
    })),
    theme: "light",
  },
  name: "Connected Many Freebets (Scroll Test)",
}
