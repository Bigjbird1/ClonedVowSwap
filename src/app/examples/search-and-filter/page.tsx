import React from 'react';
import { weddingListings } from '../../../exampleData/weddingListings';
import SearchAndFilterExample from './SearchAndFilterExample';

export const metadata = {
  title: 'VowSwap - Search and Filter Example',
  description: 'Example of the search and filter functionality for wedding items',
};

export default function SearchAndFilterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search and Filter Wedding Items</h1>
      <p className="text-gray-600 mb-8">
        This example demonstrates the search and filter functionality for wedding items on the VowSwap marketplace.
        Users can search by keywords and filter by category, condition, price range, style, and color.
      </p>
      
      <SearchAndFilterExample initialListings={weddingListings} />
    </div>
  );
}
