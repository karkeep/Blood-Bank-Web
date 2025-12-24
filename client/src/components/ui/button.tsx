import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-red-400",
  {
    variants: {
      variant: {
        default: "bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5 shadow-lg hover:shadow-xl hover:shadow-red-500/25",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5 shadow-lg hover:shadow-red-500/30",
        outline:
          "border-2 border-slate-200 bg-white/90 backdrop-blur-sm hover:bg-slate-50 hover:border-red-200 hover:text-red-700 dark:border-slate-700 dark:bg-slate-950/90 dark:hover:bg-slate-900 dark:hover:text-red-400",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700",
        ghost: "hover:bg-slate-100/80 hover:text-slate-900 dark:hover:bg-slate-800/80 dark:hover:text-slate-50",
        link: "text-red-600 underline-offset-4 hover:underline dark:text-red-400",
        // Premium Glass Variants
        glass: "backdrop-blur-xl bg-white/20 border border-white/30 text-white hover:bg-white/30 hover:border-white/50 hover:-translate-y-0.5 shadow-lg",
        "glass-primary": "backdrop-blur-xl bg-red-600/90 border border-red-400/50 text-white hover:bg-red-500/95 hover:border-red-300/60 hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(220,38,38,0.4),0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_8px_30px_rgba(220,38,38,0.5),0_0_40px_rgba(220,38,38,0.3)]",
        "glass-secondary": "backdrop-blur-xl bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:-translate-y-0.5",
        "glass-life": "backdrop-blur-xl bg-green-600/90 border border-green-400/50 text-white hover:bg-green-500/95 hover:border-green-300/60 hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(34,197,94,0.4),0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_8px_30px_rgba(34,197,94,0.5),0_0_40px_rgba(34,197,94,0.3)]",
        // Glow Variants
        glow: "bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4),0_0_40px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6),0_0_60px_rgba(220,38,38,0.3)] animate-glow-pulse hover:animate-none",
        "glow-green": "bg-green-600 text-white hover:bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4),0_0_40px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6),0_0_60px_rgba(34,197,94,0.3)]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }