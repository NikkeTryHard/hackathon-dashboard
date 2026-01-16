import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        neon: { green: "#00ff00", purple: "#9945ff", cyan: "#00ffff" },
        dark: { bg: "#0a0a0a", card: "#111111", border: "#1a1a1a" },
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
