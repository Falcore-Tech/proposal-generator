import { cva, type VariantProps } from "class-variance-authority";

/**
 * Falcore Design System - Component Variants
 * Provides consistent styling patterns across the application
 */

// Surface Variants - For backgrounds and containers
export const surfaceVariants = cva("", {
  variants: {
    level: {
      primary: "bg-surface-primary",
      secondary: "bg-surface-secondary", 
      elevated: "bg-surface-elevated",
      interactive: "bg-surface-interactive",
    }
  },
  defaultVariants: {
    level: "secondary"
  }
});

// Text Variants - For text hierarchy
export const textVariants = cva("", {
  variants: {
    level: {
      primary: "text-text-primary",
      secondary: "text-text-secondary",
      muted: "text-text-muted",
      subtle: "text-text-subtle",
    }
  },
  defaultVariants: {
    level: "primary"
  }
});

// Border Variants - For borders and dividers
export const borderVariants = cva("", {
  variants: {
    level: {
      primary: "border-border-primary",
      secondary: "border-border-secondary",
      interactive: "border-border-interactive",
      focus: "border-border-focus",
    }
  },
  defaultVariants: {
    level: "primary"
  }
});

// Status Variants - For status badges and indicators
export const statusVariants = cva("inline-flex items-center rounded px-2 py-1 text-xs font-medium", {
  variants: {
    status: {
      draft: "bg-status-draft text-status-draft-foreground",
      sent: "bg-status-sent text-status-sent-foreground",
      accepted: "bg-status-accepted text-status-accepted-foreground",
      paid: "bg-status-paid text-status-paid-foreground",
      rejected: "bg-status-rejected text-status-rejected-foreground",
      expired: "bg-status-expired text-status-expired-foreground",
    }
  }
});

// Brand Button Variants - For primary actions
export const brandButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-brand-primary text-brand-primary-foreground hover:bg-interactive-primary-hover active:bg-interactive-primary-active",
        primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
        secondary: "bg-brand-secondary text-brand-secondary-foreground hover:bg-interactive-secondary-hover active:bg-interactive-secondary-active",
        outline: "border border-border-primary text-text-primary hover:bg-surface-interactive active:bg-surface-elevated",
        ghost: "text-brand-primary hover:bg-surface-interactive active:bg-surface-elevated",
        destructive: "bg-semantic-error text-semantic-error-foreground hover:bg-semantic-error/90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-3",
        xl: "h-14 px-8 py-4",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

// Semantic Variants - For semantic colors
export const semanticVariants = cva("", {
  variants: {
    intent: {
      success: "bg-semantic-success text-semantic-success-foreground",
      error: "bg-semantic-error text-semantic-error-foreground", 
      warning: "bg-semantic-warning text-semantic-warning-foreground",
      info: "bg-semantic-info text-semantic-info-foreground",
    }
  }
});

// Card Variants - For elevated surfaces
export const cardVariants = cva("rounded-lg border", {
  variants: {
    level: {
      primary: "bg-surface-primary border-border-secondary",
      secondary: "bg-surface-secondary border-border-primary",
      elevated: "bg-surface-elevated border-border-primary",
      interactive: "bg-surface-interactive border-border-interactive hover:bg-surface-elevated transition-colors",
    }
  },
  defaultVariants: {
    level: "secondary"
  }
});

// Tab Variants - For tab components
export const tabVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-text-muted hover:text-text-secondary data-[state=active]:bg-brand-primary data-[state=active]:text-brand-primary-foreground",
        secondary: "text-text-muted hover:text-text-secondary data-[state=active]:bg-surface-elevated data-[state=active]:text-text-primary",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

// Export types for TypeScript support
export type SurfaceVariants = VariantProps<typeof surfaceVariants>;
export type TextVariants = VariantProps<typeof textVariants>;
export type BorderVariants = VariantProps<typeof borderVariants>;
export type StatusVariants = VariantProps<typeof statusVariants>;
export type BrandButtonVariants = VariantProps<typeof brandButtonVariants>;
export type SemanticVariants = VariantProps<typeof semanticVariants>;
export type CardVariants = VariantProps<typeof cardVariants>;
export type TabVariants = VariantProps<typeof tabVariants>;

