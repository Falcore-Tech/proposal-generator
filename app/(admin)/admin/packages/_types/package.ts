import type { Package as PackageRow, PackageFeature } from "@/lib/db";

export type { PackageFeature };
export type Package = PackageRow & { features: PackageFeature[] };
