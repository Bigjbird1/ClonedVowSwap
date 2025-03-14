"use client";

import { useState } from "react";
import WeddingDetailsForm from "../../../Components/MainComponents/WeddingDetails/WeddingDetailsForm";
import { SupabaseListing, WeddingCategory, ItemCondition, Measurements } from "../../../../models/supabaseListing";

export default function WeddingDetailsFormExample() {
  const [formData, setFormData] = useState<Partial<SupabaseListing> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleSubmit = (data: {
    category: WeddingCategory;
    condition: ItemCondition;
    price: number;
    originalRetailPrice?: number;
    measurements?: Measurements;
    style?: string[];
    color?: string[];
  }) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setFormData(data);
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Wedding Details Form Example</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <WeddingDetailsForm onSubmit={handleSubmit} />
          </div>
        </div>
        
        {isSubmitting && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-center text-gray-700">Submitting form...</p>
            </div>
          </div>
        )}
        
        {isSuccess && (
          <div className="rounded-md bg-green-50 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Form submitted successfully!
                </p>
              </div>
            </div>
          </div>
        )}
        
        {formData && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Submitted Form Data
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                This is the data that would be sent to the API.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formData.category}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Condition</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formData.condition}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Price</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ${formData.price}
                  </dd>
                </div>
                {formData.originalRetailPrice && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Original Retail Price
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      ${formData.originalRetailPrice}
                    </dd>
                  </div>
                )}
                {formData.measurements && Object.keys(formData.measurements).length > 0 && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Measurements</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {Object.entries(formData.measurements).map(([key, { value, unit }]) => (
                          <li
                            key={key}
                            className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                          >
                            <div className="w-0 flex-1 flex items-center">
                              <span className="ml-2 flex-1 w-0 truncate capitalize">
                                {key.replace(/_/g, " ")}
                              </span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              {value} {unit}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
                {formData.style && formData.style.length > 0 && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Style</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formData.style.join(", ")}
                    </dd>
                  </div>
                )}
                {formData.color && formData.color.length > 0 && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Color</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formData.color.join(", ")}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}
        
        <div className="mt-8 bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Usage Instructions</h2>
          <div className="prose prose-sm text-gray-500">
            <p>
              The Wedding Details Form component can be used in any page where you need to collect
              wedding-specific details for listings. It handles:
            </p>
            <ul>
              <li>Category selection with helpful descriptions</li>
              <li>Condition selection with detailed explanations</li>
              <li>Price inputs with original retail price comparison</li>
              <li>Dynamic measurement fields based on the selected category</li>
              <li>Style and color tagging with suggestions</li>
              <li>Form validation for required fields</li>
            </ul>
            <p>
              To use this component, import it and provide an onSubmit handler to process the form data:
            </p>
            <pre className="bg-gray-100 p-2 rounded">
              {`import WeddingDetailsForm from "../Components/MainComponents/WeddingDetails/WeddingDetailsForm";

// In your component:
const handleSubmit = (data) => {
  // Process form data
  console.log(data);
};

return <WeddingDetailsForm onSubmit={handleSubmit} />;`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
