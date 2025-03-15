import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../../libs/supabaseClient';
import { AnalyticsEventType } from '../../../../services/analyticsService';

/**
 * Get filter usage metrics data
 * 
 * @param req NextRequest object
 * @returns NextResponse with filter usage metrics data
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    // Get most used filters
    const mostUsedFilters = await getMostUsedFilters(limit, startDate, endDate);
    
    // Get filter usage over time
    const filterUsageOverTime = await getFilterUsageOverTime(startDate, endDate);
    
    // Get filter removal metrics
    const filterRemovalMetrics = await getFilterRemovalMetrics(limit, startDate, endDate);

    return NextResponse.json({
      mostUsedFilters,
      filterUsageOverTime,
      filterRemovalMetrics,
    });
  } catch (error) {
    console.error('Error fetching filter usage metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter usage metrics' },
      { status: 500 }
    );
  }
}

/**
 * Get the most used filters
 * 
 * @param limit Maximum number of results to return
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Array of most used filters with counts
 */
async function getMostUsedFilters(
  limit: number = 10,
  startDate?: string | null,
  endDate?: string | null
): Promise<{ filterType: string; count: number }[]> {
  try {
    // Using a raw query since the Supabase JS client has limitations with group by
    let query = `
      SELECT filter_type, COUNT(*) as count
      FROM analytics_events
      WHERE event_type = '${AnalyticsEventType.FILTER_APPLY}'
      AND filter_type IS NOT NULL
    `;
    
    if (startDate) {
      query += ` AND timestamp >= '${startDate}'`;
    }
    
    if (endDate) {
      query += ` AND timestamp <= '${endDate}'`;
    }
    
    query += `
      GROUP BY filter_type
      ORDER BY count DESC
      LIMIT ${limit}
    `;
    
    const { data, error } = await supabase.rpc('execute_sql', { sql: query });
    
    if (error) {
      console.error('Error executing SQL for most used filters:', error);
      return [];
    }
    
    return data.map((item: { filter_type: string; count: string }) => ({
      filterType: item.filter_type,
      count: parseInt(item.count, 10),
    }));
  } catch (error) {
    console.error('Error fetching most used filters:', error);
    return [];
  }
}

/**
 * Get filter usage over time
 * 
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Array of filter usage data points
 */
async function getFilterUsageOverTime(
  startDate?: string | null,
  endDate?: string | null
): Promise<{ date: string; filterType: string; count: number }[]> {
  try {
    // Default to last 30 days if no date range provided
    const defaultStartDate = startDate || 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const defaultEndDate = endDate || new Date().toISOString();
    
    const { data, error } = await supabase.rpc('get_filter_usage_by_day', {
      start_date: defaultStartDate,
      end_date: defaultEndDate,
    });
    
    if (error) {
      // If the RPC function doesn't exist, fall back to a direct query
      console.warn('RPC function not available, using direct query:', error);
      return getFilterUsageByDirectQuery(defaultStartDate, defaultEndDate);
    }
    
    return data.map((item: { day: string; filter_type: string; count: string }) => ({
      date: item.day,
      filterType: item.filter_type,
      count: parseInt(item.count, 10),
    }));
  } catch (error) {
    console.error('Error fetching filter usage over time:', error);
    return [];
  }
}

/**
 * Fallback function to get filter usage by direct query
 * 
 * @param startDate Start date for filtering
 * @param endDate End date for filtering
 * @returns Array of filter usage data points
 */
async function getFilterUsageByDirectQuery(
  startDate: string,
  endDate: string
): Promise<{ date: string; filterType: string; count: number }[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('timestamp, filter_type')
      .eq('event_type', AnalyticsEventType.FILTER_APPLY)
      .not('filter_type', 'is', null)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);
    
    if (error) throw error;
    
    // Group by day and filter type
    const countsByDayAndType: Record<string, Record<string, number>> = {};
    data.forEach((item: { timestamp: string; filter_type: string }) => {
      const day = new Date(item.timestamp).toISOString().split('T')[0];
      const filterType = item.filter_type;
      
      if (!countsByDayAndType[day]) {
        countsByDayAndType[day] = {};
      }
      
      countsByDayAndType[day][filterType] = (countsByDayAndType[day][filterType] || 0) + 1;
    });
    
    // Convert to array format
    const result: { date: string; filterType: string; count: number }[] = [];
    
    Object.entries(countsByDayAndType).forEach(([date, filterCounts]) => {
      Object.entries(filterCounts).forEach(([filterType, count]) => {
        result.push({ date, filterType, count });
      });
    });
    
    return result.sort((a, b) => 
      a.date.localeCompare(b.date) || a.filterType.localeCompare(b.filterType)
    );
  } catch (error) {
    console.error('Error in direct query for filter usage:', error);
    return [];
  }
}

/**
 * Get filter removal metrics
 * 
 * @param limit Maximum number of results to return
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Array of filter removal metrics
 */
async function getFilterRemovalMetrics(
  limit: number = 10,
  startDate?: string | null,
  endDate?: string | null
): Promise<{ filterType: string; appliedCount: number; removedCount: number; ratio: number }[]> {
  try {
    // Using a raw query to get both applied and removed counts
    let query = `
      WITH applied AS (
        SELECT filter_type, COUNT(*) as count
        FROM analytics_events
        WHERE event_type = '${AnalyticsEventType.FILTER_APPLY}'
        AND filter_type IS NOT NULL
    `;
    
    if (startDate) {
      query += ` AND timestamp >= '${startDate}'`;
    }
    
    if (endDate) {
      query += ` AND timestamp <= '${endDate}'`;
    }
    
    query += `
        GROUP BY filter_type
      ),
      removed AS (
        SELECT filter_type, COUNT(*) as count
        FROM analytics_events
        WHERE event_type = '${AnalyticsEventType.FILTER_REMOVE}'
        AND filter_type IS NOT NULL
    `;
    
    if (startDate) {
      query += ` AND timestamp >= '${startDate}'`;
    }
    
    if (endDate) {
      query += ` AND timestamp <= '${endDate}'`;
    }
    
    query += `
        GROUP BY filter_type
      )
      SELECT a.filter_type, a.count as applied_count, COALESCE(r.count, 0) as removed_count
      FROM applied a
      LEFT JOIN removed r ON a.filter_type = r.filter_type
      ORDER BY a.count DESC
      LIMIT ${limit}
    `;
    
    const { data, error } = await supabase.rpc('execute_sql', { sql: query });
    
    if (error) {
      console.error('Error executing SQL for filter removal metrics:', error);
      return [];
    }
    
    return data.map((item: { filter_type: string; applied_count: string; removed_count: string }) => {
      const appliedCount = parseInt(item.applied_count, 10);
      const removedCount = parseInt(item.removed_count, 10);
      
      return {
        filterType: item.filter_type,
        appliedCount,
        removedCount,
        ratio: appliedCount > 0 ? removedCount / appliedCount : 0,
      };
    });
  } catch (error) {
    console.error('Error fetching filter removal metrics:', error);
    return [];
  }
}
