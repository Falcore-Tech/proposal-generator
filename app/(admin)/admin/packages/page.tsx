import { asc } from "drizzle-orm";
import { requireAdminRole } from "@/lib/auth/page";
import { db, packageFeatures, packages } from "@/lib/db";
import PackageManagementClient from "./PackageManagementClient";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  await requireAdminRole();
  const [allPackages, allFeatures] = await Promise.all([
    db.select().from(packages).orderBy(asc(packages.created_at)),
    db.select().from(packageFeatures).orderBy(asc(packageFeatures.order_index)),
  ]);
  const packagesWithFeatures = allPackages.map((pkg) => ({
    ...pkg,
    features: allFeatures.filter((feature) => feature.package_id === pkg.id),
  }));
  return <PackageManagementClient initialPackages={packagesWithFeatures as never} />;
}
