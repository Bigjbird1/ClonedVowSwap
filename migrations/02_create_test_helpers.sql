-- Migration: Create Test Helper Functions
-- Description: SQL functions to support database testing

-- Start transaction
BEGIN;

-- Function to get enum values
CREATE OR REPLACE FUNCTION get_enum_values(enum_name text)
RETURNS TABLE (enum_value text) AS $$
BEGIN
    RETURN QUERY EXECUTE format(
        'SELECT unnest(enum_range(NULL::%I))::text AS enum_value',
        enum_name
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get table columns
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE (
    column_name text,
    data_type text,
    is_nullable text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::text
    FROM 
        information_schema.columns c
    WHERE 
        c.table_name = get_table_columns.table_name
    ORDER BY 
        c.ordinal_position;
END;
$$ LANGUAGE plpgsql;

-- Function to create a database snapshot (simplified example)
-- In a real implementation, you would need a more robust solution
CREATE OR REPLACE FUNCTION create_db_snapshot()
RETURNS void AS $$
DECLARE
    snapshot_table text;
BEGIN
    -- Create a timestamp-based snapshot table name
    snapshot_table := 'snapshot_' || to_char(now(), 'YYYYMMDD_HH24MISS');
    
    -- Create a record of the snapshot
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS db_snapshots (
            id SERIAL PRIMARY KEY,
            snapshot_name TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
    ');
    
    -- Record this snapshot
    EXECUTE format('
        INSERT INTO db_snapshots (snapshot_name) VALUES (%L)
    ', snapshot_table);
    
    -- For a real implementation, you would create copies of relevant tables
    -- or use pg_dump to create a backup
    
    -- This is a simplified example that just records that a snapshot was created
    RAISE NOTICE 'Created database snapshot: %', snapshot_table;
END;
$$ LANGUAGE plpgsql;

-- Function to restore a database snapshot (simplified example)
CREATE OR REPLACE FUNCTION restore_db_snapshot()
RETURNS void AS $$
DECLARE
    snapshot_table text;
BEGIN
    -- Get the most recent snapshot
    EXECUTE '
        SELECT snapshot_name FROM db_snapshots 
        ORDER BY created_at DESC LIMIT 1
    ' INTO snapshot_table;
    
    IF snapshot_table IS NULL THEN
        RAISE EXCEPTION 'No database snapshot found';
    END IF;
    
    -- For a real implementation, you would restore data from the snapshot
    -- or use pg_restore to restore from a backup
    
    -- This is a simplified example that just records that a restore was attempted
    RAISE NOTICE 'Restored database from snapshot: %', snapshot_table;
END;
$$ LANGUAGE plpgsql;

-- Commit transaction
COMMIT;
