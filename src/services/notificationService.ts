import supabase from "../../libs/supabaseClient";
import { v4 as uuidv4 } from 'uuid';
import WebSocketServer, { WebSocketEventType, WebSocketMessage } from "../websocket/server";
import { FilterAnalyticsEvent, AnalyticsEventType } from "./analyticsService";

// Define notification types
export enum NotificationType {
  SEARCH_SPIKE = 'search_spike',
  FILTER_TREND = 'filter_trend',
  HIGH_VALUE_LISTING = 'high_value_listing',
  ABUSE_DETECTION = 'abuse_detection',
  SYSTEM_ALERT = 'system_alert',
  USER_ACTIVITY = 'user_activity',
  LISTING_POPULARITY = 'listing_popularity',
}

// Define notification priorities
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Define notification interface
export interface Notification {
  id?: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  isRead?: boolean;
  createdAt?: string;
  userId?: string;
  eventId?: string;
}

// Define notification rule interface
export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  eventTypes: AnalyticsEventType[];
  condition: (event: FilterAnalyticsEvent) => boolean;
  createNotification: (event: FilterAnalyticsEvent) => Notification;
  isEnabled: boolean;
}

// Define WebSocket notification event type
export enum NotificationEventType {
  NOTIFICATION_CREATED = 'notification_created',
  NOTIFICATION_READ = 'notification_read',
  NOTIFICATION_DELETED = 'notification_deleted',
  NOTIFICATION_SETTINGS_UPDATED = 'notification_settings_updated',
}

// Define notification payload interface
export interface NotificationPayload {
  notificationType: NotificationEventType;
  notification?: Notification;
  notificationId?: string;
  userId?: string;
}

/**
 * Notification Service for processing analytics events and generating notifications
 */
class NotificationService {
  private static instance: NotificationService;
  private rules: Map<string, NotificationRule> = new Map();
  private wsServer: WebSocketServer;
  
  // Cache for tracking event counts within time windows
  private searchCountCache: Map<string, { count: number, timestamp: number }> = new Map();
  private filterCountCache: Map<string, { count: number, timestamp: number }> = new Map();
  private listingViewCache: Map<string, { count: number, timestamp: number }> = new Map();
  
  // Constants for thresholds
  private readonly SEARCH_SPIKE_THRESHOLD = 10; // 10 searches in 5 minutes
  private readonly SEARCH_SPIKE_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly FILTER_TREND_THRESHOLD = 15; // 15 uses of the same filter in 10 minutes
  private readonly FILTER_TREND_WINDOW = 10 * 60 * 1000; // 10 minutes in milliseconds
  private readonly LISTING_POPULARITY_THRESHOLD = 20; // 20 views in 15 minutes
  private readonly LISTING_POPULARITY_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
  private readonly HIGH_VALUE_THRESHOLD = 1000; // $1000 for high value listings

  private constructor() {
    // Initialize WebSocket server
    this.wsServer = WebSocketServer.getInstance();
    
    // Initialize default rules
    this.initializeRules();
    
    // Set up cleanup interval for caches
    setInterval(() => this.cleanupCaches(), 15 * 60 * 1000); // Clean up every 15 minutes
  }