/**
 * Design System Constants
 * Use these for consistent spacing, sizing, and other design decisions
 */
export const designTokens = {
  // Surface hierarchy (950→900→800→700)
  surface: {
    primary: 'bg-surface-primary',
    secondary: 'bg-surface-secondary',
    elevated: 'bg-surface-elevated',
    interactive: 'bg-surface-interactive',
  },
  
  // Text hierarchy
  text: {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    muted: 'text-text-muted',
    subtle: 'text-text-subtle',
  },
  
  // Brand colors
  brand: {
    primary: 'text-brand-primary',
    secondary: 'text-brand-secondary',
    primaryBg: 'bg-brand-primary',
    secondaryBg: 'bg-brand-secondary',
  },
  
  // Status colors
  status: {
    draft: 'bg-status-draft text-status-draft-foreground',
    sent: 'bg-status-sent text-status-sent-foreground',
    accepted: 'bg-status-accepted text-status-accepted-foreground',
    paid: 'bg-status-paid text-status-paid-foreground',
    rejected: 'bg-status-rejected text-status-rejected-foreground',
    expired: 'bg-status-expired text-status-expired-foreground',
  },
  
  // Semantic colors
  semantic: {
    success: 'bg-semantic-success text-semantic-success-foreground',
    error: 'bg-semantic-error text-semantic-error-foreground',
    warning: 'bg-semantic-warning text-semantic-warning-foreground',
    info: 'bg-semantic-info text-semantic-info-foreground',
  },
  
  // Borders
  border: {
    primary: 'border-border-primary',
    secondary: 'border-border-secondary',
    interactive: 'border-border-interactive',
    focus: 'border-border-focus',
  },
  
  // Interactive states
  interactive: {
    primaryHover: 'hover:bg-interactive-primary-hover',
    primaryActive: 'active:bg-interactive-primary-active',
    secondaryHover: 'hover:bg-interactive-secondary-hover',
    secondaryActive: 'active:bg-interactive-secondary-active',
  }
} as const;

/**
 * Helper function to apply design system classes
 * @param classes - Classes to apply with design system tokens
 * @returns Processed class string
 */
export function applyDesignSystem(classes: string): string {
  return classes;
}

/**
 * Common component class combinations
 */
export const commonClasses = {
  // Page layouts
  pageContainer: "bg-surface-primary min-h-screen",
  contentContainer: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
  
  // Cards (DEPRECATED - Use design-system-card components instead)
  card: "bg-surface-secondary border-border-primary rounded-lg p-6",
  cardElevated: "bg-surface-elevated border-border-primary rounded-lg p-6",
  
  // Forms
  input: "bg-surface-elevated border-border-primary text-text-primary placeholder:text-text-muted",
  label: "text-text-secondary font-medium",
  
  // Lists
  listContainer: "bg-surface-secondary border-border-primary rounded-lg",
  listItem: "border-border-secondary hover:bg-surface-elevated transition-colors",
  
  // Navigation
  navItem: "text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors",
  navItemActive: "text-brand-primary bg-surface-elevated",
} as const;

/**
 * Card Usage Guide
 * 
 * For consistent card styling across the application, use the standardized card components:
 * 
 * import { FormCard, ContentCard, ServiceCard, PackageCard, SummaryCard } from "@/components/ui/design-system-card"
 * 
 * - FormCard: Main form sections (ClientInformationForm, PackageSelection, etc.)
 * - ContentCard: General elevated content within forms
 * - ServiceCard: Individual service selection items
 * - PackageCard: Package selection cards with selection/popular states
 * - SummaryCard: Pricing and summary sections
 * 
 * This ensures consistent visual hierarchy and eliminates hardcoded color issues.
 */