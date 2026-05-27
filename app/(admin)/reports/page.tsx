import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { requireAdminRole } from "@/lib/auth/page";
import { commonClasses } from "@/lib/design-system";
import ReportsClient from "./ReportsClient";

export const metadata: Metadata = {
  title: "Reports - Falcore",
  description: "View proposal analytics and reports",
};

async function getProposalsData(startDate?: Date, endDate?: Date) {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from("proposals")
      .select(`
        *,
        client:clients(*),
        links:proposal_links(*),
        package:packages(*),
        created_by_profile:profiles!created_by(name, email)
      `);
    
    // Add date filtering if provided
    if (startDate && endDate) {
      query = query
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
    }
    
    // Note: Admin access is enforced at the page level, so we can fetch all proposals
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return [];
  }
}

export default async function ReportsPage() {
  // Require admin role to access reports
  await requireAdminRole();
  
  const proposals = await getProposalsData();

  return (
    <div className={commonClasses.pageContainer}>
      <div className={commonClasses.contentContainer}>
        <h1 className="text-3xl font-bold mb-6">
          Reports & Analytics
        </h1>
        <ReportsClient initialProposals={proposals} />
      </div>
    </div>
  );
}
