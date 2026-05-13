import { requireAdminRole } from "@/lib/auth/page";
import { createClient } from "@/utils/supabase/server";
import PackageManagementClient from "./PackageManagementClient";

export default async function PackagesPage() {
  await requireAdminRole();
  const supabase = await createClient();

  // Fetch packages with features
  const { data: packages, error: packagesError } = await supabase
    .from("packages")
    .select(`
      *,
      features:package_features(*)
    `)
    .order("created_at", { ascending: true });

  if (packagesError) {
    console.error("Error fetching packages:", packagesError);
  }

  // Sort features by order_index
  const packagesWithSortedFeatures = packages?.map(pkg => ({
    ...pkg,
    features: pkg.features?.sort((a: any, b: any) => a.order_index - b.order_index) || []
  })) || [];

  return <PackageManagementClient initialPackages={packagesWithSortedFeatures} />;
}