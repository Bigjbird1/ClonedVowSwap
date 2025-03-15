-- Migration: 06_add_performance_indexes.sql
-- Description: Adds database indexes to improve query performance for VowSwap marketplace

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for frequently accessed columns in listings table
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_condition ON listings(condition);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);

-- Create composite indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_listings_category_condition ON listings(category, condition);
CREATE INDEX IF NOT EXISTS idx_listings_category_price ON listings(category, price);
CREATE INDEX IF NOT EXISTS idx_listings_user_id_status ON listings(user_id, status);

-- Create indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_listings_title_description_gin ON listings USING gin(to_tsvector('english', title || ' ' || description));

-- Create indexes for order-related tables
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Create indexes for order items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_listing_id ON order_items(listing_id);

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Create indexes for shipping details
CREATE INDEX IF NOT EXISTS idx_shipping_details_order_id ON shipping_details(order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_details_status ON shipping_details(status);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Create indexes for saved filters
CREATE INDEX IF NOT EXISTS idx_saved_filters_user_id ON saved_filters(user_id);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_search_metrics_query ON search_metrics(query);
CREATE INDEX IF NOT EXISTS idx_search_metrics_created_at ON search_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_filter_usage_filter_type ON filter_usage(filter_type);
CREATE INDEX IF NOT EXISTS idx_filter_usage_created_at ON filter_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);

-- Add comment to document the migration
COMMENT ON MIGRATION IS 'Added database indexes to improve query performance for VowSwap marketplace';
