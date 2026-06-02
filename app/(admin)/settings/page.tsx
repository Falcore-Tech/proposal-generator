"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { brandButtonVariants } from "@/lib/design-system";
import { THEMES, DEFAULT_THEME_ID, type ThemeId } from "@/lib/proposal-themes";
import { ThemeOptionCard } from "./_components/ThemeOptionCard";

export default function SettingsPage() {
  const [savedTheme, setSavedTheme] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [selected, setSelected] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await axios.get("/api/settings");
        const theme = (data?.proposal_theme as ThemeId) ?? DEFAULT_THEME_ID;
        setSavedTheme(theme);
        setSelected(theme);
      } catch {
        setError("Failed to load settings. Has the database migration been applied?");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const dirty = selected !== savedTheme;

  async function save() {
    setSaving(true);
    setError(null);
    setJustSaved(false);
    try {
      const { data } = await axios.patch("/api/settings", { proposal_theme: selected });
      const theme = (data?.proposal_theme as ThemeId) ?? selected;
      setSavedTheme(theme);
      setSelected(theme);
      setJustSaved(true);
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-surface-primary min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-2">
          <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
          <p className="mt-1 text-sm text-text-muted max-w-2xl">
            Choose the default theme for proposal pages. Clients see this theme on every public
            proposal link. Individual proposals can override it.
          </p>
        </header>

        <section className="mt-8">
          <div className="border-b border-border-secondary pb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
              Proposal viewer theme
            </h2>
          </div>

          {loading ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {THEMES.map((t) => (
                <div
                  key={t.id}
                  className="h-[10.75rem] animate-pulse rounded-lg border border-border-primary bg-surface-secondary"
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {THEMES.map((t) => (
                <ThemeOptionCard
                  key={t.id}
                  id={t.id}
                  label={t.label}
                  className={t.className}
                  scheme={t.scheme}
                  selected={selected === t.id}
                  onSelect={setSelected}
                />
              ))}
            </div>
          )}
        </section>

        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving || loading}
            className={cn(brandButtonVariants({ variant: "default", size: "md" }))}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>

          {justSaved && !dirty && (
            <span className="inline-flex items-center gap-1 text-sm text-semantic-success">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
          {dirty && !saving && (
            <span className="text-sm text-text-muted">Unsaved changes</span>
          )}
          {error && <span className="text-sm text-semantic-error">{error}</span>}
        </div>
      </div>
    </div>
  );
}
