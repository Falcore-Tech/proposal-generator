"use client";

import { brandButtonVariants } from "@/lib/design-system";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  X,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import type { Package } from "../_types/package";


interface PackageHeaderProps {
  pkg: Package;
  isCollapsed: boolean;
  isEditMode: boolean;
  isSaving: boolean;
  onToggleCollapse: (packageId: string) => void;
  onStartEdit: (packageId: string) => void;
  onCancelEdit: (packageId: string) => void;
  onSave: (packageId: string) => void;
  onDuplicate: (packageId: string) => void;
  onDelete: (packageId: string) => void;
}

export function PackageHeader({
  pkg,
  isCollapsed,
  isEditMode,
  isSaving,
  onToggleCollapse,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDuplicate,
  onDelete,
}: PackageHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div 
        className="flex items-center gap-3 cursor-pointer rounded p-2 -m-2 flex-1"
        onClick={() => onToggleCollapse(pkg.id)}
      >
        <div className="p-1">
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-text-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-muted" />
          )}
        </div>
        <h2 className="text-lg font-semibold text-text-primary">{pkg.name}</h2>
        {pkg.is_popular && (
          <span className="bg-semantic-warning/20 text-semantic-warning text-xs font-medium px-2 py-1 rounded">
            Popular
          </span>
        )}
      </div>
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {isEditMode ? (
          <>
            <button
              className={brandButtonVariants({ variant: "secondary" })}
              onClick={() => onCancelEdit(pkg.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </button>
            <button
              className={brandButtonVariants({ variant: "primary" })}
              onClick={() => onSave(pkg.id)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              {isSaving ? "Saving..." : "Save"}
            </button>
          </>
        ) : (
          <>
            <button
              className={brandButtonVariants({ variant: "secondary" })}
              onClick={() => onStartEdit(pkg.id)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>
            <button
              className={brandButtonVariants({ variant: "secondary" })}
              onClick={() => onDuplicate(pkg.id)}
            >
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </button>
            <button
              className={brandButtonVariants({ variant: "destructive" })}
              onClick={() => onDelete(pkg.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
