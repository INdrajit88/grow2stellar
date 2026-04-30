/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16181d",
        mint: "#0f9f8f",
        coral: "#e75d4f",
        gold: "#f4be32",
        cloud: "#f6f7f9",
      },
    },
  },
  plugins: [],
};
