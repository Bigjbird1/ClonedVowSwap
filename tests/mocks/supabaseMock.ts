import { createClient } from '@supabase/supabase-js';

// Mock Supabase client for testing
export const mockSupabaseClient = {
  from: jest.fn().mockImplementation((table) => {
    if (table === 'measurement_templates') {
      return {
        select: jest.fn().mockReturnValue({
          data: [
            {
              id: '1',
              category: 'dress',
              name: 'Wedding Dress',
              template: {
                bust: { label: 'Bust', unit: 'inches' },
                waist: { label: 'Waist', unit: 'inches' },
                hips: { label: 'Hips', unit: 'inches' },
                length: { label: 'Length', unit: 'inches' },
                sleeve: { label: 'Sleeve', unit: 'inches' }
              }
            },
            {
              id: '2',
              category: 'accessories',
              name: 'Jewelry',
              template: {
                length: { label: 'Length', unit: 'inches' },
                width: { label: 'Width', unit: 'inches' }
              }
            }
          ],
          error: null
        })
      };
    } else if (table === 'shipping_options') {
      return {
        select: jest.fn().mockReturnValue({
          data: [
            {
              id: '1',
              name: 'Standard Shipping',
              price_range: { min: 5.99, max: 15.99 },
              estimated_days_range: [3, 7]
            },
            {
              id: '2',
              name: 'Express Shipping',
              price_range: { min: 15.99, max: 29.99 },
              estimated_days_range: [1, 3]
            }
          ],
          error: null
        })
      };
    } else if (table === 'listings') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnValue({
          data: {
            id: 'mock-id-123',
            title: 'Test Listing',
            condition: 'new_with_tags'
          },
          error: null
        }),
        order: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation(callback => {
          return Promise.resolve(callback({ data: [], error: null }));
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: { success: true },
            error: null
          }),
          in: jest.fn().mockReturnValue({
            data: { success: true },
            error: null
          })
        })
      };
    }
    return {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(callback => {
        return Promise.resolve(callback({ data: [], error: null }));
      }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          data: { success: true },
          error: null
        }),
        in: jest.fn().mockReturnValue({
          data: { success: true },
          error: null
        })
      })
    };
  }),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  rpc: jest.fn().mockImplementation((func, params) => {
    if (func === 'exec_sql' && params?.sql?.includes('idx_listings_category')) {
      return {
        data: [
          { indexname: 'idx_listings_category', indexdef: 'CREATE INDEX idx_listings_category ON listings(category)' },
          { indexname: 'idx_listings_condition', indexdef: 'CREATE INDEX idx_listings_condition ON listings(condition)' }
        ],
        error: null
      };
    }
    return { data: [], error: null };
  }),
};

// Mock setupTestEnvironment function
export const mockSetupTestEnvironment = async () => {
  return Promise.resolve(mockSupabaseClient);
};

// Mock createDatabaseSnapshot function
export const mockCreateDatabaseSnapshot = async () => {
  return true;
};

// Mock restoreDatabaseSnapshot function
export const mockRestoreDatabaseSnapshot = async () => {
  return true;
};

// Mock getEnumValues function
export const mockGetEnumValues = async (enumName: string) => {
  if (enumName === 'wedding_category') {
    return ['dress', 'decor', 'accessories', 'stationery', 'gifts'];
  } else if (enumName === 'item_condition') {
    return ['new_with_tags', 'new_without_tags', 'like_new', 'gently_used', 'visible_wear'];
  }
  return [];
};

// Mock getTableColumns function
export const mockGetTableColumns = async (tableName: string) => {
  if (tableName === 'listings') {
    return [
      { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
      { column_name: 'title', data_type: 'text', is_nullable: 'NO' },
      { column_name: 'description', data_type: 'text', is_nullable: 'NO' },
      { column_name: 'price', data_type: 'numeric', is_nullable: 'NO' },
      { column_name: 'photos', data_type: 'jsonb', is_nullable: 'NO' },
      { column_name: 'sellerId', data_type: 'text', is_nullable: 'NO' },
      { column_name: 'category', data_type: 'USER-DEFINED', is_nullable: 'YES' },
      { column_name: 'condition', data_type: 'USER-DEFINED', is_nullable: 'YES' },
      { column_name: 'original_retail_price', data_type: 'numeric', is_nullable: 'YES' },
      { column_name: 'measurements', data_type: 'jsonb', is_nullable: 'YES' },
      { column_name: 'style', data_type: 'ARRAY', is_nullable: 'YES' },
      { column_name: 'color', data_type: 'ARRAY', is_nullable: 'YES' },
      { column_name: 'shipping_options', data_type: 'jsonb', is_nullable: 'YES' },
    ];
  }
  return [];
};
