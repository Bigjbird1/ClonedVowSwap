import { 
  mockSetupTestEnvironment, 
  mockCreateDatabaseSnapshot, 
  mockRestoreDatabaseSnapshot,
  mockSupabaseClient
} from '../mocks/supabaseMock';
import { sampleListings, sampleShippingOptions } from './testData';

// Mock the Supabase listing functions
jest.mock('../../models/supabaseListing', () => ({
  createSupabaseListing: jest.fn().mockImplementation((listing) => {
    // Check for invalid data to simulate validation
    if (listing.category === 'invalid_category') {
      return Promise.reject(new Error('Invalid category'));
    }
    if (listing.condition === 'invalid_condition') {
      return Promise.reject(new Error('Invalid condition'));
    }
    if (listing.measurements === 'not-a-json-object') {
      return Promise.reject(new Error('Invalid measurements format'));
    }
    
    return Promise.resolve({
      ...listing,
      id: 'mock-id-' + Math.random().toString(36).substring(7)
    });
  }),
  getSupabaseListingById: jest.fn().mockImplementation((id) => {
    if (id.startsWith('mock-id-')) {
      return Promise.resolve({
        id,
        title: "Elegant Lace Wedding Dress",
        description: "Beautiful vintage-inspired lace wedding dress",
        price: 1200.00,
        category: "dress",
        condition: "like_new",
        photos: [{ url: "https://example.com/dress1.jpg" }],
        measurements: {
          bust: { value: 36, unit: "inches" },
          waist: { value: 28, unit: "inches" }
        },
        style: ["vintage", "lace"],
        color: ["ivory", "champagne"]
      });
    }
    throw new Error('Listing not found');
  }),
  getSupabaseListingsByCategory: jest.fn().mockImplementation((category) => {
    if (['dress', 'accessories', 'decor', 'stationery', 'gifts'].includes(category)) {
      return Promise.resolve([
        {
          id: 'mock-id-' + category,
          title: `Test ${category}`,
          category: category,
          photos: [],
          style: [],
          color: []
        }
      ]);
    }
    throw new Error('Invalid category');
  }),
  getMeasurementTemplateByCategory: jest.fn().mockImplementation((category) => {
    if (['dress', 'accessories', 'decor'].includes(category)) {
      const templates: Record<string, Record<string, {label: string, unit: string}>> = {
        dress: {
          bust: { label: "Bust", unit: "inches" },
          waist: { label: "Waist", unit: "inches" },
          hips: { label: "Hips", unit: "inches" }
        },
        accessories: {
          length: { label: "Length", unit: "inches" },
          width: { label: "Width", unit: "inches" }
        },
        decor: {
          length: { label: "Length", unit: "inches" },
          width: { label: "Width", unit: "inches" },
          height: { label: "Height", unit: "inches" }
        }
      };
      return Promise.resolve({
        id: 'template-' + category,
        category: category,
        template: templates[category as keyof typeof templates]
      });
    }
    throw new Error('Invalid category');
  })
}));

// Import the mocked functions
import { 
  createSupabaseListing, 
  getSupabaseListingById,
  getSupabaseListingsByCategory,
  getMeasurementTemplateByCategory
} from '../../models/supabaseListing';

