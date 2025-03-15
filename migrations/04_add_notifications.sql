-- Migration: Add Notifications System
-- Description: This migration adds tables and functions for the notification system

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, notification_type)
);

-- Create index on user_id for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Create index on is_read for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Create index on created_at for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Create index on user_id and notification_type for notification_preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id_type ON notification_preferences(user_id, notification_type);

-- Function to mark a notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE id = notification_uuid AND user_id = user_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE user_id = user_uuid AND is_read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO count
  FROM notifications
  WHERE user_id = user_uuid AND is_read = false;
  
  RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own notifications
CREATE POLICY notifications_select_policy ON notifications
  FOR SELECT
  USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Policy for users to update their own notifications
CREATE POLICY notifications_update_policy ON notifications
  FOR UPDATE
  USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Policy for users to delete their own notifications
CREATE POLICY notifications_delete_policy ON notifications
  FOR DELETE
  USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for notification_preferences table
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own notification preferences
CREATE POLICY notification_preferences_select_policy ON notification_preferences
  FOR SELECT
  USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Policy for users to update their own notification preferences
CREATE POLICY notification_preferences_update_policy ON notification_preferences
  FOR UPDATE
  USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Policy for users to insert their own notification preferences
CREATE POLICY notification_preferences_insert_policy ON notification_preferences
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Policy for users to delete their own notification preferences
CREATE POLICY notification_preferences_delete_policy ON notification_preferences
  FOR DELETE
  USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Create trigger to update updated_at timestamp on notification_preferences
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id, notification_type, enabled)
SELECT 
  id, 
  'search_spike', 
  true
FROM 
  auth.users
ON CONFLICT (user_id, notification_type) DO NOTHING;

INSERT INTO notification_preferences (user_id, notification_type, enabled)
SELECT 
  id, 
  'filter_trend', 
  true
FROM 
  auth.users
ON CONFLICT (user_id, notification_type) DO NOTHING;

INSERT INTO notification_preferences (user_id, notification_type, enabled)
SELECT 
  id, 
  'high_value_listing', 
  true
FROM 
  auth.users
ON CONFLICT (user_id, notification_type) DO NOTHING;

INSERT INTO notification_preferences (user_id, notification_type, enabled)
SELECT 
  id, 
  'listing_popularity', 
  true
FROM 
  auth.users
ON CONFLICT (user_id, notification_type) DO NOTHING;

INSERT INTO notification_preferences (user_id, notification_type, enabled)
SELECT 
  id, 
  'system_alert', 
  true
FROM 
  auth.users
ON CONFLICT (user_id, notification_type) DO NOTHING;

INSERT INTO notification_preferences (user_id, notification_type, enabled)
SELECT 
  id, 
  'user_activity', 
  true
FROM 
  auth.users
ON CONFLICT (user_id, notification_type) DO NOTHING;

INSERT INTO notification_preferences (user_id, notification_type, enabled)
SELECT 
  id, 
  'abuse_detection', 
  true
FROM 
  auth.users
ON CONFLICT (user_id, notification_type) DO NOTHING;

-- Create trigger to insert default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id, notification_type, enabled)
  VALUES 
    (NEW.id, 'search_spike', true),
    (NEW.id, 'filter_trend', true),
    (NEW.id, 'high_value_listing', true),
    (NEW.id, 'listing_popularity', true),
    (NEW.id, 'system_alert', true),
    (NEW.id, 'user_activity', true),
    (NEW.id, 'abuse_detection', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_notification_preferences
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_default_notification_preferences();

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count TO authenticated;
