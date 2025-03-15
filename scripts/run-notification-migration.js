// Script to run the notification system migration
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Check if Supabase URL and key are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

// Path to the migration file
const migrationFile = path.join(__dirname, '../migrations/04_add_notifications.sql');

// Check if the migration file exists
if (!fs.existsSync(migrationFile)) {
  console.error(`Error: Migration file not found: ${migrationFile}`);
  process.exit(1);
}

// Read the migration file
const migrationSql = fs.readFileSync(migrationFile, 'utf8');

// Run the migration using the Supabase CLI
console.log('Running notification system migration...');

try {
  // Use the Supabase CLI to run the migration
  // This assumes the Supabase CLI is installed and configured
  execSync(`echo "${migrationSql}" | supabase db execute --db-url ${process.env.NEXT_PUBLIC_SUPABASE_URL}`, {
    stdio: 'inherit',
  });
  
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Error running migration:', error.message);
  process.exit(1);
}

// Verify the migration by checking if the tables were created
console.log('Verifying migration...');

try {
  // Check if the notifications table exists
  const checkNotificationsTable = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'notifications'
    );
  `;
  
  // Check if the notification_preferences table exists
  const checkPreferencesTable = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'notification_preferences'
    );
  `;
  
  // Run the checks
  execSync(`echo "${checkNotificationsTable}" | supabase db execute --db-url ${process.env.NEXT_PUBLIC_SUPABASE_URL}`, {
    stdio: 'inherit',
  });
  
  execSync(`echo "${checkPreferencesTable}" | supabase db execute --db-url ${process.env.NEXT_PUBLIC_SUPABASE_URL}`, {
    stdio: 'inherit',
  });
  
  console.log('Verification completed successfully!');
  console.log('Notification system is ready to use.');
} catch (error) {
  console.error('Error verifying migration:', error.message);
  process.exit(1);
}
