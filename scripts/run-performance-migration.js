// Script to run the performance optimization migration
require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const migrationFile = '06_add_performance_indexes.sql';
const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);

// Validate that the migration file exists
if (!fs.existsSync(migrationPath)) {
  console.error(`Migration file not found: ${migrationPath}`);
  process.exit(1);
}

// Get database connection details from environment variables
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_DB_URL
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_DB_URL) {
  console.error('Missing required environment variables. Please check your .env file.');
  console.error('Required variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL');
  process.exit(1);
}

console.log(`Running migration: ${migrationFile}`);
console.log('This migration adds database indexes to improve query performance.');

try {
  // Execute the migration using psql
  const command = `psql "${SUPABASE_DB_URL}" -f "${migrationPath}"`;
  
  console.log('Executing migration...');
  const output = execSync(command, { encoding: 'utf8' });
  
  console.log('Migration output:');
  console.log(output);
  
  console.log('Migration completed successfully.');
  console.log('Performance indexes have been added to the database.');
  console.log('These indexes will improve query performance for:');
  console.log('- Listing searches by category, condition, and price');
  console.log('- Full-text search on listing titles and descriptions');
  console.log('- Order management queries');
  console.log('- Notification and analytics queries');
  
} catch (error) {
  console.error('Migration failed:');
  console.error(error.message);
  
  if (error.stdout) {
    console.error('Standard output:');
    console.error(error.stdout);
  }
  
  if (error.stderr) {
    console.error('Standard error:');
    console.error(error.stderr);
  }
  
  process.exit(1);
}
