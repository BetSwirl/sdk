import type { Meta, StoryObj } from "@storybook/react"
import gameBg from "../../assets/game/game-background-1.png"
import { AppProviders } from "../../providers"
import { CoinTossGame } from "./CoinTossGame"

const meta = {
  title: "Game/CoinTossGame",
  component: CoinTossGame,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#FFFFFF" },
        { name: "dark", value: "oklch(0.15 0 0)" },
      ],
    },
    loki: {
      skip: true,
    },
  },
  decorators: [
    (Story) => (
      <AppProviders>
        <Story />
      </AppProviders>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    theme: {
      control: "radio",
      options: ["light", "dark", "system"],
    },
    customTheme: {
      control: "object",
      description: "Custom theme",
      table: {
        type: {
          summary: "object",
          detail: `{
            "--primary": string,
            "--play-btn-font": string,
            "--game-window-overlay": string,
          }`,
        },
      },
    },
    backgroundImage: {
      control: "file",
      description: "Background image",
      accept: "image/*",
    },
  },
} satisfies Meta<typeof CoinTossGame>

export default meta
type Story = StoryObj<typeof meta>

const Template: Story = {
  render: (args) => <CoinTossGame {...args} />,
}

export const LightTheme: Story = {
  ...Template,
  args: {
    theme: "light",
  },
}

export const DarkTheme: Story = {
  ...Template,
  args: {
    theme: "dark",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
}

export const SystemTheme: Story = {
  ...Template,
  args: {
    theme: "system",
  },
}

export const CustomTheme1: Story = {
  ...Template,
  args: {
    theme: "light",
    customTheme: {
      "--primary": "#4dae52",
      "--play-btn-font": "#1B5E20",
      "--game-window-overlay": "oklch(0 0 0 / 40%)",
    } as React.CSSProperties,
  },
}

export const CustomTheme2: Story = {
  ...Template,
  args: {
    theme: "light",
    customTheme: {
      "--primary": "#6AB3D3",
      "--play-btn-font": "#ffffff",
      "--game-window-overlay": "oklch(0 0 0 / 10%)",
    } as React.CSSProperties,
    backgroundImage: gameBg,
  },
}
