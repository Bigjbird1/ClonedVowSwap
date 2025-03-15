import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import NotificationService, { 
  NotificationType, 
  NotificationPriority,
  NotificationRule
} from '../../src/services/notificationService';
import { AnalyticsEventType, FilterAnalyticsEvent } from '../../src/services/analyticsService';
import WebSocketServer from '../../src/websocket/server';

// Mock dependencies
jest.mock('../../libs/supabaseClient', () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  rpc: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } }
    })
  }
}));

jest.mock('../../src/websocket/server', () => {
  return {
    __esModule: true,
    WebSocketEventType: {
      CONNECT: 'connect',
      DISCONNECT: 'disconnect',
      ANALYTICS_UPDATE: 'analytics_update',
      NOTIFICATION_UPDATE: 'notification_update',
      ERROR: 'error',
      SUBSCRIBE: 'subscribe',
      UNSUBSCRIBE: 'unsubscribe',
    },
    default: {
      getInstance: jest.fn().mockReturnValue({
        broadcastToChannel: jest.fn(),
        registerClient: jest.fn(),
        unregisterClient: jest.fn(),
        subscribeToChannel: jest.fn(),
        unsubscribeFromChannel: jest.fn(),
      }),
    },
  };
});

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockSupabase: any;
  let mockWebSocketServer: any;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Get instance of notification service
    notificationService = NotificationService.getInstance();
    
    // Get mocked dependencies
    mockSupabase = require('../../libs/supabaseClient');
    mockWebSocketServer = WebSocketServer.getInstance();
    
    // Mock successful database operations
    mockSupabase.from().insert().select().single.mockResolvedValue({
      data: {
        id: 'test-notification-id',
        type: NotificationType.SEARCH_SPIKE,
        priority: NotificationPriority.HIGH,
        title: 'Test Notification',
        message: 'This is a test notification',
        metadata: {},
        is_read: false,
        created_at: new Date().toISOString(),
        user_id: 'test-user-id',
        event_id: 'test-event-id',
      },
      error: null,
    });
    
    mockSupabase.from().select().mockResolvedValue({
      data: [
        {
          id: 'test-notification-id',
          type: NotificationType.SEARCH_SPIKE,
          priority: NotificationPriority.HIGH,
          title: 'Test Notification',
          message: 'This is a test notification',
          metadata: {},
          is_read: false,
          created_at: new Date().toISOString(),
          user_id: 'test-user-id',
          event_id: 'test-event-id',
        },
      ],
      error: null,
    });
    
    mockSupabase.rpc().mockResolvedValue({
      data: true,
      error: null,
    });
  });
  
  afterEach(() => {
    // Reset the singleton instance
    // @ts-ignore: Accessing private property for testing
    NotificationService.instance = undefined;
  });
  
  describe('getInstance', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = NotificationService.getInstance();
      const instance2 = NotificationService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
  
  describe('addRule', () => {
    it('should add a rule to the rules map', () => {
      const rule: NotificationRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        eventTypes: [AnalyticsEventType.SEARCH],
        condition: jest.fn().mockReturnValue(true),
        createNotification: jest.fn().mockReturnValue({
          type: NotificationType.SEARCH_SPIKE,
          priority: NotificationPriority.HIGH,
          title: 'Test Notification',
          message: 'This is a test notification',
        }),
        isEnabled: true,
      };
      
      notificationService.addRule(rule);
      
      // @ts-ignore: Accessing private property for testing
      expect(notificationService.rules.get('test-rule')).toBe(rule);
    });
  });
  
  describe('removeRule', () => {
    it('should remove a rule from the rules map', () => {
      const rule: NotificationRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        eventTypes: [AnalyticsEventType.SEARCH],
        condition: jest.fn().mockReturnValue(true),
        createNotification: jest.fn().mockReturnValue({
          type: NotificationType.SEARCH_SPIKE,
          priority: NotificationPriority.HIGH,
          title: 'Test Notification',
          message: 'This is a test notification',
        }),
        isEnabled: true,
      };
      
      notificationService.addRule(rule);
      const result = notificationService.removeRule('test-rule');
      
      expect(result).toBe(true);
      // @ts-ignore: Accessing private property for testing
      expect(notificationService.rules.has('test-rule')).toBe(false);
    });
    
    it('should return false if the rule does not exist', () => {
      const result = notificationService.removeRule('non-existent-rule');
      
      expect(result).toBe(false);
    });
  });
  
  describe('enableRule and disableRule', () => {
    it('should enable a rule', () => {
      const rule: NotificationRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        eventTypes: [AnalyticsEventType.SEARCH],
        condition: jest.fn().mockReturnValue(true),
        createNotification: jest.fn().mockReturnValue({
          type: NotificationType.SEARCH_SPIKE,
          priority: NotificationPriority.HIGH,
          title: 'Test Notification',
          message: 'This is a test notification',
        }),
        isEnabled: false,
      };
      
      notificationService.addRule(rule);
      const result = notificationService.enableRule('test-rule');
      
      expect(result).toBe(true);
      // @ts-ignore: Accessing private property for testing
      expect(notificationService.rules.get('test-rule')?.isEnabled).toBe(true);
    });
    
    it('should disable a rule', () => {
      const rule: NotificationRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        eventTypes: [AnalyticsEventType.SEARCH],
        condition: jest.fn().mockReturnValue(true),
        createNotification: jest.fn().mockReturnValue({
          type: NotificationType.SEARCH_SPIKE,
          priority: NotificationPriority.HIGH,
          title: 'Test Notification',
          message: 'This is a test notification',
        }),
        isEnabled: true,
      };
      
      notificationService.addRule(rule);
      const result = notificationService.disableRule('test-rule');
      
      expect(result).toBe(true);
      // @ts-ignore: Accessing private property for testing
      expect(notificationService.rules.get('test-rule')?.isEnabled).toBe(false);
    });
  });
  
  describe('processEvent', () => {
    it('should process an event and create a notification if the rule condition is met', async () => {
      const rule: NotificationRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        eventTypes: [AnalyticsEventType.SEARCH],
        condition: jest.fn().mockReturnValue(true),
        createNotification: jest.fn().mockReturnValue({
          type: NotificationType.SEARCH_SPIKE,
          priority: NotificationPriority.HIGH,
          title: 'Test Notification',
          message: 'This is a test notification',
        }),
        isEnabled: true,
      };
      
      notificationService.addRule(rule);
      
      const event: FilterAnalyticsEvent = {
        id: 'test-event-id',
        eventType: AnalyticsEventType.SEARCH,
        searchQuery: 'test',
        timestamp: new Date().toISOString(),
        sessionId: 'test-session-id',
        userId: 'test-user-id',
      };
      
      const notifications = await notificationService.processEvent(event);
      
      expect(rule.condition).toHaveBeenCalledWith(event);
      expect(rule.createNotification).toHaveBeenCalledWith(event);
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe(NotificationType.SEARCH_SPIKE);
      expect(mockWebSocketServer.broadcastToChannel).toHaveBeenCalled();
    });
    
    it('should not create a notification if the rule condition is not met', async () => {
      const rule: NotificationRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        eventTypes: [AnalyticsEventType.SEARCH],
        condition: jest.fn().mockReturnValue(false),
        createNotification: jest.fn(),
        isEnabled: true,
      };
      
      notificationService.addRule(rule);
      
      const event: FilterAnalyticsEvent = {
        id: 'test-event-id',
        eventType: AnalyticsEventType.SEARCH,
        searchQuery: 'test',
        timestamp: new Date().toISOString(),
        sessionId: 'test-session-id',
        userId: 'test-user-id',
      };
      
      const notifications = await notificationService.processEvent(event);
      
      expect(rule.condition).toHaveBeenCalledWith(event);
      expect(rule.createNotification).not.toHaveBeenCalled();
      expect(notifications).toHaveLength(0);
      expect(mockWebSocketServer.broadcastToChannel).not.toHaveBeenCalled();
    });
    
    it('should not process a rule if it is disabled', async () => {
      const rule: NotificationRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        eventTypes: [AnalyticsEventType.SEARCH],
        condition: jest.fn(),
        createNotification: jest.fn(),
        isEnabled: false,
      };
      
      notificationService.addRule(rule);
      
      const event: FilterAnalyticsEvent = {
        id: 'test-event-id',
        eventType: AnalyticsEventType.SEARCH,
        searchQuery: 'test',
        timestamp: new Date().toISOString(),
        sessionId: 'test-session-id',
        userId: 'test-user-id',
      };
      
      const notifications = await notificationService.processEvent(event);
      
      expect(rule.condition).not.toHaveBeenCalled();
      expect(rule.createNotification).not.toHaveBeenCalled();
      expect(notifications).toHaveLength(0);
    });
    
    it('should not process a rule if the event type does not match', async () => {
      const rule: NotificationRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        eventTypes: [AnalyticsEventType.FILTER_APPLY],
        condition: jest.fn(),
        createNotification: jest.fn(),
        isEnabled: true,
      };
      
      notificationService.addRule(rule);
      
      const event: FilterAnalyticsEvent = {
        id: 'test-event-id',
        eventType: AnalyticsEventType.SEARCH,
        searchQuery: 'test',
        timestamp: new Date().toISOString(),
        sessionId: 'test-session-id',
        userId: 'test-user-id',
      };
      
      const notifications = await notificationService.processEvent(event);
      
      expect(rule.condition).not.toHaveBeenCalled();
      expect(rule.createNotification).not.toHaveBeenCalled();
      expect(notifications).toHaveLength(0);
    });
  });
  
  describe('getUserNotifications', () => {
    it('should return notifications for a user', async () => {
      const notifications = await notificationService.getUserNotifications('test-user-id');
      
      expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(notifications).toHaveLength(1);
      expect(notifications[0].id).toBe('test-notification-id');
    });
    
    it('should filter out read notifications if includeRead is false', async () => {
      await notificationService.getUserNotifications('test-user-id', 20, 0, false);
      
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_read', false);
    });
    
    it('should include read notifications if includeRead is true', async () => {
      await notificationService.getUserNotifications('test-user-id', 20, 0, true);
      
      expect(mockSupabase.eq).not.toHaveBeenCalledWith('is_read', false);
    });
  });
  
  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const result = await notificationService.markAsRead('test-notification-id', 'test-user-id');
      
      expect(mockSupabase.rpc).toHaveBeenCalledWith('mark_notification_read', {
        notification_uuid: 'test-notification-id',
        user_uuid: 'test-user-id',
      });
      expect(result).toBe(true);
      expect(mockWebSocketServer.broadcastToChannel).toHaveBeenCalled();
    });
  });
  
  describe('markAllAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      const result = await notificationService.markAllAsRead('test-user-id');
      
      expect(mockSupabase.rpc).toHaveBeenCalledWith('mark_all_notifications_read', {
        user_uuid: 'test-user-id',
      });
      expect(result).toBe(true);
      expect(mockWebSocketServer.broadcastToChannel).toHaveBeenCalled();
    });
  });
  
  describe('getUnreadCount', () => {
    it('should get the unread notification count for a user', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: 5,
        error: null,
      });
      
      const result = await notificationService.getUnreadCount('test-user-id');
      
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_unread_notification_count', {
        user_uuid: 'test-user-id',
      });
      expect(result).toBe(5);
    });
  });
  
  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      mockSupabase.from().delete().eq().eq.mockResolvedValueOnce({
        error: null,
      });
      
      const result = await notificationService.deleteNotification('test-notification-id', 'test-user-id');
      
      expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'test-notification-id');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(result).toBe(true);
      expect(mockWebSocketServer.broadcastToChannel).toHaveBeenCalled();
    });
  });
  
  describe('getUserPreferences', () => {
    it('should get notification preferences for a user', async () => {
      mockSupabase.from().select().eq.mockResolvedValueOnce({
        data: [
          {
            notification_type: NotificationType.SEARCH_SPIKE,
            enabled: true,
          },
          {
            notification_type: NotificationType.FILTER_TREND,
            enabled: false,
          },
        ],
        error: null,
      });
      
      const result = await notificationService.getUserPreferences('test-user-id');
      
      expect(mockSupabase.from).toHaveBeenCalledWith('notification_preferences');
      expect(mockSupabase.select).toHaveBeenCalledWith('notification_type, enabled');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(result).toEqual({
        [NotificationType.SEARCH_SPIKE]: true,
        [NotificationType.FILTER_TREND]: false,
      });
    });
  });
  
  describe('updateUserPreferences', () => {
    it('should update notification preferences for a user', async () => {
      mockSupabase.from().upsert.mockResolvedValueOnce({
        error: null,
      });
      
      const preferences = {
        [NotificationType.SEARCH_SPIKE]: true,
        [NotificationType.FILTER_TREND]: false,
      };
      
      const result = await notificationService.updateUserPreferences('test-user-id', preferences);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('notification_preferences');
      expect(mockSupabase.upsert).toHaveBeenCalled();
      expect(result).toBe(true);
      expect(mockWebSocketServer.broadcastToChannel).toHaveBeenCalled();
    });
  });
});
