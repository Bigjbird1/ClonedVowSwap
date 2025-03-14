'use client';

import React, { useState, useEffect } from 'react';
import { FilterParams } from '../../../../../models/supabaseListingFilters';
import { SavedFilter } from '../../../../services/savedFiltersService';
import savedFiltersService from '../../../../services/savedFiltersService';
import { BookmarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

interface SavedFiltersPanelProps {
  currentFilters: FilterParams;
  onApplyFilter: (filterData: FilterParams) => void;
  className?: string;
}

const SavedFiltersPanel: React.FC<SavedFiltersPanelProps> = ({
  currentFilters,
  onApplyFilter,
  className = '',
}) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load saved filters
  const loadSavedFilters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const filters = await savedFiltersService.getSavedFilters();
      setSavedFilters(filters);
    } catch (err) {
      setError('Failed to load saved filters');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved filters on component mount
  useEffect(() => {
    loadSavedFilters();
  }, []);

  // Handle saving a filter
  const handleSaveFilter = async () => {
    if (!filterName.trim()) {
      setError('Please enter a name for your filter');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await savedFiltersService.saveFilter(filterName, currentFilters);
      setFilterName('');
      setShowSaveDialog(false);
      await loadSavedFilters();
    } catch (err) {
      setError('Failed to save filter');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle applying a saved filter
  const handleApplyFilter = async (filterId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const filterData = await savedFiltersService.applySavedFilter(filterId);
      if (filterData) {
        onApplyFilter(filterData);
      }
    } catch (err) {
      setError('Failed to apply filter');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a saved filter
  const handleDeleteFilter = async (filterId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click handler
    
    try {
      setIsLoading(true);
      setError(null);
      await savedFiltersService.deleteSavedFilter(filterId);
      await loadSavedFilters();
    } catch (err) {
      setError('Failed to delete filter');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Saved Filters</h2>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
          aria-label="Save current filter"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Save Current
        </button>
      </div>

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="text-sm font-medium mb-2">Save Current Filter</h3>
          <input
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Filter name"
            className="w-full p-2 border border-gray-300 rounded-md mb-2"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowSaveDialog(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveFilter}
              disabled={isSaving}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Saved Filters List */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {isLoading && <div className="text-center py-4">Loading...</div>}
        
        {!isLoading && savedFilters.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No saved filters yet
          </div>
        )}
        
        {savedFilters.map((filter) => (
          <div
            key={filter.id}
            onClick={() => filter.id && handleApplyFilter(filter.id)}
            className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-gray-900">{filter.name}</div>
                <div className="text-xs text-gray-500">
                  Last used: {formatDate(filter.updatedAt)}
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={(e) => filter.id && handleApplyFilter(filter.id)}
                  className="p-1 text-indigo-600 hover:text-indigo-800"
                  aria-label="Apply filter"
                >
                  <BookmarkSolidIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => filter.id && handleDeleteFilter(filter.id, e)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  aria-label="Delete filter"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedFiltersPanel;
