import React from 'react'
import { Button } from './button'
import { cn } from './utils'

interface ProfessionalButtonProps extends React.ComponentProps<"button"> {
  gradient?: boolean
  premium?: boolean
  success?: boolean
  floating?: boolean
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export const ProfessionalButton: React.FC<ProfessionalButtonProps> = ({
  className,
  gradient = false,
  premium = false,
  success = false,
  floating = false,
  ...props
}) => {
  return (
    <Button
      className={cn(
        // Base professional styles
        "font-medium transition-all duration-200 ease-out",
        "hover:translate-y-[-1px] active:translate-y-[0px]",

        // Gradient variant
        gradient && [
          "bg-gradient-to-r from-primary-500 to-primary-600",
          "hover:from-primary-600 hover:to-primary-700",
          "text-white border-0",
          "shadow-lg hover:shadow-xl"
        ],

        // Premium variant
        premium && [
          "bg-gradient-to-r from-purple-600 to-blue-600",
          "hover:from-purple-700 hover:to-blue-700",
          "text-white border-0",
          "shadow-lg hover:shadow-xl"
        ],

        // Success variant
        success && [
          "bg-gradient-to-r from-success-500 to-success-600",
          "hover:from-success-600 hover:to-success-700",
          "text-white border-0",
          "shadow-lg hover:shadow-xl"
        ],

        // Floating variant
        floating && [
          "shadow-professional hover:shadow-float",
          "backdrop-blur-sm bg-white/90 hover:bg-white"
        ],

        className
      )}
      {...props}
    />
  )
}