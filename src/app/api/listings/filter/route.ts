import { NextRequest, NextResponse } from "next/server";
import supabase from "../../../../../libs/supabaseClient";
import { WeddingCategory, ItemCondition } from "../../../../../models/supabaseListing";

// Define filter parameters interface
export interface FilterParams {
  search?: string;
  categories?: WeddingCategory[];
  conditions?: ItemCondition[];
  priceMin?: number;
  priceMax?: number;
  styles?: string[];
  colors?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Parses query parameters from the request URL
 */
function parseQueryParams(request: NextRequest): FilterParams {
  const url = new URL(request.url);
  const params: FilterParams = {};

  // Parse search query
  const search = url.searchParams.get('search');
  if (search) params.search = search;

  // Parse categories (comma-separated)
  const categories = url.searchParams.get('categories');
  if (categories) {
    params.categories = categories.split(',') as WeddingCategory[];
  }

  // Parse conditions (comma-separated)
  const conditions = url.searchParams.get('conditions');
  if (conditions) {
    params.conditions = conditions.split(',') as ItemCondition[];
  }

  // Parse price range
  const priceMin = url.searchParams.get('priceMin');
  if (priceMin) params.priceMin = Number(priceMin);

  const priceMax = url.searchParams.get('priceMax');
  if (priceMax) params.priceMax = Number(priceMax);

  // Parse styles (comma-separated)
  const styles = url.searchParams.get('styles');
  if (styles) {
    params.styles = styles.split(',');
  }

  // Parse colors (comma-separated)
  const colors = url.searchParams.get('colors');
  if (colors) {
    params.colors = colors.split(',');
  }

  // Parse pagination
  const page = url.searchParams.get('page');
  if (page) params.page = Number(page);

  const limit = url.searchParams.get('limit');
  if (limit) params.limit = Number(limit);

  // Parse sorting
  const sortBy = url.searchParams.get('sortBy');
  if (sortBy) params.sortBy = sortBy;

  const sortDirection = url.searchParams.get('sortDirection');
  if (sortDirection && (sortDirection === 'asc' || sortDirection === 'desc')) {
    params.sortDirection = sortDirection;
  }

  return params;
}

/**
 * Builds a Supabase query based on filter parameters
 */
function buildFilteredQuery(params: FilterParams) {
  let query = supabase.from("listings").select("*");

  // Apply text search if provided
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  // Apply category filter
  if (params.categories && params.categories.length > 0) {
    query = query.in('category', params.categories);
  }

  // Apply condition filter
  if (params.conditions && params.conditions.length > 0) {
    query = query.in('condition', params.conditions);
  }

  // Apply price range filter
  if (params.priceMin !== undefined) {
    query = query.gte('price', params.priceMin);
  }
  if (params.priceMax !== undefined) {
    query = query.lte('price', params.priceMax);
  }

  // Apply style filter (this is more complex as style is stored as an array)
  if (params.styles && params.styles.length > 0) {
    // For array containment, we need to use a different approach
    // This is a simplification - in a real implementation, you might need
    // to use a more sophisticated query or a stored procedure
    const styleConditions = params.styles.map(style => 
      `style::text ILIKE '%${style}%'`
    );
    query = query.or(styleConditions.join(','));
  }

  // Apply color filter (similar to style)
  if (params.colors && params.colors.length > 0) {
    const colorConditions = params.colors.map(color => 
      `color::text ILIKE '%${color}%'`
    );
    query = query.or(colorConditions.join(','));
  }

  // Apply sorting
  if (params.sortBy) {
    const direction = params.sortDirection || 'desc';
    query = query.order(params.sortBy, { ascending: direction === 'asc' });
  } else {
    // Default sorting by createdAt
    query = query.order('createdAt', { ascending: false });
  }

  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  query = query.range(from, to);

  return query;
}

/**
 * Counts total results for a given filter
 */
async function countFilteredResults(params: FilterParams) {
  let query = supabase.from("listings").select("id", { count: 'exact' });

  // Apply the same filters as the main query
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  if (params.categories && params.categories.length > 0) {
    query = query.in('category', params.categories);
  }

  if (params.conditions && params.conditions.length > 0) {
    query = query.in('condition', params.conditions);
  }

  if (params.priceMin !== undefined) {
    query = query.gte('price', params.priceMin);
  }
  if (params.priceMax !== undefined) {
    query = query.lte('price', params.priceMax);
  }

  if (params.styles && params.styles.length > 0) {
    const styleConditions = params.styles.map(style => 
      `style::text ILIKE '%${style}%'`
    );
    query = query.or(styleConditions.join(','));
  }

  if (params.colors && params.colors.length > 0) {
    const colorConditions = params.colors.map(color => 
      `color::text ILIKE '%${color}%'`
    );
    query = query.or(colorConditions.join(','));
  }

  const { count, error } = await query;
  
  if (error) throw error;
  return count || 0;
}

/**
 * Parse JSON fields in listings
 */
function parseListingJsonFields(listings: any[]) {
  return listings.map(listing => ({
    ...listing,
    photos: JSON.parse(listing.photos || '[]'),
    measurements: listing.measurements ? JSON.parse(listing.measurements) : null,
    shippingOptions: listing.shipping_options ? JSON.parse(listing.shipping_options) : null,
    style: listing.style ? JSON.parse(listing.style) : [],
    color: listing.color ? JSON.parse(listing.color) : [],
  }));
}

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const filterParams = parseQueryParams(request);
    
    // Build and execute the query
    const query = buildFilteredQuery(filterParams);
    const { data: listings, error } = await query;
    
    if (error) {
      console.error("Error fetching filtered listings:", error);
      return NextResponse.json(
        { error: "Error fetching listings" },
        { status: 500 }
      );
    }

    // Count total results for pagination
    const totalCount = await countFilteredResults(filterParams);
    
    // Parse JSON fields in the listings
    const parsedListings = parseListingJsonFields(listings || []);
    
    // Return the results with pagination metadata
    return NextResponse.json({
      listings: parsedListings,
      pagination: {
        total: totalCount,
        page: filterParams.page || 1,
        limit: filterParams.limit || 10,
        totalPages: Math.ceil(totalCount / (filterParams.limit || 10)),
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error processing filtered listings request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
