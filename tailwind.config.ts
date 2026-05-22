import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        "ink-4": "var(--ink-4)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        primary: "var(--primary)",
        "primary-soft": "var(--primary-soft)",
        "on-primary": "var(--on-primary)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        kcal: "var(--kcal)",
        protein: "var(--protein)",
        carbs: "var(--carbs)",
        fats: "var(--fats)",
        water: "var(--water)",
        fiber: "var(--fiber)",
        danger: "var(--danger)",
        "danger-soft": "var(--danger-soft)",
        success: "var(--success)",
        warning: "var(--warning)",
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        xs: "6px",
        sm: "10px",
        md: "16px",
        lg: "24px",
        pill: "999px",
      },
      boxShadow: {
        1: "0 1px 2px rgba(28, 26, 22, 0.04), 0 1px 1px rgba(28, 26, 22, 0.03)",
        2: "0 4px 14px rgba(28, 26, 22, 0.06), 0 1px 3px rgba(28, 26, 22, 0.04)",
        3: "0 16px 48px rgba(28, 26, 22, 0.16), 0 4px 12px rgba(28, 26, 22, 0.08)",
      },
      keyframes: {
        slideup: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadein: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        slideup: "slideup 240ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        fadein: "fadein 200ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
