import type { Meta, StoryObj } from "@storybook/react"
import { Info } from "lucide-react"
import coinHeadsIcon from "../../assets/game/coin-heads.svg"
import { Button } from "./button"

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
        "iconRound",
        "iconTransparent",
        "coinButton",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon", "iconRound", "coin"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "default",
    size: "default",
    disabled: false,
    children: "Button Text",
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: "default",
    children: "Default Button",
  },
}

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive Button",
  },
}

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline Button",
  },
}

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost Button",
  },
}

export const Link: Story = {
  args: {
    variant: "link",
    children: "Link Button",
  },
}

export const Icon: Story = {
  args: {
    variant: "outline",
    size: "icon",
    children: <Info className="h-4 w-4" />,
  },
}

export const IconRound: Story = {
  args: {
    variant: "iconRound",
    size: "iconRound",
    children: <Info className="h-4 w-4" />,
  },
}

export const IconTransparent: Story = {
  args: {
    variant: "iconTransparent",
    size: "iconRound",
    children: <Info className="h-4 w-4" />,
  },
}

export const CoinButton: Story = {
  args: {
    variant: "coinButton",
    size: "coin",
    children: (
      <img src={coinHeadsIcon} alt="Coin Heads" className="h-full w-auto pointer-events-none" />
    ),
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled Button",
  },
}
