import React, { useState, useEffect } from 'react';
import { SupabaseListing, WeddingCategory, ItemCondition } from '../../../../models/supabaseListing';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import { getAllListingsWithSellers } from '../../../exampleData/weddingListings';

// Define the filter state interface
export interface FilterState {
  searchQuery: string;
  categories: WeddingCategory[];
  conditions: ItemCondition[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
  styles: string[];
  colors: string[];
}

// Define props for the SearchAndFilterContainer
interface SearchAndFilterContainerProps {
  initialListings?: SupabaseListing[];
  onFilteredResults?: (results: SupabaseListing[]) => void;
  className?: string;
}

const SearchAndFilterContainer: React.FC<SearchAndFilterContainerProps> = ({
  initialListings,
  onFilteredResults,
  className = '',
}) => {
  // State for listings and filtered results
  const [allListings, setAllListings] = useState<SupabaseListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<SupabaseListing[]>([]);
  
  // Initialize filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    categories: [],
    conditions: [],
    priceRange: {
      min: null,
      max: null,
    },
    styles: [],
    colors: [],
  });

  // Load initial listings
  useEffect(() => {
    if (initialListings) {
      setAllListings(initialListings);
      setFilteredListings(initialListings);
    } else {
      // Use example data if no listings provided
      const listings = getAllListingsWithSellers();
      setAllListings(listings);
      setFilteredListings(listings);
    }
  }, [initialListings]);

  // Apply filters whenever filter state changes
  useEffect(() => {
    const results = applyFilters(allListings, filters);
    setFilteredListings(results);
    
    // Notify parent component if callback provided
    if (onFilteredResults) {
      onFilteredResults(results);
    }
  }, [filters, allListings, onFilteredResults]);

  // Handle search query changes
  const handleSearchChange = (query: string) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: query,
    }));
  };

  // Handle filter changes
  const handleFilterChange = (filterUpdate: Partial<FilterState>) => {
    setFilters(prev => ({
      ...prev,
      ...filterUpdate,
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      categories: [],
      conditions: [],
      priceRange: {
        min: null,
        max: null,
      },
      styles: [],
      colors: [],
    });
  };

  // Apply all filters to the listings
  const applyFilters = (listings: SupabaseListing[], filters: FilterState): SupabaseListing[] => {
    return listings.filter(listing => {
      // Search query filter
      if (filters.searchQuery && !listing.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
          !listing.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && listing.category && 
          !filters.categories.includes(listing.category)) {
        return false;
      }

      // Condition filter
      if (filters.conditions.length > 0 && 
          !filters.conditions.includes(listing.condition)) {
        return false;
      }

      // Price range filter
      if (filters.priceRange.min !== null && listing.price < filters.priceRange.min) {
        return false;
      }
      if (filters.priceRange.max !== null && listing.price > filters.priceRange.max) {
        return false;
      }

      // Style filter
      if (filters.styles.length > 0 && listing.style &&
          !filters.styles.some(style => listing.style?.includes(style))) {
        return false;
      }

      // Color filter
      if (filters.colors.length > 0 && listing.color &&
          !filters.colors.some(color => listing.color?.includes(color))) {
        return false;
      }

      return true;
    });
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4">
        <SearchBar 
          onSearch={handleSearchChange} 
          initialValue={filters.searchQuery} 
        />
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/4">
          <FilterPanel 
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            listings={allListings}
          />
        </div>
        
        <div className="w-full md:w-3/4">
          <div className="mb-4 text-sm text-gray-500">
            {filteredListings.length} {filteredListings.length === 1 ? 'result' : 'results'} found
          </div>
          
          {/* Render children or filtered results */}
          {/* This will be implemented by the parent component */}
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilterContainer;
