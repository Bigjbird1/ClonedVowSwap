import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchAndFilterContainer from '../../src/Components/MainComponents/SearchAndFilter/SearchAndFilterContainer';
import * as analyticsService from '../../src/services/analyticsService';

// Mock the analytics service
jest.mock('../../src/services/analyticsService', () => ({
  trackSearch: jest.fn(),
  trackFilterApply: jest.fn(),
  trackFilterRemove: jest.fn(),
  trackFilterClear: jest.fn(),
}));

// Mock the debounce hook to execute immediately for testing
jest.mock('../../src/hooks/useDebounce', () => ({
  __esModule: true,
  default: jest.fn((value) => value), // Return the value immediately without debouncing
}));

describe('Analytics Tracking for Search and Filter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should track search events when user searches', async () => {
    render(<SearchAndFilterContainer />);
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText(/search/i);
    
    // Type in the search box
    fireEvent.change(searchInput, { target: { value: 'wedding dress' } });
    
    // Verify trackSearch was called with the correct search term
    await waitFor(() => {
      expect(analyticsService.trackSearch).toHaveBeenCalledWith('wedding dress');
    });
  });

  it('should track filter apply events when filters are applied', async () => {
    render(<SearchAndFilterContainer />);
    
    // Find and click on a category filter (example)
    const categoryFilter = screen.getByText(/dress/i);
    fireEvent.click(categoryFilter);
    
    // Verify trackFilterApply was called with the correct filter type and value
    await waitFor(() => {
      expect(analyticsService.trackFilterApply).toHaveBeenCalledWith(
        'categories', 
        expect.stringContaining('DRESS')
      );
    });
  });

  it('should track filter remove events when individual filters are removed', async () => {
    render(<SearchAndFilterContainer />);
    
    // First apply a filter
    const categoryFilter = screen.getByText(/dress/i);
    fireEvent.click(categoryFilter);
    
    // Find and click the remove button for the category filter
    const removeButton = screen.getByLabelText(/remove category filter/i);
    fireEvent.click(removeButton);
    
    // Verify trackFilterRemove was called with the correct filter type and value
    await waitFor(() => {
      expect(analyticsService.trackFilterRemove).toHaveBeenCalledWith(
        'categories',
        expect.any(String)
      );
    });
  });

  it('should track filter clear events when all filters are cleared', async () => {
    render(<SearchAndFilterContainer />);
    
    // First apply a filter
    const categoryFilter = screen.getByText(/dress/i);
    fireEvent.click(categoryFilter);
    
    // Find and click the clear all button
    const clearAllButton = screen.getByText(/clear all/i);
    fireEvent.click(clearAllButton);
    
    // Verify trackFilterClear was called
    await waitFor(() => {
      expect(analyticsService.trackFilterClear).toHaveBeenCalled();
    });
  });

  it('should handle errors gracefully when analytics tracking fails', async () => {
    // Mock trackSearch to throw an error
    (analyticsService.trackSearch as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Network error');
    });
    
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<SearchAndFilterContainer />);
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText(/search/i);
    
    // Type in the search box
    fireEvent.change(searchInput, { target: { value: 'wedding dress' } });
    
    // Verify the error was logged but the app didn't crash
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});
