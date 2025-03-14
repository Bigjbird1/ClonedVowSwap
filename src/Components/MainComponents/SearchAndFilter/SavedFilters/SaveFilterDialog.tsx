import React, { useState } from 'react';
import { FilterParams } from '../../../../models/supabaseListingFilters';
import { saveFilter } from '../../../../services/savedFiltersService';

interface SaveFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterParams;
}

export default function SaveFilterDialog({ isOpen, onClose, currentFilters }: SaveFilterDialogProps) {
  const [filterName, setFilterName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterName.trim()) {
      setError('Please enter a name for your filter');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await saveFilter(filterName, currentFilters);
      setFilterName('');
      onClose();
    } catch (err) {
      setError('Failed to save filter. Please try again.');
      console.error('Error saving filter:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Save Current Filters</h2>
        
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label htmlFor="filterName" className="block text-sm font-medium text-gray-700 mb-2">
              Filter Name
            </label>
            <input
              type="text"
              id="filterName"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Enter a name for your filter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Filter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
