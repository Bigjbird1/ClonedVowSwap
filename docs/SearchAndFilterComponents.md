# Search and Filter Components

This document provides an overview of the Search and Filter components for the VowSwap marketplace, which enable users to efficiently search and filter wedding-specific items.

## Overview

The Search and Filter components provide a comprehensive solution for users to find wedding items based on various criteria such as:

- Text search (title and description)
- Category (dress, decor, accessories, stationery, gifts)
- Condition (new with tags, new without tags, like new, gently used, visible wear)
- Price range
- Style (vintage, modern, rustic, etc.)
- Color (white, ivory, champagne, etc.)

## Component Structure

```
SearchAndFilterContainer
├── SearchBar
└── FilterPanel
    ├── CategoryFilter
    ├── ConditionFilter
    ├── PriceRangeFilter
    ├── StyleFilter
    └── ColorFilter
```

## Usage

### Basic Implementation

```tsx
import SearchAndFilterContainer from '../Components/MainComponents/SearchAndFilter/SearchAndFilterContainer';
import { SupabaseListing } from '../models/supabaseListing';

// Your component
function YourComponent() {
  const [filteredListings, setFilteredListings] = useState<SupabaseListing[]>([]);
  
  return (
    <SearchAndFilterContainer
      initialListings={yourListingsArray}
      onFilteredResults={setFilteredListings}
    />
    
    {/* Display your filtered results */}
    <div>
      {filteredListings.map(listing => (
        <YourListingComponent key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

### Component Props

#### SearchAndFilterContainer

| Prop | Type | Description |
|------|------|-------------|
| `initialListings` | `SupabaseListing[]` | The initial array of listings to filter |
| `onFilteredResults` | `(results: SupabaseListing[]) => void` | Callback function that receives the filtered results |
| `className` | `string` (optional) | Additional CSS classes |

#### SearchBar

| Prop | Type | Description |
|------|------|-------------|
| `onSearch` | `(query: string) => void` | Callback function when search query changes |
| `initialValue` | `string` (optional) | Initial search query |
| `placeholder` | `string` (optional) | Placeholder text for the search input |
| `className` | `string` (optional) | Additional CSS classes |

#### CategoryFilter

| Prop | Type | Description |
|------|------|-------------|
| `selectedCategories` | `WeddingCategory[]` | Array of currently selected categories |
| `onChange` | `(categories: WeddingCategory[]) => void` | Callback function when selection changes |

#### ConditionFilter

| Prop | Type | Description |
|------|------|-------------|
| `selectedConditions` | `ItemCondition[]` | Array of currently selected conditions |
| `onChange` | `(conditions: ItemCondition[]) => void` | Callback function when selection changes |

#### PriceRangeFilter

| Prop | Type | Description |
|------|------|-------------|
| `priceRange` | `{ min: number \| null; max: number \| null; }` | Current price range |
| `onChange` | `(priceRange: { min: number \| null; max: number \| null; }) => void` | Callback function when price range changes |

#### StyleFilter

| Prop | Type | Description |
|------|------|-------------|
| `availableStyles` | `string[]` | Array of available styles to choose from |
| `selectedStyles` | `string[]` | Array of currently selected styles |
| `onChange` | `(styles: string[]) => void` | Callback function when selection changes |

#### ColorFilter

| Prop | Type | Description |
|------|------|-------------|
| `availableColors` | `string[]` | Array of available colors to choose from |
| `selectedColors` | `string[]` | Array of currently selected colors |
| `onChange` | `(colors: string[]) => void` | Callback function when selection changes |

## Features

### Responsive Design

- The filter panel collapses to a mobile-friendly layout on smaller screens
- Each filter section can be expanded/collapsed to save space

### User Experience Enhancements

- Clear all filters button
- Filter count badges to show active filters
- Collapsible filter sections
- Search within style and color filters
- Quick price range selections
- Color swatches with visual representation

### Performance Considerations

- Efficient filtering algorithm
- Debounced search input to prevent excessive filtering
- Memoized filter results to prevent unnecessary re-renders

## Example

A complete example implementation can be found at:
`src/app/examples/search-and-filter/SearchAndFilterExample.tsx`

You can view this example by navigating to `/examples/search-and-filter` in the application.

## Testing

Comprehensive tests for all filter components are available in:
`tests/components/SearchAndFilterComponents.test.tsx`

Run the tests with:

```bash
npm test -- --testPathPattern=SearchAndFilterComponents
```

## Customization

### Styling

The components use Tailwind CSS for styling and can be customized by:

1. Adding custom classes via the `className` prop
2. Modifying the component styles directly
3. Overriding Tailwind classes in your CSS

### Adding New Filters

To add a new filter type:

1. Create a new filter component in `src/Components/MainComponents/SearchAndFilter/Filters/`
2. Add the new filter state to the `FilterState` interface in `SearchAndFilterContainer.tsx`
3. Update the `applyFilters` function to handle the new filter type
4. Add the new filter component to the `FilterPanel` component
