import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-slate-200/50 bg-white/95 text-slate-950 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-slate-800/50 dark:bg-slate-950/95 dark:text-slate-50",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

// Premium Glass Card with full glassmorphism effect
const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "light" | "dark" | "solid" }
>(({ className, variant = "light", ...props }, ref) => {
  const variantClasses = {
    light: "bg-white/10 border-white/20 text-white",
    dark: "bg-black/20 border-white/10 text-white",
    solid: "bg-white/80 border-white/40 text-slate-900 dark:bg-slate-900/80 dark:text-slate-50"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300",
        variantClasses[variant],
        "hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(220,38,38,0.15)]",
        className
      )}
      style={{
        boxShadow: variant === "solid"
          ? '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.5)'
          : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
      }}
      {...props}
    />
  )
})
GlassCard.displayName = "GlassCard"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, GlassCard, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

