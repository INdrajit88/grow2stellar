/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./lib/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink:   "#16181d",
        mint:  "#0f9f8f",
        coral: "#e75d4f",
        gold:  "#f4be32",
        cloud: "#f6f7f9",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          '"Fira Code"',
          '"Fira Mono"',
          '"Roboto Mono"',
          "monospace",
        ],
      },
      animation: {
        "fade-in":    "fade-in 0.35s ease both",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(15,159,143,0.3)" },
          "50%":       { boxShadow: "0 0 0 8px rgba(15,159,143,0)" },
        },
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};
