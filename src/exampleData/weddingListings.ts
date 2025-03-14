import { WeddingCategory, ItemCondition, SupabaseListing } from "../../models/supabaseListing";

export const weddingListings: SupabaseListing[] = [
  {
    id: "wedding-dress-1",
    title: "Elegant Lace Wedding Dress",
    description: "Beautiful lace wedding dress with a sweetheart neckline and chapel train. Worn once for my wedding day and professionally cleaned. In excellent condition with no visible flaws or alterations.",
    price: 850,
    originalRetailPrice: 2200,
    photos: [
      { url: "/images/sneaker1.png", alt: "Wedding Dress Front" },
      { url: "/images/sneaker2.png", alt: "Wedding Dress Back" },
      { url: "/images/sneaker3.png", alt: "Wedding Dress Detail" },
    ],
    sellerId: "user-1",
    category: "dress",
    condition: "like_new",
    measurements: {
      bust: { value: 36, unit: "inches" },
      waist: { value: 28, unit: "inches" },
      hips: { value: 38, unit: "inches" },
      length: { value: 60, unit: "inches" },
    },
    style: ["Lace", "A-line", "Sweetheart", "Vintage"],
    color: ["Ivory", "Champagne"],
    shippingOptions: [
      {
        name: "Standard Shipping",
        price: 15.99,
        estimatedDays: [3, 5],
      },
      {
        name: "Express Shipping",
        price: 29.99,
        estimatedDays: [1, 2],
      },
    ],
  },
  {
    id: "wedding-decor-1",
    title: "Rustic Wedding Centerpieces (Set of 10)",
    description: "Set of 10 rustic wedding centerpieces featuring mason jars with burlap and lace accents. Perfect for a rustic or country-themed wedding. Used for one day and in excellent condition.",
    price: 120,
    originalRetailPrice: 250,
    photos: [
      { url: "/images/sneaker2.png", alt: "Centerpiece Set" },
      { url: "/images/sneaker3.png", alt: "Centerpiece Detail" },
    ],
    sellerId: "user-2",
    category: "decor",
    condition: "gently_used",
    measurements: {
      height: { value: 8, unit: "inches" },
      width: { value: 4, unit: "inches" },
    },
    style: ["Rustic", "Country", "Vintage"],
    color: ["Brown", "White", "Green"],
    shippingOptions: [
      {
        name: "Standard Shipping",
        price: 12.99,
        estimatedDays: [3, 5],
      },
    ],
  },
  {
    id: "wedding-accessories-1",
    title: "Crystal Bridal Tiara",
    description: "Stunning crystal bridal tiara with pearl accents. Perfect for adding a touch of elegance to your wedding day look. Worn once and in perfect condition.",
    price: 75,
    originalRetailPrice: 150,
    photos: [
      { url: "/images/sneaker3.png", alt: "Tiara Front" },
      { url: "/images/sneaker4.png", alt: "Tiara Side" },
    ],
    sellerId: "user-3",
    category: "accessories",
    condition: "like_new",
    measurements: {
      length: { value: 6, unit: "inches" },
      height: { value: 2, unit: "inches" },
    },
    style: ["Crystal", "Elegant", "Princess"],
    color: ["Silver", "Clear"],
    shippingOptions: [
      {
        name: "Standard Shipping",
        price: 5.99,
        estimatedDays: [3, 5],
      },
      {
        name: "Express Shipping",
        price: 12.99,
        estimatedDays: [1, 2],
      },
    ],
  },
  {
    id: "wedding-stationery-1",
    title: "Floral Wedding Invitation Suite (50 Sets)",
    description: "Beautiful floral wedding invitation suite including invitations, RSVP cards, and envelopes. 50 sets available, never used due to change of plans.",
    price: 120,
    originalRetailPrice: 300,
    photos: [
      { url: "/images/sneaker4.png", alt: "Invitation Suite" },
      { url: "/images/sneaker1.png", alt: "Invitation Detail" },
    ],
    sellerId: "user-4",
    category: "stationery",
    condition: "new_with_tags",
    measurements: {
      width: { value: 5, unit: "inches" },
      height: { value: 7, unit: "inches" },
    },
    style: ["Floral", "Elegant", "Watercolor"],
    color: ["Pink", "Green", "White"],
    shippingOptions: [
      {
        name: "Standard Shipping",
        price: 8.99,
        estimatedDays: [3, 5],
      },
    ],
  },
  {
    id: "wedding-gifts-1",
    title: "Personalized Wedding Champagne Flutes (Set of 2)",
    description: "Beautiful personalized champagne flutes with 'Mr & Mrs' and wedding date. Perfect for toasting on your special day and as a keepsake afterward. Never used, still in original packaging.",
    price: 35,
    originalRetailPrice: 60,
    photos: [
      { url: "/images/sneaker1.png", alt: "Champagne Flutes" },
      { url: "/images/sneaker2.png", alt: "Champagne Flutes Detail" },
    ],
    sellerId: "user-5",
    category: "gifts",
    condition: "new_with_tags",
    measurements: {
      height: { value: 9, unit: "inches" },
    },
    style: ["Personalized", "Elegant", "Classic"],
    color: ["Clear", "Silver"],
    shippingOptions: [
      {
        name: "Standard Shipping",
        price: 7.99,
        estimatedDays: [3, 5],
      },
      {
        name: "Express Shipping",
        price: 15.99,
        estimatedDays: [1, 2],
      },
    ],
  },
];

// Define a type for the seller data
type SellerDataType = {
  [key: string]: {
    id: string;
    name: string;
    imageUrl: string;
    location: string;
    rating: number;
  };
};

export const sellerData: SellerDataType = {
  "user-1": {
    id: "user-1",
    name: "Emily Johnson",
    imageUrl: "/images/profiles/profile1.jpg",
    location: "New York, NY",
    rating: 4.9,
  },
  "user-2": {
    id: "user-2",
    name: "Michael Smith",
    imageUrl: "/images/profiles/profile2.jpg",
    location: "Los Angeles, CA",
    rating: 4.7,
  },
  "user-3": {
    id: "user-3",
    name: "Sophia Williams",
    imageUrl: "/images/profiles/profile3.jpg",
    location: "Chicago, IL",
    rating: 4.8,
  },
  "user-4": {
    id: "user-4",
    name: "David Brown",
    imageUrl: "/images/profiles/profile4.jpg",
    location: "Houston, TX",
    rating: 4.6,
  },
  "user-5": {
    id: "user-5",
    name: "Olivia Davis",
    imageUrl: "/images/profiles/profile1.jpg",
    location: "Miami, FL",
    rating: 4.9,
  },
};

export const getListingWithSeller = (listingId: string) => {
  const listing = weddingListings.find((l) => l.id === listingId);
  if (!listing) return null;
  
  const seller = sellerData[listing.sellerId];
  if (!seller) return null;
  
  return {
    ...listing,
    seller,
  };
};

export const getAllListingsWithSellers = () => {
  return weddingListings.map((listing) => ({
    ...listing,
    seller: sellerData[listing.sellerId],
  }));
};
