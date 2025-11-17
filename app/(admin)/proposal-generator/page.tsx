import { Suspense } from "react";
import { Metadata } from "next";
import ProposalGeneratorTabs from "@/components/proposal/ProposalGeneratorTabs";
import ProposalGeneratorSkeleton from "@/components/proposal/ProposalGeneratorSkeleton";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Proposal Generator - XMA Agency",
  description: "Create customized marketing proposals for your clients.",
};

async function getInitialData() {
  try {
    // Fetch packages with their features
    const { data: packages, error: packagesError } = await supabase
      .from("packages")
      .select("*, features:package_features(*)")
      .order("price");

    // Fetch services
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("*")
      .order("price");

    if (packagesError) {
      console.error("Error fetching packages:", packagesError);
      throw packagesError;
    }

    if (servicesError) {
      console.error("Error fetching services:", servicesError);
      throw servicesError;
    }

    return {
      packages: packages || [],
      services: services || [],
    };
  } catch (error) {
    console.error("Error fetching initial data:", error);
    return { packages: [], services: [] };
  }
}

async function ProposalGeneratorContent() {
  const initialData = await getInitialData();
  return <ProposalGeneratorTabs initialData={initialData} />;
}

export default async function ProposalGeneratorPage() {
  return (
    <Suspense fallback={<ProposalGeneratorSkeleton />}>
      <ProposalGeneratorContent />
    </Suspense>
  );
}
