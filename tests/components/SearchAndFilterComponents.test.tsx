import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from '../../src/Components/MainComponents/SearchAndFilter/SearchBar';
import CategoryFilter from '../../src/Components/MainComponents/SearchAndFilter/Filters/CategoryFilter';
import ConditionFilter from '../../src/Components/MainComponents/SearchAndFilter/Filters/ConditionFilter';
import PriceRangeFilter from '../../src/Components/MainComponents/SearchAndFilter/Filters/PriceRangeFilter';
import StyleFilter from '../../src/Components/MainComponents/SearchAndFilter/Filters/StyleFilter';
import ColorFilter from '../../src/Components/MainComponents/SearchAndFilter/Filters/ColorFilter';
import { WeddingCategory, ItemCondition } from '../../models/supabaseListing';

// Mock data
const mockStyles = ['Vintage', 'Modern', 'Rustic', 'Elegant', 'Bohemian'];
const mockColors = ['White', 'Ivory', 'Champagne', 'Blush', 'Gold'];

describe('Search and Filter Components', () => {
  // SearchBar Tests
  describe('SearchBar', () => {
    test('renders search input correctly', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} />);
      
      const searchInput = screen.getByPlaceholderText('Search for wedding items...');
      expect(searchInput).toBeInTheDocument();
    });

    test('calls onSearch when input changes', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} />);
      
      const searchInput = screen.getByPlaceholderText('Search for wedding items...');
      fireEvent.change(searchInput, { target: { value: 'wedding dress' } });
      
      expect(mockOnSearch).toHaveBeenCalledWith('wedding dress');
    });

    test('clears search when clear button is clicked', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} initialValue="wedding dress" />);
      
      // Clear button should be visible
      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);
      
      expect(mockOnSearch).toHaveBeenCalledWith('');
    });
  });

  // CategoryFilter Tests
  describe('CategoryFilter', () => {
    test('renders all category options', () => {
      const mockOnChange = jest.fn();
      render(<CategoryFilter selectedCategories={[]} onChange={mockOnChange} />);
      
      expect(screen.getByLabelText(/Wedding Dresses/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Decorations/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Accessories/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Stationery/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Gifts/i)).toBeInTheDocument();
    });

    test('selects and deselects categories correctly', () => {
      const mockOnChange = jest.fn();
      render(<CategoryFilter selectedCategories={[]} onChange={mockOnChange} />);
      
      // Select a category
      fireEvent.click(screen.getByLabelText(/Wedding Dresses/i));
      expect(mockOnChange).toHaveBeenCalledWith(['dress']);
      
      // Now render with the selected category and test deselection
      mockOnChange.mockClear();
      render(<CategoryFilter selectedCategories={['dress']} onChange={mockOnChange} />);
      
      fireEvent.click(screen.getByLabelText(/Wedding Dresses/i));
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  // ConditionFilter Tests
  describe('ConditionFilter', () => {
    test('renders all condition options with descriptions', () => {
      const mockOnChange = jest.fn();
      render(<ConditionFilter selectedConditions={[]} onChange={mockOnChange} />);
      
      expect(screen.getByLabelText(/New with tags/i)).toBeInTheDocument();
      expect(screen.getByText(/Brand new, unused, with original tags attached/i)).toBeInTheDocument();
      
      expect(screen.getByLabelText(/Like new/i)).toBeInTheDocument();
      expect(screen.getByText(/Used once or twice, in perfect condition/i)).toBeInTheDocument();
    });

    test('selects and deselects conditions correctly', () => {
      const mockOnChange = jest.fn();
      render(<ConditionFilter selectedConditions={[]} onChange={mockOnChange} />);
      
      // Select a condition
      fireEvent.click(screen.getByLabelText(/Like new/i));
      expect(mockOnChange).toHaveBeenCalledWith(['like_new']);
      
      // Now render with the selected condition and test deselection
      mockOnChange.mockClear();
      render(<ConditionFilter selectedConditions={['like_new']} onChange={mockOnChange} />);
      
      fireEvent.click(screen.getByLabelText(/Like new/i));
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  // PriceRangeFilter Tests
  describe('PriceRangeFilter', () => {
    test('renders min and max price inputs', () => {
      const mockOnChange = jest.fn();
      render(<PriceRangeFilter priceRange={{ min: null, max: null }} onChange={mockOnChange} />);
      
      expect(screen.getByLabelText(/Min/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Max/i)).toBeInTheDocument();
    });

    test('updates price range on input change and blur', () => {
      const mockOnChange = jest.fn();
      render(<PriceRangeFilter priceRange={{ min: null, max: null }} onChange={mockOnChange} />);
      
      // Enter min price
      const minInput = screen.getByLabelText(/Min/i);
      fireEvent.change(minInput, { target: { value: '100' } });
      fireEvent.blur(minInput);
      
      expect(mockOnChange).toHaveBeenCalledWith({ min: 100, max: null });
      
      // Enter max price
      mockOnChange.mockClear();
      const maxInput = screen.getByLabelText(/Max/i);
      fireEvent.change(maxInput, { target: { value: '500' } });
      fireEvent.blur(maxInput);
      
      expect(mockOnChange).toHaveBeenCalledWith({ min: null, max: 500 });
    });

    test('applies predefined price ranges', () => {
      const mockOnChange = jest.fn();
      render(<PriceRangeFilter priceRange={{ min: null, max: null }} onChange={mockOnChange} />);
      
      // Click on a predefined range
      fireEvent.click(screen.getByText(/\$100 - \$500/i));
      
      expect(mockOnChange).toHaveBeenCalledWith({ min: 100, max: 500 });
    });
  });

  // StyleFilter Tests
  describe('StyleFilter', () => {
    test('renders available styles', () => {
      const mockOnChange = jest.fn();
      render(
        <StyleFilter 
          availableStyles={mockStyles} 
          selectedStyles={[]} 
          onChange={mockOnChange} 
        />
      );
      
      mockStyles.forEach(style => {
        expect(screen.getByLabelText(style)).toBeInTheDocument();
      });
    });

    test('filters styles based on search term', () => {
      const mockOnChange = jest.fn();
      render(
        <StyleFilter 
          availableStyles={mockStyles} 
          selectedStyles={[]} 
          onChange={mockOnChange} 
        />
      );
      
      // Search for a specific style
      const searchInput = screen.getByPlaceholderText(/Search styles/i);
      fireEvent.change(searchInput, { target: { value: 'Vintage' } });
      
      // Only Vintage should be visible
      expect(screen.getByLabelText('Vintage')).toBeInTheDocument();
      expect(screen.queryByLabelText('Modern')).not.toBeInTheDocument();
    });

    test('selects and deselects styles correctly', () => {
      const mockOnChange = jest.fn();
      render(
        <StyleFilter 
          availableStyles={mockStyles} 
          selectedStyles={[]} 
          onChange={mockOnChange} 
        />
      );
      
      // Select a style
      fireEvent.click(screen.getByLabelText('Vintage'));
      expect(mockOnChange).toHaveBeenCalledWith(['Vintage']);
      
      // Now render with the selected style and test deselection
      mockOnChange.mockClear();
      render(
        <StyleFilter 
          availableStyles={mockStyles} 
          selectedStyles={['Vintage']} 
          onChange={mockOnChange} 
        />
      );
      
      fireEvent.click(screen.getByLabelText('Vintage'));
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  // ColorFilter Tests
  describe('ColorFilter', () => {
    test('renders available colors', () => {
      const mockOnChange = jest.fn();
      render(
        <ColorFilter 
          availableColors={mockColors} 
          selectedColors={[]} 
          onChange={mockOnChange} 
        />
      );
      
      mockColors.forEach(color => {
        expect(screen.getByText(color)).toBeInTheDocument();
      });
    });

    test('filters colors based on search term', () => {
      const mockOnChange = jest.fn();
      render(
        <ColorFilter 
          availableColors={mockColors} 
          selectedColors={[]} 
          onChange={mockOnChange} 
        />
      );
      
      // Search for a specific color
      const searchInput = screen.getByPlaceholderText(/Search colors/i);
      fireEvent.change(searchInput, { target: { value: 'White' } });
      
      // Only White should be visible
      expect(screen.getByText('White')).toBeInTheDocument();
      expect(screen.queryByText('Ivory')).not.toBeInTheDocument();
    });

    test('selects and deselects colors correctly', () => {
      const mockOnChange = jest.fn();
      render(
        <ColorFilter 
          availableColors={mockColors} 
          selectedColors={[]} 
          onChange={mockOnChange} 
        />
      );
      
      // Select a color
      fireEvent.click(screen.getByText('White').closest('button')!);
      expect(mockOnChange).toHaveBeenCalledWith(['White']);
      
      // Now render with the selected color and test deselection
      mockOnChange.mockClear();
      render(
        <ColorFilter 
          availableColors={mockColors} 
          selectedColors={['White']} 
          onChange={mockOnChange} 
        />
      );
      
      fireEvent.click(screen.getByText('White').closest('button')!);
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });
});
