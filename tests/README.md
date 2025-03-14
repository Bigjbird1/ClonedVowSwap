# VowSwap Database Migration Testing Suite

This directory contains tests for the VowSwap database migration from a sneaker marketplace to a wedding marketplace.

## Test Structure

The tests are organized into the following directories:

- `setup/`: Test environment setup and helper functions
- `migration/`: Tests for schema migration and verification
- `data/`: Tests for data migration and integrity
- `rollback/`: Tests for rollback procedures
- `api/`: Tests for API integration with the new schema

## Running Tests

### Prerequisites

1. Set up a test database in Supabase
2. Configure `.env.test` with your test database credentials:

```
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-test-service-role-key
SUPABASE_ANON_KEY=your-test-anon-key
```

### Setup Test Helpers

Before running the tests, you need to set up the test helper functions in the database:

```bash
npm run migrate:test
```

This will run the `02_create_test_helpers.sql` migration script to create the necessary helper functions.

### Running All Tests

```bash
npm test
```

### Running Specific Test Suites

```bash
# Run migration tests
npm run test:migration

# Run data migration tests
npm run test:data

# Run rollback tests
npm run test:rollback

# Run API integration tests
npm run test:api
```

### Watch Mode

```bash
npm run test:watch
```

## Test Coverage

The tests cover the following aspects of the database migration:

### 1. Schema Verification

- ENUM types creation (`wedding_category` and `item_condition`)
- Table structure modifications (new columns in `listings` table)
- Supporting tables creation (`measurement_templates` and `shipping_options`)
- Index creation

### 2. Data Migration

- Creating listings with wedding-specific attributes
- JSON field handling (measurements, shipping options)
- Array field handling (style, color)
- Category-based queries

### 3. Rollback Procedures

- Schema rollback
- Data preservation during rollback
- Restoring original schema

### 4. API Integration

- CRUD operations with wedding-specific attributes
- Category-based filtering
- Measurement template retrieval
- Shipping options retrieval
- Error handling

## Test Data

Sample test data is provided in `data/testData.ts`, including:

- Sample wedding listings for each category
- Sample shipping options
- Sample measurement templates

## Extending the Tests

To add new tests:

1. Add test files to the appropriate directory
2. Update the test data if needed
3. Run the tests to verify your changes

## Troubleshooting

If you encounter issues with the tests:

1. Verify your Supabase connection in `.env.test`
2. Check that the test helper functions are installed
3. Ensure the database schema is up to date
4. Check for any errors in the test output
