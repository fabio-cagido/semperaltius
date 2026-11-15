import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        everest: {
          navy: "#0F294A",
          dark: "#0A1D36",
          blue: "#1E56A0",
          lightBlue: "#3B82F6",
          sky: "#E0F2FE",
          red: "#B91C1C",
          crimson: "#991B1B",
          gold: "#D97706",
          gray: {
            50: "#F8FAFC",
            100: "#F1F5F9",
            200: "#E2E8F0",
            300: "#CBD5E1",
            400: "#94A3B8",
            500: "#64748B",
            600: "#475569",
            700: "#334155",
            800: "#1E293B",
            900: "#0F172A",
          }
        },
        desempenho: {
          inicial: "#EF4444",
          desenvolvimento: "#F59E0B",
          adequada: "#3B82F6",
          referencia: "#10B981"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