  /**
   * Get the NotificationService instance (Singleton pattern)
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize default notification rules
   */
  private initializeRules(): void {
    // Rule 1: Search Spike Detection
    this.addRule({
      id: 'search-spike',
      name: 'Search Spike Detection',
      description: 'Detects unusual spikes in search volume for specific terms',
      eventTypes: [AnalyticsEventType.SEARCH],
      condition: (event: FilterAnalyticsEvent) => {
        if (event.eventType !== AnalyticsEventType.SEARCH || !event.searchQuery) {
          return false;
        }
        
        const searchTerm = event.searchQuery.toLowerCase();
        const now = Date.now();
        const cacheKey = searchTerm;
        
        // Get or initialize cache entry
        const cacheEntry = this.searchCountCache.get(cacheKey) || { count: 0, timestamp: now };
        
        // If the entry is too old, reset it
        if (now - cacheEntry.timestamp > this.SEARCH_SPIKE_WINDOW) {
          cacheEntry.count = 1;
          cacheEntry.timestamp = now;
        } else {
          cacheEntry.count += 1;
        }
        
        // Update cache
        this.searchCountCache.set(cacheKey, cacheEntry);
        
        // Check if threshold is exceeded
        return cacheEntry.count >= this.SEARCH_SPIKE_THRESHOLD;
      },
      createNotification: (event: FilterAnalyticsEvent) => {
        const searchTerm = event.searchQuery || '';
        const count = this.searchCountCache.get(searchTerm.toLowerCase())?.count || 0;
        
        return {
          type: NotificationType.SEARCH_SPIKE,
          priority: NotificationPriority.HIGH,
          title: 'Search Spike Detected',
          message: `Unusual spike in searches for "${searchTerm}" (${count} searches in the last 5 minutes)`,
          metadata: {
            searchTerm,
            count,
            timeWindow: '5 minutes',
          },
          eventId: event.id,
        };
      },
      isEnabled: true,
    });

    // Rule 2: Filter Trend Detection
    this.addRule({
      id: 'filter-trend',
      name: 'Filter Trend Detection',
      description: 'Detects emerging trends in filter usage',
      eventTypes: [AnalyticsEventType.FILTER_APPLY],
      condition: (event: FilterAnalyticsEvent) => {
        if (event.eventType !== AnalyticsEventType.FILTER_APPLY || !event.filterType) {
          return false;
        }
        
        const filterType = event.filterType;
        const filterValue = JSON.stringify(event.filterValue);
        const now = Date.now();
        const cacheKey = `${filterType}:${filterValue}`;
        
        // Get or initialize cache entry
        const cacheEntry = this.filterCountCache.get(cacheKey) || { count: 0, timestamp: now };
        
        // If the entry is too old, reset it
        if (now - cacheEntry.timestamp > this.FILTER_TREND_WINDOW) {
          cacheEntry.count = 1;
          cacheEntry.timestamp = now;
        } else {
          cacheEntry.count += 1;
        }
        
        // Update cache
        this.filterCountCache.set(cacheKey, cacheEntry);
        
        // Check if threshold is exceeded
        return cacheEntry.count >= this.FILTER_TREND_THRESHOLD;
      },
      createNotification: (event: FilterAnalyticsEvent) => {
        const filterType = event.filterType || '';
        const filterValue = event.filterValue;
        const cacheKey = `${filterType}:${JSON.stringify(filterValue)}`;
        const count = this.filterCountCache.get(cacheKey)?.count || 0;
        
        return {
          type: NotificationType.FILTER_TREND,
          priority: NotificationPriority.MEDIUM,
          title: 'Filter Trend Detected',
          message: `Trending filter: "${filterType}" with value "${JSON.stringify(filterValue)}" (${count} uses in the last 10 minutes)`,
          metadata: {
            filterType,
            filterValue,
            count,
            timeWindow: '10 minutes',
          },
          eventId: event.id,
        };
      },
      isEnabled: true,
    });

    // Rule 3: High-Value Listing Detection
    this.addRule({
      id: 'high-value-listing',
      name: 'High-Value Listing Detection',
      description: 'Detects views on high-value listings',
      eventTypes: [AnalyticsEventType.LISTING_VIEW],
      condition: (event: FilterAnalyticsEvent) => {
        if (event.eventType !== AnalyticsEventType.LISTING_VIEW || !event.listingId || !event.metadata?.price) {
          return false;
        }
        
        // Check if the listing price exceeds the high value threshold
        const price = parseFloat(event.metadata.price);
        return !isNaN(price) && price >= this.HIGH_VALUE_THRESHOLD;
      },
      createNotification: (event: FilterAnalyticsEvent) => {
        const listingId = event.listingId || '';
        const price = event.metadata?.price || 'unknown';
        const title = event.metadata?.title || 'Unknown Listing';
        
        return {
          type: NotificationType.HIGH_VALUE_LISTING,
          priority: NotificationPriority.HIGH,
          title: 'High-Value Listing Activity',
          message: `High-value listing "${title}" (${price}) is receiving attention`,
          metadata: {
            listingId,
            price,
            title,
          },
          eventId: event.id,
        };
      },
      isEnabled: true,
    });

    // Rule 4: Listing Popularity Detection
    this.addRule({
      id: 'listing-popularity',
      name: 'Listing Popularity Detection',
      description: 'Detects listings that are receiving a lot of views',
      eventTypes: [AnalyticsEventType.LISTING_VIEW],
      condition: (event: FilterAnalyticsEvent) => {
        if (event.eventType !== AnalyticsEventType.LISTING_VIEW || !event.listingId) {
          return false;
        }
        
        const listingId = event.listingId;
        const now = Date.now();
        const cacheKey = listingId;
        
        // Get or initialize cache entry
        const cacheEntry = this.listingViewCache.get(cacheKey) || { count: 0, timestamp: now };
        
        // If the entry is too old, reset it
        if (now - cacheEntry.timestamp > this.LISTING_POPULARITY_WINDOW) {
          cacheEntry.count = 1;
          cacheEntry.timestamp = now;
        } else {
          cacheEntry.count += 1;
        }
        
        // Update cache
        this.listingViewCache.set(cacheKey, cacheEntry);
        
        // Check if threshold is exceeded
        return cacheEntry.count >= this.LISTING_POPULARITY_THRESHOLD;
      },
      createNotification: (event: FilterAnalyticsEvent) => {
        const listingId = event.listingId || '';
        const count = this.listingViewCache.get(listingId)?.count || 0;
        const title = event.metadata?.title || 'Unknown Listing';
        
        return {
          type: NotificationType.LISTING_POPULARITY,
          priority: NotificationPriority.MEDIUM,
          title: 'Popular Listing Detected',
          message: `Listing "${title}" is trending with ${count} views in the last 15 minutes`,
          metadata: {
            listingId,
            count,
            title,
            timeWindow: '15 minutes',
          },
          eventId: event.id,
        };
      },
      isEnabled: true,
    });

    // Rule 5: System Alert for Error Rate
    this.addRule({
      id: 'system-error-rate',
      name: 'System Error Rate Alert',
      description: 'Detects unusual error rates in the system',
      eventTypes: [AnalyticsEventType.SYSTEM_ERROR],
      condition: (event: FilterAnalyticsEvent) => {
        // This is a placeholder for system error detection
        // In a real implementation, you would track error rates over time
        // and trigger notifications when they exceed thresholds
        return event.eventType === AnalyticsEventType.SYSTEM_ERROR && 
               event.metadata?.errorCount && 
               event.metadata.errorCount > 5;
      },
      createNotification: (event: FilterAnalyticsEvent) => {
        const errorCount = event.metadata?.errorCount || 0;
        const errorType = event.metadata?.errorType || 'Unknown';
        
        return {
          type: NotificationType.SYSTEM_ALERT,
          priority: NotificationPriority.CRITICAL,
          title: 'System Error Rate Alert',
          message: `Elevated error rate detected: ${errorCount} ${errorType} errors in the last 5 minutes`,
          metadata: {
            errorCount,
            errorType,
            timeWindow: '5 minutes',
          },
          eventId: event.id,
        };
      },
      isEnabled: true,
    });
  }

