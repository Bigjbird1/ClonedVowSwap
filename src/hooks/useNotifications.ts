"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { 
  Notification, 
  NotificationType, 
  NotificationPriority,
  NotificationEventType
} from '../services/notificationService';
import { WebSocketEventType } from '../websocket/server';
import supabase from '../../libs/supabaseClient';

/**
 * Custom hook for managing notifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [preferencesLoading, setPreferencesLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Get WebSocket connection - only connect if authenticated
  const { connectionState, lastMessage } = useWebSocket(
    isAuthenticated 
      ? `${typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}` : ''}/api/websocket/notifications`
      : '' // Use empty string when not authenticated
  );
  
  // Check if connected
  const connected = connectionState === 'connected';
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (err) {
        console.error('Error checking authentication:', err);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  // Fetch notifications from API
  const fetchNotifications = useCallback(async (includeRead: boolean = false) => {
    // Don't attempt to fetch if not authenticated
    if (!isAuthenticated) {
      setLoading(false);
      setError('Authentication required to fetch notifications');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?includeRead=${includeRead}`);
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          setError('You must be logged in to view notifications');
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications?.filter((n: Notification) => !n.isRead)?.length || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Fetch notification preferences
  const fetchPreferences = useCallback(async () => {
    // Don't attempt to fetch if not authenticated
    if (!isAuthenticated) {
      setPreferencesLoading(false);
      return;
    }
    
    try {
      setPreferencesLoading(true);
      const response = await fetch('/api/notifications/preferences');
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          console.warn('Authentication required to fetch notification preferences');
          setPreferences({});
          return;
        }
        
        throw new Error(`Failed to fetch notification preferences: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPreferences(data.preferences || {});
    } catch (err) {
      console.error('Error fetching notification preferences:', err);
      setPreferences({});
    } finally {
      setPreferencesLoading(false);
    }
  }, [isAuthenticated]);
  
  // Update notification preferences
  const updatePreferences = useCallback(async (newPreferences: Record<string, boolean>) => {
    if (!isAuthenticated) {
      console.error('Authentication required to update notification preferences');
      return false;
    }
    
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences: newPreferences }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication required to update notification preferences');
          return false;
        }
        
        throw new Error(`Failed to update notification preferences: ${response.statusText}`);
      }
      
      setPreferences(newPreferences);
      return true;
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      return false;
    }
  }, [isAuthenticated]);
  
  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!isAuthenticated) {
      console.error('Authentication required to mark notification as read');
      return false;
    }
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication required to mark notification as read');
          return false;
        }
        
        throw new Error(`Failed to mark notification as read: ${response.statusText}`);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, [isAuthenticated]);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) {
      console.error('Authentication required to mark all notifications as read');
      return false;
    }
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication required to mark all notifications as read');
          return false;
        }
        
        throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, [isAuthenticated]);
  
  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!isAuthenticated) {
      console.error('Authentication required to delete notification');
      return false;
    }
    
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication required to delete notification');
          return false;
        }
        
        throw new Error(`Failed to delete notification: ${response.statusText}`);
      }
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if the deleted notification was unread
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, [notifications, isAuthenticated]);
  
  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;
    
    try {
      // Only process notification update messages
      if (lastMessage.type !== WebSocketEventType.NOTIFICATION_UPDATE) return;
      
      // Extract notification data from payload
      const { notificationType, notification, notificationId } = lastMessage.payload || {};
      
      switch (notificationType) {
        case NotificationEventType.NOTIFICATION_CREATED:
          if (notification) {
            // Add the new notification to the list
            setNotifications(prev => [notification, ...prev]);
            
            // Update unread count
            if (!notification.isRead) {
              setUnreadCount(prev => prev + 1);
            }
          }
          break;
          
        case NotificationEventType.NOTIFICATION_READ:
          if (notificationId) {
            // Mark the specific notification as read
            setNotifications(prev => 
              prev.map(n => 
                n.id === notificationId ? { ...n, isRead: true } : n
              )
            );
            
            // Update unread count
            const wasUnread = notifications.some(n => n.id === notificationId && !n.isRead);
            if (wasUnread) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          } else {
            // Mark all notifications as read
            setNotifications(prev => 
              prev.map(n => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
          }
          break;
          
        case NotificationEventType.NOTIFICATION_DELETED:
          if (notificationId) {
            // Remove the deleted notification
            const deletedNotification = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            
            // Update unread count if the deleted notification was unread
            if (deletedNotification && !deletedNotification.isRead) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
          break;
          
        case NotificationEventType.NOTIFICATION_SETTINGS_UPDATED:
          // Refresh preferences
          fetchPreferences();
          break;
      }
    } catch (err) {
      console.error('Error processing notification WebSocket message:', err);
    }
  }, [lastMessage, notifications, fetchPreferences]);
  
  // Initial data fetch - only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [fetchNotifications, fetchPreferences, isAuthenticated]);
  
  return {
    notifications,
    unreadCount,
    loading,
    error,
    preferences,
    preferencesLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    connected,
    isAuthenticated,
  };
}
