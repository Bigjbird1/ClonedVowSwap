import supabase from "../../libs/supabaseClient";
import { FilterParams } from "../../models/supabaseListingFilters";
import analyticsService from "./analyticsService";

// Define saved filter interface
export interface SavedFilter {
  id?: string;
  userId: string;
  name: string;
  filterData: FilterParams;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Get the current user ID
 */
const getUserId = async (): Promise<string> => {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user?.id) {
    throw new Error("User not authenticated");
  }
  return data.session.user.id;
};

/**
 * Save a filter configuration
 */
export const saveFilter = async (
  name: string,
  filterData: FilterParams
): Promise<SavedFilter> => {
  try {
    const userId = await getUserId();
    const timestamp = new Date().toISOString();
    
    const savedFilter: SavedFilter = {
      userId,
      name,
      filterData,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    const { data, error } = await supabase
      .from('saved_filters')
      .insert([savedFilter])
      .select()
      .single();
    
    if (error) throw error;
    
    // Track the save filter event
    await analyticsService.trackSaveFilter(name, filterData);
    
    return data;
  } catch (error) {
    console.error('Error saving filter:', error);
    throw error;
  }
};

/**
 * Get all saved filters for the current user
 */
export const getSavedFilters = async (): Promise<SavedFilter[]> => {
  try {
    const userId = await getUserId();
    
    const { data, error } = await supabase
      .from('saved_filters')
      .select('*')
      .eq('userId', userId)
      .order('updatedAt', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching saved filters:', error);
    return [];
  }
};

/**
 * Get a saved filter by ID
 */
export const getSavedFilterById = async (filterId: string): Promise<SavedFilter | null> => {
  try {
    const userId = await getUserId();
    
    const { data, error } = await supabase
      .from('saved_filters')
      .select('*')
      .eq('id', filterId)
      .eq('userId', userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching saved filter:', error);
    return null;
  }
};

/**
 * Update a saved filter
 */
export const updateSavedFilter = async (
  filterId: string,
  updates: Partial<SavedFilter>
): Promise<SavedFilter | null> => {
  try {
    const userId = await getUserId();
    const timestamp = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('saved_filters')
      .update({
        ...updates,
        updatedAt: timestamp,
      })
      .eq('id', filterId)
      .eq('userId', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating saved filter:', error);
    return null;
  }
};

/**
 * Delete a saved filter
 */
export const deleteSavedFilter = async (filterId: string): Promise<boolean> => {
  try {
    const userId = await getUserId();
    
    const { error } = await supabase
      .from('saved_filters')
      .delete()
      .eq('id', filterId)
      .eq('userId', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting saved filter:', error);
    return false;
  }
};

/**
 * Apply a saved filter
 */
export const applySavedFilter = async (filterId: string): Promise<FilterParams | null> => {
  try {
    const savedFilter = await getSavedFilterById(filterId);
    
    if (!savedFilter) {
      throw new Error('Saved filter not found');
    }
    
    // Track the apply saved filter event
    await analyticsService.trackApplySavedFilter(filterId, savedFilter.name);
    
    // Update the last used timestamp
    await updateSavedFilter(filterId, { updatedAt: new Date().toISOString() });
    
    return savedFilter.filterData;
  } catch (error) {
    console.error('Error applying saved filter:', error);
    return null;
  }
};

export default {
  saveFilter,
  getSavedFilters,
  getSavedFilterById,
  updateSavedFilter,
  deleteSavedFilter,
  applySavedFilter,
};
