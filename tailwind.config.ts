import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        banking: {
          slate: {
            950: "#070a13",
            900: "#0b0f19",
            850: "#111827",
            800: "#1e293b",
            700: "#334155",
          },
          navy: {
            950: "#050b14",
            900: "#0a1325",
            800: "#0e1e3e",
            700: "#173160",
          },
          emerald: {
            400: "#34d399",
            500: "#10b981",
            600: "#059669",
            glow: "rgba(16, 185, 129, 0.25)",
          },
          amber: {
            400: "#fbbf24",
            500: "#f59e0b",
            glow: "rgba(245, 158, 11, 0.25)",
          },
          rose: {
            500: "#f43f5e",
            600: "#e11d48",
            glow: "rgba(244, 63, 94, 0.25)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "spatial-sm": "0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.02)",
        "spatial-md": "0 10px 30px -10px rgba(0, 0, 0, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.05)",
        "spatial-lg": "0 20px 40px -15px rgba(0, 0, 0, 0.3), 0 0 20px 0 rgba(16, 185, 129, 0.08)",
        "spatial-glow-emerald": "0 0 25px -5px rgba(16, 185, 129, 0.4)",
        "spatial-glow-blue": "0 0 25px -5px rgba(59, 130, 246, 0.35)",
        "inner-light": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.02)" },
        },
        floatSpatial: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "float-spatial": "floatSpatial 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
