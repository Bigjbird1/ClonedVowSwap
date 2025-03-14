'use client';

import React, { useState } from 'react';
import { SupabaseListing } from '../../../../models/supabaseListing';
import SearchAndFilterContainer from '../../../Components/MainComponents/SearchAndFilter/SearchAndFilterContainer';
import ListingCard from '../../../Components/MainComponents/Listings/ListingCard';

interface SearchAndFilterExampleProps {
  initialListings: SupabaseListing[];
}

const SearchAndFilterExample: React.FC<SearchAndFilterExampleProps> = ({
  initialListings,
}) => {
  const [filteredListings, setFilteredListings] = useState<SupabaseListing[]>(initialListings);

  return (
    <div>
      <SearchAndFilterContainer
        initialListings={initialListings}
        onFilteredResults={setFilteredListings}
      >
        {/* The filtered results will be handled by the container component */}
      </SearchAndFilterContainer>

      {/* Display the filtered listings */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Results</h2>
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id || ''}
                title={listing.title}
                description={listing.description}
                price={listing.price}
                originalRetailPrice={listing.originalRetailPrice}
                photos={listing.photos}
                category={listing.category}
                condition={listing.condition}
                measurements={listing.measurements}
                style={listing.style}
                color={listing.color}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No listings found matching your criteria.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilterExample;
