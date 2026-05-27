import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Falcore Design System - Single Card Component
 * One flexible card component that handles all use cases
 */

const cardVariants = cva(
  "rounded-lg border transition-colors", 
  {
    variants: {
      variant: {
        // Main containers (forms, sections)
        primary: "bg-surface-secondary border-border-primary",
        
        // Content within forms (elevated above primary)
        elevated: "bg-surface-elevated border-border-primary",
        
        // Interactive/clickable cards
        interactive: "bg-surface-elevated border-border-primary hover:bg-surface-interactive cursor-pointer",
        
        // Selected state
        selected: "bg-surface-elevated border-brand-primary shadow-lg",
      },
      size: {
        sm: "p-3",
        md: "p-4", 
        lg: "p-6",
        none: "p-0",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  selected?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, selected, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ 
          variant: selected ? "selected" : variant, 
          size 
        }), 
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card, cardVariants }

/**
 * Usage Examples:
 * 
 * // Form sections (like ClientInformationForm)
 * <Card>
 *   <h2>Client Information</h2>
 *   ...form content
 * </Card>
 * 
 * // Content within forms (like service items)
 * <Card variant="elevated" size="md">
 *   <h3>Service Name</h3>
 *   <p>Service description</p>
 * </Card>
 * 
 * // Interactive/clickable cards
 * <Card variant="interactive" onClick={handleClick}>
 *   <h3>Clickable content</h3>
 * </Card>
 * 
 * // Selected state
 * <Card selected={isSelected} onClick={handleSelect}>
 *   <h3>Selectable content</h3>
 * </Card>
 * 
 * // Custom styling
 * <Card variant="elevated" size="sm" className="mb-4">
 *   Custom content
 * </Card>
 */