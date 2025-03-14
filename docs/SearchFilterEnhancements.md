# VowSwap Search and Filter Enhancements

This document provides an overview of the enhanced search and filter functionality for the VowSwap marketplace, including server-side filtering, performance optimizations, analytics tracking, and saved filters.

## Table of Contents

1. [Server-Side Filtering](#server-side-filtering)
2. [Performance Optimizations](#performance-optimizations)
3. [Analytics Tracking](#analytics-tracking)
4. [Saved Filters](#saved-filters)
5. [Database Schema](#database-schema)
6. [Implementation Guide](#implementation-guide)

## Server-Side Filtering

The server-side filtering implementation provides efficient and scalable filtering capabilities for the VowSwap marketplace.

### API Endpoint

- **Route**: `/api/listings/filter`
- **Method**: GET
- **Query Parameters**:
  - `search`: Text search query
  - `categories`: Comma-separated list of wedding categories
  - `conditions`: Comma-separated list of item conditions
  - `priceMin`: Minimum price
  - `priceMax`: Maximum price
  - `styles`: Comma-separated list of styles
  - `colors`: Comma-separated list of colors
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `sortBy`: Field to sort by
  - `sortDirection`: Sort direction ('asc' or 'desc')

### Supabase Integration

The filter API uses Supabase queries to efficiently filter listings based on the provided parameters. The implementation includes:

- Text search across title and description
- Category and condition filtering
- Price range filtering
- Style and color filtering with array containment
- Pagination and sorting

### Response Format

```json
{
  "listings": [
    {
      "id": "123",
      "title": "Wedding Dress",
      "description": "Beautiful wedding dress",
      "price": 500,
      "category": "dress",
      "condition": "like_new",
      // other listing fields
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## Performance Optimizations

Several performance optimizations have been implemented to ensure a smooth user experience, especially with large datasets.

### Debouncing

The `useDebounce` hook delays the execution of a function until a specified delay has passed since the last call. This is particularly useful for search inputs to prevent excessive API calls while the user is typing.

```typescript
// Example usage
const debouncedSearchTerm = useDebounce(searchTerm, 300);

useEffect(() => {
  // This effect only runs when debouncedSearchTerm changes
  fetchResults(debouncedSearchTerm);
}, [debouncedSearchTerm]);
```

### Throttling

The `useThrottle` hook limits the rate at which a function can be called. Unlike debounce, throttle ensures a function is called at most once in a specified time period.

```typescript
// Example usage
const throttledFilterChange = useThrottle(filterState, 200);

useEffect(() => {
  // This effect runs at most once every 200ms
  applyFilters(throttledFilterChange);
}, [throttledFilterChange]);
```

### Memoization

The `useMemoizedValue` hook caches expensive computations and only recalculates them when dependencies change.

```typescript
// Example usage
const expensiveComputation = useMemoizedValue(() => {
  // Complex calculation based on filters
  return processFilters(filters);
}, [filters]);
```

## Analytics Tracking

The analytics service tracks user interactions with the search and filter functionality to provide insights into user behavior.

### Tracked Events

- **Search**: When a user performs a search
- **Filter Apply**: When a user applies a filter
- **Filter Remove**: When a user removes a filter
- **Filter Clear**: When a user clears all filters
- **Listing View**: When a user views a listing
- **Listing Click**: When a user clicks on a listing
- **Save Filter**: When a user saves a filter configuration
- **Apply Saved Filter**: When a user applies a saved filter

### Implementation

The analytics service batches events and sends them to Supabase in the background to minimize performance impact. Events are stored in the `analytics_events` table.

```typescript
// Example usage
import analyticsService from '../services/analyticsService';

// Track a search event
analyticsService.trackSearch('wedding dress');

// Track a filter application
analyticsService.trackFilterApply('category', 'dress');
```

### Analytics Dashboard

The analytics data can be queried to provide insights such as:

- Most popular search terms
- Most used filters
- Filter usage by user
- Popular filter combinations

## Saved Filters

The saved filters functionality allows users to save and reuse their filter configurations.

### Features

- Save current filter configuration with a name
- View list of saved filters
- Apply a saved filter
- Delete a saved filter
- Track last used date

### Implementation

Saved filters are stored in the `saved_filters` table in Supabase. The saved filters service provides methods for managing saved filters.

```typescript
// Example usage
import savedFiltersService from '../services/savedFiltersService';

// Save a filter
await savedFiltersService.saveFilter('My Wedding Dress Filter', filterState);

// Get all saved filters
const filters = await savedFiltersService.getSavedFilters();

// Apply a saved filter
const filterData = await savedFiltersService.applySavedFilter(filterId);
```

## Database Schema

### Analytics Events Table

```sql
CREATE TABLE analytics_events (
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
```

### Saved Filters Table

```sql
CREATE TABLE saved_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  filter_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Implementation Guide

### Setting Up the Database

1. Run the migration script to create the necessary tables:
   ```bash
   node scripts/run-migration.js 03_add_analytics_and_saved_filters.sql
   ```

### Integrating Server-Side Filtering

1. Update the listings page to use the filter API endpoint
2. Pass filter parameters from the UI to the API
3. Display the filtered results and pagination

### Adding Performance Optimizations

1. Use the `useDebounce` hook for search inputs
2. Use the `useThrottle` hook for filter changes
3. Use the `useMemoizedValue` hook for expensive computations

### Implementing Analytics Tracking

1. Add analytics tracking to search and filter interactions
2. Create an admin dashboard to view analytics data
3. Set up regular analytics reports

### Adding Saved Filters

1. Add the SavedFiltersPanel component to the filter UI
2. Implement the save filter functionality
3. Implement the apply saved filter functionality

## Conclusion

These enhancements provide a robust and user-friendly search and filter experience for the VowSwap marketplace. The server-side filtering ensures efficient data retrieval, the performance optimizations ensure a smooth user experience, the analytics tracking provides valuable insights, and the saved filters functionality improves user convenience.
