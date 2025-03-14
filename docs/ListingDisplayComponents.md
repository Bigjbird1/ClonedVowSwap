# Listing Display Components

This document provides an overview of the Listing Display Components for the VowSwap marketplace. These components are designed to display wedding-specific attributes in a user-friendly and visually appealing way.

## Component Structure

The Listing Display Components are organized as follows:

```
Listing Display Components
├── ListingCard
├── ListingDetailView
├── WeddingAttributeBadges
└── MeasurementDisplay
```

## Main Components

### ListingCard

The `ListingCard` component is used to display a listing in a grid view, such as on the listings page or search results.

#### Props

- `id`: Unique identifier for the listing
- `title`: Title of the listing
- `description`: Description of the listing
- `price`: Current price of the listing
- `originalRetailPrice`: (Optional) Original retail price of the item
- `photos`: Array of photo objects with URL and alt text
- `category`: (Optional) Wedding category (dress, decor, accessories, etc.)
- `condition`: (Optional) Item condition (new_with_tags, like_new, etc.)
- `measurements`: (Optional) Object containing measurements with values and units
- `style`: (Optional) Array of style tags
- `color`: (Optional) Array of color tags

#### Features

- Image carousel with navigation
- Discount percentage calculation
- Category and condition badges
- Primary measurement display
- Style and color tags
- Save/bookmark functionality

#### Usage

```tsx
import ListingCard from "../Components/MainComponents/Listings/ListingCard";

// In your component:
<ListingCard
  id="123"
  title="Beautiful Wedding Dress"
  description="A stunning wedding dress in excellent condition"
  price={500}
  originalRetailPrice={1200}
  photos={[
    { url: "/images/dress1.jpg", alt: "Wedding Dress Front" },
    { url: "/images/dress2.jpg", alt: "Wedding Dress Back" },
  ]}
  category="dress"
  condition="like_new"
  measurements={{
    bust: { value: 36, unit: "inches" },
    waist: { value: 28, unit: "inches" },
  }}
  style={["Vintage", "Lace"]}
  color={["White", "Ivory"]}
/>
```

### ListingDetailView

The `ListingDetailView` component is used to display a detailed view of a listing, such as on the listing detail page.

#### Props

Same as `ListingCard`, plus:

- `shippingOptions`: (Optional) Array of shipping options with name, price, and estimated delivery days
- `seller`: Object containing seller information (id, name, imageUrl, location, rating)

#### Features

- Full-size image gallery with lightbox
- Detailed wedding attribute display with tooltips
- Measurement display with unit conversion
- Shipping options selection
- Total price calculation
- Seller information
- Save/bookmark and share functionality

#### Usage

```tsx
import ListingDetailView from "../Components/MainComponents/Listings/ListingDetailView";

// In your component:
<ListingDetailView
  id="123"
  title="Beautiful Wedding Dress"
  description="A stunning wedding dress in excellent condition"
  price={500}
  originalRetailPrice={1200}
  photos={[
    { url: "/images/dress1.jpg", alt: "Wedding Dress Front" },
    { url: "/images/dress2.jpg", alt: "Wedding Dress Back" },
  ]}
  category="dress"
  condition="like_new"
  measurements={{
    bust: { value: 36, unit: "inches" },
    waist: { value: 28, unit: "inches" },
  }}
  style={["Vintage", "Lace"]}
  color={["White", "Ivory"]}
  shippingOptions={[
    {
      name: "Standard Shipping",
      price: 9.99,
      estimatedDays: [3, 5],
    },
    {
      name: "Express Shipping",
      price: 19.99,
      estimatedDays: [1, 2],
    },
  ]}
  seller={{
    id: "seller123",
    name: "Jane Smith",
    imageUrl: "/images/profiles/jane.jpg",
    location: "New York, NY",
    rating: 4.8,
  }}
/>
```

## Helper Components

### WeddingAttributeBadges

The `WeddingAttributeBadges` component displays category, condition, style, and color badges.

#### Props

- `category`: (Optional) Wedding category
- `condition`: (Optional) Item condition
- `style`: (Optional) Array of style tags
- `color`: (Optional) Array of color tags
- `size`: (Optional) Size of badges ("sm", "md", or "lg")
- `showTooltips`: (Optional) Whether to show tooltips on hover

#### Usage

```tsx
import WeddingAttributeBadges from "../Components/MainComponents/Listings/WeddingAttributeBadges";

// In your component:
<WeddingAttributeBadges
  category="dress"
  condition="new_with_tags"
  style={["Vintage", "Lace"]}
  color={["White", "Ivory"]}
  size="md"
  showTooltips={true}
/>
```

### MeasurementDisplay

The `MeasurementDisplay` component displays measurements with unit conversion.

#### Props

- `category`: (Optional) Wedding category
- `measurements`: Object containing measurements with values and units
- `showDiagram`: (Optional) Whether to show a measurement diagram

#### Features

- Unit conversion (inches, cm, mm, m)
- Category-specific measurement descriptions
- Measurement diagrams (when available)

#### Usage

```tsx
import MeasurementDisplay from "../Components/MainComponents/Listings/MeasurementDisplay";

// In your component:
<MeasurementDisplay
  category="dress"
  measurements={{
    bust: { value: 36, unit: "inches" },
    waist: { value: 28, unit: "inches" },
    hips: { value: 38, unit: "inches" },
  }}
  showDiagram={true}
/>
```

## Testing

Unit tests for the Listing Display Components can be found at:

```
/tests/components/ListingComponents.test.tsx
```

These tests cover rendering, interaction, and functionality of the components.

## Styling

The Listing Display Components use Tailwind CSS for styling. The components are designed to be responsive and accessible.

## Future Enhancements

Potential future enhancements for the Listing Display Components include:

- Integration with favorites/wishlist functionality
- Social sharing capabilities
- Enhanced measurement diagrams with interactive elements
- More advanced filtering options
- AR/VR integration for virtual try-on (for dress category)
- Comparison feature for multiple listings
