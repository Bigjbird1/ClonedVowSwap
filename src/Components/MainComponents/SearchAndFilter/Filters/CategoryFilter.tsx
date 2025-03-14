import React from 'react';
import { WeddingCategory } from '../../../../../models/supabaseListing';

interface CategoryFilterProps {
  selectedCategories: WeddingCategory[];
  onChange: (categories: WeddingCategory[]) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategories,
  onChange,
}) => {
  const categories: { value: WeddingCategory; label: string; icon: string }[] = [
    { value: 'dress', label: 'Wedding Dresses', icon: '👰' },
    { value: 'decor', label: 'Decorations', icon: '🎊' },
    { value: 'accessories', label: 'Accessories', icon: '💍' },
    { value: 'stationery', label: 'Stationery', icon: '📝' },
    { value: 'gifts', label: 'Gifts', icon: '🎁' },
  ];

  const handleCategoryChange = (category: WeddingCategory) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter(c => c !== category));
    } else {
      onChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div key={category.value} className="flex items-center">
          <input
            id={`category-${category.value}`}
            name={`category-${category.value}`}
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            checked={selectedCategories.includes(category.value)}
            onChange={() => handleCategoryChange(category.value)}
          />
          <label
            htmlFor={`category-${category.value}`}
            className="ml-3 text-sm text-gray-700 flex items-center"
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </label>
        </div>
      ))}
    </div>
  );
};

export default CategoryFilter;
