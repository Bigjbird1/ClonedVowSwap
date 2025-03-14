"use client";

import { useState } from "react";
import { WeddingCategory } from "../../../../models/supabaseListing";

interface StyleAndColorInputsProps {
  style: string[];
  onStyleChange: (style: string[]) => void;
  color: string[];
  onColorChange: (color: string[]) => void;
  category?: WeddingCategory;
}

// Predefined style suggestions by category
const styleSuggestionsByCategory: Record<WeddingCategory, string[]> = {
  dress: [
    "A-line",
    "Ball Gown",
    "Mermaid",
    "Sheath",
    "Empire",
    "Trumpet",
    "Tea Length",
    "Boho",
    "Vintage",
    "Modern",
    "Lace",
    "Beaded",
    "Minimalist",
    "Princess",
    "Romantic",
  ],
  decor: [
    "Rustic",
    "Elegant",
    "Bohemian",
    "Vintage",
    "Modern",
    "Minimalist",
    "Glamorous",
    "Beach",
    "Garden",
    "Industrial",
    "Traditional",
    "Whimsical",
    "Romantic",
    "Art Deco",
  ],
  accessories: [
    "Vintage",
    "Modern",
    "Bohemian",
    "Classic",
    "Glamorous",
    "Minimalist",
    "Romantic",
    "Art Deco",
    "Floral",
    "Pearl",
    "Crystal",
    "Gold",
    "Silver",
    "Beaded",
  ],
  stationery: [
    "Elegant",
    "Rustic",
    "Modern",
    "Vintage",
    "Minimalist",
    "Floral",
    "Watercolor",
    "Calligraphy",
    "Letterpress",
    "Foil Stamped",
    "Laser Cut",
    "Handmade",
    "Digital",
    "Illustrated",
  ],
  gifts: [
    "Personalized",
    "Handmade",
    "Luxury",
    "Practical",
    "Sentimental",
    "Traditional",
    "Modern",
    "Unique",
    "Customized",
    "Keepsake",
    "Eco-friendly",
    "Local",
    "Artisanal",
    "DIY",
  ],
};

// Common wedding colors
const commonWeddingColors = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Ivory", hex: "#FFFFF0" },
  { name: "Champagne", hex: "#F7E7CE" },
  { name: "Blush", hex: "#F8C8C8" },
  { name: "Dusty Rose", hex: "#D8A9A9" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Navy", hex: "#000080" },
  { name: "Sage", hex: "#BCB88A" },
  { name: "Emerald", hex: "#50C878" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Black", hex: "#000000" },
  { name: "Lavender", hex: "#E6E6FA" },
  { name: "Peach", hex: "#FFE5B4" },
  { name: "Coral", hex: "#FF7F50" },
  { name: "Teal", hex: "#008080" },
];

export default function StyleAndColorInputs({
  style,
  onStyleChange,
  color,
  onColorChange,
  category,
}: StyleAndColorInputsProps) {
  const [newStyleTag, setNewStyleTag] = useState("");
  const [newColorTag, setNewColorTag] = useState("");
  
  // Get style suggestions based on category
  const getStyleSuggestions = () => {
    if (!category) return [];
    return styleSuggestionsByCategory[category] || [];
  };
  
  // Add a style tag
  const addStyleTag = (tag: string) => {
    if (!tag.trim() || style.includes(tag.trim())) return;
    onStyleChange([...style, tag.trim()]);
    setNewStyleTag("");
  };
  
  // Remove a style tag
  const removeStyleTag = (tagToRemove: string) => {
    onStyleChange(style.filter((tag) => tag !== tagToRemove));
  };
  
  // Add a color tag
  const addColorTag = (tag: string) => {
    if (!tag.trim() || color.includes(tag.trim())) return;
    onColorChange([...color, tag.trim()]);
    setNewColorTag("");
  };
  
  // Remove a color tag
  const removeColorTag = (tagToRemove: string) => {
    onColorChange(color.filter((tag) => tag !== tagToRemove));
  };
  
  // Add a predefined color
  const addPredefinedColor = (colorName: string) => {
    if (color.includes(colorName)) return;
    onColorChange([...color, colorName]);
  };
  
  return (
    <div className="space-y-6">
      {/* Style Tags */}
      <div>
        <label htmlFor="style-tags" className="block text-sm font-medium text-gray-700">
          Style Tags
        </label>
        <p className="mt-1 text-sm text-gray-500">
          Add tags to describe the style of your item
        </p>
        
        <div className="mt-2">
          <div className="flex rounded-md shadow-sm">
            <input
              type="text"
              name="style-tags"
              id="style-tags"
              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
              placeholder="Add a style tag"
              value={newStyleTag}
              onChange={(e) => setNewStyleTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addStyleTag(newStyleTag);
                }
              }}
            />
            <button
              type="button"
              onClick={() => addStyleTag(newStyleTag)}
              className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
            >
              Add
            </button>
          </div>
        </div>
        
        {/* Style Tags Display */}
        {style.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {style.map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-full items-center py-0.5 pl-2.5 pr-1 text-sm font-medium bg-indigo-100 text-indigo-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeStyleTag(tag)}
                  className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                >
                  <span className="sr-only">Remove {tag}</span>
                  <svg
                    className="h-2 w-2"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 8 8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeWidth="1.5"
                      d="M1 1l6 6m0-6L1 7"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        
        {/* Style Suggestions */}
        {category && (
          <div className="mt-3">
            <h4 className="text-xs font-medium text-gray-500">Suggested styles:</h4>
            <div className="mt-1 flex flex-wrap gap-1">
              {getStyleSuggestions().map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addStyleTag(suggestion)}
                  disabled={style.includes(suggestion)}
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    style.includes(suggestion)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Color Tags */}
      <div>
        <label htmlFor="color-tags" className="block text-sm font-medium text-gray-700">
          Colors
        </label>
        <p className="mt-1 text-sm text-gray-500">
          Add colors to help buyers find your item
        </p>
        
        <div className="mt-2">
          <div className="flex rounded-md shadow-sm">
            <input
              type="text"
              name="color-tags"
              id="color-tags"
              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
              placeholder="Add a color"
              value={newColorTag}
              onChange={(e) => setNewColorTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addColorTag(newColorTag);
                }
              }}
            />
            <button
              type="button"
              onClick={() => addColorTag(newColorTag)}
              className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
            >
              Add
            </button>
          </div>
        </div>
        
        {/* Color Tags Display */}
        {color.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {color.map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-full items-center py-0.5 pl-2.5 pr-1 text-sm font-medium bg-indigo-100 text-indigo-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeColorTag(tag)}
                  className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                >
                  <span className="sr-only">Remove {tag}</span>
                  <svg
                    className="h-2 w-2"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 8 8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeWidth="1.5"
                      d="M1 1l6 6m0-6L1 7"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        
        {/* Common Color Suggestions */}
        <div className="mt-3">
          <h4 className="text-xs font-medium text-gray-500">Common colors:</h4>
          <div className="mt-1 flex flex-wrap gap-2">
            {commonWeddingColors.map((colorOption) => (
              <button
                key={colorOption.name}
                type="button"
                onClick={() => addPredefinedColor(colorOption.name)}
                disabled={color.includes(colorOption.name)}
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  color.includes(colorOption.name)
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "hover:bg-gray-50 border border-gray-200"
                }`}
                style={{
                  backgroundColor: colorOption.hex,
                  color: isLightColor(colorOption.hex) ? "#000000" : "#FFFFFF",
                }}
              >
                {colorOption.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to determine if a color is light or dark
function isLightColor(hexColor: string): boolean {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if light, false if dark
  return luminance > 0.5;
}
