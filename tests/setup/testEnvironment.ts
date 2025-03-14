import { createClient } from '@supabase/supabase-js';

/**
 * Sets up the test environment and returns a Supabase client
 */
export const setupTestEnvironment = async () => {
  // Initialize test database client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.test file');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Verify connection
  try {
    const { data, error } = await supabase.from('listings').select('count');
    if (error) throw error;
    console.info('Test database connection successful');
  } catch (error) {
    console.error('Test database connection failed:', error);
    throw new Error('Failed to connect to test database');
  }
  
  return supabase;
};

/**
 * Creates a database snapshot for rollback testing
 */
export const createDatabaseSnapshot = async (supabase: any) => {
  try {
    // This is a simplified example - in a real implementation, you would
    // need to create a proper snapshot mechanism or use a transaction
    const { error } = await supabase.rpc('create_db_snapshot');
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to create database snapshot:', error);
    return false;
  }
};

/**
 * Restores database from snapshot
 */
export const restoreDatabaseSnapshot = async (supabase: any) => {
  try {
    // This is a simplified example - in a real implementation, you would
    // need to create a proper restore mechanism
    const { error } = await supabase.rpc('restore_db_snapshot');
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to restore database snapshot:', error);
    return false;
  }
};

/**
 * Helper function to get enum values from database
 */
export const getEnumValues = async (supabase: any, enumName: string) => {
  try {
    // SQL query to get enum values
    const { data, error } = await supabase.rpc('get_enum_values', { enum_name: enumName });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Failed to get enum values for ${enumName}:`, error);
    return [];
  }
};

/**
 * Helper function to get table columns
 */
export const getTableColumns = async (supabase: any, tableName: string) => {
  try {
    // SQL query to get table columns
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: tableName });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Failed to get columns for table ${tableName}:`, error);
    return [];
  }
};
