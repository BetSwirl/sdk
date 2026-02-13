import tailwindcss from "@tailwindcss/postcss"
import autoprefixer from "autoprefixer"

import postcssImport from "postcss-import"

const isProd = process.env.NODE_ENV === "production"

/** @type {import('postcss').ProcessOptions} */
export default {
  plugins: [
    postcssImport,
    tailwindcss,
    autoprefixer,
    ...(isProd
      ? [
          {
            postcssPlugin: "unpack-tailwind-layers",
            OnceExit(root) {
              const layers = ["base", "components", "utilities", "theme", "properties"]
              root.walkAtRules("layer", (rule) => {
                if (layers.includes(rule.params)) {
                  if (Array.isArray(rule.nodes) && rule.nodes.length > 0) {
                    rule.replaceWith(...rule.nodes)
                  } else {
                    rule.remove()
                  }
                }
              })
            },
          },
        ]
      : []),
  ],
}
