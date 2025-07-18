"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ToSTemplate, ToSTerm } from "@/types/tos";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";

interface ToSSelectionProps {
  selectedPackageId: string | null;
  selectedToS: "standard" | "custom" | string;
  setSelectedToS: (value: "standard" | "custom" | string) => void;
  customTerms: string[];
  setCustomTerms: (terms: string[]) => void;
}

export default function ToSSelection({
  selectedPackageId,
  selectedToS,
  setSelectedToS,
  customTerms,
  setCustomTerms,
}: ToSSelectionProps) {
  const [tosTemplates, setTosTemplates] = useState<ToSTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ToSTemplate | null>(null);
  const [newTerm, setNewTerm] = useState("");

  // Fetch ToS templates when component mounts or package changes
  useEffect(() => {
    if (selectedPackageId) {
      fetchToSTemplates();
    }
  }, [selectedPackageId]);

  const fetchToSTemplates = async () => {
    try {
      setLoading(true);
      // For now, get all templates since we don't have package-ToS mapping implemented yet
      const response = await fetch("/api/admin/tos-templates");
      if (!response.ok) throw new Error("Failed to fetch ToS templates");
      
      const data = await response.json();
      setTosTemplates(data.templates.filter((t: ToSTemplate) => t.is_active));
      
      // Set default selection if none selected
      if (!selectedToS && data.templates.length > 0) {
        setSelectedToS(data.templates[0].id);
      }
    } catch (error) {
      console.error("Error fetching ToS templates:", error);
      toast.error("Failed to load terms and conditions");
    } finally {
      setLoading(false);
    }
  };

  const handleToSChange = (value: string) => {
    setSelectedToS(value);
    
    if (value === "custom") {
      setSelectedTemplate(null);
    } else {
      const template = tosTemplates.find(t => t.id === value);
      setSelectedTemplate(template || null);
    }
  };

  const addCustomTerm = () => {
    if (newTerm.trim()) {
      setCustomTerms([...customTerms, newTerm.trim()]);
      setNewTerm("");
    }
  };

  const removeCustomTerm = (index: number) => {
    setCustomTerms(customTerms.filter((_, i) => i !== index));
  };

  const updateCustomTerm = (index: number, value: string) => {
    const updatedTerms = [...customTerms];
    updatedTerms[index] = value;
    setCustomTerms(updatedTerms);
  };

  const formatTermsForDisplay = (terms: ToSTerm[] | string[]) => {
    if (!terms || terms.length === 0) return [];
    
    // Handle new ToSTerm format
    if (typeof terms[0] === 'object' && 'title' in terms[0]) {
      return (terms as ToSTerm[])
        .sort((a, b) => a.order - b.order)
        .map(term => `${term.title}: ${term.content}`);
    }
    
    // Handle legacy string format
    return terms as string[];
  };

  return (
    <Card className="bg-surface-secondary border-border-primary mb-8">
      <CardHeader>
        <CardTitle className="text-text-primary">Terms & Conditions</CardTitle>
        <CardDescription className="text-text-secondary">
          Select the terms and conditions for this proposal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
          </div>
        ) : (
          <>
            {/* ToS Selection */}
            <div className="space-y-2">
              <Label htmlFor="tos-selection">Select Terms & Conditions</Label>
              <Select value={selectedToS} onValueChange={handleToSChange}>
                <SelectTrigger className="bg-surface-elevated border-border-primary">
                  <SelectValue placeholder="Choose terms and conditions" />
                </SelectTrigger>
                <SelectContent>
                  {tosTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{template.name}</span>
                        {template.payment_type && (
                          <span className="ml-2 text-xs bg-surface-interactive px-2 py-1 rounded">
                            {template.payment_type}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Terms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview Toggle */}
            {selectedToS && selectedToS !== "custom" && selectedTemplate && (
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="bg-surface-elevated border-border-primary hover:bg-surface-interactive"
                >
                  {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {showPreview ? "Hide" : "Preview"} Terms
                </Button>
                <span className="text-sm text-text-secondary">
                  {selectedTemplate.terms.length} terms
                </span>
              </div>
            )}

            {/* Terms Preview */}
            {showPreview && selectedTemplate && (
              <div className="bg-surface-elevated border border-border-primary rounded-lg p-4 max-h-60 overflow-y-auto">
                <h4 className="font-medium text-text-primary mb-3">
                  {selectedTemplate.name}
                </h4>
                <div className="space-y-2">
                  {formatTermsForDisplay(selectedTemplate.terms).map((term, index) => (
                    <div key={index} className="text-sm text-text-secondary">
                      <span className="font-medium">{index + 1}.</span> {term}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Terms Editor */}
            {selectedToS === "custom" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Custom Terms</Label>
                  <span className="text-sm text-text-secondary">
                    {customTerms.length} terms
                  </span>
                </div>
                
                {/* Add New Term */}
                <div className="flex gap-2">
                  <Input
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    placeholder={`${customTerms.length + 1}. Enter term or condition`}
                    className="bg-surface-elevated border-border-primary"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomTerm()}
                  />
                  <Button
                    type="button"
                    onClick={addCustomTerm}
                    size="sm"
                    className="bg-brand-primary hover:bg-interactive-primary-hover"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Custom Terms List */}
                {customTerms.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {customTerms.map((term, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm text-text-secondary font-medium min-w-6">
                          {index + 1}.
                        </span>
                        <Textarea
                          value={term}
                          onChange={(e) => updateCustomTerm(index, e.target.value)}
                          className="flex-1 bg-surface-elevated border-border-primary text-sm"
                          rows={2}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCustomTerm(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {customTerms.length === 0 && (
                  <div className="text-center py-4 text-text-secondary">
                    No custom terms added yet. Add your first term above.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