  /**
   * Add a new notification rule
   */
  public addRule(rule: NotificationRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove a notification rule
   */
  public removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Enable a notification rule
   */
  public enableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.isEnabled = true;
      this.rules.set(ruleId, rule);
      return true;
    }
    return false;
  }

  /**
   * Disable a notification rule
   */
  public disableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.isEnabled = false;
      this.rules.set(ruleId, rule);
      return true;
    }
    return false;
  }

  /**
   * Get all notification rules
   */
  public getRules(): NotificationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Process an analytics event and generate notifications if needed
   */
  public async processEvent(event: FilterAnalyticsEvent): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    // Check each rule
    for (const rule of this.rules.values()) {
      // Skip disabled rules
      if (!rule.isEnabled) {
        continue;
      }
      
      // Skip rules that don't apply to this event type
      if (!rule.eventTypes.includes(event.eventType)) {
        continue;
      }
      
      // Check if the rule condition is met
      if (rule.condition(event)) {
        // Create notification
        const notification = rule.createNotification(event);
        
        // Add user ID if available
        if (event.userId) {
          notification.userId = event.userId;
        }
        
        // Save notification to database
        const savedNotification = await this.saveNotification(notification);
        
        if (savedNotification) {
          notifications.push(savedNotification);
          
          // Broadcast notification via WebSocket
          this.broadcastNotification(savedNotification);
        }
      }
    }
    
    return notifications;
  }

  /**
   * Save a notification to the database
   */
  private async saveNotification(notification: Notification): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          type: notification.type,
          priority: notification.priority,
          title: notification.title,
          message: notification.message,
          metadata: notification.metadata || {},
          is_read: false,
          user_id: notification.userId,
          event_id: notification.eventId,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving notification:', error);
        return null;
      }
      
      // Convert from snake_case to camelCase
      return {
        id: data.id,
        type: data.type,
        priority: data.priority,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
        isRead: data.is_read,
        createdAt: data.created_at,
        userId: data.user_id,
        eventId: data.event_id,
      };
    } catch (error) {
      console.error('Error saving notification:', error);
      return null;
    }
  }

  /**
   * Broadcast a notification via WebSocket
   */
  private broadcastNotification(notification: Notification): void {
    try {
      // Create WebSocket message
      const message: WebSocketMessage = {
        type: WebSocketEventType.NOTIFICATION_UPDATE,
        payload: {
          notificationType: NotificationEventType.NOTIFICATION_CREATED,
          notification,
        },
        timestamp: new Date().toISOString(),
      };
      
      // Broadcast to all users (admin channel)
      this.wsServer.broadcastToChannel('notifications:admin', message);
      
      // Broadcast to specific user if user ID is available
      if (notification.userId) {
        this.wsServer.broadcastToChannel(`notifications:user:${notification.userId}`, message);
      }
    } catch (error) {
      console.error('Error broadcasting notification:', error);
    }
  }

  /**
   * Get notifications for a user
   */
  public async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    includeRead: boolean = false
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);
      
      if (!includeRead) {
        query = query.eq('is_read', false);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching user notifications:', error);
        return [];
      }
      
      // Convert from snake_case to camelCase
      return data.map(item => ({
        id: item.id,
        type: item.type,
        priority: item.priority,
        title: item.title,
        message: item.message,
        metadata: item.metadata,
        isRead: item.is_read,
        createdAt: item.created_at,
        userId: item.user_id,
        eventId: item.event_id,
      }));
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  /**
   * Mark a notification as read
   */
  public async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('mark_notification_read', {
        notification_uuid: notificationId,
        user_uuid: userId,
      });
      
      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }
      
      // Broadcast notification read status via WebSocket
      const message: WebSocketMessage = {
        type: WebSocketEventType.NOTIFICATION_UPDATE,
        payload: {
          notificationType: NotificationEventType.NOTIFICATION_READ,
          notificationId,
          userId,
        },
        timestamp: new Date().toISOString(),
      };
      
      this.wsServer.broadcastToChannel(`notifications:user:${userId}`, message);
      
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  public async markAllAsRead(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('mark_all_notifications_read', {
        user_uuid: userId,
      });
      
      if (error) {
        console.error('Error marking all notifications as read:', error);
        return 0;
      }
      
      // Broadcast notification read status via WebSocket
      const message: WebSocketMessage = {
        type: WebSocketEventType.NOTIFICATION_UPDATE,
        payload: {
          notificationType: NotificationEventType.NOTIFICATION_READ,
          userId,
        },
        timestamp: new Date().toISOString(),
      };
      
      this.wsServer.broadcastToChannel(`notifications:user:${userId}`, message);
      
      return data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }
  }

  /**
   * Get unread notification count for a user
   */
  public async getUnreadCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_unread_notification_count', {
        user_uuid: userId,
      });
      
      if (error) {
        console.error('Error getting unread notification count:', error);
        return 0;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  }

  /**
   * Delete a notification
   */
  public async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }
      
      // Broadcast notification deletion via WebSocket
      const message: WebSocketMessage = {
        type: WebSocketEventType.NOTIFICATION_UPDATE,
        payload: {
          notificationType: NotificationEventType.NOTIFICATION_DELETED,
          notificationId,
          userId,
        },
        timestamp: new Date().toISOString(),
      };
      
      this.wsServer.broadcastToChannel(`notifications:user:${userId}`, message);
      
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Get user notification preferences
   */
  public async getUserPreferences(userId: string): Promise<Record<string, boolean>> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('notification_type, enabled')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user notification preferences:', error);
        return {};
      }
      
      // Convert to a map of notification type to enabled status
      const preferences: Record<string, boolean> = {};
      data.forEach(item => {
        preferences[item.notification_type] = item.enabled;
      });
      
      return preferences;
    } catch (error) {
      console.error('Error fetching user notification preferences:', error);
      return {};
    }
  }

  /**
   * Update user notification preferences
   */
  public async updateUserPreferences(
    userId: string,
    preferences: Record<string, boolean>
  ): Promise<boolean> {
    try {
      // Convert preferences to an array of upsert operations
      const upserts = Object.entries(preferences).map(([type, enabled]) => ({
        user_id: userId,
        notification_type: type,
        enabled,
        updated_at: new Date().toISOString(),
      }));
      
      const { error } = await supabase
        .from('notification_preferences')
        .upsert(upserts, { onConflict: 'user_id, notification_type' });
      
      if (error) {
        console.error('Error updating user notification preferences:', error);
        return false;
      }
      
      // Broadcast preferences update via WebSocket
      const message: WebSocketMessage = {
        type: WebSocketEventType.NOTIFICATION_UPDATE,
        payload: {
          notificationType: NotificationEventType.NOTIFICATION_SETTINGS_UPDATED,
          userId,
        },
        timestamp: new Date().toISOString(),
      };
      
      this.wsServer.broadcastToChannel(`notifications:user:${userId}`, message);
      
      return true;
    } catch (error) {
      console.error('Error updating user notification preferences:', error);
      return false;
    }
  }

  /**
   * Clean up old entries from caches
   */
  private cleanupCaches(): void {
    const now = Date.now();
    
    // Clean up search count cache
    this.searchCountCache.forEach((entry, key) => {
      if (now - entry.timestamp > this.SEARCH_SPIKE_WINDOW) {
        this.searchCountCache.delete(key);
      }
    });
    
    // Clean up filter count cache
    this.filterCountCache.forEach((entry, key) => {
      if (now - entry.timestamp > this.FILTER_TREND_WINDOW) {
        this.filterCountCache.delete(key);
      }
    });
    
    // Clean up listing view cache
    this.listingViewCache.forEach((entry, key) => {
      if (now - entry.timestamp > this.LISTING_POPULARITY_WINDOW) {
        this.listingViewCache.delete(key);
      }
    });
  }
}

export default NotificationService;
