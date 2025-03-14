"use client";

import { WeddingCategory, Measurements } from "../../../../models/supabaseListing";

interface MeasurementsFormProps {
  category: WeddingCategory;
  template: any;
  measurements?: Measurements;
  onChange: (measurements: Measurements) => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export default function MeasurementsForm({
  category,
  template,
  measurements,
  onChange,
  errors,
  isLoading,
}: MeasurementsFormProps) {
  // Parse template if it's a string
  const templateObj = typeof template === 'string' ? JSON.parse(template) : template;
  
  // Handle measurement change
  const handleMeasurementChange = (key: string, value: number) => {
    if (!measurements) return;
    
    const updatedMeasurements = {
      ...measurements,
      [key]: {
        ...measurements[key],
        value,
      },
    };
    
    onChange(updatedMeasurements);
  };
  
  // Handle unit change
  const handleUnitChange = (key: string, unit: string) => {
    if (!measurements) return;
    
    const updatedMeasurements = {
      ...measurements,
      [key]: {
        ...measurements[key],
        unit,
      },
    };
    
    onChange(updatedMeasurements);
  };
  
  // Get category-specific help text
  const getCategoryHelpText = (category: WeddingCategory) => {
    switch (category) {
      case 'dress':
        return "Provide accurate measurements to help buyers find the perfect fit. Measure the dress laid flat.";
      case 'decor':
        return "Specify dimensions to help buyers understand the size of your decor items.";
      case 'accessories':
        return "Include relevant measurements for accessories like jewelry, veils, or headpieces.";
      case 'stationery':
        return "Include dimensions for paper goods like invitations or place cards.";
      case 'gifts':
        return "Provide size information to help buyers understand the dimensions of gift items.";
      default:
        return "Add measurements to help buyers understand the size of your item.";
    }
  };
  
  // Get measurement diagram URL based on category
  const getMeasurementDiagramUrl = (category: WeddingCategory) => {
    switch (category) {
      case 'dress':
        return "/images/measurement-diagrams/dress-measurements.svg";
      case 'decor':
        return "/images/measurement-diagrams/decor-measurements.svg";
      case 'accessories':
        return "/images/measurement-diagrams/accessories-measurements.svg";
      default:
        return null;
    }
  };
  
  // Get available units for a measurement type
  const getAvailableUnits = (measurementType: string) => {
    // Default units for all measurement types
    const defaultUnits = ["inches", "cm"];
    
    // Add specific units based on measurement type
    switch (measurementType) {
      case 'weight':
        return ["oz", "g", "lbs", "kg"];
      case 'volume':
        return ["oz", "ml", "l"];
      default:
        return defaultUnits;
    }
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (!templateObj || !measurements) {
    return null;
  }
  
  const diagramUrl = getMeasurementDiagramUrl(category);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Measurements</h4>
          <p className="mt-1 text-sm text-gray-500">{getCategoryHelpText(category)}</p>
        </div>
        
        {diagramUrl && (
          <button
            type="button"
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => window.open(diagramUrl, '_blank')}
          >
            <svg
              className="-ml-0.5 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Measurement Guide
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        {Object.entries(templateObj).map(([key, field]: [string, any]) => {
          const measurementValue = measurements[key]?.value || 0;
          const measurementUnit = measurements[key]?.unit || field.unit || "inches";
          const errorKey = `measurement_${key}`;
          const hasError = !!errors[errorKey];
          
          return (
            <div key={key} className="sm:col-span-3">
              <label
                htmlFor={`measurement-${key}`}
                className="block text-sm font-medium text-gray-700"
              >
                {field.label || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="number"
                  name={`measurement-${key}`}
                  id={`measurement-${key}`}
                  value={measurementValue}
                  onChange={(e) => handleMeasurementChange(key, parseFloat(e.target.value) || 0)}
                  className={`focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300 ${
                    hasError ? "border-red-300 text-red-900 placeholder-red-300" : ""
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                <select
                  id={`unit-${key}`}
                  name={`unit-${key}`}
                  value={measurementUnit}
                  onChange={(e) => handleUnitChange(key, e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                >
                  {getAvailableUnits(key).map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              {hasError ? (
                <p className="mt-2 text-sm text-red-600" id={`${key}-error`}>
                  {errors[errorKey]}
                </p>
              ) : (
                <p className="mt-2 text-xs text-gray-500">
                  {field.description || `Enter the ${key.replace(/_/g, " ")} measurement`}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
