"use client";
import React from "react";
import MainLayout from "../../SpeceficLayouts/MainLayout";
import ListingDetailView from "../../../Components/MainComponents/Listings/ListingDetailView";
import { ItemCondition, WeddingCategory } from "../../../../models/supabaseListing";

interface ListingData {
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
  shippingOptions?: {
    id?: string;
    name: string;
    price: number;
    estimatedDays: [number, number]; // [min, max]
  }[];
  seller: {
    id: string;
    imageUrl: string;
    name: string;
    location: string;
    rating?: number;
  };
}

interface SpecificListingProps {
  listingData: ListingData;
}

export default function SpecificListing({ listingData }: SpecificListingProps) {
  return (
    <MainLayout>
      <ListingDetailView
        id={listingData.id || ""}
        title={listingData.title}
        description={listingData.description}
        price={listingData.price}
        originalRetailPrice={listingData.originalRetailPrice}
        photos={listingData.photos}
        category={listingData.category}
        condition={listingData.condition}
        measurements={listingData.measurements}
        style={listingData.style}
        color={listingData.color}
        shippingOptions={listingData.shippingOptions}
        seller={listingData.seller}
      />
    </MainLayout>
  );
}
