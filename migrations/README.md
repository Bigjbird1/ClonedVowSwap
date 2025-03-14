# VowSwap Database Migration Guide

This directory contains database migration scripts for transforming the existing sneaker marketplace schema into the VowSwap wedding marketplace schema.

## Migration Files

- `01_update_schema_for_vowswap.sql`: Initial schema transformation for VowSwap

## Running Migrations

### Prerequisites

Before running migrations, ensure you have:

1. Set up your Supabase environment variables in `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (required for schema modifications)

2. Backed up your database (recommended)

### Option 1: Using the Migration Runner Script

We've provided a Node.js script to run migrations:

```bash
# Install dependencies if needed
npm install

# Run the migration
node scripts/run-migration.js 01_update_schema_for_vowswap.sql
```

### Option 2: Manual Execution in Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file
4. Paste into the SQL Editor and execute

## Migration Details

### 01_update_schema_for_vowswap.sql

This migration:

1. Creates new ENUM types:
   - `wedding_category` (dress, decor, accessories, stationery, gifts)
   - `item_condition` (new_with_tags, new_without_tags, like_new, gently_used, visible_wear)

2. Modifies the `listings` table:
   - Adds wedding-specific columns (category, measurements, style, color, etc.)
   - Updates the condition column to use the new enum type
   - Adds indexes for common queries

3. Creates supporting tables:
   - `measurement_templates` for standardized measurements by category
   - `shipping_options` for shipping choices

4. Populates initial data for measurement templates and shipping options

## Post-Migration Steps

After running the migration:

1. Update your TypeScript models to use the new schema
2. Test existing functionality to ensure backward compatibility
3. Begin implementing wedding-specific features using the new schema

## Rollback

If you need to rollback the migration, you can use the following SQL:

```sql
-- This is a simplified rollback and may need adjustments
BEGIN;

-- Drop new tables
DROP TABLE IF EXISTS measurement_templates;
DROP TABLE IF EXISTS shipping_options;

-- Restore original condition column if needed
ALTER TABLE listings DROP COLUMN IF EXISTS condition;
ALTER TABLE listings RENAME COLUMN old_condition TO condition;

-- Drop new columns
ALTER TABLE listings 
  DROP COLUMN IF EXISTS category,
  DROP COLUMN IF EXISTS original_retail_price,
  DROP COLUMN IF EXISTS measurements,
  DROP COLUMN IF EXISTS style,
  DROP COLUMN IF EXISTS color,
  DROP COLUMN IF EXISTS shipping_options;

-- Drop custom types
DROP TYPE IF EXISTS wedding_category;
DROP TYPE IF EXISTS item_condition;

COMMIT;
```

## Troubleshooting

If you encounter issues:

1. Check the Supabase logs for detailed error messages
2. Ensure your service role key has sufficient permissions
3. Verify that the SQL syntax is compatible with PostgreSQL version used by Supabase
