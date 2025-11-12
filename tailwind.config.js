/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#fdfcf8",
        foreground: "#2d3319",
        card: "#ffffff",
        "card-foreground": "#2d3319",
        popover: "#ffffff",
        "popover-foreground": "#2d3319",
        primary: "#4a7c59",
        "primary-foreground": "#ffffff",
        secondary: "#f5f5f0",
        "secondary-foreground": "#2d3319",
        muted: "#f0f0eb",
        "muted-foreground": "#6b7360",
        accent: "#e8f4ed",
        "accent-foreground": "#2d3319",
        destructive: "#dc2626",
        "destructive-foreground": "#ffffff",
        border: "rgba(75, 124, 89, 0.15)",
        input: "transparent",
        "input-background": "#f8f8f5",
        "switch-background": "#d4d4aa",
        ring: "#4a7c59",
        "ring-offset": "#fdfcf8",
        chart: {
          1: "#4a7c59",
          2: "#8b9a6b",
          3: "#a67c52",
          4: "#d4d4aa",
          5: "#6b7360",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "calc(0.75rem - 2px)",
        sm: "calc(0.75rem - 4px)",
        xl: "calc(0.75rem + 4px)",
      },
      ringWidth: {
        DEFAULT: "2px",
      },
      ringOffsetWidth: {
        DEFAULT: "2px",
      },
    },
  },
  plugins: [],
};
