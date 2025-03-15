import React, { useState } from 'react';
import { SupabaseListing } from '../../../../models/supabaseListing';
import { FilterState } from './SearchAndFilterContainer';
import CategoryFilter from './Filters/CategoryFilter';
import ConditionFilter from './Filters/ConditionFilter';
import PriceRangeFilter from './Filters/PriceRangeFilter';
import StyleFilter from './Filters/StyleFilter';
import ColorFilter from './Filters/ColorFilter';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { trackFilterRemove } from '../../../services/analyticsService';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filterUpdate: Partial<FilterState>) => void;
  onClearFilters: () => void;
  listings: SupabaseListing[];
  className?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  listings,
  className = '',
}) => {
  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    condition: true,
    price: true,
    style: true,
    color: true,
  });

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle removing a specific filter with analytics tracking
  const handleRemoveFilter = (filterType: string) => {
    switch (filterType) {
      case 'categories':
        trackFilterRemove('categories', JSON.stringify(filters.categories));
        onFilterChange({ categories: [] });
        break;
      case 'conditions':
        trackFilterRemove('conditions', JSON.stringify(filters.conditions));
        onFilterChange({ conditions: [] });
        break;
      case 'price':
        trackFilterRemove('priceRange', JSON.stringify(filters.priceRange));
        onFilterChange({ priceRange: { min: null, max: null } });
        break;
      case 'styles':
        trackFilterRemove('styles', filters.styles);
        onFilterChange({ styles: [] });
        break;
      case 'colors':
        trackFilterRemove('colors', filters.colors);
        onFilterChange({ colors: [] });
        break;
    }
  };

  // Count active filters
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.conditions.length > 0) count++;
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) count++;
    if (filters.styles.length > 0) count++;
    if (filters.colors.length > 0) count++;
    return count;
  };

  // Extract unique styles from listings
  const getUniqueStyles = (): string[] => {
    const stylesSet = new Set<string>();
    listings.forEach(listing => {
      if (listing.style) {
        listing.style.forEach(style => stylesSet.add(style));
      }
    });
    return Array.from(stylesSet).sort();
  };

  // Extract unique colors from listings
  const getUniqueColors = (): string[] => {
    const colorsSet = new Set<string>();
    listings.forEach(listing => {
      if (listing.color) {
        listing.color.forEach(color => colorsSet.add(color));
      }
    });
    return Array.from(colorsSet).sort();
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        {getActiveFilterCount() > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
            aria-label="Clear all filters"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Clear all
          </button>
        )}
      </div>

      {getActiveFilterCount() > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.categories.length > 0 && (
            <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full flex items-center">
              <span>Categories: {filters.categories.length}</span>
              <button 
                onClick={() => handleRemoveFilter('categories')}
                className="ml-1 text-indigo-600 hover:text-indigo-800"
                aria-label="Remove category filter"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.conditions.length > 0 && (
            <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full flex items-center">
              <span>Conditions: {filters.conditions.length}</span>
              <button 
                onClick={() => handleRemoveFilter('conditions')}
                className="ml-1 text-indigo-600 hover:text-indigo-800"
                aria-label="Remove condition filter"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}
          {(filters.priceRange.min !== null || filters.priceRange.max !== null) && (
            <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full flex items-center">
              <span>Price</span>
              <button 
                onClick={() => handleRemoveFilter('price')}
                className="ml-1 text-indigo-600 hover:text-indigo-800"
                aria-label="Remove price filter"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.styles.length > 0 && (
            <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full flex items-center">
              <span>Styles: {filters.styles.length}</span>
              <button 
                onClick={() => handleRemoveFilter('styles')}
                className="ml-1 text-indigo-600 hover:text-indigo-800"
                aria-label="Remove style filter"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.colors.length > 0 && (
            <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full flex items-center">
              <span>Colors: {filters.colors.length}</span>
              <button 
                onClick={() => handleRemoveFilter('colors')}
                className="ml-1 text-indigo-600 hover:text-indigo-800"
                aria-label="Remove color filter"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Category Filter Section */}
        <div className="border-b pb-3">
          <button
            className="flex justify-between items-center w-full text-left font-medium"
            onClick={() => toggleSection('category')}
            aria-expanded={expandedSections.category}
          >
            <span>Category</span>
            {expandedSections.category ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
          {expandedSections.category && (
            <div className="mt-2">
              <CategoryFilter
                selectedCategories={filters.categories}
                onChange={(categories) => onFilterChange({ categories })}
              />
            </div>
          )}
        </div>

        {/* Condition Filter Section */}
        <div className="border-b pb-3">
          <button
            className="flex justify-between items-center w-full text-left font-medium"
            onClick={() => toggleSection('condition')}
            aria-expanded={expandedSections.condition}
          >
            <span>Condition</span>
            {expandedSections.condition ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
          {expandedSections.condition && (
            <div className="mt-2">
              <ConditionFilter
                selectedConditions={filters.conditions}
                onChange={(conditions) => onFilterChange({ conditions })}
              />
            </div>
          )}
        </div>

        {/* Price Range Filter Section */}
        <div className="border-b pb-3">
          <button
            className="flex justify-between items-center w-full text-left font-medium"
            onClick={() => toggleSection('price')}
            aria-expanded={expandedSections.price}
          >
            <span>Price Range</span>
            {expandedSections.price ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
          {expandedSections.price && (
            <div className="mt-2">
              <PriceRangeFilter
                priceRange={filters.priceRange}
                onChange={(priceRange) => onFilterChange({ priceRange })}
              />
            </div>
          )}
        </div>

        {/* Style Filter Section */}
        <div className="border-b pb-3">
          <button
            className="flex justify-between items-center w-full text-left font-medium"
            onClick={() => toggleSection('style')}
            aria-expanded={expandedSections.style}
          >
            <span>Style</span>
            {expandedSections.style ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
          {expandedSections.style && (
            <div className="mt-2">
              <StyleFilter
                availableStyles={getUniqueStyles()}
                selectedStyles={filters.styles}
                onChange={(styles) => onFilterChange({ styles })}
              />
            </div>
          )}
        </div>

        {/* Color Filter Section */}
        <div className="border-b pb-3">
          <button
            className="flex justify-between items-center w-full text-left font-medium"
            onClick={() => toggleSection('color')}
            aria-expanded={expandedSections.color}
          >
            <span>Color</span>
            {expandedSections.color ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
          {expandedSections.color && (
            <div className="mt-2">
              <ColorFilter
                availableColors={getUniqueColors()}
                selectedColors={filters.colors}
                onChange={(colors) => onFilterChange({ colors })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
