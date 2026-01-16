import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Luxury Terminal palette
        void: "#050506",
        surface: {
          0: "#0a0a0b",
          1: "#111113",
          2: "#1a1a1d",
        },
        border: {
          dim: "#1f1f23",
          DEFAULT: "#2a2a2f",
          bright: "#3a3a42",
        },
        text: {
          primary: "#fafafa",
          secondary: "#a1a1a6",
          tertiary: "#636369",
          ghost: "#3a3a42",
        },
        gold: {
          DEFAULT: "#d4a853",
          bright: "#e8c06a",
          dim: "#9a7b3d",
        },
        success: "#3ecf8e",
        error: "#ef5f5f",
        info: "#6b8afd",
        warning: "#f59e0b",
        // Keep obsidian for backward compat
        obsidian: {
          50: "#fafafa",
          100: "#d4d4d8",
          200: "#a1a1aa",
          300: "#71717a",
          400: "#52525b",
          500: "#3f3f46",
          600: "#27272a",
          700: "#1c1c21",
          800: "#131316",
          900: "#0c0c0e",
          950: "#09090b",
        },
        amber: {
          200: "#fde68a",
          300: "#fcd34d",
          400: "#d4a853",
          500: "#9a7b3d",
        },
        copper: "#c77b4a",
        rose: {
          400: "#fb7185",
          500: "#f43f5e",
        },
      },
      fontFamily: {
        sans: ["Geist", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0, 255, 0, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(0, 255, 0, 0.4)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
