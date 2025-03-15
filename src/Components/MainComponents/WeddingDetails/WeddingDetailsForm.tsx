"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { WeddingCategory, ItemCondition, Measurements } from "../../../../models/supabaseListing";
import { getMeasurementTemplateByCategory } from "../../../../models/supabaseListing";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

// Dynamically import components
const CategorySelect = dynamic(() => import("./CategorySelect"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const ConditionSelect = dynamic(() => import("./ConditionSelect"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const PriceInputs = dynamic(() => import("./PriceInputs"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const MeasurementsForm = dynamic(() => import("./MeasurementsForm"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const StyleAndColorInputs = dynamic(() => import("./StyleAndColorInputs"), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

interface WeddingDetailsFormProps {
  initialValues?: {
    category?: WeddingCategory;
    condition?: ItemCondition;
    price?: number;
    originalRetailPrice?: number;
    measurements?: Measurements;
    style?: string[];
    color?: string[];
  };
  onSubmit: (formData: {
    category: WeddingCategory;
    condition: ItemCondition;
    price: number;
    originalRetailPrice?: number;
    measurements?: Measurements;
    style?: string[];
    color?: string[];
  }) => void;
  onCancel?: () => void;
}

export default function WeddingDetailsForm({
  initialValues,
  onSubmit,
  onCancel,
}: WeddingDetailsFormProps) {
  // Form state
  const [category, setCategory] = useState<WeddingCategory | undefined>(
    initialValues?.category
  );
  const [condition, setCondition] = useState<ItemCondition | undefined>(
    initialValues?.condition
  );
  const [price, setPrice] = useState<number | undefined>(initialValues?.price);
  const [originalRetailPrice, setOriginalRetailPrice] = useState<number | undefined>(
    initialValues?.originalRetailPrice
  );
  const [measurements, setMeasurements] = useState<Measurements | undefined>(
    initialValues?.measurements
  );
  const [style, setStyle] = useState<string[]>(initialValues?.style || []);
  const [color, setColor] = useState<string[]>(initialValues?.color || []);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [measurementTemplate, setMeasurementTemplate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load measurement template when category changes
  useEffect(() => {
    if (category) {
      setIsLoading(true);
      getMeasurementTemplateByCategory(category)
        .then((template) => {
          setMeasurementTemplate(template);
          // Initialize empty measurements based on template
          if (template && template.template) {
            const templateObj = typeof template.template === 'string' 
              ? JSON.parse(template.template) 
              : template.template;
              
            const initialMeasurements: Measurements = {};
            Object.keys(templateObj).forEach(key => {
              initialMeasurements[key] = { value: 0, unit: templateObj[key].unit };
            });
            
            setMeasurements(initialMeasurements);
          }
        })
        .catch((error) => {
          console.error("Error loading measurement template:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [category]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!category) {
      newErrors.category = "Category is required";
    }

    if (!condition) {
      newErrors.condition = "Condition is required";
    }

    if (!price || price <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (originalRetailPrice !== undefined && originalRetailPrice <= 0) {
      newErrors.originalRetailPrice = "Original retail price must be greater than 0";
    }

    if (originalRetailPrice !== undefined && price !== undefined && originalRetailPrice < price) {
      newErrors.originalRetailPrice = "Original retail price should be greater than or equal to current price";
    }

    // Validate measurements based on category requirements
    if (category && measurementTemplate && measurements) {
      const templateObj = typeof measurementTemplate.template === 'string' 
        ? JSON.parse(measurementTemplate.template) 
        : measurementTemplate.template;
        
      Object.keys(templateObj).forEach(key => {
        if (!measurements[key] || measurements[key].value <= 0) {
          newErrors[`measurement_${key}`] = `Valid ${key} measurement is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        category: category as WeddingCategory,
        condition: condition as ItemCondition,
        price: price as number,
        originalRetailPrice,
        measurements,
        style: style.length > 0 ? style : undefined,
        color: color.length > 0 ? color : undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">Wedding Item Details</h3>
          <p className="mt-1 text-sm text-gray-500">
            Provide detailed information about your wedding item to help buyers find it.
          </p>
        </div>

        <div className="pt-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Category Selection */}
            <div className="sm:col-span-3">
              <CategorySelect
                value={category}
                onChange={setCategory}
                error={errors.category}
              />
            </div>

            {/* Condition Selection */}
            <div className="sm:col-span-3">
              <ConditionSelect
                value={condition}
                onChange={setCondition}
                error={errors.condition}
              />
            </div>

            {/* Price Inputs */}
            <div className="sm:col-span-6">
              <PriceInputs
                price={price}
                onPriceChange={setPrice}
                originalRetailPrice={originalRetailPrice}
                onOriginalRetailPriceChange={setOriginalRetailPrice}
                priceError={errors.price}
                originalRetailPriceError={errors.originalRetailPrice}
              />
            </div>

            {/* Measurements Form - Only show when category is selected */}
            {category && measurementTemplate && (
              <div className="sm:col-span-6">
                <MeasurementsForm
                  category={category}
                  template={measurementTemplate.template}
                  measurements={measurements}
                  onChange={setMeasurements}
                  errors={errors}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Style and Color Inputs */}
            <div className="sm:col-span-6">
              <StyleAndColorInputs
                style={style}
                onStyleChange={setStyle}
                color={color}
                onColorChange={setColor}
                category={category}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
}
