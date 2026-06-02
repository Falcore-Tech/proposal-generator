import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type HeadingFont = "display" | "script" | "body";
type HeadingSize =
  | "display"
  | "numeral"
  | "h1"
  | "h2"
  | "h3"
  | "numeral-sm"
  | "script"
  | "script-sm";
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "blockquote";

interface HeadingProps {
  as?: HeadingTag;
  font?: HeadingFont;
  size?: HeadingSize;
  italic?: boolean;
  weight?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const sizeStyles: Record<HeadingSize, React.CSSProperties> = {
  display:      { fontSize: "var(--fs-display)",   lineHeight: 0.9,  letterSpacing: "var(--tracking-tight)" },
  numeral:      { fontSize: "var(--fs-numeral)",   lineHeight: 0.85, letterSpacing: "var(--tracking-tight)" },
  h1:           { fontSize: "var(--fs-h1)",        lineHeight: 1,    letterSpacing: "var(--tracking-tight)" },
  h2:           { fontSize: "var(--fs-h2)",        lineHeight: 1.2,  letterSpacing: "var(--tracking-tight)" },
  h3:           { fontSize: "var(--fs-h3)",        lineHeight: 1.3,  letterSpacing: "var(--tracking-tight)" },
  "numeral-sm": { fontSize: "var(--fs-h3)",        lineHeight: 1,    letterSpacing: "var(--tracking-tight)" },
  script:       { fontSize: "var(--fs-script)",    lineHeight: 1.05 },
  "script-sm":  { fontSize: "var(--fs-script-sm)", lineHeight: 1.5  },
};

const defaultWeight: Record<HeadingSize, number> = {
  display: 300,
  numeral: 300,
  "numeral-sm": 300,
  h1: 400,
  h2: 400,
  h3: 400,
  script: 400,
  "script-sm": 400,
};

const fontMap: Record<HeadingFont, string> = {
  display: "var(--font-display)",
  script:  "var(--font-script)",
  body:    "var(--font-body)",
};

const Heading = forwardRef<HTMLElement, HeadingProps>(function Heading(
  { as: Tag = "h2", font = "display", size = "h2", italic, weight, className, style, children },
  ref
) {
  const Tag2 = Tag as React.ElementType;
  const resolvedItalic = italic ?? font === "display";
  return (
    <Tag2
      ref={ref}
      className={cn("leading-none", className)}
      style={{
        fontFamily: fontMap[font],
        fontStyle: resolvedItalic ? "italic" : undefined,
        fontWeight: weight ?? defaultWeight[size],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {children}
    </Tag2>
  );
});

export { Heading };
