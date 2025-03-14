import React from 'react';
import { ItemCondition } from '../../../../../models/supabaseListing';

interface ConditionFilterProps {
  selectedConditions: ItemCondition[];
  onChange: (conditions: ItemCondition[]) => void;
}

const ConditionFilter: React.FC<ConditionFilterProps> = ({
  selectedConditions,
  onChange,
}) => {
  const conditions: { value: ItemCondition; label: string; description: string }[] = [
    { 
      value: 'new_with_tags', 
      label: 'New with tags', 
      description: 'Brand new, unused, with original tags attached'
    },
    { 
      value: 'new_without_tags', 
      label: 'New without tags', 
      description: 'Brand new, unused, without original tags'
    },
    { 
      value: 'like_new', 
      label: 'Like new', 
      description: 'Used once or twice, in perfect condition'
    },
    { 
      value: 'gently_used', 
      label: 'Gently used', 
      description: 'Used but well-maintained with minimal signs of wear'
    },
    { 
      value: 'visible_wear', 
      label: 'Visible wear', 
      description: 'Shows signs of use but still functional and presentable'
    },
  ];

  const handleConditionChange = (condition: ItemCondition) => {
    if (selectedConditions.includes(condition)) {
      onChange(selectedConditions.filter(c => c !== condition));
    } else {
      onChange([...selectedConditions, condition]);
    }
  };

  return (
    <div className="space-y-2">
      {conditions.map((condition) => (
        <div key={condition.value} className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id={`condition-${condition.value}`}
              name={`condition-${condition.value}`}
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={selectedConditions.includes(condition.value)}
              onChange={() => handleConditionChange(condition.value)}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor={`condition-${condition.value}`} className="font-medium text-gray-700">
              {condition.label}
            </label>
            <p className="text-gray-500">{condition.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConditionFilter;
