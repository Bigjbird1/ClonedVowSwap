"use client";

import { WeddingCategory, ItemCondition } from "../../../../models/supabaseListing";

interface WeddingAttributeBadgesProps {
  category?: WeddingCategory;
  condition?: ItemCondition;
  style?: string[];
  color?: string[];
  size?: "sm" | "md" | "lg";
  showTooltips?: boolean;
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

// Helper function to get condition description
const getConditionDescription = (condition?: ItemCondition): string => {
  if (!condition) return "";
  
  switch (condition) {
    case "new_with_tags":
      return "Brand new item with original tags still attached";
    case "new_without_tags":
      return "Brand new item but tags have been removed";
    case "like_new":
      return "Used once or twice, in excellent condition with no visible flaws";
    case "gently_used":
      return "Used but well-maintained with minimal signs of wear";
    case "visible_wear":
      return "Shows some signs of use but still in good, functional condition";
    default:
      return "";
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

// Helper function to get category description
const getCategoryDescription = (category?: WeddingCategory): string => {
  if (!category) return "";
  
  switch (category) {
    case "dress":
      return "Wedding dresses, veils, and bridal attire";
    case "decor":
      return "Centerpieces, table settings, backdrops, and decorative items";
    case "accessories":
      return "Jewelry, shoes, headpieces, and other bridal accessories";
    case "stationery":
      return "Invitations, save-the-dates, place cards, and other paper goods";
    case "gifts":
      return "Wedding favors, bridesmaid/groomsmen gifts, and other keepsakes";
    default:
      return "";
  }
};

export default function WeddingAttributeBadges({
  category,
  condition,
  style,
  color,
  size = "md",
  showTooltips = false,
}: WeddingAttributeBadgesProps) {
  // Determine size classes
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-0.5 text-sm",
    lg: "px-2.5 py-1 text-sm",
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      {/* Category Badge */}
      {category && (
        <div className="relative group">
          <span 
            className={`inline-flex items-center rounded font-medium ${sizeClasses[size]} ${getCategoryBadgeColor(category)}`}
          >
            {formatCategory(category)}
          </span>
          
          {/* Tooltip */}
          {showTooltips && (
            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              {getCategoryDescription(category)}
            </div>
          )}
        </div>
      )}
      
      {/* Condition Badge */}
      {condition && (
        <div className="relative group">
          <span 
            className={`inline-flex items-center rounded font-medium ${sizeClasses[size]} ${getConditionBadgeColor(condition)}`}
          >
            {formatCondition(condition)}
          </span>
          
          {/* Tooltip */}
          {showTooltips && (
            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              {getConditionDescription(condition)}
            </div>
          )}
        </div>
      )}
      
      {/* Style Tags */}
      {style && style.length > 0 && style.slice(0, 3).map((tag) => (
        <span 
          key={`style-${tag}`}
          className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} bg-gray-100 text-gray-800`}
        >
          {tag}
        </span>
      ))}
      
      {/* Color Tags */}
      {color && color.length > 0 && color.slice(0, 3).map((tag) => (
        <span 
          key={`color-${tag}`}
          className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} bg-gray-100 text-gray-800`}
        >
          {tag}
        </span>
      ))}
      
      {/* More indicator */}
      {((style?.length || 0) + (color?.length || 0) > 6) && (
        <span 
          className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} bg-gray-100 text-gray-800`}
        >
          +{(style?.length || 0) + (color?.length || 0) - 6} more
        </span>
      )}
    </div>
  );
}
