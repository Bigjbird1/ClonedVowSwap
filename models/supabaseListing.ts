import supabase from "../libs/supabaseClient";

// Wedding-specific types
export type WeddingCategory = 'dress' | 'decor' | 'accessories' | 'stationery' | 'gifts';
export type ItemCondition = 'new_with_tags' | 'new_without_tags' | 'like_new' | 'gently_used' | 'visible_wear';

// Measurement type
export interface Measurement {
  value: number;
  unit: string;
}

// Measurements object type
export interface Measurements {
  [key: string]: Measurement;
}

// Shipping option type
export interface ShippingOption {
  id?: string;
  name: string;
  price: number;
  estimatedDays: [number, number]; // [min, max]
}

export interface SupabaseListing {
  id?: string;
  title: string;
  description: string;
  price: number;
  originalRetailPrice?: number;
  photos: { url: string; alt?: string }[];
  sellerId: string;
  
  // Wedding-specific attributes
  category?: WeddingCategory;
  condition: ItemCondition;
  measurements?: Measurements;
  style?: string[];
  color?: string[];
  shippingOptions?: ShippingOption[];
  
  // Legacy fields (kept for backward compatibility)
  primaryColor?: string;
  secondaryColor?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Creates a new listing in Supabase
 */
export const createSupabaseListing = async (listing: SupabaseListing) => {
  const { data, error } = await supabase
    .from("listings")
    .insert([
      {
        ...listing,
        photos: JSON.stringify(listing.photos),
        measurements: listing.measurements ? JSON.stringify(listing.measurements) : null,
        shippingOptions: listing.shippingOptions ? JSON.stringify(listing.shippingOptions) : null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Retrieves a listing by its ID
 */
export const getSupabaseListingById = async (listingId: string) => {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (error) throw error;
  
  // Parse JSON fields
  return {
    ...data,
    photos: JSON.parse(data.photos),
    measurements: data.measurements ? JSON.parse(data.measurements) : null,
    shippingOptions: data.shipping_options ? JSON.parse(data.shipping_options) : null,
  };
};

/**
 * Fetches all listings
 */
export const getAllSupabaseListings = async () => {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) throw error;
  
  // Parse JSON fields for each listing
  return data.map((listing) => ({
    ...listing,
    photos: JSON.parse(listing.photos),
    measurements: listing.measurements ? JSON.parse(listing.measurements) : null,
    shippingOptions: listing.shipping_options ? JSON.parse(listing.shipping_options) : null,
  }));
};

/**
 * Updates a listing
 */
export const updateSupabaseListing = async (
  listingId: string,
  updates: Partial<SupabaseListing>
) => {
  const { data, error } = await supabase
    .from("listings")
    .update({
      ...updates,
      photos: updates.photos ? JSON.stringify(updates.photos) : undefined,
      measurements: updates.measurements ? JSON.stringify(updates.measurements) : undefined,
      shippingOptions: updates.shippingOptions ? JSON.stringify(updates.shippingOptions) : undefined,
    })
    .eq("id", listingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Fetches listings by user ID
 */
export const getSupabaseListingsByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("sellerId", userId)
    .order("createdAt", { ascending: false });

  if (error) throw error;
  
  // Parse JSON fields for each listing
  return data.map((listing) => ({
    ...listing,
    photos: JSON.parse(listing.photos),
    measurements: listing.measurements ? JSON.parse(listing.measurements) : null,
    shippingOptions: listing.shipping_options ? JSON.parse(listing.shipping_options) : null,
  }));
};

/**
 * Fetches listings by category
 */
export const getSupabaseListingsByCategory = async (category: WeddingCategory) => {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("category", category)
    .order("createdAt", { ascending: false });

  if (error) throw error;
  
  // Parse JSON fields for each listing
  return data.map((listing) => ({
    ...listing,
    photos: JSON.parse(listing.photos),
    measurements: listing.measurements ? JSON.parse(listing.measurements) : null,
    shippingOptions: listing.shipping_options ? JSON.parse(listing.shipping_options) : null,
  }));
};

/**
 * Fetches measurement templates by category
 */
export const getMeasurementTemplateByCategory = async (category: WeddingCategory) => {
  const { data, error } = await supabase
    .from("measurement_templates")
    .select("*")
    .eq("category", category)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Fetches all shipping options
 */
export const getAllShippingOptions = async () => {
  const { data, error } = await supabase
    .from("shipping_options")
    .select("*");

  if (error) throw error;
  return data.map(option => ({
    ...option,
    price_range: JSON.parse(option.price_range),
    estimatedDays: option.estimated_days_range
  }));
};
