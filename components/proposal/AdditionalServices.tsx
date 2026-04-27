import React, { useState } from "react";
import {
  calculateDiscountedPrice,
  formatPrice,
  parsePrice,
  Discount,
} from "@/lib/proposalUtils";

interface Service {
  id: string | number;
  name: string;
  price: string | number;
  currency?: string;
  description?: string;
  monthly?: boolean;
  is_monthly?: boolean;
  setupFee?: number;
  setup_fee?: number;
}

interface AdditionalServicesProps {
  selectedServices: Service[];
  discounts: Record<string | number, Discount>;
  onDiscountChange: (
    id: string | number,
    value: number,
    type: "percentage" | "absolute",
  ) => void;
  isXmaMedia?: boolean;
}

const AdditionalServices: React.FC<AdditionalServicesProps> = ({
  selectedServices,
  discounts,
  onDiscountChange,
  isXmaMedia = false,
}) => {
  const [expandedService, setExpandedService] = useState<
    string | number | null
  >(null);

  const toggleExpand = (id: string | number) => {
    setExpandedService(expandedService === id ? null : id);
  };

  // Make sure selected services is an array
  if (!Array.isArray(selectedServices) || selectedServices.length === 0) {
    return null;
  }

  const cardBg = isXmaMedia ? "bg-(--card)" : "bg-zinc-800";

  return (
    <div className={`mb-8 rounded-lg p-6 shadow-lg ${cardBg}`}>
      <h2 className={`text-xl font-bold mb-4 ${isXmaMedia ? 'text-(--primary)' : 'text-red-500'}`}>
        Additional Services
      </h2>
      <div className="space-y-4">
        {selectedServices.map((service) => {
          if (!service || typeof service.id === "undefined") return null;

          const isExpanded = expandedService === service.id;
          const serviceDiscount = discounts[service.id] || {
            type: "percentage",
            value: 0,
          };
          const originalPrice = parsePrice(service.price);
          const discountedPrice = calculateDiscountedPrice(
            originalPrice,
            serviceDiscount,
          );
          const currency = service.currency || "AED";

          return (
            <div key={service.id} className={`p-5 rounded-lg ${isXmaMedia ? 'bg-(--background)' : 'bg-zinc-900'}`}>
              <div className="flex flex-wrap justify-between items-start">
                <div className="flex-grow">
                  <div className="flex items-center">
                    <h3 className="font-medium text-lg">{service.name}</h3>
                    <button
                      onClick={() => toggleExpand(service.id)}
                      className="ml-2 text-zinc-400 hover:text-white transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        {isExpanded ? (
                          <path
                            fillRule="evenodd"
                            d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        ) : (
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                  {!isExpanded && service.description && (
                    <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                </div>
                <div className="text-right mt-2 md:mt-0 min-w-max">
                  {serviceDiscount.value > 0 && (
                    <div className="text-base line-through text-zinc-500">
                      {formatPrice(originalPrice)} {currency}
                    </div>
                  )}
                  <div className="text-xl font-bold flex items-center justify-end">
                    {formatPrice(discountedPrice)} {currency}
                    {serviceDiscount.value > 0 && (
                      <span className="ml-2 text-xs font-normal bg-green-900/30 text-green-400 px-2 py-0.5 rounded">
                        {serviceDiscount.type === "percentage"
                          ? `${serviceDiscount.value}% OFF`
                          : `-${formatPrice(serviceDiscount.value)} ${currency}`}
                      </span>
                    )}
                  </div>
                  {(service.monthly || service.is_monthly) && (
                    <div className="text-sm text-zinc-400">
                      +{formatPrice(service.setupFee || service.setup_fee || 0)}{" "}
                      {currency}/month
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded description */}
              {isExpanded && service.description && (
                <div className="mt-3 border-t border-zinc-800 pt-3">
                  <p className="text-zinc-300">{service.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdditionalServices;