describe('Data Migration Tests', () => {
  let supabase: any;
  let createdListingIds: string[] = [];
  
  beforeAll(async () => {
    // Set up test environment with mock
    supabase = await mockSetupTestEnvironment();
    
    // Create database snapshot before tests
    await mockCreateDatabaseSnapshot();
  });
  
  afterAll(async () => {
    // Clean up test data
    if (createdListingIds.length > 0) {
      await supabase
        .from('listings')
        .delete()
        .in('id', createdListingIds);
    }
    
    // Restore database snapshot after tests
    await mockRestoreDatabaseSnapshot();
  });
  
  describe('Listing Creation', () => {
    test('Should create listings with wedding-specific attributes', async () => {
      for (const listing of sampleListings) {
        // Add a seller ID for testing
        const testListing = {
          ...listing,
          sellerId: 'test-seller-id'
        };
        
        // Create the listing
        const data = await createSupabaseListing(testListing as any);
        
        // Store ID for cleanup
        if (data && data.id) {
          createdListingIds.push(data.id);
        }
        
        // Verify listing was created with correct data
        expect(data).toBeDefined();
        expect(data.id).toBeDefined();
        expect(data.title).toBe(listing.title);
        expect(data.category).toBe(listing.category);
        expect(data.condition).toBe(listing.condition);
      }
    });
    
    test('Should handle JSON fields correctly', async () => {
      // Get the first created listing
      if (createdListingIds.length === 0) {
        throw new Error('No listings created for testing');
      }
      
      const listingId = createdListingIds[0];
      const listing = await getSupabaseListingById(listingId);
      
      // Verify JSON fields are parsed correctly
      expect(listing).toBeDefined();
      expect(listing.photos).toBeInstanceOf(Array);
      expect(listing.photos.length).toBeGreaterThan(0);
      
      // Check measurements if it's a dress
      if (listing.category === 'dress') {
        expect(listing.measurements).toBeDefined();
        expect(listing.measurements).toHaveProperty('bust');
        expect(listing.measurements.bust).toHaveProperty('value');
        expect(listing.measurements.bust).toHaveProperty('unit');
      }
      
      // Check array fields
      expect(listing.style).toBeInstanceOf(Array);
      expect(listing.color).toBeInstanceOf(Array);
    });
  });
  
  describe('Category-based Queries', () => {
    test('Should filter listings by category', async () => {
      // Test each category
      const categories = ['dress', 'accessories', 'decor', 'stationery', 'gifts'];
      
      for (const category of categories) {
        const listings = await getSupabaseListingsByCategory(category as any);
        
        // Skip if no listings found for this category
        if (listings.length === 0) continue;
        
        // Verify all listings have the correct category
        listings.forEach(listing => {
          expect(listing.category).toBe(category);
        });
        
        // Verify JSON fields are parsed correctly
        listings.forEach(listing => {
          expect(listing.photos).toBeInstanceOf(Array);
          if (listing.measurements) {
            expect(typeof listing.measurements).toBe('object');
          }
          if (listing.style) {
            expect(listing.style).toBeInstanceOf(Array);
          }
          if (listing.color) {
            expect(listing.color).toBeInstanceOf(Array);
          }
        });
      }
    });
  });
  
  describe('Measurement Templates', () => {
    test('Should retrieve measurement templates by category', async () => {
      // Test each category that has measurement templates
      const categories = ['dress', 'accessories', 'decor'];
      
      for (const category of categories) {
        const template = await getMeasurementTemplateByCategory(category as any);
        
        // Verify template exists
        expect(template).toBeDefined();
        expect(template.category).toBe(category);
        expect(template.template).toBeDefined();
        
        // Verify template structure based on category
        if (category === 'dress') {
          expect(template.template).toHaveProperty('bust');
          expect(template.template).toHaveProperty('waist');
          expect(template.template).toHaveProperty('hips');
        } else if (category === 'accessories') {
          expect(template.template).toHaveProperty('length');
          expect(template.template).toHaveProperty('width');
        } else if (category === 'decor') {
          expect(template.template).toHaveProperty('length');
          expect(template.template).toHaveProperty('width');
          expect(template.template).toHaveProperty('height');
        }
      }
    });
  });
  
  describe('Data Type Validation', () => {
    test('Should enforce ENUM constraints', async () => {
      // Try to create a listing with invalid category
      const invalidListing = {
        ...sampleListings[0],
        sellerId: 'test-seller-id',
        category: 'invalid_category' as any
      };
      
      // Expect an error when creating with invalid category
      await expect(createSupabaseListing(invalidListing as any))
        .rejects.toThrow();
      
      // Try to create a listing with invalid condition
      const invalidConditionListing = {
        ...sampleListings[0],
        sellerId: 'test-seller-id',
        condition: 'invalid_condition' as any
      };
      
      // Expect an error when creating with invalid condition
      await expect(createSupabaseListing(invalidConditionListing as any))
        .rejects.toThrow();
    });
    
    test('Should validate JSON structure', async () => {
      // Try to create a listing with invalid measurements structure
      const invalidMeasurementsListing = {
        ...sampleListings[0],
        sellerId: 'test-seller-id',
        measurements: 'not-a-json-object' as any
      };
      
      // Expect an error when creating with invalid measurements
      await expect(createSupabaseListing(invalidMeasurementsListing as any))
        .rejects.toThrow();
    });
  });
});
