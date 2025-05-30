import { TokenImage } from "@coinbase/onchainkit/token"
import type { Meta, StoryObj } from "@storybook/react"
import { ETH_TOKEN } from "../../lib/tokens"
import { Input } from "./input"

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    className: { control: "text" },
    token: { control: "object" },
  },
  args: {
    type: "text",
    placeholder: "Enter text...",
    disabled: false,
    className: "w-64",
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: "number",
    placeholder: "0",
    value: "10.5",
    token: {
      icon: <TokenImage token={ETH_TOKEN} size={18} className="mr-1" />,
      symbol: "ETH",
    },
  },
}

export const Disabled: Story = {
  args: {
    type: "number",
    placeholder: "0",
    value: "10.5",
    token: {
      icon: <TokenImage token={ETH_TOKEN} size={18} className="mr-1" />,
      symbol: "ETH",
    },
    disabled: true,
  },
}
