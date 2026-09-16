import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";

export const alt = SITE_TITLE;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Proposals",
    title: SITE_TITLE,
    subtitle: SITE_DESCRIPTION,
  });
}
