"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { brandButtonVariants } from "@/lib/design-system";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ToSTemplate } from "@/types/tos";
import { Edit, Trash2, Plus, Copy } from "lucide-react";
import ToSTemplateDialog from "@/components/admin/ToSTemplateDialog";

interface ToSManagementClientProps {
  initialTemplates: ToSTemplate[];
}

export default function ToSManagementClient({ initialTemplates }: ToSManagementClientProps) {
  const [templates, setTemplates] = useState<ToSTemplate[]>(initialTemplates);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ToSTemplate | null>(null);
  const router = useRouter();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/tos-templates");
      if (!response.ok) throw new Error("Failed to fetch templates");
      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      toast.error("Failed to load ToS templates");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`/api/admin/tos-templates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete template");
      }

      toast.success("Template deleted successfully");
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (template: ToSTemplate) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  const handleDuplicate = (template: ToSTemplate) => {
    const duplicatedTemplate = {
      ...template,
      id: "", // Clear ID for new template
      name: `${template.name} (Copy)`,
    };
    setEditingTemplate(duplicatedTemplate);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
    fetchTemplates();
  };

  const getPaymentTypeColor = (type?: string) => {
    switch (type) {
      case "full":
        return "bg-status-accepted text-white";
      case "split":
        return "bg-brand-primary text-white";
      case "custom":
        return "bg-status-warning text-white";
      default:
        return "bg-surface-secondary text-text-secondary";
    }
  };

  const getPaymentTypeLabel = (type?: string) => {
    switch (type) {
      case "full":
        return "Full Payment";
      case "split":
        return "Split Payment";
      case "custom":
        return "Custom";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="bg-surface-primary min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Terms & Conditions Management
          </h1>
          <p className="text-text-secondary mt-1">
            Create and manage ToS templates for different packages and payment types
          </p>
        </div>
        <button
          onClick={handleCreate}
          className={brandButtonVariants({ variant: "primary" })}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading templates...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className={`
                bg-surface-primary border-border-primary
                ${!template.is_active ? "opacity-60" : ""}
              `}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-text-primary">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="mt-1 text-text-secondary">
                      {template.description || "No description"}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    {template.payment_type && (
                      <span 
                        className={`
                          px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                          ${getPaymentTypeColor(template.payment_type)}
                        `}
                      >
                        {getPaymentTypeLabel(template.payment_type)}
                      </span>
                    )}
                    {!template.is_active && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-surface-secondary text-text-secondary">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-text-secondary mb-4">
                  {template.terms.length} terms
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className={brandButtonVariants({ variant: "outline", size: "sm" })}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className={brandButtonVariants({ variant: "outline", size: "sm" })}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className={brandButtonVariants({ variant: "destructive", size: "sm" })}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && templates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-text-secondary">
            <h3 className="text-lg font-medium mb-2">No ToS templates yet</h3>
            <p className="mb-4">Create your first template to get started</p>
            <button
              onClick={handleCreate}
              className={brandButtonVariants({ variant: "primary" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </button>
          </div>
        </div>
      )}

        {/* Dialog */}
        <ToSTemplateDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          template={editingTemplate}
        />
      </div>
    </div>
  );
}
