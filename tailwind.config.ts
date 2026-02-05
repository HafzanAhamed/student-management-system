import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"]
      },
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-2": "rgb(var(--color-surface-2) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--color-ink-soft) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        brand: "rgb(var(--color-brand) / <alpha-value>)",
        "brand-strong": "rgb(var(--color-brand-strong) / <alpha-value>)",
        sky: "rgb(var(--color-sky) / <alpha-value>)",
        coral: "rgb(var(--color-coral) / <alpha-value>)",
        "coral-strong": "rgb(var(--color-coral-strong) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)"
      },
      boxShadow: {
        soft: "0 18px 36px -22px rgba(24, 36, 52, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
