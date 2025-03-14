"use client";

import { useState } from "react";
import MainLayout from "../../SpeceficLayouts/MainLayout";
import ListingCard from "../../../Components/MainComponents/Listings/ListingCard";
import ListingDetailView from "../../../Components/MainComponents/Listings/ListingDetailView";
import { weddingListings, sellerData } from "../../../exampleData/weddingListings";

export default function WeddingListingsExample() {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  
  // Get the selected listing with seller data
  const getSelectedListing = () => {
    if (!selectedListingId) return null;
    
    const listing = weddingListings.find((l) => l.id === selectedListingId);
    if (!listing) return null;
    
    return {
      ...listing,
      seller: sellerData[listing.sellerId],
    };
  };
  
  const selectedListing = getSelectedListing();
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Wedding Listings Example</h1>
          
          {selectedListing ? (
            <div>
              <button
                onClick={() => setSelectedListingId(null)}
                className="mb-6 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to listings
              </button>
              
              <ListingDetailView
                id={selectedListing.id || ""}
                title={selectedListing.title}
                description={selectedListing.description}
                price={selectedListing.price}
                originalRetailPrice={selectedListing.originalRetailPrice}
                photos={selectedListing.photos}
                category={selectedListing.category}
                condition={selectedListing.condition}
                measurements={selectedListing.measurements}
                style={selectedListing.style}
                color={selectedListing.color}
                shippingOptions={selectedListing.shippingOptions}
                seller={selectedListing.seller}
              />
            </div>
          ) : (
            <div>
              <p className="text-lg text-gray-500 mb-8">
                This example demonstrates the wedding-specific listing components. Click on a listing to view its details.
              </p>
              
              <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3">
                {weddingListings.map((listing) => (
                  <div key={listing.id || ""} onClick={() => setSelectedListingId(listing.id || "")} className="cursor-pointer">
                    <ListingCard
                      id={listing.id || ""}
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
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Component Documentation</h2>
            <p className="text-sm text-gray-500 mb-4">
              These components are designed to display wedding-specific attributes in a user-friendly way.
              For more information, see the documentation in <code>/docs/ListingDisplayComponents.md</code>.
            </p>
            
            <h3 className="text-md font-medium text-gray-900 mt-4 mb-2">Features</h3>
            <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
              <li>Category and condition badges with tooltips</li>
              <li>Style and color tags</li>
              <li>Measurement display with unit conversion</li>
              <li>Original retail price comparison with discount calculation</li>
              <li>Image gallery with navigation</li>
              <li>Shipping options selection</li>
              <li>Seller information</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
