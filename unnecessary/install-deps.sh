#!/bin/bash

echo "🔧 LifeLink Blood Bank - Dependency Fixer"
echo "========================================"

# Navigate to project root
cd /Users/prabeshkarkee/Desktop/blood-bank

echo "📦 Installing main dependencies..."
npm install

echo "📦 Installing client dependencies..."
cd client
npm install firebase @hookform/resolvers @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip @tanstack/react-query @tanstack/react-table class-variance-authority clsx cmdk date-fns framer-motion input-otp lucide-react next-themes react-day-picker react-helmet react-hook-form react-icons recharts tailwind-merge tailwindcss-animate vaul wouter zod

echo "🛠️  Installing dev dependencies..."
npm install -D @tailwindcss/typography @tailwindcss/vite @types/react-helmet autoprefixer postcss tailwindcss

cd ..

echo "✅ All dependencies installed!"
echo "🚀 Ready to start the application!"
