import React, { useState } from 'react';

interface ColorFilterProps {
  availableColors: string[];
  selectedColors: string[];
  onChange: (colors: string[]) => void;
}

// Color mapping for common wedding colors
const colorMap: Record<string, string> = {
  'White': '#FFFFFF',
  'Ivory': '#FFFFF0',
  'Champagne': '#F7E7CE',
  'Blush': '#FFE4E1',
  'Pink': '#FFC0CB',
  'Red': '#FF0000',
  'Burgundy': '#800020',
  'Purple': '#800080',
  'Lavender': '#E6E6FA',
  'Blue': '#0000FF',
  'Navy': '#000080',
  'Teal': '#008080',
  'Mint': '#98FB98',
  'Green': '#008000',
  'Gold': '#FFD700',
  'Silver': '#C0C0C0',
  'Gray': '#808080',
  'Black': '#000000',
  'Brown': '#A52A2A',
  'Beige': '#F5F5DC',
  'Clear': '#FFFFFF',
};

const ColorFilter: React.FC<ColorFilterProps> = ({
  availableColors,
  selectedColors,
  onChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Handle color selection
  const handleColorChange = (color: string) => {
    if (selectedColors.includes(color)) {
      onChange(selectedColors.filter(c => c !== color));
    } else {
      onChange([...selectedColors, color]);
    }
  };

  // Filter colors based on search term
  const filteredColors = searchTerm
    ? availableColors.filter(color => 
        color.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableColors;

  // Get color hex code or default to a light gray
  const getColorHex = (color: string): string => {
    return colorMap[color] || '#E5E7EB';
  };

  // Group colors by families
  const colorFamilies = {
    'Whites & Ivories': ['White', 'Ivory', 'Champagne', 'Cream'],
    'Pinks & Reds': ['Blush', 'Pink', 'Red', 'Burgundy', 'Rose', 'Coral'],
    'Purples & Blues': ['Purple', 'Lavender', 'Blue', 'Navy', 'Periwinkle'],
    'Greens': ['Teal', 'Mint', 'Green', 'Sage', 'Emerald'],
    'Metallics': ['Gold', 'Silver', 'Bronze', 'Copper'],
    'Neutrals': ['Gray', 'Black', 'Brown', 'Beige', 'Tan', 'Clear'],
  };

  // Check if we should show color families
  const shouldShowColorFamilies = !searchTerm && availableColors.length > 10;

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Search colors..."
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

      {/* Color swatches */}
      <div className="max-h-40 overflow-y-auto">
        {shouldShowColorFamilies ? (
          // Show colors grouped by families
          Object.entries(colorFamilies).map(([family, colors]) => {
            const availableInFamily = availableColors.filter(color => 
              colors.some(c => c.toLowerCase() === color.toLowerCase())
            );
            
            if (availableInFamily.length === 0) return null;
            
            return (
              <div key={family} className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-2">{family}</p>
                <div className="flex flex-wrap gap-2">
                  {availableInFamily.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`flex items-center px-3 py-1 text-xs rounded-full border ${
                        selectedColors.includes(color)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleColorChange(color)}
                    >
                      <span 
                        className="inline-block w-3 h-3 rounded-full mr-1.5" 
                        style={{ backgroundColor: getColorHex(color), border: '1px solid #E5E7EB' }}
                      />
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          // Show flat list of colors (for search results or small color sets)
          <div className="flex flex-wrap gap-2">
            {filteredColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`flex items-center px-3 py-1 text-xs rounded-full border ${
                  selectedColors.includes(color)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleColorChange(color)}
              >
                <span 
                  className="inline-block w-3 h-3 rounded-full mr-1.5" 
                  style={{ backgroundColor: getColorHex(color), border: '1px solid #E5E7EB' }}
                />
                {color}
              </button>
            ))}
            {filteredColors.length === 0 && (
              <p className="text-sm text-gray-500">No colors found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorFilter;
