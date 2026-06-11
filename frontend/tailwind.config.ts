import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0D9488",
          hover: "#0F766E",
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A"
        },
        ink: {
          DEFAULT: "#0F172A",
          muted: "#64748B"
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F8FAFC"
        },
        status: {
          pending: { bg: "#FEF9C3", fg: "#A16207", border: "#FEF08A" },
          confirmed: { bg: "#DCFCE7", fg: "#15803D", border: "#BBF7D0" },
          cancelled: { bg: "#FEE2E2", fg: "#B91C1C", border: "#FECACA" }
        }
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 4px 20px -4px rgba(15,23,42,0.05)",
        cardHover: "0 12px 30px -4px rgba(15,23,42,0.08)"
      },
      borderRadius: {
        "2xl": "1rem"
      }
    }
  },
  plugins: []
};

export default config;
