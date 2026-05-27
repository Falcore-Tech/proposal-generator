import React, { useState } from "react";
import {
  calculateDiscountedPrice,
  formatPrice,
  parsePrice,
  Discount,
} from "@/lib/proposalUtils";
import { HeroMedia } from "@/components/ui/brand/HeroMedia";
import { CurrencyState } from "@/lib/useCurrencyRates";

interface PackageDisplayProps {
  selectedPackageIndex?: number | null;
  selectedPackage?: any;
  discount: Discount;
  onDiscountChange: (value: number, type: "percentage" | "absolute") => void;
  includePackage?: boolean;
  currencyState?: CurrencyState;
}

const PackageDisplay: React.FC<PackageDisplayProps> = ({
  selectedPackageIndex,
  selectedPackage,
  discount,
  onDiscountChange,
  includePackage = true,
  currencyState,
}) => {
  const [showAllPackages, setShowAllPackages] = useState(false);

  if (!includePackage || (!selectedPackage && selectedPackageIndex === null)) {
    return null;
  }

  if (selectedPackage) {
    const originalPrice = parsePrice(selectedPackage.price);
    const discountedPrice = calculateDiscountedPrice(originalPrice, discount);

    return (
      <div className="mb-8 rounded-lg p-6 shadow-lg bg-(--card)">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-(--primary)">Selected Package</h2>
          <button
            onClick={() => setShowAllPackages(!showAllPackages)}
            className="text-sm px-3 py-1 rounded transition-colors bg-(--muted) hover:bg-(--border) text-(--muted-foreground)"
          >
            {showAllPackages ? "Hide Details" : "Show Details"}
          </button>
        </div>

        {selectedPackage.hero_media_url && selectedPackage.hero_media_type && (
          <div className="rounded-lg overflow-hidden mb-4 aspect-video">
            <HeroMedia
              url={selectedPackage.hero_media_url}
              type={selectedPackage.hero_media_type}
              alt={selectedPackage.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="bg-(--background) p-6 rounded-lg mb-6">
          <div className="flex flex-wrap justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold">
                {selectedPackage.name} Package
              </h3>
              {selectedPackage.is_popular && (
                <div className="inline-block text-xs font-medium px-2 py-1 rounded mt-1 bg-(--primary)/20 text-(--primary)">
                  Most Popular
                </div>
              )}
              <p className="mt-2 max-w-xl text-(--muted-foreground)">
                {selectedPackage.description}
              </p>
            </div>
            <div className="text-right mt-2 md:mt-0">
              {discount.value > 0 && (
                <div className="text-lg line-through text-zinc-500">
                  {currencyState ? currencyState.convert(originalPrice) : formatPrice(originalPrice)}{" "}
                  {currencyState?.selected.code ?? selectedPackage.currency}
                </div>
              )}
              <div className="text-2xl font-bold flex items-center justify-end">
                {currencyState ? currencyState.convert(discountedPrice) : formatPrice(discountedPrice)}{" "}
                {currencyState?.selected.code ?? selectedPackage.currency}
                {discount.value > 0 && (
                  <span className="ml-2 text-sm font-normal bg-green-900/30 text-green-400 px-2 py-1 rounded">
                    {discount.type === "percentage"
                      ? `${discount.value}% OFF`
                      : `-${currencyState ? currencyState.convert(discount.value) : formatPrice(discount.value)} ${currencyState?.selected.code ?? selectedPackage.currency}`}
                  </span>
                )}
              </div>
              {selectedPackage.usd_price && (!currencyState || currencyState.selected.code === "AED") && (
                <div className="text-sm text-zinc-400">
                  ${formatPrice(selectedPackage.usd_price)} USD
                </div>
              )}
            </div>
          </div>

          {showAllPackages && (
            <div className="mt-6">
              {selectedPackage.features && Array.isArray(selectedPackage.features) && selectedPackage.features.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPackage.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-(--primary)"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className={typeof feature === 'string' ? '' : (feature.is_bold ? "font-medium" : "")}>
                        {typeof feature === 'string' ? feature : feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 rounded text-(--muted-foreground) bg-(--muted)">
                  No additional details available for this package.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-lg p-6 shadow-lg bg-(--card)">
      <h2 className="text-xl font-bold mb-4 text-(--primary)">Selected Package</h2>
      <div className="bg-(--background) p-5 rounded-lg">
        <div className="text-center py-4 text-(--muted-foreground)">
          Package information is not stored in this proposal&apos;s format.
        </div>
      </div>
    </div>
  );
};

export default PackageDisplay;
