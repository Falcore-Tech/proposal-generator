import { requireAdminRole } from "@/lib/auth/page";
import { createClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/design-card";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, FileText, Archive, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SalesRepDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminRole();
  const { id } = await params;
  const supabase = await createClient();

  // Get sales rep details
  const { data: salesRep } = await supabase
    .from("profiles")
    .select("id, name, email, role, created_at, updated_at")
    .eq("id", id)
    .eq("role", "sales_rep")
    .single();

  if (!salesRep) {
    notFound();
  }

  // Get proposal statistics
  const { data: activeProposals } = await supabase
    .from("proposals")
    .select("id, status, created_at, client_name, company_name")
    .eq("created_by", salesRep.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  const { data: archivedProposals } = await supabase
    .from("proposals")
    .select("id, created_at, client_name, company_name")
    .eq("created_by", salesRep.id)
    .not("archived_at", "is", null)
    .order("archived_at", { ascending: false });

  const totalActive = activeProposals?.length || 0;
  const totalArchived = archivedProposals?.length || 0;

  // Calculate status breakdown
  const statusCounts = activeProposals?.reduce((acc, proposal) => {
    const status = proposal.status || "draft";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="bg-surface-primary min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/sales-team"
            className="px-3 py-1.5 text-sm border border-border-primary text-text-secondary hover:bg-surface-interactive rounded-md transition-colors flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sales Team
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {salesRep.name || salesRep.email?.split("@")[0]}
            </h1>
            <p className="text-text-muted">Sales Representative Details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Rep Info */}
          <div className="lg:col-span-1">
            <Card variant="primary" size="lg">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Contact Information</h3>
              <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-text-primary font-medium text-lg">
                  {salesRep.name ? salesRep.name.charAt(0).toUpperCase() : salesRep.email!.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-text-primary">
                    {salesRep.name || "No name set"}
                  </p>
                  <Badge variant="secondary" className="bg-status-accepted text-text-primary">
                    Active
                  </Badge>
                </div>
              </div>
              
                <div className="space-y-3 pt-4 border-t border-border-secondary">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Mail className="h-4 w-4" />
                    {salesRep.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(salesRep.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Statistics and Proposals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="elevated" size="md">
                <div className="flex flex-row items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-text-muted">Active Proposals</h4>
                  <FileText className="h-4 w-4 text-status-sent" />
                </div>
                <div className="text-2xl font-bold text-text-primary">{totalActive}</div>
                <p className="text-xs text-text-subtle">Currently in progress</p>
              </Card>

              <Card variant="elevated" size="md">
                <div className="flex flex-row items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-text-muted">Accepted</h4>
                  <TrendingUp className="h-4 w-4 text-status-accepted" />
                </div>
                <div className="text-2xl font-bold text-text-primary">{statusCounts.accepted || 0}</div>
                <p className="text-xs text-text-subtle">Proposals accepted</p>
              </Card>

              <Card variant="elevated" size="md">
                <div className="flex flex-row items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-text-muted">Archived</h4>
                  <Archive className="h-4 w-4 text-text-muted" />
                </div>
                <div className="text-2xl font-bold text-text-primary">{totalArchived}</div>
                <p className="text-xs text-text-subtle">Archived proposals</p>
              </Card>
            </div>

            {/* Recent Active Proposals */}
            <Card variant="primary" size="lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Recent Active Proposals</h3>
                  <p className="text-sm text-text-muted">
                    Latest proposal activity
                  </p>
                </div>
                <Link 
                  href={`/proposals?sales_rep=${salesRep.id}`}
                  className="px-3 py-1.5 text-sm border border-border-primary text-text-secondary hover:bg-surface-interactive rounded-md transition-colors"
                >
                  View All
                </Link>
              </div>
              <div>
                {activeProposals && activeProposals.length > 0 ? (
                  <div className="space-y-3">
                    {activeProposals.slice(0, 5).map((proposal) => (
                      <Card
                        key={proposal.id}
                        variant="elevated"
                        size="sm"
                        className="flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-medium text-text-primary">
                            {proposal.company_name}
                          </h4>
                          <p className="text-sm text-text-muted">
                            {proposal.client_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            className={
                              proposal.status === "accepted"
                                ? "bg-status-accepted text-text-primary"
                                : proposal.status === "sent"
                                ? "bg-status-sent text-text-primary"
                                : proposal.status === "rejected"
                                ? "bg-status-rejected text-text-primary"
                                : proposal.status === "paid"
                                ? "bg-status-paid text-text-primary"
                                : proposal.status === "expired"
                                ? "bg-status-expired text-text-primary"
                                : "bg-status-draft text-text-primary"
                            }
                          >
                            {proposal.status || "draft"}
                          </Badge>
                          <span className="text-xs text-text-subtle">
                            {new Date(proposal.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-text-subtle" />
                    <h3 className="mt-2 text-sm font-medium text-text-secondary">No active proposals</h3>
                    <p className="mt-1 text-sm text-text-muted">
                      This sales representative hasn't created any proposals yet.
                    </p>
                  </div>
                )}
              </div>
            </Card>

              {/* Archived Proposals */}
            <Card variant="primary" size="lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <Archive className="h-5 w-5" />
                    Archived Proposals
                  </h3>
                  <p className="text-sm text-text-muted">
                    Previously archived proposals
                  </p>
                </div>
                {totalArchived > 5 && (
                  <Link 
                    href={`/proposals?sales_rep=${salesRep.id}&archived=true`}
                    className="px-3 py-1.5 text-sm border border-border-primary text-text-secondary hover:bg-surface-interactive rounded-md transition-colors"
                  >
                    View All Archived
                  </Link>
                )}
              </div>
              <div>
              {archivedProposals && archivedProposals.length > 0 ? (
                <div className="space-y-3">
                  {archivedProposals.slice(0, 5).map((proposal) => (
                    <Card
                      key={proposal.id}
                      variant="elevated"
                      size="sm"
                      className="flex items-center justify-between opacity-75"
                    >
                      <div className="flex items-center gap-3">
                        <Archive className="h-4 w-4 text-text-muted" />
                        <div>
                          <h4 className="font-medium text-text-secondary">
                            {proposal.company_name}
                          </h4>
                          <p className="text-sm text-text-muted">
                            {proposal.client_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-status-expired text-status-expired">
                          Archived
                        </Badge>
                        <span className="text-xs text-text-subtle">
                          {new Date(proposal.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Archive className="mx-auto h-12 w-12 text-text-subtle" />
                  <h3 className="mt-2 text-sm font-medium text-text-secondary">No archived proposals</h3>
                  <p className="mt-1 text-sm text-text-muted">
                    This sales representative hasn't archived any proposals yet.
                  </p>
                </div>
              )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
