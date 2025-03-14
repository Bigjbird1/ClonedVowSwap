import { SupabaseListing, WeddingCategory, ItemCondition } from '../../models/supabaseListing';

/**
 * Sample wedding listings for testing
 */
export const sampleListings: Partial<SupabaseListing>[] = [
  {
    title: "Elegant Lace Wedding Dress",
    description: "Beautiful vintage-inspired lace wedding dress, worn once. Perfect condition with no alterations.",
    price: 1200.00,
    originalRetailPrice: 2400.00,
    photos: [
      { url: "https://example.com/dress1.jpg", alt: "Front view of lace wedding dress" },
      { url: "https://example.com/dress2.jpg", alt: "Back view of lace wedding dress" }
    ],
    category: "dress",
    condition: "like_new",
    measurements: {
      bust: { value: 36, unit: "inches" },
      waist: { value: 28, unit: "inches" },
      hips: { value: 38, unit: "inches" },
      length: { value: 60, unit: "inches" }
    },
    style: ["vintage", "lace", "a-line"],
    color: ["ivory", "champagne"]
  },
  {
    title: "Crystal Wedding Tiara",
    description: "Handcrafted crystal and pearl tiara, perfect for a princess-inspired wedding look.",
    price: 150.00,
    originalRetailPrice: 350.00,
    photos: [
      { url: "https://example.com/tiara1.jpg", alt: "Crystal wedding tiara" },
      { url: "https://example.com/tiara2.jpg", alt: "Tiara detail view" }
    ],
    category: "accessories",
    condition: "new_with_tags",
    measurements: {
      length: { value: 6, unit: "inches" },
      width: { value: 2, unit: "inches" }
    },
    style: ["princess", "crystal", "vintage"],
    color: ["silver", "clear"]
  },
  {
    title: "Rustic Table Centerpieces",
    description: "Set of 10 wooden centerpieces with glass votive holders. Perfect for rustic or barn weddings.",
    price: 200.00,
    originalRetailPrice: 400.00,
    photos: [
      { url: "https://example.com/centerpiece1.jpg", alt: "Wooden centerpiece with flowers" },
      { url: "https://example.com/centerpiece2.jpg", alt: "Centerpiece detail" }
    ],
    category: "decor",
    condition: "gently_used",
    measurements: {
      length: { value: 12, unit: "inches" },
      width: { value: 6, unit: "inches" },
      height: { value: 4, unit: "inches" }
    },
    style: ["rustic", "barn", "boho"],
    color: ["brown", "natural"]
  },
  {
    title: "Custom Wedding Invitations",
    description: "100 custom letterpress wedding invitations with envelopes. Floral design, never used.",
    price: 150.00,
    originalRetailPrice: 350.00,
    photos: [
      { url: "https://example.com/invitation1.jpg", alt: "Wedding invitation" },
      { url: "https://example.com/invitation2.jpg", alt: "Invitation with envelope" }
    ],
    category: "stationery",
    condition: "new_with_tags",
    style: ["floral", "letterpress", "elegant"],
    color: ["blush", "gold"]
  },
  {
    title: "Personalized Wedding Guest Book",
    description: "Leather-bound guest book with custom engraving. Used for display only.",
    price: 75.00,
    originalRetailPrice: 150.00,
    photos: [
      { url: "https://example.com/guestbook1.jpg", alt: "Leather guest book" },
      { url: "https://example.com/guestbook2.jpg", alt: "Guest book pages" }
    ],
    category: "gifts",
    condition: "like_new",
    measurements: {
      length: { value: 10, unit: "inches" },
      width: { value: 8, unit: "inches" }
    },
    style: ["rustic", "personalized"],
    color: ["brown", "cream"]
  }
];

/**
 * Sample shipping options for testing
 */
export const sampleShippingOptions = [
  {
    name: "Standard Shipping",
    price: 9.99,
    estimatedDays: [3, 7]
  },
  {
    name: "Express Shipping",
    price: 19.99,
    estimatedDays: [1, 3]
  },
  {
    name: "Local Pickup",
    price: 0,
    estimatedDays: [0, 1]
  }
];

/**
 * Sample measurement templates for testing
 */
export const sampleMeasurementTemplates = {
  dress: {
    bust: { label: "Bust", unit: "inches" },
    waist: { label: "Waist", unit: "inches" },
    hips: { label: "Hips", unit: "inches" },
    length: { label: "Length", unit: "inches" },
    sleeve: { label: "Sleeve", unit: "inches" }
  },
  accessories: {
    length: { label: "Length", unit: "inches" },
    width: { label: "Width", unit: "inches" }
  },
  decor: {
    length: { label: "Length", unit: "inches" },
    width: { label: "Width", unit: "inches" },
    height: { label: "Height", unit: "inches" }
  }
};
