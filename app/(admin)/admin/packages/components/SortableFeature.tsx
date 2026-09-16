"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { brandButtonVariants } from "@/lib/design-system";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
// Color selection components removed since feature coloring was disabled
import {
  GripVertical,
  Trash2,
  Check,
  X,
} from "lucide-react";
import type { Package, PackageFeature } from "../_types/package";



interface SortableFeatureProps {
  feature: PackageFeature;
  onDeleteFeature: (packageId: string, featureId: string) => void;
  setPackagesAction: React.Dispatch<React.SetStateAction<Package[]>>;
  packageId: string;
  selectedFeatures: Set<string>;
  toggleFeatureSelection: (id: string) => void;
  markAsChanged: () => void;
  isEditMode: boolean;
}

export function SortableFeature({
  feature,
  onDeleteFeature,
  setPackagesAction,
  packageId,
  selectedFeatures,
  toggleFeatureSelection,
  markAsChanged,
  isEditMode,
}: SortableFeatureProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feature.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = selectedFeatures.has(feature.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-2 rounded transition-all ${
        isSelected
          ? "bg-surface-interactive border-brand-primary"
          : "hover:bg-surface-elevated border-transparent hover:border-border-primary"
      } border`}
    >
      {isEditMode && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleFeatureSelection(feature.id)}
          className="mr-2"
        />
      )}

      {isEditMode && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-surface-interactive rounded"
        >
          <GripVertical className="h-4 w-4 text-text-muted" />
        </div>
      )}

      {isEditMode ? (
        <Checkbox
          checked={feature.is_included !== false}
          onCheckedChange={(checked) => {
            setPackagesAction((prev) =>
              prev.map((p) =>
                p.id === packageId
                  ? {
                      ...p,
                      features: p.features.map((f) =>
                        f.id === feature.id
                          ? { ...f, is_included: checked === true }
                          : f,
                      ),
                    }
                  : p,
              ),
            );
            markAsChanged();
          }}
        />
      ) : (
        <div className="w-4 h-4 flex items-center justify-center">
          {feature.is_included !== false ? (
            <Check className="h-3 w-3 text-status-accepted" />
          ) : (
            <X className="h-3 w-3 text-status-rejected" />
          )}
        </div>
      )}

      {isEditMode ? (
        <>
          <Checkbox
            checked={feature.is_bold || false}
            onCheckedChange={(checked) => {
              setPackagesAction((prev) =>
                prev.map((p) =>
                  p.id === packageId
                    ? {
                        ...p,
                        features: p.features.map((f) =>
                          f.id === feature.id
                            ? { ...f, is_bold: checked === true }
                            : f,
                        ),
                      }
                    : p,
                ),
              );
              markAsChanged();
            }}
            className="ml-2"
          />
          <label className="text-sm text-text-secondary">Bold</label>
        </>
      ) : (
        <></>
      )}

      {isEditMode ? (
        <Input
          value={feature.text}
          onChange={(e) => {
            setPackagesAction((prev) =>
              prev.map((p) =>
                p.id === packageId
                  ? {
                      ...p,
                      features: p.features.map((f) =>
                        f.id === feature.id
                          ? { ...f, text: e.target.value }
                          : f,
                      ),
                    }
                  : p,
              ),
            );
            markAsChanged();
          }}
          className="flex-1"
        />
      ) : (
        <p
          className={`flex-1 text-text-primary ${
            feature.is_bold ? "font-bold" : ""
          }`}
        >
          {feature.text}
        </p>
      )}

      {isEditMode && (
        <button
          className={brandButtonVariants({ variant: "ghost" })}
          onClick={() => onDeleteFeature(packageId, feature.id)}
        >
          <Trash2 className="h-4 w-4 text-semantic-error transition" />
        </button>
      )}
    </div>
  );
}
