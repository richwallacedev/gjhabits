import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1440px"
      }
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        gamification: "hsl(var(--gamification))",
        habits: "hsl(var(--habits))",
        petwarm: "hsl(var(--petwarm))",
        tomasa: "hsl(var(--tomasa))",
        dante: "hsl(var(--dante))",
        lucien: "hsl(var(--lucien))"
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(15, 23, 42, 0.18)"
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1rem"
      },
      backgroundImage: {
        "fintech-gradient":
          "linear-gradient(135deg, rgba(15, 23, 42, 0.08), rgba(34, 197, 94, 0.08))"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
