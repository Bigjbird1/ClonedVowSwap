import supabase from "../../libs/supabaseClient";
import { v4 as uuidv4 } from 'uuid';

// Define analytics event types
export enum AnalyticsEventType {
  SEARCH = 'search',
  FILTER_APPLY = 'filter_apply',
  FILTER_REMOVE = 'filter_remove',
  FILTER_CLEAR = 'filter_clear',
  LISTING_VIEW = 'listing_view',
  LISTING_CLICK = 'listing_click',
  SAVE_FILTER = 'save_filter',
  APPLY_SAVED_FILTER = 'apply_saved_filter',
}

// Define filter analytics event interface
export interface FilterAnalyticsEvent {
  id?: string;
  eventType: AnalyticsEventType;
  filterType?: string;
  filterValue?: string | number | boolean | string[];
  searchQuery?: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  listingId?: string;
  metadata?: Record<string, any>;
}

/**
 * Get or create a session ID for the current user session
 */
const getSessionId = (): string => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !window.localStorage) {
    return uuidv4(); // Return a new ID if not in browser
  }
  
  let sessionId = localStorage.getItem('vowswap_session_id');
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('vowswap_session_id', sessionId);
  }
  
  return sessionId;
};

/**
 * Get the current user ID if available
 */
const getUserId = async (): Promise<string | undefined> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id;
};

/**
 * Track a filter analytics event
 */
export const trackFilterEvent = async (
  eventType: AnalyticsEventType,
  data: Partial<FilterAnalyticsEvent> = {}
): Promise<void> => {
  try {
    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();
    
    const event: FilterAnalyticsEvent = {
      eventType,
      timestamp,
      userId,
      sessionId,
      ...data,
    };
    
    // Queue the event for batch processing
    queueAnalyticsEvent(event);
    
    // Process the queue if it's time
    await processAnalyticsQueue();
  } catch (error) {
    console.error('Error tracking filter event:', error);
  }
};

// Queue for batching analytics events
let analyticsQueue: FilterAnalyticsEvent[] = [];
let queueTimer: NodeJS.Timeout | null = null;
const QUEUE_FLUSH_INTERVAL = 10000; // 10 seconds

/**
 * Add an event to the analytics queue
 */
const queueAnalyticsEvent = (event: FilterAnalyticsEvent): void => {
  analyticsQueue.push(event);
  
  // Set up a timer to flush the queue if not already set
  if (!queueTimer) {
    queueTimer = setTimeout(async () => {
      await processAnalyticsQueue();
      queueTimer = null;
    }, QUEUE_FLUSH_INTERVAL);
  }
};

/**
 * Process the analytics queue by sending events to Supabase
 */
const processAnalyticsQueue = async (): Promise<void> => {
  if (analyticsQueue.length === 0) return;
  
  const eventsToProcess = [...analyticsQueue];
  analyticsQueue = [];
  
  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert(eventsToProcess);
    
    if (error) {
      console.error('Error saving analytics events:', error);
      // Put the events back in the queue to retry later
      analyticsQueue = [...eventsToProcess, ...analyticsQueue];
    }
  } catch (error) {
    console.error('Error processing analytics queue:', error);
    // Put the events back in the queue to retry later
    analyticsQueue = [...eventsToProcess, ...analyticsQueue];
  }
};

/**
 * Track a search event
 */
export const trackSearch = async (searchQuery: string): Promise<void> => {
  await trackFilterEvent(AnalyticsEventType.SEARCH, { searchQuery });
};

/**
 * Track a filter application event
 */
export const trackFilterApply = async (
  filterType: string,
  filterValue: string | number | boolean | string[]
): Promise<void> => {
  await trackFilterEvent(AnalyticsEventType.FILTER_APPLY, { filterType, filterValue });
};

/**
 * Track a filter removal event
 */
export const trackFilterRemove = async (
  filterType: string,
  filterValue: string | number | boolean | string[]
): Promise<void> => {
  await trackFilterEvent(AnalyticsEventType.FILTER_REMOVE, { filterType, filterValue });
};

/**
 * Track a clear all filters event
 */
