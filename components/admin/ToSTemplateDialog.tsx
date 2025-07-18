"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ToSTemplate, ToSTerm } from "@/types/tos";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ToSTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  template: ToSTemplate | null;
}

// Sortable Term Component
interface SortableTermProps {
  term: ToSTerm;
  index: number;
  onUpdate: (index: number, field: keyof ToSTerm, value: string | number) => void;
  onRemove: (index: number) => void;
}

function SortableTerm({ term, index, onUpdate, onRemove }: SortableTermProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: term.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4">
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded mt-2"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex-1 space-y-3">
          <Input
            value={term.title}
            onChange={(e) => onUpdate(index, "title", e.target.value)}
            placeholder={`Term ${index + 1} Title (e.g., Payment Terms)`}
          />
          <Textarea
            value={term.content}
            onChange={(e) => onUpdate(index, "content", e.target.value)}
            placeholder="Term content..."
            rows={3}
          />
        </div>

        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

export default function ToSTemplateDialog({ open, onClose, template }: ToSTemplateDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    payment_type: "full" as "full" | "split" | "custom",
    is_active: true,
    terms: [] as ToSTerm[],
  });
  const [loading, setLoading] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || "",
        payment_type: template.payment_type || "full",
        is_active: template.is_active,
        terms: template.terms || [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        payment_type: "full",
        is_active: true,
        terms: [],
      });
    }
  }, [template]);

  const handleSubmit = async () => {
    if (!formData.name || formData.terms.length === 0) {
      toast.error("Name and at least one term are required");
      return;
    }

    setLoading(true);
    try {
      const url = template?.id
        ? `/api/admin/tos-templates/${template.id}`
        : "/api/admin/tos-templates";
      const method = template?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save template");
      }

      toast.success(`Template ${template?.id ? "updated" : "created"} successfully`);
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = formData.terms.findIndex(term => term.id.toString() === active.id);
      const newIndex = formData.terms.findIndex(term => term.id.toString() === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTerms = [...formData.terms];
        const [movedTerm] = newTerms.splice(oldIndex, 1);
        newTerms.splice(newIndex, 0, movedTerm);
        
        // Update order numbers
        const reorderedTerms = newTerms.map((term, index) => ({
          ...term,
          order: index + 1,
        }));
        
        setFormData({ ...formData, terms: reorderedTerms });
      }
    }
  };

  const addTerm = () => {
    const newTerm: ToSTerm = {
      id: Date.now(),
      title: "",
      content: "",
      order: formData.terms.length + 1,
    };
    setFormData({ ...formData, terms: [...formData.terms, newTerm] });
  };

  const updateTerm = (index: number, field: keyof ToSTerm, value: string | number) => {
    const updatedTerms = [...formData.terms];
    updatedTerms[index] = { ...updatedTerms[index], [field]: value };
    setFormData({ ...formData, terms: updatedTerms });
  };

  const removeTerm = (index: number) => {
    const updatedTerms = formData.terms.filter((_, i) => i !== index);
    // Reorder remaining terms
    updatedTerms.forEach((term, i) => {
      term.order = i + 1;
    });
    setFormData({ ...formData, terms: updatedTerms });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template?.id ? "Edit" : "Create"} ToS Template
          </DialogTitle>
          <DialogDescription>
            Create a template for terms and conditions that can be assigned to packages
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard Full Payment"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this template"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment_type">Payment Type</Label>
                <Select
                  value={formData.payment_type}
                  onValueChange={(value) => setFormData({ ...formData, payment_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Payment</SelectItem>
                    <SelectItem value="split">Split Payment</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Terms</Label>
              <Button type="button" onClick={addTerm} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Term
              </Button>
            </div>

            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={formData.terms.map(term => term.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {formData.terms.map((term, index) => (
                    <SortableTerm
                      key={term.id}
                      term={term}
                      index={index}
                      onUpdate={updateTerm}
                      onRemove={removeTerm}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {formData.terms.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No terms added yet. Click "Add Term" to get started.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : template?.id ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}