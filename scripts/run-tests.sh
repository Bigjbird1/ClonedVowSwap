#!/bin/bash

# VowSwap Database Migration Test Runner
# This script runs the database migration tests in a CI/CD environment

# Exit on error
set -e

# Load environment variables
if [ -f .env.test ]; then
  echo "Loading test environment variables..."
  export $(grep -v '^#' .env.test | xargs)
else
  echo "Error: .env.test file not found"
  exit 1
fi

# Check required environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: Required environment variables are missing"
  echo "Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.test"
  exit 1
fi

# Create test database snapshot
echo "Creating test database snapshot..."
# In a real CI/CD environment, you would create a snapshot of the database here
# For example, using pg_dump or a Supabase backup

# Run migrations
echo "Running main migration..."
node scripts/run-migration.js

echo "Installing test helper functions..."
node scripts/run-migration.js 02_create_test_helpers.sql

# Run tests
echo "Running tests..."
npm test

# Run tests with coverage
echo "Running tests with coverage..."
npm run test:coverage

# Check test results
if [ $? -eq 0 ]; then
  echo "All tests passed!"
  exit 0
else
  echo "Tests failed!"
  exit 1
fi
