/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}", "!./node_modules/**"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontSize: {
      sm: ["14px", "157%"],
      base: ["16px", "150%"],
      lg: ["18px", "133%"],
    },
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      fontWeight: {
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },
    },
  },
  plugins: [require("tw-animate-css")],
}
