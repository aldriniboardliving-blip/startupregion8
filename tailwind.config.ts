import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#edf7f8",
          100: "#d5edf0",
          200: "#aadd",
          300: "#75c5cd",
          400: "#40a8b5",
          500: "#218796",
          600: "#0e7080",
          700: "#0a545f",
          800: "#06424c",
          900: "#063642",
          950: "#03222b",
        },
        gold: {
          50: "#fff9eb",
          100: "#ffecc3",
          200: "#ffd888",
          300: "#ffc24d",
          400: "#ffb233",
          500: "#f5a525",
          600: "#f09a20",
          700: "#c96d17",
          800: "#9c4f16",
          900: "#7e4017",
          950: "#44210a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;