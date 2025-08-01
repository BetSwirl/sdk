import type { Meta, StoryObj } from "@storybook/react"
import { WheelGame, type WheelGameProps } from "../../components/game/WheelGame"
import { STORYBOOK_TOKENS, StorybookProviders } from "../../storybook/StorybookProviders"
import { THEME_OPTIONS } from "../../types/types"
import gameBg1 from "../assets/game/game-background-9.png"
import gameBg2 from "../assets/game/game-background-11.webp"

interface StoryArgs extends WheelGameProps {
  token?: keyof typeof STORYBOOK_TOKENS
}

const meta = {
  title: "Game/WheelGame",
  component: WheelGame,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#FFFFFF" },
        { name: "dark", value: "oklch(0.15 0 0)" },
      ],
    },
  },
  decorators: [
    (Story, context) => {
      const token = context.args.token ? STORYBOOK_TOKENS[context.args.token] : STORYBOOK_TOKENS.ETH
      return (
        <StorybookProviders token={token}>
          <Story />
        </StorybookProviders>
      )
    },
  ],
  tags: ["autodocs"],
  argTypes: {
    theme: {
      control: "radio",
      options: THEME_OPTIONS,
    },
    token: {
      control: "radio",
      options: ["ETH", "DEGEN"],
      description: "Token to use for betting",
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
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

const Template: Story = {
  render: (args) => <WheelGame {...args} />,
}

export const LightTheme: Story = {
  ...Template,
  args: {
    theme: "light",
    token: "ETH",
  },
}

export const DarkTheme: Story = {
  ...Template,
  args: {
    theme: "dark",
    token: "ETH",
    backgroundImage: gameBg2,
  },
  parameters: {
    backgrounds: { default: "light" },
  },
}

export const SystemTheme: Story = {
  ...Template,
  args: {
    theme: "system",
    token: "ETH",
    backgroundImage: gameBg1,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const CustomTheme: Story = {
  ...Template,
  args: {
    theme: "light",
    token: "DEGEN",
    customTheme: {
      "--primary": "#ff6b35",
      "--play-btn-font": "#ffffff",
      "--game-window-overlay": "rgba(255, 107, 53, 0.1)",
    },
  },
  parameters: {
    chromatic: { disable: true },
  },
}
