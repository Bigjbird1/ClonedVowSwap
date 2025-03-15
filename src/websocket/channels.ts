import WebSocketServer, { WebSocketEventType, WebSocketMessage } from './server';
import { AnalyticsEventType } from '../services/analyticsService';

// Define channel types
export enum ChannelType {
  ANALYTICS = 'analytics',
  SEARCH = 'analytics:search',
  FILTERS = 'analytics:filters',
  LISTINGS = 'analytics:listings',
  USER_SESSIONS = 'analytics:user_sessions',
}

// Define channel subscription options
export interface ChannelSubscriptionOptions {
  userId?: string;
  filters?: {
    eventTypes?: AnalyticsEventType[];
    listingId?: string;
    filterType?: string;
  };
}

/**
 * Channel Manager for WebSocket communications
 */
class ChannelManager {
  private static instance: ChannelManager;
  public wsServer: WebSocketServer;

  private constructor() {
    this.wsServer = WebSocketServer.getInstance();
  }

  /**
   * Get the Channel Manager instance (Singleton pattern)
   */
  public static getInstance(): ChannelManager {
    if (!ChannelManager.instance) {
      ChannelManager.instance = new ChannelManager();
    }
    return ChannelManager.instance;
  }

  /**
   * Initialize the Channel Manager
   */
  public async initialize(): Promise<void> {
    await this.wsServer.initialize();
    console.log('Channel Manager initialized');
  }

  /**
   * Subscribe a client to a channel
   */
  public subscribeToChannel(
    clientId: string,
    channelType: ChannelType,
    options?: ChannelSubscriptionOptions
  ): void {
    this.wsServer.subscribeToChannel(clientId, channelType);

    // Send subscription confirmation
    const message: WebSocketMessage = {
      type: WebSocketEventType.SUBSCRIBE,
      channel: channelType,
      payload: { success: true, options },
      timestamp: new Date().toISOString(),
    };

    this.wsServer.sendToClient(clientId, message);
    console.log(`Client ${clientId} subscribed to ${channelType}`);
  }

  /**
   * Unsubscribe a client from a channel
   */
  public unsubscribeFromChannel(clientId: string, channelType: ChannelType): void {
    this.wsServer.unsubscribeFromChannel(clientId, channelType);

    // Send unsubscription confirmation
    const message: WebSocketMessage = {
      type: WebSocketEventType.UNSUBSCRIBE,
      channel: channelType,
      payload: { success: true },
      timestamp: new Date().toISOString(),
    };

    this.wsServer.sendToClient(clientId, message);
    console.log(`Client ${clientId} unsubscribed from ${channelType}`);
  }

  /**
   * Get all available channels
   */
  public getAvailableChannels(): ChannelType[] {
    return Object.values(ChannelType);
  }

  /**
   * Get channel description
   */
  public getChannelDescription(channelType: ChannelType): string {
    switch (channelType) {
      case ChannelType.ANALYTICS:
        return 'All analytics events';
      case ChannelType.SEARCH:
        return 'Search-related analytics events';
      case ChannelType.FILTERS:
        return 'Filter-related analytics events';
      case ChannelType.LISTINGS:
        return 'Listing-related analytics events';
      case ChannelType.USER_SESSIONS:
        return 'User session analytics events';
      default:
        return 'Unknown channel';
    }
  }

  /**
   * Get analytics event types for a channel
   */
  public getChannelEventTypes(channelType: ChannelType): AnalyticsEventType[] {
    switch (channelType) {
      case ChannelType.ANALYTICS:
        return Object.values(AnalyticsEventType);
      case ChannelType.SEARCH:
        return [AnalyticsEventType.SEARCH];
      case ChannelType.FILTERS:
        return [
          AnalyticsEventType.FILTER_APPLY,
          AnalyticsEventType.FILTER_REMOVE,
          AnalyticsEventType.FILTER_CLEAR,
          AnalyticsEventType.SAVE_FILTER,
          AnalyticsEventType.APPLY_SAVED_FILTER,
        ];
      case ChannelType.LISTINGS:
        return [AnalyticsEventType.LISTING_VIEW, AnalyticsEventType.LISTING_CLICK];
      case ChannelType.USER_SESSIONS:
        return []; // No specific event types for user sessions
      default:
        return [];
    }
  }

  /**
   * Shutdown the Channel Manager
   */
  public shutdown(): void {
    this.wsServer.shutdown();
    console.log('Channel Manager shut down');
  }
}

export default ChannelManager;
