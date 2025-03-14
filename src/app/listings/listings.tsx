"use client";

import { useState, useEffect } from "react";
import { Disclosure } from "@headlessui/react";
import MainLayout from "../SpeceficLayouts/MainLayout";
import Pagination from "./paginationComponent";
import ListingCard from "../../Components/MainComponents/Listings/ListingCard";
import { WeddingCategory, ItemCondition } from "../../../models/supabaseListing";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  originalRetailPrice?: number;
  photos: { url: string; alt?: string }[];
  category?: WeddingCategory;
  condition?: ItemCondition;
  measurements?: Record<string, { value: number; unit: string }>;
  style?: string[];
  color?: string[];
}

interface ListingsProps {
  listings: Listing[];
}

const priceOptions = [
  { value: "0-50", label: "$0 - $50" },
  { value: "51-100", label: "$51 - $100" },
  { value: "101-200", label: "$101 - $200" },
  { value: "201-500", label: "$201 - $500" },
  { value: "501-1000", label: "$501 - $1000" },
  { value: "1001+", label: "$1000+" },
];

const categoryOptions = [
  { value: "dress", label: "Wedding Dresses" },
  { value: "decor", label: "Decorations" },
  { value: "accessories", label: "Accessories" },
  { value: "stationery", label: "Stationery" },
  { value: "gifts", label: "Gifts" },
];

const conditionOptions = [
  { value: "new_with_tags", label: "New with Tags" },
  { value: "new_without_tags", label: "New without Tags" },
  { value: "like_new", label: "Like New" },
  { value: "gently_used", label: "Gently Used" },
  { value: "visible_wear", label: "Visible Wear" },
];

export default function Listings({ listings }: ListingsProps) {
  const [filteredProducts, setFilteredProducts] = useState<Listing[]>(listings);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  useEffect(() => {
    applyFilters();
  }, [selectedPriceRange, selectedCategories, selectedConditions]);

  const applyFilters = () => {
    let filtered = [...listings];
    
    // Apply price filter
    if (selectedPriceRange.length > 0) {
      filtered = filtered.filter((product) => {
        return selectedPriceRange.some((range) => {
          const [min, max] = range.split("-").map(Number);
          return product.price >= min && (max ? product.price <= max : true);
        });
      });
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => 
        selectedCategories.includes(product.category || '')
      );
    }
    
    // Apply condition filter
    if (selectedConditions.length > 0) {
      filtered = filtered.filter((product) => 
        selectedConditions.includes(product.condition || '')
      );
    }
    
    setFilteredProducts(filtered);
  };

  const handlePriceChange = (priceRange: string) => {
    setSelectedPriceRange((prevRanges) =>
      prevRanges.includes(priceRange)
        ? prevRanges.filter((range) => range !== priceRange)
        : [...prevRanges, priceRange]
    );
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((cat) => cat !== category)
        : [...prevCategories, category]
    );
  };
  
  const handleConditionChange = (condition: string) => {
    setSelectedConditions((prevConditions) =>
      prevConditions.includes(condition)
        ? prevConditions.filter((cond) => cond !== condition)
        : [...prevConditions, condition]
    );
  };

  return (
    <MainLayout>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-4 lg:gap-x-8 xl:grid-cols-5 lg:pl-4">
          {/* Filters */}
          <aside className="hidden lg:block lg:col-span-1 xl:col-span-1">
            <h2 className="sr-only">Filters</h2>
            <div className="space-y-10 divide-y divide-gray-200 p-4">
              <fieldset>
                <legend className="block text-sm font-medium text-gray-900">
                  Category
                </legend>
                <div className="space-y-3 pt-6">
                  {categoryOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        id={`category-${option.value}`}
                        name="category"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                        onChange={() => handleCategoryChange(option.value)}
                        checked={selectedCategories.includes(option.value)}
                      />
                      <label
                        htmlFor={`category-${option.value}`}
                        className="ml-3 text-sm text-gray-500"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>

              <fieldset className="pt-6">
                <legend className="block text-sm font-medium text-gray-900">
                  Price
                </legend>
                <div className="space-y-3 pt-6">
                  {priceOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        id={`price-${option.value}`}
                        name="price"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                        onChange={() => handlePriceChange(option.value)}
                        checked={selectedPriceRange.includes(option.value)}
                      />
                      <label
                        htmlFor={`price-${option.value}`}
                        className="ml-3 text-sm text-gray-500"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>

              <fieldset className="pt-6">
                <legend className="block text-sm font-medium text-gray-900">
                  Condition
                </legend>
                <div className="space-y-3 pt-6">
                  {conditionOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        id={`condition-${option.value}`}
                        name="condition"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                        onChange={() => handleConditionChange(option.value)}
                        checked={selectedConditions.includes(option.value)}
                      />
                      <label
                        htmlFor={`condition-${option.value}`}
                        className="ml-3 text-sm text-gray-500"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          </aside>

          {/* Mobile Filters */}
          <Disclosure as="div" className="lg:hidden">
            {({ open }) => (
              <>
                <Disclosure.Button className="px-4 py-2 w-full text-left text-sm font-medium text-gray-600 hover:text-gray-900">
                  {open ? "Hide" : "Show"} filters
                </Disclosure.Button>
                <Disclosure.Panel className="p-4">
                  <div className="space-y-6">
                    <fieldset>
                      <legend className="block text-sm font-medium text-gray-900">
                        Category
                      </legend>
                      <div className="space-y-3 pt-6">
                        {categoryOptions.map((option) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              id={`mobile-category-${option.value}`}
                              name="category"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                              onChange={() => handleCategoryChange(option.value)}
                              checked={selectedCategories.includes(option.value)}
                            />
                            <label
                              htmlFor={`mobile-category-${option.value}`}
                              className="ml-3 text-sm text-gray-500"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                    
                    <fieldset>
                      <legend className="block text-sm font-medium text-gray-900">
                        Price
                      </legend>
                      <div className="space-y-3 pt-6">
                        {priceOptions.map((option) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              id={`mobile-price-${option.value}`}
                              name="price"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                              onChange={() => handlePriceChange(option.value)}
                              checked={selectedPriceRange.includes(option.value)}
                            />
                            <label
                              htmlFor={`mobile-price-${option.value}`}
                              className="ml-3 text-sm text-gray-500"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                    
                    <fieldset>
                      <legend className="block text-sm font-medium text-gray-900">
                        Condition
                      </legend>
                      <div className="space-y-3 pt-6">
                        {conditionOptions.map((option) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              id={`mobile-condition-${option.value}`}
                              name="condition"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                              onChange={() => handleConditionChange(option.value)}
                              checked={selectedConditions.includes(option.value)}
                            />
                            <label
                              htmlFor={`mobile-condition-${option.value}`}
                              className="ml-3 text-sm text-gray-500"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>

          {/* Product Listings */}
          <main className="lg:col-span-3 xl:col-span-4 px-4 md:px-6 lg:px-8">
            <div className="mt-6 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-3 mb-8">
              {filteredProducts.map((product) => (
                <ListingCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  description={product.description}
                  price={product.price}
                  originalRetailPrice={product.originalRetailPrice}
                  photos={product.photos}
                  category={product.category}
                  condition={product.condition}
                  measurements={product.measurements}
                  style={product.style}
                  color={product.color}
                />
              ))}
            </div>
            <Pagination
              currentPage={1}
              totalPages={1}
              handlePageChange={() => {}}
            />
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
