"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { WeddingCategory, ItemCondition } from "../../../../models/supabaseListing";

interface ListingCardProps {
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

// Helper function to get condition badge color
const getConditionBadgeColor = (condition?: ItemCondition): string => {
  if (!condition) return "bg-gray-100 text-gray-800";
  
  switch (condition) {
    case "new_with_tags":
      return "bg-green-100 text-green-800";
    case "new_without_tags":
      return "bg-green-50 text-green-700";
    case "like_new":
      return "bg-blue-50 text-blue-700";
    case "gently_used":
      return "bg-yellow-50 text-yellow-700";
    case "visible_wear":
      return "bg-orange-50 text-orange-700";
    default:
      return "bg-gray-100 text-gray-800";
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

// Helper function to get category badge color
const getCategoryBadgeColor = (category?: WeddingCategory): string => {
  if (!category) return "bg-gray-100 text-gray-800";
  
  switch (category) {
    case "dress":
      return "bg-pink-50 text-pink-700";
    case "decor":
      return "bg-purple-50 text-purple-700";
    case "accessories":
      return "bg-indigo-50 text-indigo-700";
    case "stationery":
      return "bg-blue-50 text-blue-700";
    case "gifts":
      return "bg-teal-50 text-teal-700";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to calculate discount percentage
const calculateDiscountPercentage = (price: number, originalRetailPrice?: number): number | null => {
  if (!originalRetailPrice || originalRetailPrice <= price) return null;
  return Math.round(((originalRetailPrice - price) / originalRetailPrice) * 100);
};

// Helper function to get primary measurement for preview
const getPrimaryMeasurement = (
  category?: WeddingCategory,
  measurements?: Record<string, { value: number; unit: string }>
): { label: string; value: number; unit: string } | null => {
  if (!category || !measurements || Object.keys(measurements).length === 0) return null;
  
  // Define primary measurement key by category
  let primaryKey: string;
  switch (category) {
    case "dress":
      primaryKey = "bust"; // Bust is usually the primary measurement for dresses
      break;
    case "decor":
      primaryKey = "length"; // Length for decor items
      break;
    case "accessories":
      primaryKey = "length"; // Length for accessories
      break;
    case "stationery":
      primaryKey = "width"; // Width for stationery
      break;
    default:
      // Get the first measurement if no specific one is defined
      primaryKey = Object.keys(measurements)[0];
  }
  
  // Return the primary measurement if it exists, otherwise the first one
  if (measurements[primaryKey]) {
    return {
      label: primaryKey.charAt(0).toUpperCase() + primaryKey.slice(1).replace(/_/g, " "),
      value: measurements[primaryKey].value,
      unit: measurements[primaryKey].unit
    };
  } else {
    const firstKey = Object.keys(measurements)[0];
    return {
      label: firstKey.charAt(0).toUpperCase() + firstKey.slice(1).replace(/_/g, " "),
      value: measurements[firstKey].value,
      unit: measurements[firstKey].unit
    };
  }
};

export default function ListingCard({
  id,
  title,
  description,
  price,
  originalRetailPrice,
  photos,
  category,
  condition,
  measurements,
  style,
  color,
}: ListingCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const discountPercentage = calculateDiscountPercentage(price, originalRetailPrice);
  const primaryMeasurement = getPrimaryMeasurement(category, measurements);
  
  // Truncate description to a reasonable length
  const truncatedDescription = description.length > 100
    ? `${description.substring(0, 100)}...`
    : description;
  
  // Handle image navigation
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };
  
  // Toggle saved state
  const toggleSaved = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  };
  
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      {/* Image Section with Navigation */}
      <div className="relative w-full h-64 bg-gray-200 group-hover:opacity-95">
        <Image
          src={photos[currentImageIndex].url}
          alt={photos[currentImageIndex].alt || title}
          layout="fill"
          objectFit="cover"
          className="transition-opacity duration-300"
        />
        
        {/* Image Navigation Buttons (only visible on hover) */}
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Save Button */}
        <button
          onClick={toggleSaved}
          className="absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label={isSaved ? "Remove from saved" : "Save listing"}
        >
          {isSaved ? (
            <BookmarkSolidIcon className="h-5 w-5 text-rose-600" aria-hidden="true" />
          ) : (
            <BookmarkIcon className="h-5 w-5 text-gray-700" aria-hidden="true" />
          )}
        </button>
        
        {/* Discount Badge */}
        {discountPercentage && (
          <div className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded">
            {discountPercentage}% OFF
          </div>
        )}
        
        {/* Image Counter */}
        {photos.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
            {currentImageIndex + 1}/{photos.length}
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Badges Row */}
        <div className="flex flex-wrap gap-2 mb-2">
          {category && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadgeColor(category)}`}>
              {formatCategory(category)}
            </span>
          )}
          {condition && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getConditionBadgeColor(condition)}`}>
              {formatCondition(condition)}
            </span>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 mb-1">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-xs text-gray-500 mb-2 flex-grow">
          {truncatedDescription}
        </p>
        
        {/* Measurements & Attributes */}
        <div className="mt-1 mb-2">
          {primaryMeasurement && (
            <div className="text-xs text-gray-600 mb-1">
              <span className="font-medium">{primaryMeasurement.label}:</span> {primaryMeasurement.value} {primaryMeasurement.unit}
            </div>
          )}
          
          {/* Style & Color Tags */}
          {(style?.length || color?.length) ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {style?.slice(0, 2).map((tag) => (
                <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                  {tag}
                </span>
              ))}
              {color?.slice(0, 2).map((tag) => (
                <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                  {tag}
                </span>
              ))}
              {(style?.length || 0) + (color?.length || 0) > 4 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                  +{(style?.length || 0) + (color?.length || 0) - 4} more
                </span>
              )}
            </div>
          ) : null}
        </div>
        
        {/* Price Section */}
        <div className="mt-auto">
          <div className="flex items-baseline">
            <p className="text-lg font-medium text-gray-900">
              ${price.toFixed(2)}
            </p>
            {originalRetailPrice && (
              <p className="ml-2 text-sm text-gray-500 line-through">
                ${originalRetailPrice.toFixed(2)}
              </p>
            )}
          </div>
          
          {/* View Details Link */}
          <Link href={`/listings/${id}`} passHref>
            <span className="mt-2 block text-sm font-medium text-rose-600 hover:text-rose-500">
              View details →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
