import type { Meta, StoryObj } from "@storybook/react"
import { DiceGame, type DiceGameProps } from "../../components/game/DiceGame"
import { STORYBOOK_TOKENS, StorybookProviders } from "../../storybook/StorybookProviders"
import { THEME_OPTIONS } from "../../types/types"
import gameBg1 from "../assets/game/game-background-9.png"
import gameBg4 from "../assets/game/game-background-10.png"
import gameBg2 from "../assets/game/game-background-11.webp"
import gameBg3 from "../assets/game/game-background-12.png"
import gameBg5 from "../assets/game/game-background-13.png"
import gameBg6 from "../assets/game/game-background-14.png"

interface StoryArgs extends DiceGameProps {
  token?: keyof typeof STORYBOOK_TOKENS
}

const meta = {
  title: "Game/DiceGame",
  component: DiceGame,
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
  render: (args) => <DiceGame {...args} />,
}

export const LightTheme: Story = {
  ...Template,
  args: {
    theme: "light",
    token: "ETH",
  },
  parameters: {
    chromatic: { delay: 2000 }, // Wait 2 seconds for ETH icon loading and multiplier stabilization
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
    chromatic: { delay: 2000 }, // Wait 2 seconds for images to load
  },
}

export const SystemTheme: Story = {
  ...Template,
  args: {
    theme: "system",
    token: "ETH",
    backgroundImage: gameBg4,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const DonutRollLightTheme: Story = {
  ...Template,
  args: {
    theme: "light",
    token: "DEGEN",
    customTheme: {
      "--primary": "#7f5058",
      "--play-btn-font": "rgb(238 231 235)",
    } as React.CSSProperties,
    backgroundImage: gameBg5,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const SatelliteDarkTheme: Story = {
  ...Template,
  args: {
    theme: "dark",
    token: "ETH",
    customTheme: {
      "--primary": "#d7caab",
      "--play-btn-font": "#254450",
    } as React.CSSProperties,
    backgroundImage: gameBg1,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const SpaceshipDarkTheme: Story = {
  ...Template,
  args: {
    theme: "dark",
    token: "DEGEN",
    customTheme: {
      "--primary": "#595b5c",
      "--play-btn-font": "#c5c2ab",
    } as React.CSSProperties,
    backgroundImage: gameBg3,
  },
  parameters: {
    chromatic: { disable: true },
  },
}

export const MysticForestDarkTheme: Story = {
  ...Template,
  args: {
    theme: "dark",
    token: "ETH",
    customTheme: {
      "--primary": "rgb(74 41 24)",
      "--play-btn-font": "rgb(225 159 31)",
      "--connect-btn-font": "rgb(225 159 31)",
    } as React.CSSProperties,
    backgroundImage: gameBg6,
  },
  parameters: {
    chromatic: { disable: true },
  },
}
