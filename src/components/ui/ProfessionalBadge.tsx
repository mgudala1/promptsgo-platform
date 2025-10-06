import React from 'react'
import { Badge, badgeVariants } from './badge'
import { type VariantProps } from "class-variance-authority"
import { cn } from './utils'

interface ProfessionalBadgeProps extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  gradient?: boolean
  success?: boolean
  premium?: boolean
  pulse?: boolean
}

export const ProfessionalBadge: React.FC<ProfessionalBadgeProps> = ({
  className,
  gradient = false,
  success = false,
  premium = false,
  pulse = false,
  children,
  ...props
}) => {
  return (
    <Badge
      className={cn(
        // Base professional styles
        "font-medium px-3 py-1 text-xs",
        "transition-all duration-200",

        // Gradient variant
        gradient && [
          "bg-gradient-to-r from-primary-500 to-primary-600",
          "text-white border-0"
        ],

        // Success variant
        success && [
          "bg-gradient-to-r from-success-500 to-success-600",
          "text-white border-0"
        ],

        // Premium variant
        premium && [
          "bg-gradient-to-r from-purple-600 to-blue-600",
          "text-white border-0",
          "shadow-sm"
        ],

        // Pulse animation
        pulse && "animate-pulse",

        className
      )}
      {...props}
    >
      {children}
    </Badge>
  )
}