export const trackFilterClear = async (): Promise<void> => {
  await trackFilterEvent(AnalyticsEventType.FILTER_CLEAR);
};

/**
 * Track a listing view event
 */
export const trackListingView = async (listingId: string): Promise<void> => {
  await trackFilterEvent(AnalyticsEventType.LISTING_VIEW, { listingId });
};

/**
 * Track a listing click event
 */
export const trackListingClick = async (
  listingId: string,
  metadata?: Record<string, any>
): Promise<void> => {
  await trackFilterEvent(AnalyticsEventType.LISTING_CLICK, { listingId, metadata });
};

/**
 * Track a save filter event
 */
export const trackSaveFilter = async (
  filterName: string,
  filterData: Record<string, any>
): Promise<void> => {
  await trackFilterEvent(AnalyticsEventType.SAVE_FILTER, {
    metadata: { filterName, filterData },
  });
};

/**
 * Track an apply saved filter event
 */
export const trackApplySavedFilter = async (
  filterId: string,
  filterName: string
): Promise<void> => {
  await trackFilterEvent(AnalyticsEventType.APPLY_SAVED_FILTER, {
    metadata: { filterId, filterName },
  });
};

/**
 * Get analytics data for a specific event type
 */
export const getAnalyticsData = async (
  eventType: AnalyticsEventType,
  startDate?: string,
  endDate?: string
): Promise<FilterAnalyticsEvent[]> => {
  let query = supabase
    .from('analytics_events')
    .select('*')
    .eq('eventType', eventType);
  
  if (startDate) {
    query = query.gte('timestamp', startDate);
  }
  
  if (endDate) {
    query = query.lte('timestamp', endDate);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching analytics data:', error);
    return [];
  }
  
  return data;
};

/**
 * Get the most used filters
 * Note: This is a simplified implementation. In a production environment,
 * you would use a database function or a more sophisticated query.
 */
export const getMostUsedFilters = async (
  limit: number = 10
): Promise<{ filterType: string; count: number }[]> => {
  try {
    // Get all filter apply events
    const { data, error } = await supabase
      .from('analytics_events')
      .select('filterType')
      .eq('eventType', AnalyticsEventType.FILTER_APPLY)
      .not('filterType', 'is', null);
    
    if (error) throw error;
    
    // Count occurrences of each filter type
    const filterCounts: Record<string, number> = {};
    data.forEach(event => {
      const filterType = event.filterType as string;
      filterCounts[filterType] = (filterCounts[filterType] || 0) + 1;
    });
    
    // Convert to array and sort
    const result = Object.entries(filterCounts)
      .map(([filterType, count]) => ({ filterType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return result;
  } catch (error) {
    console.error('Error fetching most used filters:', error);
    return [];
  }
};

/**
 * Get the most popular search terms
 * Note: This is a simplified implementation. In a production environment,
 * you would use a database function or a more sophisticated query.
 */
export const getMostPopularSearchTerms = async (
  limit: number = 10
): Promise<{ searchQuery: string; count: number }[]> => {
  try {
    // Get all search events
    const { data, error } = await supabase
      .from('analytics_events')
      .select('searchQuery')
      .eq('eventType', AnalyticsEventType.SEARCH)
      .not('searchQuery', 'is', null);
    
    if (error) throw error;
    
    // Count occurrences of each search query
    const searchCounts: Record<string, number> = {};
    data.forEach(event => {
      const searchQuery = event.searchQuery as string;
      searchCounts[searchQuery] = (searchCounts[searchQuery] || 0) + 1;
    });
    
    // Convert to array and sort
    const result = Object.entries(searchCounts)
      .map(([searchQuery, count]) => ({ searchQuery, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return result;
  } catch (error) {
    console.error('Error fetching most popular search terms:', error);
    return [];
  }
};

export default {
  trackSearch,
  trackFilterApply,
  trackFilterRemove,
  trackFilterClear,
  trackListingView,
  trackListingClick,
  trackSaveFilter,
  trackApplySavedFilter,
  getAnalyticsData,
  getMostUsedFilters,
  getMostPopularSearchTerms,
};
