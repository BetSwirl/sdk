import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { Slider } from "./slider"

const meta = {
  title: "UI/Slider",
  component: Slider,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "oklch(0.15 0 0)" }],
    },
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    value: { control: "object" },
    defaultValue: { control: "object" },
    className: { control: "text" },
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    className: "w-60",
  },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

function SliderWithState({ defaultValue, ...args }: React.ComponentProps<typeof Slider>) {
  const [value, setValue] = useState(defaultValue || [50])

  return (
    <div className="w-80 p-4">
      <Slider {...args} value={value} onValueChange={setValue} />
      <div className="mt-2 text-center text-sm">Value: {value.join(", ")}</div>
    </div>
  )
}

export const Default: Story = {
  render: (args) => <SliderWithState {...args} />,
  args: {
    defaultValue: [25],
  },
}

export const GreenAccent: Story = {
  render: (args) => <SliderWithState {...args} />,
  args: {
    defaultValue: [25],
    max: 99,
  },
}

export const Range: Story = {
  render: (args) => <SliderWithState {...args} />,
  args: {
    defaultValue: [25, 75],
  },
}

export const Disabled: Story = {
  render: (args) => {
    return (
      <div className="w-80 p-4">
        <Slider {...args} />
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Value: {args.value?.join(", ")} (disabled)
        </div>
      </div>
    )
  },
  args: {
    value: [60],
    disabled: true,
  },
}
