import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { DEFAULT_THEME_ID, resolveThemeId, type ThemeId } from "@/lib/proposal-themes";

export async function getGlobalTheme(): Promise<ThemeId> {
  try {
    const [row] = await db.select({ theme: appSettings.proposal_theme }).from(appSettings).where(eq(appSettings.id, true)).limit(1);
    return resolveThemeId(row?.theme);
  } catch {
    return DEFAULT_THEME_ID;
  }
}

export async function setGlobalTheme(theme: ThemeId, updatedBy: string): Promise<ThemeId> {
  const [row] = await db
    .insert(appSettings)
    .values({ id: true, proposal_theme: theme, updated_by: updatedBy })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: { proposal_theme: theme, updated_at: new Date().toISOString(), updated_by: updatedBy },
    })
    .returning({ theme: appSettings.proposal_theme });
  return resolveThemeId(row?.theme);
}
