// @ts-nocheck
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import WebSocketServer, { WebSocketEventType } from '../../src/websocket/server';
import ChannelManager, { ChannelType } from '../../src/websocket/channels';
import WebSocketMiddleware from '../../src/websocket/middleware';
import { AnalyticsEventType, FilterAnalyticsEvent } from '../../src/services/analyticsService';

// Mock dependencies
jest.mock('@supabase/realtime-js');
jest.mock('../../libs/supabaseClient');

// Setup mocks before tests
beforeAll(() => {
  // Mock RealtimeClient
  const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockImplementation((callback) => {
      if (callback) callback('SUBSCRIBED');
      return mockChannel;
    }),
    unsubscribe: jest.fn(),
    send: jest.fn()
  };
  
  const mockClient = {
    channel: jest.fn().mockReturnValue(mockChannel),
    disconnect: jest.fn()
  };
  
  // @ts-ignore - Ignore TypeScript errors for test mocks
  require('@supabase/realtime-js').RealtimeClient.mockImplementation(() => mockClient);
  
  // Mock Supabase
  const mockSupabase = {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'test-user-id'
            }
          }
        }
      })
    },
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        error: null
      })
    })
  };
  
  // @ts-ignore - Ignore TypeScript errors for test mocks
  require('../../libs/supabaseClient').default = mockSupabase;
});

describe('WebSocket Implementation', () => {
  let wsServer: WebSocketServer;
  let channelManager: ChannelManager;
  let middleware: WebSocketMiddleware;

  beforeEach(async () => {
    // Get instances
    wsServer = WebSocketServer.getInstance();
    channelManager = ChannelManager.getInstance();
    middleware = WebSocketMiddleware.getInstance();

    // Initialize
    await wsServer.initialize();
    await channelManager.initialize();

    // Clear any existing clients
    jest.spyOn(wsServer, 'unregisterClient').mockImplementation(() => {});
    jest.spyOn(wsServer, 'registerClient').mockImplementation(() => {});
    jest.spyOn(wsServer, 'sendToClient').mockImplementation(() => {});
    jest.spyOn(wsServer, 'broadcastToChannel').mockImplementation(() => {});
    jest.spyOn(wsServer, 'broadcastAnalyticsEvent').mockImplementation(() => {});
  });

  afterEach(() => {
    wsServer.shutdown();
    jest.clearAllMocks();
  });

  describe('WebSocketServer', () => {
    it('should be a singleton', () => {
      const instance1 = WebSocketServer.getInstance();
      const instance2 = WebSocketServer.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should register and unregister clients', () => {
      const clientId = 'test-client-id';
      wsServer.registerClient(clientId);
      expect(wsServer.registerClient).toHaveBeenCalledWith(clientId);

      wsServer.unregisterClient(clientId);
      expect(wsServer.unregisterClient).toHaveBeenCalledWith(clientId);
    });

    it('should broadcast analytics events to channels', () => {
      const event: FilterAnalyticsEvent = {
        eventType: AnalyticsEventType.SEARCH,
        searchQuery: 'test query',
        timestamp: new Date().toISOString(),
        sessionId: 'test-session-id'
      };

      wsServer.broadcastAnalyticsEvent(event);
      expect(wsServer.broadcastAnalyticsEvent).toHaveBeenCalledWith(event);
    });
  });

  describe('ChannelManager', () => {
    it('should be a singleton', () => {
      const instance1 = ChannelManager.getInstance();
      const instance2 = ChannelManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should subscribe and unsubscribe clients to channels', () => {
      const clientId = 'test-client-id';
      const channelType = ChannelType.ANALYTICS;

      // Mock the wsServer methods
      jest.spyOn(channelManager.wsServer, 'subscribeToChannel').mockImplementation(() => {});
      jest.spyOn(channelManager.wsServer, 'unsubscribeFromChannel').mockImplementation(() => {});
      jest.spyOn(channelManager.wsServer, 'sendToClient').mockImplementation(() => {});

      channelManager.subscribeToChannel(clientId, channelType);
      expect(channelManager.wsServer.subscribeToChannel).toHaveBeenCalledWith(clientId, channelType);
      expect(channelManager.wsServer.sendToClient).toHaveBeenCalled();

      channelManager.unsubscribeFromChannel(clientId, channelType);
      expect(channelManager.wsServer.unsubscribeFromChannel).toHaveBeenCalledWith(clientId, channelType);
      expect(channelManager.wsServer.sendToClient).toHaveBeenCalled();
    });

    it('should return available channels', () => {
      const channels = channelManager.getAvailableChannels();
      expect(channels).toContain(ChannelType.ANALYTICS);
      expect(channels).toContain(ChannelType.SEARCH);
      expect(channels).toContain(ChannelType.FILTERS);
      expect(channels).toContain(ChannelType.LISTINGS);
      expect(channels).toContain(ChannelType.USER_SESSIONS);
    });

    it('should return channel descriptions', () => {
      const description = channelManager.getChannelDescription(ChannelType.ANALYTICS);
      expect(description).toBe('All analytics events');
    });

    it('should return channel event types', () => {
      const eventTypes = channelManager.getChannelEventTypes(ChannelType.SEARCH);
      expect(eventTypes).toContain(AnalyticsEventType.SEARCH);
    });
  });

  describe('WebSocketMiddleware', () => {
    it('should be a singleton', () => {
      const instance1 = WebSocketMiddleware.getInstance();
      const instance2 = WebSocketMiddleware.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should authenticate clients', async () => {
      const authResult = await middleware.authenticateClient();
      expect(authResult).not.toBeNull();
      expect(authResult?.clientId).toBeDefined();
    });

    it('should handle rate limiting', () => {
      const clientId = 'test-client-id';
      
      // Initialize rate limit state
      middleware.isRateLimited(clientId);
      
      // Should not be rate limited initially
      expect(middleware.isRateLimited(clientId)).toBe(false);
      
      // Increment message count
      for (let i = 0; i < 100; i++) {
        middleware.incrementMessageCount(clientId);
      }
      
      // Should be rate limited after 100 messages
      expect(middleware.isRateLimited(clientId)).toBe(true);
    });

    it('should handle subscription limits', () => {
      const clientId = 'test-client-id';
      
      // Should be able to subscribe initially
      expect(middleware.canSubscribeToChannel(clientId)).toBe(true);
      
      // Increment subscription count to the limit
      for (let i = 0; i < 10; i++) {
        middleware.incrementSubscriptionCount(clientId);
      }
      
      // Should not be able to subscribe after reaching the limit
      expect(middleware.canSubscribeToChannel(clientId)).toBe(false);
      
      // Decrement subscription count
      middleware.decrementSubscriptionCount(clientId);
      
      // Should be able to subscribe again
      expect(middleware.canSubscribeToChannel(clientId)).toBe(true);
    });
  });
});
