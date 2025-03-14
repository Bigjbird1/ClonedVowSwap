import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeddingDetailsForm from '../../src/Components/MainComponents/WeddingDetails/WeddingDetailsForm';
import CategorySelect from '../../src/Components/MainComponents/WeddingDetails/CategorySelect';
import ConditionSelect from '../../src/Components/MainComponents/WeddingDetails/ConditionSelect';
import PriceInputs from '../../src/Components/MainComponents/WeddingDetails/PriceInputs';
import StyleAndColorInputs from '../../src/Components/MainComponents/WeddingDetails/StyleAndColorInputs';
import { WeddingCategory, ItemCondition } from '../../models/supabaseListing';

// Mock the supabase client and functions
jest.mock('../../libs/supabaseClient', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('../../models/supabaseListing', () => {
  const originalModule = jest.requireActual('../../models/supabaseListing');
  return {
    ...originalModule,
    getMeasurementTemplateByCategory: jest.fn().mockResolvedValue({
      template: {
        bust: { label: 'Bust', unit: 'inches' },
        waist: { label: 'Waist', unit: 'inches' },
        hips: { label: 'Hips', unit: 'inches' },
      }
    }),
  };
});

describe('Wedding Details Form Components', () => {
  // CategorySelect Tests
  describe('CategorySelect', () => {
    it('renders correctly with no initial value', () => {
      render(
        <CategorySelect
          value={undefined}
          onChange={() => {}}
          error={undefined}
        />
      );
      
      expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
      expect(screen.getByText('Select a category')).toBeInTheDocument();
    });
    
    it('shows error message when provided', () => {
      render(
        <CategorySelect
          value={undefined}
          onChange={() => {}}
          error="Category is required"
        />
      );
      
      expect(screen.getByText('Category is required')).toBeInTheDocument();
    });
    
    it('calls onChange when a category is selected', () => {
      const handleChange = jest.fn();
      render(
        <CategorySelect
          value={undefined}
          onChange={handleChange}
          error={undefined}
        />
      );
      
      fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'dress' } });
      expect(handleChange).toHaveBeenCalledWith('dress');
    });
  });
  
  // ConditionSelect Tests
  describe('ConditionSelect', () => {
    it('renders all condition options', () => {
      render(
        <ConditionSelect
          value={undefined}
          onChange={() => {}}
          error={undefined}
        />
      );
      
      expect(screen.getByLabelText(/Condition/i)).toBeInTheDocument();
      expect(screen.getByLabelText('New with Tags')).toBeInTheDocument();
      expect(screen.getByLabelText('New without Tags')).toBeInTheDocument();
      expect(screen.getByLabelText('Like New')).toBeInTheDocument();
      expect(screen.getByLabelText('Gently Used')).toBeInTheDocument();
      expect(screen.getByLabelText('Visible Wear')).toBeInTheDocument();
    });
    
    it('shows error message when provided', () => {
      render(
        <ConditionSelect
          value={undefined}
          onChange={() => {}}
          error="Condition is required"
        />
      );
      
      expect(screen.getByText('Condition is required')).toBeInTheDocument();
    });
    
    it('calls onChange when a condition is selected', () => {
      const handleChange = jest.fn();
      render(
        <ConditionSelect
          value={undefined}
          onChange={handleChange}
          error={undefined}
        />
      );
      
      fireEvent.click(screen.getByLabelText('New with Tags'));
      expect(handleChange).toHaveBeenCalledWith('new_with_tags');
    });
  });
  
  // PriceInputs Tests
  describe('PriceInputs', () => {
    it('renders price inputs correctly', () => {
      render(
        <PriceInputs
          price={undefined}
          onPriceChange={() => {}}
          originalRetailPrice={undefined}
          onOriginalRetailPriceChange={() => {}}
          priceError={undefined}
          originalRetailPriceError={undefined}
        />
      );
      
      expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Original Retail Price/i)).toBeInTheDocument();
    });
    
    it('shows price error message when provided', () => {
      render(
        <PriceInputs
          price={undefined}
          onPriceChange={() => {}}
          originalRetailPrice={undefined}
          onOriginalRetailPriceChange={() => {}}
          priceError="Valid price is required"
          originalRetailPriceError={undefined}
        />
      );
      
      expect(screen.getByText('Valid price is required')).toBeInTheDocument();
    });
    
    it('shows discount percentage when both prices are provided', () => {
      render(
        <PriceInputs
          price={50}
          onPriceChange={() => {}}
          originalRetailPrice={100}
          onOriginalRetailPriceChange={() => {}}
          priceError={undefined}
          originalRetailPriceError={undefined}
        />
      );
      
      expect(screen.getByText('50% off the original retail price')).toBeInTheDocument();
    });
  });
  
  // StyleAndColorInputs Tests
  describe('StyleAndColorInputs', () => {
    it('renders style and color inputs correctly', () => {
      render(
        <StyleAndColorInputs
          style={[]}
          onStyleChange={() => {}}
          color={[]}
          onColorChange={() => {}}
          category="dress"
        />
      );
      
      expect(screen.getByLabelText(/Style Tags/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Colors/i)).toBeInTheDocument();
      expect(screen.getByText('Suggested styles:')).toBeInTheDocument();
      expect(screen.getByText('Common colors:')).toBeInTheDocument();
    });
    
    it('displays added style tags', () => {
      render(
        <StyleAndColorInputs
          style={['Vintage', 'Romantic']}
          onStyleChange={() => {}}
          color={[]}
          onColorChange={() => {}}
          category="dress"
        />
      );
      
      expect(screen.getByText('Vintage')).toBeInTheDocument();
      expect(screen.getByText('Romantic')).toBeInTheDocument();
    });
    
    it('displays added color tags', () => {
      render(
        <StyleAndColorInputs
          style={[]}
          onStyleChange={() => {}}
          color={['White', 'Ivory']}
          onColorChange={() => {}}
          category="dress"
        />
      );
      
      // Find the color tags in the display area (not the color buttons)
      const colorTags = screen.getAllByText('White');
      expect(colorTags.length).toBeGreaterThan(0);
      
      const ivoryTags = screen.getAllByText('Ivory');
      expect(ivoryTags.length).toBeGreaterThan(0);
    });
  });
  
  // Main WeddingDetailsForm Tests
  describe('WeddingDetailsForm', () => {
    it('renders the form with all sections', () => {
      const handleSubmit = jest.fn();
      render(<WeddingDetailsForm onSubmit={handleSubmit} />);
      
      expect(screen.getByText('Wedding Item Details')).toBeInTheDocument();
      expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Condition/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
      expect(screen.getByText('Style Tags')).toBeInTheDocument();
      expect(screen.getByText('Colors')).toBeInTheDocument();
    });
    
    it('validates required fields on submit', async () => {
      const handleSubmit = jest.fn();
      render(<WeddingDetailsForm onSubmit={handleSubmit} />);
      
      // Submit the form without filling required fields
      fireEvent.click(screen.getByText('Save'));
      
      // Check that validation errors are shown
      expect(await screen.findByText('Category is required')).toBeInTheDocument();
      expect(await screen.findByText('Condition is required')).toBeInTheDocument();
      expect(await screen.findByText('Valid price is required')).toBeInTheDocument();
      
      // Verify that onSubmit was not called
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });
});
