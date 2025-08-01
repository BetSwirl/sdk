import type { Decorator, Preview } from "@storybook/react"
import "../src/index.css"
import { StorybookProviders } from "../src/storybook/StorybookProviders"
import { StorybookVersionWrapper } from "../src/storybook/StorybookVersionWrapper"

const withAppProviders: Decorator = (Story) => (
  <StorybookProviders>
    <Story />
  </StorybookProviders>
)

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ["Game", ["CoinTossGame", "*"]],
      },
    },
  },
  decorators: [StorybookVersionWrapper, withAppProviders],
}

export default preview
