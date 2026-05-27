"use client";

import React from "react";
import PackageCard from "./PackageCard";
import { Card } from "../ui/design-card";
import { CURRENCIES, CurrencyOption } from "@/lib/useCurrencyRates";

interface Package {
  id: string;
  name: string;
  price: number;
  currency: string;
  usd_price: number;
  is_popular?: boolean;
  description: string;
  features: any[];
}

interface PackageSelectionProps {
  packages: Package[];
  selectedPackageId: string | null;
  setSelectedPackageId: (id: string) => void;
  includePackage: boolean;
  setIncludePackage: (include: boolean) => void;
  selectedCurrency: CurrencyOption;
  setSelectedCurrency: (c: CurrencyOption) => void;
}

const PackageSelection: React.FC<PackageSelectionProps> = ({
  packages,
  selectedPackageId,
  setSelectedPackageId,
  includePackage,
  setIncludePackage,
  selectedCurrency,
  setSelectedCurrency,
}) => {
  return (
    <Card className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-text-primary">Select Package</h2>
        <div className="flex items-center gap-4">
          <div className="inline-flex rounded-md border border-surface-interactive overflow-hidden">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setSelectedCurrency(c)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedCurrency.code === c.code
                    ? 'bg-brand-primary text-white'
                    : 'bg-transparent text-text-secondary hover:bg-surface-interactive'
                }`}
              >
                {c.code}
              </button>
            ))}
          </div>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={includePackage}
              onChange={() => setIncludePackage(!includePackage)}
              className="sr-only"
            />
            <div
              className={`relative w-10 h-5 rounded-full transition-colors ${includePackage ? "bg-brand-primary" : "bg-surface-interactive"}`}
            >
              <div
                className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${includePackage ? "translate-x-5" : ""}`}
              />
            </div>
            <span className="ml-2 text-sm text-text-secondary">Include Package</span>
          </label>
        </div>
      </div>

      {includePackage && packages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              isSelected={selectedPackageId === pkg.id}
              onSelect={setSelectedPackageId}
            />
          ))}
        </div>
      )}

      {includePackage && packages.length === 0 && (
        <div className="bg-surface-secondary p-6 rounded-lg text-center">
          <p className="text-text-muted">
            No packages yet. Create one in <strong>Admin → Packages</strong>.
          </p>
        </div>
      )}

      {!includePackage && (
        <div className="bg-surface-secondary p-6 rounded-lg text-center">
          <p className="text-text-muted">Package selection is disabled.</p>
        </div>
      )}
    </Card>
  );
};

export default PackageSelection;
