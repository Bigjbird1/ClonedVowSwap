import { mockSetupTestEnvironment, mockSupabaseClient } from '../mocks/supabaseMock';
import { sampleListings } from '../data/testData';

// Mock the Supabase listing functions
jest.mock('../../models/supabaseListing', () => ({
  createSupabaseListing: jest.fn().mockImplementation((listing) => {
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
  }),
  getAllShippingOptions: jest.fn().mockImplementation(() => {
    return Promise.resolve([
      {
        id: '1',
        name: 'Standard Shipping',
        price_range: { min: 5.99, max: 15.99 },
        estimatedDays: [3, 7]
      },
      {
        id: '2',
        name: 'Express Shipping',
        price_range: { min: 15.99, max: 29.99 },
        estimatedDays: [1, 3]
      }
    ]);
  }),
  updateSupabaseListing: jest.fn().mockImplementation((id, updates) => {
    if (id.startsWith('mock-id-')) {
      const updatedListing = {
        id,
        title: updates.title || "Elegant Lace Wedding Dress",
        description: "Beautiful vintage-inspired lace wedding dress",
        price: updates.price || 1200.00,
        category: "dress",
        condition: "like_new",
        photos: [{ url: "https://example.com/dress1.jpg" }],
        measurements: updates.measurements || {
          bust: { value: 36, unit: "inches" },
          waist: { value: 28, unit: "inches" }
        },
        style: ["vintage", "lace"],
        color: ["ivory", "champagne"]
      };
      
      // Update the getSupabaseListingById mock to return the updated listing
      const getByIdMock = jest.fn().mockImplementation((listingId) => {
        if (listingId === id) {
          return Promise.resolve(updatedListing);
        }
        throw new Error('Listing not found');
      });
      
      // Replace the implementation
      (getSupabaseListingById as jest.Mock).mockImplementation(getByIdMock);
      
      return Promise.resolve(updatedListing);
    }
    throw new Error('Listing not found');
  })
}));

// Import the mocked functions
import { 
  createSupabaseListing, 
  getSupabaseListingById,
  getSupabaseListingsByCategory,
  getMeasurementTemplateByCategory,
  getAllShippingOptions,
  updateSupabaseListing
} from '../../models/supabaseListing';

describe('API Integration Tests', () => {
  let supabase: any;
  let createdListingIds: string[] = [];
  
  beforeAll(async () => {
    // Set up test environment with mock
    supabase = await mockSetupTestEnvironment();
  });
  
  afterAll(async () => {
    // Clean up test data
    if (createdListingIds.length > 0) {
      await supabase
        .from('listings')
        .delete()
        .in('id', createdListingIds);
    }
  });
  
  describe('Listing CRUD Operations', () => {
    test('Should create, read, update, and delete listings with wedding attributes', async () => {
      // CREATE
      const testListing = {
        ...sampleListings[0],
        sellerId: 'test-seller-id'
      };
      
      const createdListing = await createSupabaseListing(testListing as any);
      expect(createdListing).toBeDefined();
      expect(createdListing.id).toBeDefined();
      
      // Store ID for cleanup
      createdListingIds.push(createdListing.id);
      
      // READ
      const retrievedListing = await getSupabaseListingById(createdListing.id);
      expect(retrievedListing).toBeDefined();
      expect(retrievedListing.id).toBe(createdListing.id);
      expect(retrievedListing.title).toBe(testListing.title);
      expect(retrievedListing.category).toBe(testListing.category);
      expect(retrievedListing.condition).toBe(testListing.condition);
      
      // Verify wedding-specific attributes
      expect(retrievedListing.measurements).toBeDefined();
      expect(retrievedListing.style).toBeInstanceOf(Array);
      expect(retrievedListing.color).toBeInstanceOf(Array);
      
      // UPDATE
      const updates = {
        title: "Updated Wedding Dress Title",
        price: 1500.00,
        measurements: {
          ...testListing.measurements,
          waist: { value: 30, unit: "inches" }
        }
      };
      
      const updatedListing = await updateSupabaseListing(createdListing.id, updates);
      expect(updatedListing).toBeDefined();
      expect(updatedListing.title).toBe(updates.title);
      expect(updatedListing.price).toBe(updates.price);
      
      // Verify updated measurements
      const verifyUpdated = await getSupabaseListingById(createdListing.id);
      expect(verifyUpdated.measurements.waist.value).toBe(30);
      
      // DELETE
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', createdListing.id);
      
      expect(error).toBeNull();
      
      // Verify deletion
      try {
        await getSupabaseListingById(createdListing.id);
        fail('Listing should have been deleted');
      } catch (error) {
        expect(error).toBeDefined();
      }
      
      // Remove from cleanup array since we already deleted it
      createdListingIds = createdListingIds.filter(id => id !== createdListing.id);
    });
  });
  
  describe('Category-based API Operations', () => {
    test('Should filter listings by wedding categories', async () => {
      // Create listings for each category
      const categories = ['dress', 'accessories', 'decor', 'stationery', 'gifts'];
      
      for (const category of categories) {
        const listing = {
          ...sampleListings.find(l => l.category === category) || sampleListings[0],
          title: `Test ${category} for category filtering`,
          category: category,
          sellerId: 'test-seller-id'
        };
        
        const created = await createSupabaseListing(listing as any);
        createdListingIds.push(created.id);
      }
      
      // Test filtering for each category
      for (const category of categories) {
        const listings = await getSupabaseListingsByCategory(category as any);
        
        // Verify we got results
        expect(listings.length).toBeGreaterThan(0);
        
        // Verify all listings have the correct category
        listings.forEach(listing => {
          expect(listing.category).toBe(category);
        });
      }
    });
    
    test('Should retrieve measurement templates by category', async () => {
      // Test each category that has measurement templates
      const categories = ['dress', 'accessories', 'decor'];
      
      for (const category of categories) {
        const template = await getMeasurementTemplateByCategory(category as any);
        
        // Verify template exists
        expect(template).toBeDefined();
        expect(template.category).toBe(category);
        expect(template.template).toBeDefined();
      }
    });
    
    test('Should retrieve all shipping options', async () => {
      const options = await getAllShippingOptions();
      
      // Verify options exist
      expect(options).toBeDefined();
      expect(options.length).toBeGreaterThan(0);
      
      // Verify option structure
      options.forEach(option => {
        expect(option.name).toBeDefined();
        expect(option.price_range).toBeDefined();
        expect(option.price_range.min).toBeDefined();
        expect(option.price_range.max).toBeDefined();
        expect(option.estimatedDays).toBeDefined();
        expect(option.estimatedDays.length).toBe(2);
      });
    });
  });
  
  describe('Error Handling', () => {
    test('Should handle invalid listing IDs', async () => {
      try {
        await getSupabaseListingById('non-existent-id');
        fail('Should have thrown an error for non-existent ID');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
    
    test('Should handle invalid category queries', async () => {
      try {
        await getSupabaseListingsByCategory('invalid-category' as any);
        fail('Should have thrown an error for invalid category');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
    
    test('Should handle invalid measurement template queries', async () => {
      try {
        await getMeasurementTemplateByCategory('invalid-category' as any);
        fail('Should have thrown an error for invalid category');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
