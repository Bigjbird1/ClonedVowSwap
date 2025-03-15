import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../../libs/supabaseClient';
import { AnalyticsEventType } from '../../../../services/analyticsService';

/**
 * Get search metrics data
 * 
 * @param req NextRequest object
 * @returns NextResponse with search metrics data
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    // Get popular search terms
    const popularSearchTerms = await getMostPopularSearchTerms(limit, startDate, endDate);
    
    // Get search volume over time
    const searchVolume = await getSearchVolumeOverTime(startDate, endDate);

    return NextResponse.json({
      popularSearchTerms,
      searchVolume,
    });
  } catch (error) {
    console.error('Error fetching search metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search metrics' },
      { status: 500 }
    );
  }
}

/**
 * Get the most popular search terms
 * 
 * @param limit Maximum number of results to return
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Array of popular search terms with counts
 */
async function getMostPopularSearchTerms(
  limit: number = 10,
  startDate?: string | null,
  endDate?: string | null
): Promise<{ searchQuery: string; count: number }[]> {
  try {
    // Using a raw query since the Supabase JS client has limitations with group by
    let query = `
      SELECT search_query, COUNT(*) as count
      FROM analytics_events
      WHERE event_type = '${AnalyticsEventType.SEARCH}'
      AND search_query IS NOT NULL
    `;
    
    if (startDate) {
      query += ` AND timestamp >= '${startDate}'`;
    }
    
    if (endDate) {
      query += ` AND timestamp <= '${endDate}'`;
    }
    
    query += `
      GROUP BY search_query
      ORDER BY count DESC
      LIMIT ${limit}
    `;
    
    const { data, error } = await supabase.rpc('execute_sql', { sql: query });
    
    if (error) {
      console.error('Error executing SQL for popular search terms:', error);
      return [];
    }
    
    return data.map((item: { search_query: string; count: string }) => ({
      searchQuery: item.search_query,
      count: parseInt(item.count, 10),
    }));
  } catch (error) {
    console.error('Error fetching most popular search terms:', error);
    return [];
  }
}

/**
 * Get search volume over time
 * 
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Array of search volume data points
 */
async function getSearchVolumeOverTime(
  startDate?: string | null,
  endDate?: string | null
): Promise<{ date: string; count: number }[]> {
  try {
    // Default to last 30 days if no date range provided
    const defaultStartDate = startDate || 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const defaultEndDate = endDate || new Date().toISOString();
    
    const { data, error } = await supabase.rpc('get_search_volume_by_day', {
      start_date: defaultStartDate,
      end_date: defaultEndDate,
    });
    
    if (error) {
      // If the RPC function doesn't exist, fall back to a direct query
      console.warn('RPC function not available, using direct query:', error);
      return getSearchVolumeByDirectQuery(defaultStartDate, defaultEndDate);
    }
    
    return data.map((item: { day: string; count: string }) => ({
      date: item.day,
      count: parseInt(item.count, 10),
    }));
  } catch (error) {
    console.error('Error fetching search volume over time:', error);
    return [];
  }
}

/**
 * Fallback function to get search volume by direct query
 * 
 * @param startDate Start date for filtering
 * @param endDate End date for filtering
 * @returns Array of search volume data points
 */
async function getSearchVolumeByDirectQuery(
  startDate: string,
  endDate: string
): Promise<{ date: string; count: number }[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('timestamp')
      .eq('event_type', AnalyticsEventType.SEARCH)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);
    
    if (error) throw error;
    
    // Group by day
    const countsByDay: Record<string, number> = {};
    data.forEach((item: { timestamp: string }) => {
      const day = new Date(item.timestamp).toISOString().split('T')[0];
      countsByDay[day] = (countsByDay[day] || 0) + 1;
    });
    
    // Convert to array and sort by date
    return Object.entries(countsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error in direct query for search volume:', error);
    return [];
  }
}
