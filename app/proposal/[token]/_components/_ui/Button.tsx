"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const animButtonVariants = cva(
  "inline-flex items-center justify-center font-bold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none",
  {
    variants: {
      variant: {
        primary: "text-white rounded-[var(--r-pill)]",
        outline: "border border-current/20 hover:bg-current/5 rounded-[var(--r-pill)]",
        ghost:   "hover:bg-current/10 rounded-[var(--r-chip)]",
        muted:   "bg-(--muted) hover:opacity-80 rounded-[var(--r-chip)]",
      },
      size: {
        sm:  "h-9  px-5",
        md:  "h-11 px-7",
        lg:  "h-13 px-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof animButtonVariants>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, style, ...props },
  ref
) {
  const isPrimary = !variant || variant === "primary";
  return (
    <button
      ref={ref}
      style={isPrimary ? { background: "var(--accent)", ...style } : style}
      className={cn(animButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
});

export { Button, animButtonVariants };
