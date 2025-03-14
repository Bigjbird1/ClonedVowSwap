-- Migration to add analytics and saved filters tables for VowSwap

-- First, create the exec_sql function if it doesn't exist
-- This function is needed by the migration script to execute SQL
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql TO service_role;

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  filter_type TEXT,
  filter_value JSONB,
  search_query TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  listing_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_filter_type ON analytics_events(filter_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_search_query ON analytics_events(search_query);

-- Create saved_filters table
CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  filter_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for saved_filters
CREATE INDEX IF NOT EXISTS idx_saved_filters_user_id ON saved_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_updated_at ON saved_filters(updated_at);

-- Create RLS policies for analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own analytics events
CREATE POLICY analytics_events_select_policy ON analytics_events
  FOR SELECT USING (user_id = auth.uid() OR auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.uid() = id AND auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  ));

-- Allow any authenticated user to insert analytics events
CREATE POLICY analytics_events_insert_policy ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for saved_filters
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own saved filters
CREATE POLICY saved_filters_select_policy ON saved_filters
  FOR SELECT USING (user_id = auth.uid());

-- Only allow users to insert their own saved filters
CREATE POLICY saved_filters_insert_policy ON saved_filters
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Only allow users to update their own saved filters
CREATE POLICY saved_filters_update_policy ON saved_filters
  FOR UPDATE USING (user_id = auth.uid());

-- Only allow users to delete their own saved filters
CREATE POLICY saved_filters_delete_policy ON saved_filters
  FOR DELETE USING (user_id = auth.uid());

-- Create function to get most used filters
CREATE OR REPLACE FUNCTION get_most_used_filters(
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  filter_type TEXT,
  count BIGINT
)
LANGUAGE SQL
AS $$
  SELECT filter_type, COUNT(*) as count
  FROM analytics_events
  WHERE event_type = 'filter_apply' AND filter_type IS NOT NULL
  GROUP BY filter_type
  ORDER BY count DESC
  LIMIT limit_count;
$$;

-- Create function to get most popular search terms
CREATE OR REPLACE FUNCTION get_most_popular_search_terms(
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  search_query TEXT,
  count BIGINT
)
LANGUAGE SQL
AS $$
  SELECT search_query, COUNT(*) as count
  FROM analytics_events
  WHERE event_type = 'search' AND search_query IS NOT NULL
  GROUP BY search_query
  ORDER BY count DESC
  LIMIT limit_count;
$$;

-- Create function to get filter usage by user
CREATE OR REPLACE FUNCTION get_filter_usage_by_user(
  user_uuid UUID
)
RETURNS TABLE (
  filter_type TEXT,
  count BIGINT
)
LANGUAGE SQL
AS $$
  SELECT filter_type, COUNT(*) as count
  FROM analytics_events
  WHERE user_id = user_uuid AND event_type = 'filter_apply' AND filter_type IS NOT NULL
  GROUP BY filter_type
  ORDER BY count DESC;
$$;
