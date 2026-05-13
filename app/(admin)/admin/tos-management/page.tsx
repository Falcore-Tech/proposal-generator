import { requireAdminRole } from "@/lib/auth/page";
import { createClient } from "@/utils/supabase/server";
import ToSManagementClient from "./ToSManagementClient";

export default async function ToSManagementPage() {
  await requireAdminRole();
  const supabase = await createClient();

  // Fetch existing ToS templates
  const { data: templates, error: templatesError } = await supabase
    .from("tos_templates")
    .select("*")
    .order("created_at", { ascending: false });

  if (templatesError) {
    console.error("Error fetching ToS templates:", templatesError);
  }

  return <ToSManagementClient initialTemplates={templates || []} />;
}