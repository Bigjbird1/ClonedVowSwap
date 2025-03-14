"use client";

import { ItemCondition, WeddingCategory } from "../../../../models/supabaseListing";

interface WeddingDetailsCardProps {
  category?: WeddingCategory;
  condition?: ItemCondition;
  originalRetailPrice?: number;
  measurements?: Record<string, { value: number; unit: string }>;
  style?: string[];
  color?: string[];
}

// Helper function to format condition for display
const formatCondition = (condition?: ItemCondition): string => {
  if (!condition) return "Not specified";
  
  switch (condition) {
    case "new_with_tags":
      return "New with Tags";
    case "new_without_tags":
      return "New without Tags";
    case "like_new":
      return "Like New";
    case "gently_used":
      return "Gently Used";
    case "visible_wear":
      return "Visible Wear";
    default:
      return String(condition).replace(/_/g, " ");
  }
};

// Helper function to format category for display
const formatCategory = (category?: WeddingCategory): string => {
  if (!category) return "Not specified";
  
  switch (category) {
    case "dress":
      return "Wedding Dress";
    case "decor":
      return "Wedding Decor";
    case "accessories":
      return "Wedding Accessories";
    case "stationery":
      return "Wedding Stationery";
    case "gifts":
      return "Wedding Gifts";
    default:
      const categoryStr = String(category);
      return categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1);
  }
};

export default function WeddingDetailsCard({
  category,
  condition,
  originalRetailPrice,
  measurements,
  style,
  color,
}: WeddingDetailsCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Item Details</h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatCategory(category)}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Condition</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatCondition(condition)}</dd>
          </div>
          
          {originalRetailPrice && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Original Retail Price</dt>
              <dd className="mt-1 text-sm text-gray-900">${originalRetailPrice.toFixed(2)}</dd>
            </div>
          )}
          
          {color && color.length > 0 && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Color</dt>
              <dd className="mt-1 text-sm text-gray-900">{color.join(", ")}</dd>
            </div>
          )}
          
          {style && style.length > 0 && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Style</dt>
              <dd className="mt-1 text-sm text-gray-900">{style.join(", ")}</dd>
            </div>
          )}
          
          {measurements && Object.keys(measurements).length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Measurements</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {Object.entries(measurements).map(([key, { value, unit }]) => (
                    <li key={key} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="ml-2 flex-1 w-0 truncate capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {value} {unit}
                      </div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
