export const KNOWN_ICON_KEYS = new Set([
  "time_loss", "money_bleed", "inefficiency", "manual_ops", "low_conversion",
  "lead_leakage", "growth", "automation", "speed", "personalization",
  "revenue", "visibility", "strategy", "integration", "analytics",
]);

export const ICON_KEY_OPTIONS = [
  { value: "time_loss", label: "Time Loss" },
  { value: "money_bleed", label: "Money Bleed" },
  { value: "inefficiency", label: "Inefficiency" },
  { value: "manual_ops", label: "Manual Ops" },
  { value: "low_conversion", label: "Low Conversion" },
  { value: "lead_leakage", label: "Lead Leakage" },
  { value: "growth", label: "Growth" },
  { value: "automation", label: "Automation" },
  { value: "speed", label: "Speed" },
  { value: "personalization", label: "Personalization" },
  { value: "revenue", label: "Revenue" },
  { value: "visibility", label: "Visibility" },
  { value: "strategy", label: "Strategy" },
  { value: "integration", label: "Integration" },
  { value: "analytics", label: "Analytics" },
] as const;
