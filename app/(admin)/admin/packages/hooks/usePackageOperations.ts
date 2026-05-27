"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";
import { DragEndEvent } from "@dnd-kit/core";

interface PackageFeature {
  id: string;
  package_id: string;
  text: string;
  is_included: boolean | null;
  is_bold: boolean | null;
  order_index: number;
  color?: string | null;
}

interface Package {
  id: string;
  name: string;
  price: number;
  currency: string | null;
  usd_price: number | null;
  is_popular: boolean | null;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  features: PackageFeature[];
}

export function usePackageOperations(
  packages: Package[],
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>,
  packageSnapshots: {[key: string]: Package},
  setPackageSnapshots: React.Dispatch<React.SetStateAction<{[key: string]: Package}>>,
  setOriginalPackages: React.Dispatch<React.SetStateAction<Package[]>>,
  editingPackages: Set<string>,
  setEditingPackages: React.Dispatch<React.SetStateAction<Set<string>>>,
) {
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const handleAddPackage = async () => {
    try {
      const { data, error } = await supabase
        .from("packages")
        .insert({
          name: "New Package",
          price: 0,
          currency: "AED",
          usd_price: 0,
          is_popular: false,
          description: "",
        })
        .select()
        .single();

      if (error) throw error;

      setPackages((prev) => [...prev, { ...data, features: [] }]);
      toast.success("Package added successfully");
    } catch (error) {
      console.error("Error adding package:", error);
      toast.error("Failed to add package");
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this package? This will also delete all its features.",
      )
    ) {
      return;
    }

    try {
      const { error: featuresError } = await supabase
        .from("package_features")
        .delete()
        .eq("package_id", packageId);

      if (featuresError) throw featuresError;

      const { error: packageError } = await supabase
        .from("packages")
        .delete()
        .eq("id", packageId);

      if (packageError) throw packageError;

      setPackages((prev) => prev.filter((pkg) => pkg.id !== packageId));
      toast.success("Package deleted successfully");
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error("Failed to delete package");
    }
  };

  const handleDuplicatePackage = async (packageId: string) => {
    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) return;

    try {
      const { data: newPackage, error: packageError } = await supabase
        .from("packages")
        .insert({
          name: `${pkg.name} (Copy)`,
          price: pkg.price,
          currency: pkg.currency,
          usd_price: pkg.usd_price,
          is_popular: false,
          description: pkg.description,
        })
        .select()
        .single();

      if (packageError) throw packageError;

      if (pkg.features.length > 0) {
        const { error: featuresError } = await supabase
          .from("package_features")
          .insert(
            pkg.features.map((feature) => ({
              package_id: newPackage.id,
              text: feature.text,
              is_included: feature.is_included,
              is_bold: feature.is_bold,
              order_index: feature.order_index,
              color: feature.color,
            })),
          );

        if (featuresError) throw featuresError;
      }

      const { data: completePackage } = await supabase
        .from("packages")
        .select(
          `
          *,
          features:package_features(*)
        `,
        )
        .eq("id", newPackage.id)
        .single();

      if (completePackage) {
        completePackage.features =
          completePackage.features?.sort(
            (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index,
          ) || [];
        setPackages((prev) => [...prev, completePackage]);
      }

      toast.success("Package duplicated successfully");
    } catch (error) {
      console.error("Error duplicating package:", error);
      toast.error("Failed to duplicate package");
    }
  };

  const savePackageChanges = async (packageId: string) => {
    setIsSaving(true);
    
    try {
      const pkg = packages.find(p => p.id === packageId);
      const snapshot = packageSnapshots[packageId];
      
      if (!pkg || !snapshot) {
        throw new Error('Package or snapshot not found');
      }
      
      const packageUpdates = [];
      const featureUpdates = [];
      
      const packageChanges: Record<string, unknown> = {};
      if (pkg.name !== snapshot.name) packageChanges.name = pkg.name;
      if (pkg.price !== snapshot.price) packageChanges.price = pkg.price;
      if (pkg.usd_price !== snapshot.usd_price) packageChanges.usd_price = pkg.usd_price;
      if (pkg.is_popular !== snapshot.is_popular) packageChanges.is_popular = pkg.is_popular;
      if (pkg.description !== snapshot.description) packageChanges.description = pkg.description;
      
      if (Object.keys(packageChanges).length > 0) {
        packageUpdates.push({ id: pkg.id, changes: packageChanges });
      }
      
      for (const feature of pkg.features) {
        const originalFeature = snapshot.features.find(of => of.id === feature.id);
        
        if (originalFeature) {
          const featureChanges: Record<string, unknown> = {};
          if (feature.text !== originalFeature.text) featureChanges.text = feature.text;
          if (feature.is_included !== originalFeature.is_included) featureChanges.is_included = feature.is_included;
          if (feature.is_bold !== originalFeature.is_bold) featureChanges.is_bold = feature.is_bold;
          if (feature.color !== originalFeature.color) featureChanges.color = feature.color;
          if (feature.order_index !== originalFeature.order_index) featureChanges.order_index = feature.order_index;
          
          if (Object.keys(featureChanges).length > 0) {
            featureUpdates.push({ id: feature.id, changes: featureChanges });
          }
        }
      }
      
      for (const update of packageUpdates) {
        const { error } = await supabase
          .from("packages")
          .update({ ...update.changes, updated_at: new Date().toISOString() })
          .eq("id", update.id);
        if (error) throw error;
      }
      
      for (const update of featureUpdates) {
        const { error } = await supabase
          .from("package_features")
          .update(update.changes)
          .eq("id", update.id);
        if (error) throw error;
      }
      
      setOriginalPackages(prev => prev.map(p => p.id === packageId ? pkg : p));
      
      setPackageSnapshots(prev => {
        const newSnapshots = { ...prev };
        delete newSnapshots[packageId];
        return newSnapshots;
      });
      
      setEditingPackages(prev => {
        const newSet = new Set(prev);
        newSet.delete(packageId);
        return newSet;
      });
      
      toast.success("Package saved successfully!");
      
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error("Failed to save package");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFeature = async (packageId: string) => {
    try {
      const maxOrderIndex =
        packages
          .find((pkg) => pkg.id === packageId)
          ?.features.reduce((max, f) => Math.max(max, f.order_index), 0) || 0;

      const { data, error } = await supabase
        .from("package_features")
        .insert({
          package_id: packageId,
          text: "New Feature",
          is_included: true,
          is_bold: false,
          order_index: maxOrderIndex + 1,
        })
        .select()
        .single();

      if (error) throw error;

      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.id === packageId
            ? { ...pkg, features: [...pkg.features, data] }
            : pkg,
        ),
      );
      toast.success("Feature added successfully");
    } catch (error) {
      console.error("Error adding feature:", error);
      toast.error("Failed to add feature");
    }
  };

  const handleDeleteFeature = async (packageId: string, featureId: string) => {
    try {
      const { error } = await supabase
        .from("package_features")
        .delete()
        .eq("id", featureId);

      if (error) throw error;

      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.id === packageId
            ? {
                ...pkg,
                features: pkg.features.filter((f) => f.id !== featureId),
              }
            : pkg,
        ),
      );
      toast.success("Feature deleted successfully");
    } catch (error) {
      console.error("Error deleting feature:", error);
      toast.error("Failed to delete feature");
    }
  };

  const handleDragEnd = (event: DragEndEvent, packageId: string) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) return;

    const oldIndex = pkg.features.findIndex(
      (feature) => feature.id === active.id,
    );
    const newIndex = pkg.features.findIndex(
      (feature) => feature.id === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const newFeatures = arrayMove(pkg.features, oldIndex, newIndex);
    
    // Update order_index for all features based on their new position
    const reorderedFeatures = newFeatures.map((feature, index) => ({
      ...feature,
      order_index: index,
    }));

    // Only update local state - no database persistence until package is saved
    setPackages((prev) =>
      prev.map((p) =>
        p.id === packageId ? { ...p, features: reorderedFeatures } : p,
      ),
    );

    // These should already be handled by the UI when entering edit mode
    // The drag operation should only work when already in edit mode
  };

  const handleBulkDeleteFeatures = async (selectedFeatures: Set<string>, setSelectedFeatures: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    if (selectedFeatures.size === 0) {
      toast.error("No features selected");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedFeatures.size} selected features?`,
      )
    ) {
      return;
    }

    try {
      const featureIds = Array.from(selectedFeatures);
      const { error } = await supabase
        .from("package_features")
        .delete()
        .in("id", featureIds);

      if (error) throw error;

      setPackages((prev) =>
        prev.map((pkg) => ({
          ...pkg,
          features: pkg.features.filter((f) => !selectedFeatures.has(f.id)),
        })),
      );
      setSelectedFeatures(new Set());
      toast.success(`${featureIds.length} features deleted successfully`);
    } catch (error) {
      console.error("Error deleting features:", error);
      toast.error("Failed to delete features");
    }
  };

  return {
    isSaving,
    handleAddPackage,
    handleDeletePackage,
    handleDuplicatePackage,
    savePackageChanges,
    handleAddFeature,
    handleDeleteFeature,
    handleDragEnd,
    handleBulkDeleteFeatures,
  };
}