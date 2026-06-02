import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextVariant = "lead" | "body" | "caption";
type TextTag = "p" | "span" | "div" | "li";

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextTag;
  variant?: TextVariant;
  muted?: boolean;
}

const variantSize: Record<TextVariant, string> = {
  lead:    "var(--fs-lead)",
  body:    "var(--fs-body)",
  caption: "var(--fs-caption)",
};

const variantLeading: Record<TextVariant, string> = {
  lead:    "leading-relaxed",
  body:    "leading-relaxed",
  caption: "leading-normal",
};

const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { as: Tag = "p", variant = "body", muted, className, style, children, ...props },
  ref
) {
  const Tag2 = Tag as React.ElementType;
  return (
    <Tag2
      ref={ref}
      className={cn(variantLeading[variant], muted && "opacity-55", className)}
      style={{ fontFamily: "var(--font-body)", fontSize: variantSize[variant], ...style }}
      {...props}
    >
      {children}
    </Tag2>
  );
});

export { Text };
