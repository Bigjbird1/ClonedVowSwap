'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAnalyticsWebSocket, ConnectionState } from '../../../hooks/useWebSocket';
import { ChannelType } from '../../../websocket/channels';
import { WebSocketEventType } from '../../../websocket/server';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

// Define the types for our analytics data
interface SearchMetrics {
  popularSearchTerms: { searchQuery: string; count: number }[];
  searchVolume: { date: string; count: number }[];
}

interface FilterUsage {
  mostUsedFilters: { filterType: string; count: number }[];
  filterUsageOverTime: { date: string; filterType: string; count: number }[];
  filterRemovalMetrics: { 
    filterType: string; 
    appliedCount: number; 
    removedCount: number; 
    ratio: number 
  }[];
}

interface UserSessions {
  activeSessions: { sessionId: string; eventCount: number; lastActive: string }[];
  sessionsByDay: { date: string; sessionCount: number }[];
  averageSessionDuration: { averageDuration: number; sessionCount: number };
}

// Define the colors for our charts
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', 
  '#00c49f', '#ffbb28', '#ff8042', '#a4de6c', '#d0ed57'
];

const AnalyticsDashboard: React.FC = () => {
  // State for our analytics data
  const [searchMetrics, setSearchMetrics] = useState<SearchMetrics | null>(null);
  const [filterUsage, setFilterUsage] = useState<FilterUsage | null>(null);
  const [userSessions, setUserSessions] = useState<UserSessions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [wsStatus, setWsStatus] = useState<string>('Disconnected');
  const [realTimeEnabled, setRealTimeEnabled] = useState<boolean>(true);

  // WebSocket connection for real-time updates
  const {
    connectionState,
    analyticsEvents,
    subscribe,
    unsubscribe,
    clearEvents
  } = useAnalyticsWebSocket({
    onConnect: () => {
      console.log('Connected to analytics WebSocket');
      setWsStatus('Connected');
    },
    onDisconnect: () => {
      console.log('Disconnected from analytics WebSocket');
      setWsStatus('Disconnected');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      setWsStatus('Error');
    }
  });

  // Subscribe to analytics channels when connected
  useEffect(() => {
    if (connectionState === ConnectionState.CONNECTED && realTimeEnabled) {
      subscribe(ChannelType.ANALYTICS);
      subscribe(ChannelType.SEARCH);
      subscribe(ChannelType.FILTERS);
      subscribe(ChannelType.LISTINGS);
      subscribe(ChannelType.USER_SESSIONS);
      setWsStatus('Subscribed to analytics channels');
    }
  }, [connectionState, subscribe, realTimeEnabled]);

  // Process real-time analytics events
  useEffect(() => {
    if (!realTimeEnabled || analyticsEvents.length === 0) return;

    // Process the events and update the charts
    analyticsEvents.forEach(event => {
      // Update search metrics
      if (event.eventType === 'search' && searchMetrics) {
        // Update popular search terms
        const updatedTerms = [...searchMetrics.popularSearchTerms];
        const termIndex = updatedTerms.findIndex(term => term.searchQuery === event.searchQuery);
        
        if (termIndex >= 0) {
          updatedTerms[termIndex] = {
            ...updatedTerms[termIndex],
            count: updatedTerms[termIndex].count + 1
          };
        } else {
          updatedTerms.push({ searchQuery: event.searchQuery || 'unknown', count: 1 });
        }
        
        // Update search volume
        const today = new Date().toISOString().split('T')[0];
        const updatedVolume = [...searchMetrics.searchVolume];
        const volumeIndex = updatedVolume.findIndex(vol => vol.date === today);
        
        if (volumeIndex >= 0) {
          updatedVolume[volumeIndex] = {
            ...updatedVolume[volumeIndex],
            count: updatedVolume[volumeIndex].count + 1
          };
        } else {
          updatedVolume.push({ date: today, count: 1 });
        }
        
        setSearchMetrics({
          popularSearchTerms: updatedTerms,
          searchVolume: updatedVolume
        });
      }
      
      // Update filter usage metrics
      if ((event.eventType === 'filter_apply' || event.eventType === 'filter_remove') && filterUsage) {
        // Update most used filters
        if (event.filterType && event.eventType === 'filter_apply') {
          const updatedFilters = [...filterUsage.mostUsedFilters];
          const filterIndex = updatedFilters.findIndex(filter => filter.filterType === event.filterType);
          
          if (filterIndex >= 0) {
            updatedFilters[filterIndex] = {
              ...updatedFilters[filterIndex],
              count: updatedFilters[filterIndex].count + 1
            };
          } else {
            updatedFilters.push({ filterType: event.filterType, count: 1 });
          }
          
          // Update filter removal metrics
          const updatedRemovalMetrics = [...filterUsage.filterRemovalMetrics];
          const removalIndex = updatedRemovalMetrics.findIndex(metric => metric.filterType === event.filterType);
          
          if (removalIndex >= 0) {
            const metric = updatedRemovalMetrics[removalIndex];
            updatedRemovalMetrics[removalIndex] = {
              ...metric,
              appliedCount: metric.appliedCount + 1,
              ratio: (metric.removedCount / (metric.appliedCount + 1))
            };
          } else {
            updatedRemovalMetrics.push({
              filterType: event.filterType,
              appliedCount: 1,
              removedCount: 0,
              ratio: 0
            });
          }
          
          setFilterUsage({
            ...filterUsage,
            mostUsedFilters: updatedFilters,
            filterRemovalMetrics: updatedRemovalMetrics
          });
        }
        
        // Update filter removal metrics
        if (event.filterType && event.eventType === 'filter_remove') {
          const updatedRemovalMetrics = [...filterUsage.filterRemovalMetrics];
          const removalIndex = updatedRemovalMetrics.findIndex(metric => metric.filterType === event.filterType);
          
          if (removalIndex >= 0) {
            const metric = updatedRemovalMetrics[removalIndex];
            updatedRemovalMetrics[removalIndex] = {
              ...metric,
              removedCount: metric.removedCount + 1,
              ratio: ((metric.removedCount + 1) / metric.appliedCount)
            };
            
            setFilterUsage({
              ...filterUsage,
              filterRemovalMetrics: updatedRemovalMetrics
            });
          }
        }
      }
    });
    
    // Clear processed events
    clearEvents();
  }, [analyticsEvents, searchMetrics, filterUsage, clearEvents, realTimeEnabled]);

  // Fetch initial analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch search metrics
        const searchResponse = await fetch(
          `/api/analytics/search-metrics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
        );
        
        if (!searchResponse.ok) {
          throw new Error(`Failed to fetch search metrics: ${searchResponse.statusText}`);
        }
        
        const searchData = await searchResponse.json();
        setSearchMetrics(searchData);
        
        // Fetch filter usage
        const filterResponse = await fetch(
          `/api/analytics/filter-usage?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
        );
        
        if (!filterResponse.ok) {
          throw new Error(`Failed to fetch filter usage: ${filterResponse.statusText}`);
        }
        
        const filterData = await filterResponse.json();
        setFilterUsage(filterData);
        
        // Fetch user sessions
        const sessionsResponse = await fetch(
          `/api/analytics/user-sessions?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
        );
        
        if (!sessionsResponse.ok) {
          throw new Error(`Failed to fetch user sessions: ${sessionsResponse.statusText}`);
        }
        
        const sessionsData = await sessionsResponse.json();
        setUserSessions(sessionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching analytics data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [dateRange]);

  // Handle date range change
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };
  
  // Toggle real-time updates
  const toggleRealTime = useCallback(() => {
    setRealTimeEnabled(prev => !prev);
    
    if (!realTimeEnabled) {
      // Re-subscribe to channels
      if (connectionState === ConnectionState.CONNECTED) {
        subscribe(ChannelType.ANALYTICS);
        subscribe(ChannelType.SEARCH);
        subscribe(ChannelType.FILTERS);
        subscribe(ChannelType.LISTINGS);
        subscribe(ChannelType.USER_SESSIONS);
        setWsStatus('Subscribed to analytics channels');
      }
    } else {
      // Unsubscribe from channels
      unsubscribe(ChannelType.ANALYTICS);
      unsubscribe(ChannelType.SEARCH);
      unsubscribe(ChannelType.FILTERS);
      unsubscribe(ChannelType.LISTINGS);
      unsubscribe(ChannelType.USER_SESSIONS);
      setWsStatus('Unsubscribed from analytics channels');
    }
  }, [realTimeEnabled, connectionState, subscribe, unsubscribe]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">VowSwap Analytics Dashboard</h1>
      
      {/* Date Range and Real-time Controls */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Date Range</h2>
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium text-gray-700">
              WebSocket: <span className={`font-bold ${wsStatus === 'Connected' || wsStatus.includes('Subscribed') ? 'text-green-600' : 'text-red-600'}`}>{wsStatus}</span>
            </span>
            <button
              onClick={toggleRealTime}
              className={`px-4 py-2 rounded-md text-white ${realTimeEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}`}
            >
              {realTimeEnabled ? 'Real-time: ON' : 'Real-time: OFF'}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>
      
      {/* Search Metrics Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Search Metrics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Search Terms */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Popular Search Terms</h3>
            {searchMetrics?.popularSearchTerms && searchMetrics.popularSearchTerms.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={searchMetrics.popularSearchTerms}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="searchQuery" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Search Count" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-10">No search data available</p>
            )}
          </div>
          
          {/* Search Volume Over Time */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Search Volume Over Time</h3>
            {searchMetrics?.searchVolume && searchMetrics.searchVolume.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={searchMetrics.searchVolume}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value: string) => `Date: ${new Date(value).toLocaleDateString()}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8884d8" 
                    name="Search Count"
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-10">No search volume data available</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Filter Usage Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Filter Usage</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Used Filters */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Most Used Filters</h3>
            {filterUsage?.mostUsedFilters && filterUsage.mostUsedFilters.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={filterUsage.mostUsedFilters}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent: number }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="filterType"
                  >
                    {filterUsage.mostUsedFilters.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-10">No filter usage data available</p>
            )}
          </div>
          
          {/* Filter Removal Metrics */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Filter Application vs. Removal</h3>
            {filterUsage?.filterRemovalMetrics && filterUsage.filterRemovalMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={filterUsage.filterRemovalMetrics}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="filterType" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="appliedCount" fill="#82ca9d" name="Applied" />
                  <Bar dataKey="removedCount" fill="#ff8042" name="Removed" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-10">No filter removal data available</p>
            )}
          </div>
        </div>
      </div>
      
      {/* User Sessions Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">User Sessions</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sessions By Day */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Sessions By Day</h3>
            {userSessions?.sessionsByDay && userSessions.sessionsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={userSessions.sessionsByDay}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value: string) => `Date: ${new Date(value).toLocaleDateString()}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sessionCount" 
                    stroke="#0088fe" 
                    name="Session Count"
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-10">No session data available</p>
            )}
          </div>
          
          {/* Average Session Duration */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Average Session Duration</h3>
            {userSessions?.averageSessionDuration ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-5xl font-bold text-indigo-600">
                  {formatDuration(userSessions.averageSessionDuration.averageDuration)}
                </div>
                <p className="text-gray-500 mt-2">
                  Based on {userSessions.averageSessionDuration.sessionCount} sessions
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-10">No session duration data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
