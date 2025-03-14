"use client";

import { useState } from "react";
import { WeddingCategory } from "../../../../models/supabaseListing";

interface MeasurementDisplayProps {
  category?: WeddingCategory;
  measurements?: Record<string, { value: number; unit: string }>;
  showDiagram?: boolean;
}

// Helper function to get measurement diagram URL based on category
const getMeasurementDiagramUrl = (category?: WeddingCategory): string | null => {
  if (!category) return null;
  
  switch (category) {
    case "dress":
      return "/images/measurement-diagrams/dress-measurements.svg";
    case "decor":
      return "/images/measurement-diagrams/decor-measurements.svg";
    case "accessories":
      return "/images/measurement-diagrams/accessories-measurements.svg";
    default:
      return null;
  }
};

// Helper function to get measurement description
const getMeasurementDescription = (key: string, category?: WeddingCategory): string => {
  // Dress measurements
  if (category === "dress") {
    switch (key) {
      case "bust":
        return "Measured around the fullest part of the bust";
      case "waist":
        return "Measured around the natural waistline";
      case "hips":
        return "Measured around the fullest part of the hips";
      case "length":
        return "Measured from shoulder to hem";
      case "sleeve":
        return "Measured from shoulder to end of sleeve";
      default:
        return "";
    }
  }
  
  // Decor measurements
  if (category === "decor") {
    switch (key) {
      case "length":
        return "The longest dimension of the item";
      case "width":
        return "The second longest dimension of the item";
      case "height":
        return "The shortest dimension of the item";
      default:
        return "";
    }
  }
  
  // Accessories measurements
  if (category === "accessories") {
    switch (key) {
      case "length":
        return "The longest dimension of the accessory";
      case "width":
        return "The width of the accessory";
      default:
        return "";
    }
  }
  
  return "";
};

// Helper function to convert measurements between units
const convertMeasurement = (value: number, fromUnit: string, toUnit: string): number => {
  // Convert to base unit (inches)
  let baseValue: number;
  switch (fromUnit) {
    case "cm":
      baseValue = value / 2.54;
      break;
    case "mm":
      baseValue = value / 25.4;
      break;
    case "m":
      baseValue = value * 39.37;
      break;
    default: // inches
      baseValue = value;
  }
  
  // Convert from base unit to target unit
  switch (toUnit) {
    case "cm":
      return Math.round(baseValue * 2.54 * 10) / 10;
    case "mm":
      return Math.round(baseValue * 25.4);
    case "m":
      return Math.round(baseValue / 39.37 * 100) / 100;
    default: // inches
      return Math.round(baseValue * 10) / 10;
  }
};

export default function MeasurementDisplay({
  category,
  measurements,
  showDiagram = true,
}: MeasurementDisplayProps) {
  const [selectedUnit, setSelectedUnit] = useState<string>("inches");
  
  if (!measurements || Object.keys(measurements).length === 0) {
    return null;
  }
  
  const diagramUrl = getMeasurementDiagramUrl(category);
  
  return (
    <div className="bg-white overflow-hidden rounded-lg border border-gray-200">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Measurements</h3>
        
        {/* Unit Selector */}
        <div className="flex items-center space-x-2">
          <label htmlFor="unit-selector" className="text-sm text-gray-500">
            Unit:
          </label>
          <select
            id="unit-selector"
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="block w-24 pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="inches">inches</option>
            <option value="cm">cm</option>
            <option value="mm">mm</option>
            <option value="m">m</option>
          </select>
        </div>
      </div>
      
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Measurements List */}
            <div>
              <ul className="divide-y divide-gray-200">
                {Object.entries(measurements).map(([key, { value, unit }]) => {
                  const convertedValue = convertMeasurement(value, unit, selectedUnit);
                  const description = getMeasurementDescription(key, category);
                  
                  return (
                    <li key={key} className="py-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {key.replace(/_/g, " ")}
                          </p>
                          {description && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {description}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 font-medium">
                          {convertedValue} {selectedUnit}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            {/* Measurement Diagram */}
            {showDiagram && diagramUrl && (
              <div className="flex justify-center items-center">
                <div className="relative w-full max-w-xs h-64 bg-gray-50 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <svg
                      className="h-12 w-12"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                      />
                    </svg>
                    <p className="ml-2 text-sm">Measurement diagram</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Measurement Guide Note */}
          <div className="mt-4 text-xs text-gray-500">
            <p>
              Note: Measurements may vary slightly due to the handmade nature of many wedding items. 
              Please allow for a small margin of difference (±0.5 {selectedUnit}).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
