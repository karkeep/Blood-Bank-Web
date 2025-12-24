import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // Blood theme colors
        blood: {
          50: '#fef2f2',   // Very light red/pink
          100: '#fee2e2',  // Light pink
          200: '#fecaca',  // Light red
          300: '#fca5a5',  // Medium light red
          400: '#f87171',  // Medium red
          500: '#ef4444',  // Standard red
          600: '#dc2626',  // Dark red (primary)
          700: '#b91c1c',  // Darker red
          800: '#991b1b',  // Very dark red
          900: '#7f1d1d',  // Deepest red
          950: '#450a0a',  // Almost black red
        },
        
        // Enhanced primary colors for blood theme
        primary: {
          DEFAULT: '#dc2626',      // Blood red
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',          // Main primary
          700: '#b91c1c',          // primary-dark
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
          foreground: '#ffffff',
          dark: '#b91c1c',         // primary-dark alias
        },
        
        // Complementary colors for blood theme
        life: {
          50: '#f0fdf4',   // Very light green (life/health)
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Life green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        
        // Existing colors with HSL variables
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
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
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
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        // Blood pulse animation
        "blood-pulse": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.8", 
            transform: "scale(1.05)",
          },
        },
        // Heartbeat animation
        "heartbeat": {
          "0%, 50%, 100%": {
            transform: "scale(1)",
          },
          "25%": {
            transform: "scale(1.1)",
          },
          "75%": {
            transform: "scale(1.05)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "blood-pulse": "blood-pulse 2s ease-in-out infinite",
        "heartbeat": "heartbeat 1.5s ease-in-out infinite",
      },
      backgroundImage: {
        'blood-gradient': 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
        'life-gradient': 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
      },
      boxShadow: {
        'blood': '0 4px 14px 0 rgba(220, 38, 38, 0.3)',
        'blood-lg': '0 10px 25px -3px rgba(220, 38, 38, 0.3), 0 4px 6px -2px rgba(220, 38, 38, 0.1)',
        'life': '0 4px 14px 0 rgba(34, 197, 94, 0.3)',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
