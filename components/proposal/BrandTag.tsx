interface BrandTagProps {
  brand: "xma" | "xma_media";
  size?: "xs" | "sm";
}

export function BrandTag({ brand, size = "xs" }: BrandTagProps) {
  const base = size === "xs"
    ? "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase"
    : "inline-flex items-center px-2 py-1 rounded text-xs font-semibold tracking-wide uppercase";

  if (brand === "xma_media") {
    return (
      <span className={`${base} bg-purple-500/20 text-purple-400 border border-purple-500/30`}>
        XMA Media
      </span>
    );
  }

  return (
    <span className={`${base} bg-red-500/20 text-red-400 border border-red-500/30`}>
      XMA
    </span>
  );
}
