import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getTableColumns } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  animatedProposalEvents,
  animatedProposals,
  appSettings,
  packageFeatures,
  packages,
  packageTosMappings,
  profiles,
  tosTemplates,
} from "@/lib/db/schema";

const exportDir = process.argv[2];
if (!exportDir) throw new Error("usage: bun scripts/import-supabase-export.ts <export-dir>");

const tablesInInsertOrder = [
  ["profiles", profiles],
  ["packages", packages],
  ["package_features", packageFeatures],
  ["tos_templates", tosTemplates],
  ["package_tos_mappings", packageTosMappings],
  ["animated_proposals", animatedProposals],
  ["animated_proposal_events", animatedProposalEvents],
  ["app_settings", appSettings],
] as const;

for (const [name, table] of tablesInInsertOrder) {
  const rows: Record<string, unknown>[] = JSON.parse(await readFile(join(exportDir, `${name}.json`), "utf8"));
  if (rows.length === 0) {
    console.log(`${name}: 0 rows, skipped`);
    continue;
  }
  const knownColumns = new Set(Object.keys(getTableColumns(table)));
  const cleaned = rows.map((row) =>
    Object.fromEntries(Object.entries(row).filter(([key]) => knownColumns.has(key)))
  );
  const dropped = [...new Set(rows.flatMap((row) => Object.keys(row)))].filter((k) => !knownColumns.has(k));
  if (name === "app_settings") {
    await db.delete(appSettings);
  }
  await db.insert(table).values(cleaned as never).onConflictDoNothing();
  console.log(`${name}: inserted ${cleaned.length}${dropped.length ? ` (dropped columns: ${dropped.join(", ")})` : ""}`);
}
