"use client";

import { useState } from "react";
import { createFeature, createPackage, deleteFeatures, deletePackage, duplicatePackage, savePackage, type PackageChangeSet } from "../actions";
import type { Package } from "../_types/package";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";
import { DragEndEvent } from "@dnd-kit/core";

export function usePackageOperations(
  packages: Package[],
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>,
  packageSnapshots: {[key: string]: Package},
  setPackageSnapshots: (updater: (prev: Record<string, Package>) => Record<string, Package>) => void,
  setOriginalPackages: React.Dispatch<React.SetStateAction<Package[]>>,
  editingPackages: Set<string>,
  setEditingPackages: (updater: (prev: Set<string>) => Set<string>) => void,
) {
  const [isSaving, setIsSaving] = useState(false);

  const handleAddPackage = async () => {
    try {
      const created = await createPackage();
      setPackages((prev) => [...prev, created]);
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
      await deletePackage(packageId);
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
      const copy = await duplicatePackage(packageId);
      setPackages((prev) => [...prev, copy]);
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
      
      const changeSet: PackageChangeSet = { packageChanges: {}, featureChanges: [] };
      if (pkg.name !== snapshot.name) changeSet.packageChanges.name = pkg.name;
      if (pkg.price !== snapshot.price) changeSet.packageChanges.price = pkg.price;
      if (pkg.usd_price !== snapshot.usd_price) changeSet.packageChanges.usd_price = pkg.usd_price;
      if (pkg.is_popular !== snapshot.is_popular) changeSet.packageChanges.is_popular = pkg.is_popular;
      if (pkg.description !== snapshot.description) changeSet.packageChanges.description = pkg.description;

      for (const feature of pkg.features) {
        const originalFeature = snapshot.features.find(of => of.id === feature.id);
        if (!originalFeature) continue;
        const changes: PackageChangeSet["featureChanges"][number]["changes"] = {};
        if (feature.text !== originalFeature.text) changes.text = feature.text;
        if (feature.is_included !== originalFeature.is_included) changes.is_included = feature.is_included;
        if (feature.is_bold !== originalFeature.is_bold) changes.is_bold = feature.is_bold;
        if (feature.order_index !== originalFeature.order_index) changes.order_index = feature.order_index;
        if (Object.keys(changes).length > 0) changeSet.featureChanges.push({ id: feature.id, changes });
      }

      await savePackage(packageId, changeSet);

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

      const data = await createFeature(packageId, maxOrderIndex + 1);

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
      await deleteFeatures([featureId]);

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
      await deleteFeatures(featureIds);

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