# VowSwap Database Migration Testing Guide

This document provides instructions for testing the database migration from a sneaker marketplace to a wedding marketplace.

## Overview

The migration process involves:
1. Creating new ENUM types for wedding categories and item conditions
2. Adding wedding-specific columns to the listings table
3. Creating supporting tables for measurement templates and shipping options
4. Adding indexes for common queries
5. Migrating existing data to the new schema

## Test Environment Setup

### Prerequisites

1. Node.js and npm installed
2. Access to a Supabase test database
3. Environment variables configured in `.env.test`

### Configuration

Create a `.env.test` file with the following variables:

```
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-test-service-role-key
SUPABASE_ANON_KEY=your-test-anon-key
```

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm run migrate:test:all
```

This command will:
1. Run the main migration script
2. Install test helper functions
3. Run all tests

### Run Specific Test Suites

```bash
# Run schema migration tests
npm run test:migration

# Run data migration tests
npm run test:data

# Run rollback tests
npm run test:rollback

# Run API integration tests
npm run test:api
```

### Test Coverage

```bash
npm run test:coverage
```

## Test Suites

### 1. Schema Migration Tests

Tests in `tests/migration/migrationTests.ts` verify:
- ENUM types creation
- Table structure modifications
- Supporting tables creation
- Index creation

### 2. Data Migration Tests

Tests in `tests/data/dataMigrationTests.ts` verify:
- Creating listings with wedding-specific attributes
- JSON field handling
- Category-based queries
- Measurement template retrieval

### 3. Rollback Tests

Tests in `tests/rollback/rollbackTests.ts` verify:
- Schema rollback functionality
- Data preservation during rollback

### 4. API Integration Tests

Tests in `tests/api/apiIntegrationTests.ts` verify:
- CRUD operations with wedding attributes
- Category filtering
- Error handling

## Troubleshooting

### Connection Issues

If you encounter connection issues:
1. Verify your Supabase credentials in `.env.test`
2. Check that your IP is allowed in Supabase
3. Ensure the database is running

### Schema Issues

If schema tests fail:
1. Check that the migration script ran successfully
2. Verify that the test helper functions are installed
3. Check for any conflicts with existing schema

### Data Issues

If data tests fail:
1. Verify that the test data is valid
2. Check for any constraints that might be violated
3. Ensure that JSON fields are properly formatted

## Adding New Tests

To add new tests:
1. Create a new test file in the appropriate directory
2. Import the necessary test utilities
3. Write your tests using Jest syntax
4. Run the tests to verify they pass
