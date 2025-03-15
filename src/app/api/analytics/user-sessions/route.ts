import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../../libs/supabaseClient';
import { AnalyticsEventType } from '../../../../services/analyticsService';

/**
 * Get user session metrics data
 * 
 * @param req NextRequest object
 * @returns NextResponse with user session metrics data
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    // Get active sessions
    const activeSessions = await getActiveSessions(limit, startDate, endDate);
    
    // Get session activity by day
    const sessionsByDay = await getSessionsByDay(startDate, endDate);
    
    // Get average session duration
    const averageSessionDuration = await getAverageSessionDuration(startDate, endDate);

    return NextResponse.json({
      activeSessions,
      sessionsByDay,
      averageSessionDuration,
    });
  } catch (error) {
    console.error('Error fetching user session metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user session metrics' },
      { status: 500 }
    );
  }
}

/**
 * Get active sessions
 * 
 * @param limit Maximum number of results to return
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Array of active sessions with counts
 */
async function getActiveSessions(
  limit: number = 10,
  startDate?: string | null,
  endDate?: string | null
): Promise<{ sessionId: string; eventCount: number; lastActive: string }[]> {
  try {
    // Using a raw query to get session activity
    let query = `
      SELECT 
        session_id, 
        COUNT(*) as event_count,
        MAX(timestamp) as last_active
      FROM analytics_events
      WHERE 1=1
    `;
    
    if (startDate) {
      query += ` AND timestamp >= '${startDate}'`;
    }
    
    if (endDate) {
      query += ` AND timestamp <= '${endDate}'`;
    }
    
    query += `
      GROUP BY session_id
      ORDER BY last_active DESC
      LIMIT ${limit}
    `;
    
    const { data, error } = await supabase.rpc('execute_sql', { sql: query });
    
    if (error) {
      console.error('Error executing SQL for active sessions:', error);
      return [];
    }
    
    return data.map((item: { session_id: string; event_count: string; last_active: string }) => ({
      sessionId: item.session_id,
      eventCount: parseInt(item.event_count, 10),
      lastActive: item.last_active,
    }));
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    return [];
  }
}

/**
 * Get session activity by day
 * 
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Array of session counts by day
 */
async function getSessionsByDay(
  startDate?: string | null,
  endDate?: string | null
): Promise<{ date: string; sessionCount: number }[]> {
  try {
    // Default to last 30 days if no date range provided
    const defaultStartDate = startDate || 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const defaultEndDate = endDate || new Date().toISOString();
    
    // Using a raw query to get unique sessions per day
    let query = `
      SELECT 
        DATE_TRUNC('day', timestamp) as day,
        COUNT(DISTINCT session_id) as session_count
      FROM analytics_events
      WHERE timestamp >= '${defaultStartDate}'
      AND timestamp <= '${defaultEndDate}'
      GROUP BY day
      ORDER BY day
    `;
    
    const { data, error } = await supabase.rpc('execute_sql', { sql: query });
    
    if (error) {
      console.error('Error executing SQL for sessions by day:', error);
      return getSessionsByDayFallback(defaultStartDate, defaultEndDate);
    }
    
    return data.map((item: { day: string; session_count: string }) => ({
      date: new Date(item.day).toISOString().split('T')[0],
      sessionCount: parseInt(item.session_count, 10),
    }));
  } catch (error) {
    console.error('Error fetching sessions by day:', error);
    return [];
  }
}

/**
 * Fallback function to get sessions by day
 * 
 * @param startDate Start date for filtering
 * @param endDate End date for filtering
 * @returns Array of session counts by day
 */
async function getSessionsByDayFallback(
  startDate: string,
  endDate: string
): Promise<{ date: string; sessionCount: number }[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('timestamp, session_id')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);
    
    if (error) throw error;
    
    // Group by day and count unique session IDs
    const sessionsByDay: Record<string, Set<string>> = {};
    data.forEach((item: { timestamp: string; session_id: string }) => {
      const day = new Date(item.timestamp).toISOString().split('T')[0];
      
      if (!sessionsByDay[day]) {
        sessionsByDay[day] = new Set();
      }
      
      sessionsByDay[day].add(item.session_id);
    });
    
    // Convert to array format
    return Object.entries(sessionsByDay)
      .map(([date, sessions]) => ({
        date,
        sessionCount: sessions.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error in fallback query for sessions by day:', error);
    return [];
  }
}

/**
 * Get average session duration
 * 
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Average session duration in seconds
 */
async function getAverageSessionDuration(
  startDate?: string | null,
  endDate?: string | null
): Promise<{ averageDuration: number; sessionCount: number }> {
  try {
    // Default to last 30 days if no date range provided
    const defaultStartDate = startDate || 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const defaultEndDate = endDate || new Date().toISOString();
    
    // Using a raw query to calculate session durations
    let query = `
      WITH session_times AS (
        SELECT 
          session_id,
          MIN(timestamp) as first_event,
          MAX(timestamp) as last_event
        FROM analytics_events
        WHERE timestamp >= '${defaultStartDate}'
        AND timestamp <= '${defaultEndDate}'
        GROUP BY session_id
      )
      SELECT 
        COUNT(*) as session_count,
        AVG(EXTRACT(EPOCH FROM (last_event - first_event))) as avg_duration_seconds
      FROM session_times
      WHERE EXTRACT(EPOCH FROM (last_event - first_event)) > 0
      AND EXTRACT(EPOCH FROM (last_event - first_event)) < 86400  -- Filter out sessions longer than 24 hours
    `;
    
    const { data, error } = await supabase.rpc('execute_sql', { sql: query });
    
    if (error) {
      console.error('Error executing SQL for average session duration:', error);
      return { averageDuration: 0, sessionCount: 0 };
    }
    
    if (!data || data.length === 0) {
      return { averageDuration: 0, sessionCount: 0 };
    }
    
    return {
      averageDuration: parseFloat(data[0].avg_duration_seconds) || 0,
      sessionCount: parseInt(data[0].session_count, 10) || 0,
    };
  } catch (error) {
    console.error('Error fetching average session duration:', error);
    return { averageDuration: 0, sessionCount: 0 };
  }
}
