"use server";

import { asc, eq, inArray } from "drizzle-orm";
import { db, packageFeatures, packages, type Package as PackageRow, type PackageFeature } from "@/lib/db";
import type { Package as PackageWithFeatures } from "./_types/package";
import { requireAdminRole } from "@/lib/auth/page";

export type { PackageWithFeatures };

async function loadPackageWithFeatures(packageId: string): Promise<PackageWithFeatures> {
  const [pkg] = await db.select().from(packages).where(eq(packages.id, packageId)).limit(1);
  const features = await db.select().from(packageFeatures).where(eq(packageFeatures.package_id, packageId)).orderBy(asc(packageFeatures.order_index));
  return { ...pkg, features };
}

export async function createPackage(): Promise<PackageWithFeatures> {
  await requireAdminRole();
  const [pkg] = await db
    .insert(packages)
    .values({ name: "New Package", price: 0, currency: "AED", usd_price: 0, is_popular: false, description: "" })
    .returning();
  return { ...pkg, features: [] };
}

export async function deletePackage(packageId: string): Promise<void> {
  await requireAdminRole();
  await db.delete(packages).where(eq(packages.id, packageId));
}

export async function duplicatePackage(packageId: string): Promise<PackageWithFeatures> {
  await requireAdminRole();
  const source = await loadPackageWithFeatures(packageId);
  const [copy] = await db
    .insert(packages)
    .values({
      name: `${source.name} (Copy)`,
      price: source.price,
      currency: source.currency,
      usd_price: source.usd_price,
      is_popular: false,
      description: source.description,
    })
    .returning();

  if (source.features.length > 0) {
    await db.insert(packageFeatures).values(
      source.features.map(({ text, is_included, is_bold, order_index }) => ({
        package_id: copy.id,
        text,
        is_included,
        is_bold,
        order_index,
      }))
    );
  }
  return loadPackageWithFeatures(copy.id);
}

export interface PackageChangeSet {
  packageChanges: Partial<Pick<PackageRow, "name" | "price" | "usd_price" | "is_popular" | "description">>;
  featureChanges: Array<{ id: string; changes: Partial<Pick<PackageFeature, "text" | "is_included" | "is_bold" | "order_index">> }>;
}

export async function savePackage(packageId: string, changeSet: PackageChangeSet): Promise<void> {
  await requireAdminRole();
  if (Object.keys(changeSet.packageChanges).length > 0) {
    await db.update(packages).set({ ...changeSet.packageChanges, updated_at: new Date().toISOString() }).where(eq(packages.id, packageId));
  }
  for (const { id, changes } of changeSet.featureChanges) {
    await db.update(packageFeatures).set(changes).where(eq(packageFeatures.id, id));
  }
}

export async function createFeature(packageId: string, orderIndex: number): Promise<PackageFeature> {
  await requireAdminRole();
  const [feature] = await db
    .insert(packageFeatures)
    .values({ package_id: packageId, text: "New Feature", is_included: true, is_bold: false, order_index: orderIndex })
    .returning();
  return feature;
}

export async function deleteFeatures(featureIds: string[]): Promise<void> {
  await requireAdminRole();
  if (featureIds.length === 0) return;
  await db.delete(packageFeatures).where(inArray(packageFeatures.id, featureIds));
}
