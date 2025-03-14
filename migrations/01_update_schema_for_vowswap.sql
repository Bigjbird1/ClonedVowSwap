-- Migration: Update Schema for VowSwap
-- Description: Transform sneaker marketplace schema to wedding marketplace

-- Start transaction
BEGIN;

-- Create custom types
DO $$
BEGIN
    -- Create wedding category enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wedding_category') THEN
        CREATE TYPE wedding_category AS ENUM (
            'dress',
            'decor',
            'accessories',
            'stationery',
            'gifts'
        );
    END IF;

    -- Create item condition enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_condition') THEN
        CREATE TYPE item_condition AS ENUM (
            'new_with_tags',
            'new_without_tags',
            'like_new',
            'gently_used',
            'visible_wear'
        );
    END IF;
END$$;

-- Modify listings table
-- First, check if columns exist before attempting to modify
DO $$
BEGIN
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'category') THEN
        ALTER TABLE listings ADD COLUMN category wedding_category;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'original_retail_price') THEN
        ALTER TABLE listings ADD COLUMN original_retail_price decimal(10,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'measurements') THEN
        ALTER TABLE listings ADD COLUMN measurements jsonb DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'style') THEN
        ALTER TABLE listings ADD COLUMN style text[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'color') THEN
        ALTER TABLE listings ADD COLUMN color text[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'shipping_options') THEN
        ALTER TABLE listings ADD COLUMN shipping_options jsonb DEFAULT '{}'::jsonb;
    END IF;

    -- Update condition column to use new enum type
    -- First create a new column with the new type
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'condition') THEN
        ALTER TABLE listings RENAME COLUMN condition TO old_condition;
        ALTER TABLE listings ADD COLUMN condition item_condition;
        
        -- Migrate data from old to new column
        UPDATE listings SET condition = 
            CASE 
                WHEN old_condition = 'new' THEN 'new_with_tags'::item_condition
                WHEN old_condition = 'used' THEN 'gently_used'::item_condition
                ELSE NULL
            END;
    END IF;
END$$;

-- Create supporting tables
CREATE TABLE IF NOT EXISTS measurement_templates (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    category wedding_category NOT NULL,
    name text NOT NULL,
    template jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipping_options (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    price_range jsonb NOT NULL,
    estimated_days_range int[] NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Add indexes for common queries
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_category') THEN
        CREATE INDEX idx_listings_category ON listings(category);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_condition') THEN
        CREATE INDEX idx_listings_condition ON listings(condition);
    END IF;
END$$;

-- Populate measurement templates with initial data
INSERT INTO measurement_templates (category, name, template)
VALUES
    ('dress', 'Wedding Dress', '{
        "bust": {"label": "Bust", "unit": "inches"},
        "waist": {"label": "Waist", "unit": "inches"},
        "hips": {"label": "Hips", "unit": "inches"},
        "length": {"label": "Length", "unit": "inches"},
        "sleeve": {"label": "Sleeve", "unit": "inches"}
    }'::jsonb),
    ('accessories', 'Jewelry', '{
        "length": {"label": "Length", "unit": "inches"},
        "width": {"label": "Width", "unit": "inches"}
    }'::jsonb),
    ('decor', 'Table Decor', '{
        "length": {"label": "Length", "unit": "inches"},
        "width": {"label": "Width", "unit": "inches"},
        "height": {"label": "Height", "unit": "inches"}
    }'::jsonb)
ON CONFLICT DO NOTHING;

-- Populate shipping options with initial data
INSERT INTO shipping_options (name, price_range, estimated_days_range)
VALUES
    ('Standard Shipping', '{"min": 5.99, "max": 15.99}'::jsonb, '{3, 7}'),
    ('Express Shipping', '{"min": 15.99, "max": 29.99}'::jsonb, '{1, 3}'),
    ('Local Pickup', '{"min": 0, "max": 0}'::jsonb, '{0, 1}')
ON CONFLICT DO NOTHING;

-- Commit transaction
COMMIT;
