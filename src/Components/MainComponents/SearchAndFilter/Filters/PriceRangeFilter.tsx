import React, { useState, useEffect } from 'react';

interface PriceRangeFilterProps {
  priceRange: {
    min: number | null;
    max: number | null;
  };
  onChange: (priceRange: { min: number | null; max: number | null }) => void;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  priceRange,
  onChange,
}) => {
  const [minPrice, setMinPrice] = useState<string>(priceRange.min?.toString() || '');
  const [maxPrice, setMaxPrice] = useState<string>(priceRange.max?.toString() || '');

  // Update local state when props change
  useEffect(() => {
    setMinPrice(priceRange.min?.toString() || '');
    setMaxPrice(priceRange.max?.toString() || '');
  }, [priceRange.min, priceRange.max]);

  // Handle min price change
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinPrice(value);
  };

  // Handle max price change
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxPrice(value);
  };

  // Apply price range filter
  const applyPriceRange = () => {
    const min = minPrice === '' ? null : Number(minPrice);
    const max = maxPrice === '' ? null : Number(maxPrice);
    
    // Validate that min is not greater than max
    if (min !== null && max !== null && min > max) {
      // Swap values if min > max
      onChange({ min: max, max: min });
      return;
    }
    
    onChange({ min, max });
  };

  // Handle blur events to apply filter
  const handleBlur = () => {
    applyPriceRange();
  };

  // Handle key press events to apply filter on Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyPriceRange();
    }
  };

  // Predefined price ranges
  const priceRanges = [
    { label: 'Under $100', min: null, max: 100 },
    { label: '$100 - $500', min: 100, max: 500 },
    { label: '$500 - $1000', min: 500, max: 1000 },
    { label: '$1000 - $2000', min: 1000, max: 2000 },
    { label: 'Over $2000', min: 2000, max: null },
  ];

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <div className="w-1/2">
          <label htmlFor="min-price" className="block text-sm font-medium text-gray-700">
            Min
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="min-price"
              id="min-price"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-3 sm:text-sm border-gray-300 rounded-md"
              placeholder="0"
              value={minPrice}
              onChange={handleMinPriceChange}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              min="0"
            />
          </div>
        </div>
        <div className="w-1/2">
          <label htmlFor="max-price" className="block text-sm font-medium text-gray-700">
            Max
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="max-price"
              id="max-price"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-3 sm:text-sm border-gray-300 rounded-md"
              placeholder="Any"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Quick ranges</p>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map((range, index) => (
            <button
              key={index}
              type="button"
              className={`px-3 py-1 text-xs rounded-full ${
                priceRange.min === range.min && priceRange.max === range.max
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => onChange({ min: range.min, max: range.max })}
            >
              {range.label}
            </button>
          ))}
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-full ${
              priceRange.min === null && priceRange.max === null
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => onChange({ min: null, max: null })}
          >
            Any Price
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
