"use client";

interface PriceInputsProps {
  price: number | undefined;
  onPriceChange: (price: number) => void;
  originalRetailPrice: number | undefined;
  onOriginalRetailPriceChange: (price: number | undefined) => void;
  priceError?: string;
  originalRetailPriceError?: string;
}

export default function PriceInputs({
  price,
  onPriceChange,
  originalRetailPrice,
  onOriginalRetailPriceChange,
  priceError,
  originalRetailPriceError,
}: PriceInputsProps) {
  // Calculate discount percentage if both prices are available
  const discountPercentage =
    price !== undefined && originalRetailPrice !== undefined && originalRetailPrice > 0
      ? Math.round(((originalRetailPrice - price) / originalRetailPrice) * 100)
      : null;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700">Pricing Information</h4>
      
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        {/* Current Price */}
        <div className="sm:col-span-3">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="price"
              id="price"
              className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${
                priceError ? "border-red-300 text-red-900 placeholder-red-300" : ""
              }`}
              placeholder="0.00"
              aria-describedby={priceError ? "price-error" : undefined}
              value={price === undefined ? "" : price}
              onChange={(e) => {
                const value = e.target.value;
                onPriceChange(value === "" ? 0 : parseFloat(value));
              }}
              min="0"
              step="0.01"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
          {priceError && (
            <p className="mt-2 text-sm text-red-600" id="price-error">
              {priceError}
            </p>
          )}
        </div>

        {/* Original Retail Price */}
        <div className="sm:col-span-3">
          <label htmlFor="originalRetailPrice" className="block text-sm font-medium text-gray-700">
            Original Retail Price
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="originalRetailPrice"
              id="originalRetailPrice"
              className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${
                originalRetailPriceError ? "border-red-300 text-red-900 placeholder-red-300" : ""
              }`}
              placeholder="0.00"
              aria-describedby={originalRetailPriceError ? "original-price-error" : undefined}
              value={originalRetailPrice === undefined ? "" : originalRetailPrice}
              onChange={(e) => {
                const value = e.target.value;
                onOriginalRetailPriceChange(value === "" ? undefined : parseFloat(value));
              }}
              min="0"
              step="0.01"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
          {originalRetailPriceError ? (
            <p className="mt-2 text-sm text-red-600" id="original-price-error">
              {originalRetailPriceError}
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              The original price the item was purchased for
            </p>
          )}
        </div>
      </div>

      {/* Discount Display */}
      {discountPercentage !== null && discountPercentage > 0 && (
        <div className="rounded-md bg-green-50 p-4">
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
                {discountPercentage}% off the original retail price
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
