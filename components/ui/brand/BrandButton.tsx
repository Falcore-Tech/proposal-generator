"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const brandButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-accent) focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-(--brand-accent) text-(--brand-accent-fg) hover:opacity-90 active:scale-95",
        outline:
          "border-2 border-(--brand-fg) text-(--brand-fg) hover:bg-(--brand-fg) hover:text-(--brand-bg) active:scale-95",
        lime: "bg-(--brand-accent-2) text-(--brand-fg) hover:opacity-90 active:scale-95",
        ghost:
          "text-(--brand-accent) hover:bg-(--brand-muted) active:scale-95",
      },
      size: {
        sm: "h-9 px-5 text-sm",
        md: "h-11 px-7 text-base",
        lg: "h-14 px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export type BrandButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof brandButtonVariants>;

const BrandButton = forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(brandButtonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
BrandButton.displayName = "BrandButton";

export { BrandButton, brandButtonVariants };
