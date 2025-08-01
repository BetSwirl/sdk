import { Decorator } from "@storybook/react"

export const StorybookVersionWrapper: Decorator = (Story) => {
  const version = import.meta.env.VITE_STORYBOOK_VERSION

  return (
    <>
      {version && (
        <div
          style={{
            display: "inline-block",
            background: "#f2f2f2",
            padding: "4px 16px",
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "10px",
            borderRadius: "4px",
            color: "#333333",
            letterSpacing: 1,
          }}
        >
          {version}
        </div>
      )}
      <Story />
    </>
  )
}
