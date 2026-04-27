import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type HeadingFont = "display" | "script" | "body";
type HeadingSize = "display" | "h1" | "script" | "script-sm" | "h2" | "h3";
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p";

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
  display:     { fontSize: "var(--fs-display)",   lineHeight: 0.9,  letterSpacing: "-0.03em" },
  h1:          { fontSize: "var(--fs-h1)",         lineHeight: 1,    letterSpacing: "-0.03em" },
  script:      { fontSize: "var(--fs-script)",     lineHeight: 1.05 },
  "script-sm": { fontSize: "var(--fs-script-sm)",  lineHeight: 1.5  },
  h2:          { fontSize: "var(--fs-h2)",         lineHeight: 1.2  },
  h3:          { fontSize: "var(--fs-h3)",         lineHeight: 1.4  },
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
  return (
    <Tag2
      ref={ref}
      className={cn("leading-none", className)}
      style={{
        fontFamily: fontMap[font],
        fontStyle: italic ? "italic" : undefined,
        fontWeight: weight,
        ...sizeStyles[size],
        ...style,
      }}
    >
      {children}
    </Tag2>
  );
});

export { Heading };
