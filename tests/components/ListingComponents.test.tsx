import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListingCard from '../../src/Components/MainComponents/Listings/ListingCard';
import WeddingAttributeBadges from '../../src/Components/MainComponents/Listings/WeddingAttributeBadges';
import MeasurementDisplay from '../../src/Components/MainComponents/Listings/MeasurementDisplay';
import { WeddingCategory, ItemCondition } from '../../models/supabaseListing';

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={props.src} alt={props.alt} />;
  },
}));

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

describe('Listing Components', () => {
  // WeddingAttributeBadges Tests
  describe('WeddingAttributeBadges', () => {
    it('renders category and condition badges', () => {
      render(
        <WeddingAttributeBadges
          category="dress"
          condition="new_with_tags"
          size="md"
        />
      );
      
      expect(screen.getByText('Wedding Dress')).toBeInTheDocument();
      expect(screen.getByText('New with Tags')).toBeInTheDocument();
    });
    
    it('renders style and color tags', () => {
      render(
        <WeddingAttributeBadges
          style={['Vintage', 'Romantic']}
          color={['White', 'Ivory']}
          size="sm"
        />
      );
      
      expect(screen.getByText('Vintage')).toBeInTheDocument();
      expect(screen.getByText('Romantic')).toBeInTheDocument();
      expect(screen.getByText('White')).toBeInTheDocument();
      expect(screen.getByText('Ivory')).toBeInTheDocument();
    });
    
    it('shows tooltips when enabled', () => {
      render(
        <WeddingAttributeBadges
          category="dress"
          condition="new_with_tags"
          showTooltips={true}
        />
      );
      
      // Check that tooltip containers exist
      const tooltipContainers = document.querySelectorAll('.group');
      expect(tooltipContainers.length).toBe(2);
    });
  });
  
  // MeasurementDisplay Tests
  describe('MeasurementDisplay', () => {
    const sampleMeasurements = {
      bust: { value: 36, unit: 'inches' },
      waist: { value: 28, unit: 'inches' },
      hips: { value: 38, unit: 'inches' },
    };
    
    it('renders measurements correctly', () => {
      render(
        <MeasurementDisplay
          category="dress"
          measurements={sampleMeasurements}
        />
      );
      
      expect(screen.getByText('Bust')).toBeInTheDocument();
      expect(screen.getByText('Waist')).toBeInTheDocument();
      expect(screen.getByText('Hips')).toBeInTheDocument();
      
      // Check values are displayed
      expect(screen.getByText('36 inches')).toBeInTheDocument();
      expect(screen.getByText('28 inches')).toBeInTheDocument();
      expect(screen.getByText('38 inches')).toBeInTheDocument();
    });
    
    it('allows unit conversion', () => {
      render(
        <MeasurementDisplay
          category="dress"
          measurements={sampleMeasurements}
        />
      );
      
      // Change unit to cm
      fireEvent.change(screen.getByLabelText('Unit:'), { target: { value: 'cm' } });
      
      // Check converted values (36 inches ≈ 91.4 cm)
      expect(screen.getByText('91.4 cm')).toBeInTheDocument();
    });
  });
  
  // ListingCard Tests
  describe('ListingCard', () => {
    const sampleListing = {
      id: '123',
      title: 'Beautiful Wedding Dress',
      description: 'A stunning wedding dress in excellent condition',
      price: 500,
      originalRetailPrice: 1200,
      photos: [
        { url: '/images/dress1.jpg', alt: 'Wedding Dress Front' },
        { url: '/images/dress2.jpg', alt: 'Wedding Dress Back' },
      ],
      category: 'dress' as WeddingCategory,
      condition: 'like_new' as ItemCondition,
      measurements: {
        bust: { value: 36, unit: 'inches' },
        waist: { value: 28, unit: 'inches' },
      },
      style: ['Vintage', 'Lace'],
      color: ['White', 'Ivory'],
    };
    
    it('renders listing details correctly', () => {
      render(<ListingCard {...sampleListing} />);
      
      expect(screen.getByText('Beautiful Wedding Dress')).toBeInTheDocument();
      expect(screen.getByText('A stunning wedding dress in excellent condition')).toBeInTheDocument();
      expect(screen.getByText('$500.00')).toBeInTheDocument();
      expect(screen.getByText('$1200.00')).toBeInTheDocument();
      expect(screen.getByText('Wedding Dress')).toBeInTheDocument();
      expect(screen.getByText('Like New')).toBeInTheDocument();
      expect(screen.getByText('Vintage')).toBeInTheDocument();
      expect(screen.getByText('Lace')).toBeInTheDocument();
      expect(screen.getByText('White')).toBeInTheDocument();
      expect(screen.getByText('Ivory')).toBeInTheDocument();
    });
    
    it('shows discount percentage', () => {
      render(<ListingCard {...sampleListing} />);
      
      // 58% discount from $1200 to $500
      expect(screen.getByText('58% OFF')).toBeInTheDocument();
    });
    
    it('displays primary measurement', () => {
      render(<ListingCard {...sampleListing} />);
      
      // For dresses, bust is the primary measurement
      expect(screen.getByText('Bust:')).toBeInTheDocument();
      expect(screen.getByText(/36 inches/)).toBeInTheDocument();
    });
  });
});
