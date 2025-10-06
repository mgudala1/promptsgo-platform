import React from 'react'
import { Card } from './card'
import { cn } from './utils'

interface ProfessionalCardProps extends React.ComponentProps<"div"> {
  hoverable?: boolean
  floating?: boolean
  glass?: boolean
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  className,
  hoverable = true,
  floating = false,
  glass = false,
  children,
  ...props
}) => {
  return (
    <Card
      className={cn(
        // Base professional styles
        "border border-border bg-surface",
        "transition-all duration-200 ease-out",

        // Hoverable effects
        hoverable && [
          "hover:translate-y-[-2px]",
          "hover:shadow-professional",
          "hover:border-border-hover"
        ],

        // Floating variant
        floating && [
          "shadow-professional",
          "hover:shadow-float"
        ],

        // Glass variant
        glass && [
          "backdrop-blur-md bg-white/80",
          "border-white/20",
          "shadow-xl"
        ],

        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
}