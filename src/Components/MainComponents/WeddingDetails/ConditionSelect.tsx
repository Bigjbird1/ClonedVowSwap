"use client";

import { ItemCondition } from "../../../../models/supabaseListing";

interface ConditionSelectProps {
  value: ItemCondition | undefined;
  onChange: (value: ItemCondition) => void;
  error?: string;
}

// Condition descriptions for help text
const conditionDescriptions: Record<ItemCondition, string> = {
  new_with_tags: "Brand new item with original tags still attached",
  new_without_tags: "Brand new item but tags have been removed",
  like_new: "Used once or twice, in excellent condition with no visible flaws",
  gently_used: "Used but well-maintained with minimal signs of wear",
  visible_wear: "Shows some signs of use but still in good, functional condition",
};

export default function ConditionSelect({
  value,
  onChange,
  error,
}: ConditionSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Condition <span className="text-red-500">*</span>
      </label>
      <div className="mt-2 space-y-4">
        {Object.entries(conditionDescriptions).map(([condition, description]) => (
          <div key={condition} className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id={`condition-${condition}`}
                name="condition"
                type="radio"
                checked={value === condition}
                onChange={() => onChange(condition as ItemCondition)}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor={`condition-${condition}`}
                className="font-medium text-gray-700"
              >
                {formatCondition(condition as ItemCondition)}
              </label>
              <p className="text-gray-500">{description}</p>
            </div>
          </div>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" id="condition-error">
          {error}
        </p>
      )}
    </div>
  );
}

// Helper function to format condition for display
function formatCondition(condition: ItemCondition): string {
  switch (condition) {
    case "new_with_tags":
      return "New with Tags";
    case "new_without_tags":
      return "New without Tags";
    case "like_new":
      return "Like New";
    case "gently_used":
      return "Gently Used";
    case "visible_wear":
      return "Visible Wear";
    default:
      return String(condition).replace(/_/g, " ");
  }
}
