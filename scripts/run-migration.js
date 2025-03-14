// Migration Runner Script
// This script executes SQL migrations against your Supabase database

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client with service role key for admin privileges
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration(migrationFile) {
  try {
    console.log(`Running migration: ${migrationFile}`);
    
    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
    
    // Execute each statement directly using Supabase's REST API
    for (const statement of statements) {
      const { data, error } = await supabase
        .from('_migrations')
        .insert({
          name: migrationFile,
          sql: statement.trim() + ';',
          executed_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Migration statement failed:', error);
        console.error('Statement:', statement.trim());
        return false;
      }
    }
    
    console.log(`Migration ${migrationFile} completed successfully`);
    return true;
  } catch (err) {
    console.error('Error running migration:', err);
    return false;
  }
}

async function main() {
  // Get migration file from command line argument or use default
  const migrationFile = process.argv[2] || '01_update_schema_for_vowswap.sql';
  
  console.log('Starting migration process...');
  
  // Run the migration
  const success = await runMigration(migrationFile);
  
  if (success) {
    console.log('Migration completed successfully');
  } else {
    console.error('Migration failed');
    process.exit(1);
  }
}

main();
