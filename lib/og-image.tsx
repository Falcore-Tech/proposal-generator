import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const OG_PALETTE = {
  bg: "#F5EDD9",
  fg: "#0D0D1A",
  muted: "#5C5C66",
  accent: "#7C3AED",
  border: "#D4C9AE",
};

async function loadFalcoreMark(): Promise<string> {
  const file = await readFile(join(process.cwd(), "public", "falcore-mark.png"));
  return `data:image/png;base64,${file.toString("base64")}`;
}

interface OgImageProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  footer?: string;
}

export async function renderOgImage({ eyebrow, title, subtitle, footer }: OgImageProps) {
  const mark = await loadFalcoreMark();
  const titleSize = title.length > 60 ? 52 : title.length > 40 ? 62 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: OG_PALETTE.bg,
          color: OG_PALETTE.fg,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src={mark} width={64} height={64} alt="" />
          <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: 6 }}>FALCORE</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 22, letterSpacing: 6, color: OG_PALETTE.accent, fontWeight: 600 }}>
            {eyebrow.toUpperCase()}
          </span>
          <span style={{ fontSize: titleSize, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.5 }}>
            {title}
          </span>
          {subtitle && (
            <span style={{ fontSize: 30, color: OG_PALETTE.muted, marginTop: 8 }}>{subtitle}</span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 28,
            borderTop: `2px solid ${OG_PALETTE.border}`,
            fontSize: 22,
            color: OG_PALETTE.muted,
          }}
        >
          <span>{footer ?? "falcoretech.com"}</span>
          <span style={{ color: OG_PALETTE.accent, fontWeight: 600 }}>proposal.falcoretech.com</span>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
