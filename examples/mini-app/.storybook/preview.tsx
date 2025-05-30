import type { Decorator, Preview } from "@storybook/react"
import "../src/index.css"

const withAppProviders: Decorator = (StoryComponent) => {
  return <StoryComponent />
}

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
  decorators: [withAppProviders],
}

export default preview
