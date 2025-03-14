import React, { useState } from 'react';

interface StyleFilterProps {
  availableStyles: string[];
  selectedStyles: string[];
  onChange: (styles: string[]) => void;
}

const StyleFilter: React.FC<StyleFilterProps> = ({
  availableStyles,
  selectedStyles,
  onChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Handle style selection
  const handleStyleChange = (style: string) => {
    if (selectedStyles.includes(style)) {
      onChange(selectedStyles.filter(s => s !== style));
    } else {
      onChange([...selectedStyles, style]);
    }
  };

  // Filter styles based on search term
  const filteredStyles = searchTerm
    ? availableStyles.filter(style => 
        style.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableStyles;

  // Common wedding styles for quick selection
  const popularStyles = [
    'Vintage',
    'Rustic',
    'Elegant',
    'Modern',
    'Bohemian',
    'Classic',
    'Romantic',
    'Beach',
    'Garden',
  ];

  // Filter popular styles that are actually in the available styles
  const availablePopularStyles = popularStyles.filter(style => 
    availableStyles.some(s => s.toLowerCase() === style.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Search styles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setSearchTerm('')}
          >
            <svg
              className="h-4 w-4 text-gray-400 hover:text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Popular styles */}
      {availablePopularStyles.length > 0 && !searchTerm && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Popular Styles</p>
          <div className="flex flex-wrap gap-2">
            {availablePopularStyles.map((style) => (
              <button
                key={style}
                type="button"
                className={`px-3 py-1 text-xs rounded-full ${
                  selectedStyles.includes(style)
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => handleStyleChange(style)}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All styles or search results */}
      <div className="max-h-40 overflow-y-auto">
        <div className="space-y-1">
          {filteredStyles.length > 0 ? (
            filteredStyles.map((style) => (
              <div key={style} className="flex items-center">
                <input
                  id={`style-${style}`}
                  name={`style-${style}`}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={selectedStyles.includes(style)}
                  onChange={() => handleStyleChange(style)}
                />
                <label
                  htmlFor={`style-${style}`}
                  className="ml-3 text-sm text-gray-700"
                >
                  {style}
                </label>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No styles found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StyleFilter;
