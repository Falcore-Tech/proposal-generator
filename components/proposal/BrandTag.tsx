interface BrandTagProps {
  size?: "xs" | "sm";
}

export function BrandTag({ size = "xs" }: BrandTagProps) {
  const base = size === "xs"
    ? "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase"
    : "inline-flex items-center px-2 py-1 rounded text-xs font-semibold tracking-wide uppercase";

  return (
    <span className={`${base} bg-purple-500/20 text-purple-400 border border-purple-500/30`}>
      Falcore
    </span>
  );
}
