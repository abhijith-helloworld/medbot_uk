import type { Config } from "tailwindcss";

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],

  // ✅ ADDED SAFELIST (THIS FIXES YOUR COLOR ISSUE)
  safelist: [
    // bg
    "bg-red-50","bg-orange-50","bg-green-50","bg-purple-50","bg-blue-50",
    "dark:bg-red-950/40","dark:bg-orange-950/40","dark:bg-green-950/40","dark:bg-purple-950/40","dark:bg-blue-950/40",

    // border
    "border-red-200","border-orange-200","border-green-200","border-purple-200","border-blue-200",
    "dark:border-red-800","dark:border-orange-800","dark:border-green-800","dark:border-purple-800","dark:border-blue-800",

    // icon bg
    "bg-red-100","bg-orange-100","bg-green-100","bg-purple-100","bg-blue-100",
    "dark:bg-red-900","dark:bg-orange-900","dark:bg-green-900","dark:bg-purple-900","dark:bg-blue-900",

    // icon text color
    "text-red-600","text-orange-600","text-green-600","text-purple-600","text-blue-600",
    "dark:text-red-300","dark:text-orange-300","dark:text-green-300","dark:text-purple-300","dark:text-blue-300",

    // progress bar inner color
    "[&>div]:bg-red-500","[&>div]:bg-orange-500","[&>div]:bg-green-500","[&>div]:bg-purple-500","[&>div]:bg-blue-500",
  ],

  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
};

export default config;
