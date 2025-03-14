"use client";

import { WeddingCategory } from "../../../../models/supabaseListing";

interface CategorySelectProps {
  value: WeddingCategory | undefined;
  onChange: (value: WeddingCategory) => void;
  error?: string;
}

// Category descriptions for help text
const categoryDescriptions: Record<WeddingCategory, string> = {
  dress: "Wedding dresses, veils, and bridal attire",
  decor: "Centerpieces, table settings, backdrops, and decorative items",
  accessories: "Jewelry, shoes, headpieces, and other bridal accessories",
  stationery: "Invitations, save-the-dates, place cards, and other paper goods",
  gifts: "Wedding favors, bridesmaid/groomsmen gifts, and other keepsakes",
};

export default function CategorySelect({
  value,
  onChange,
  error,
}: CategorySelectProps) {
  return (
    <div>
      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
        Category <span className="text-red-500">*</span>
      </label>
      <select
        id="category"
        name="category"
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
          error ? "border-red-300 text-red-900 placeholder-red-300" : ""
        }`}
        value={value || ""}
        onChange={(e) => onChange(e.target.value as WeddingCategory)}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? "category-error" : undefined}
      >
        <option value="" disabled>
          Select a category
        </option>
        <option value="dress">Wedding Dress</option>
        <option value="decor">Wedding Decor</option>
        <option value="accessories">Wedding Accessories</option>
        <option value="stationery">Wedding Stationery</option>
        <option value="gifts">Wedding Gifts</option>
      </select>
      
      {error ? (
        <p className="mt-2 text-sm text-red-600" id="category-error">
          {error}
        </p>
      ) : value ? (
        <p className="mt-2 text-sm text-gray-500">
          {categoryDescriptions[value]}
        </p>
      ) : null}
    </div>
  );
}
