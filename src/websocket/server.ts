import { RealtimeChannel, RealtimeClient } from '@supabase/realtime-js';
import supabase from '../../libs/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { AnalyticsEventType, FilterAnalyticsEvent } from '../services/analyticsService';

// Constants for WebSocket configuration
const RECONNECT_INTERVAL = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 10;
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

// Define WebSocket event types
export enum WebSocketEventType {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ANALYTICS_UPDATE = 'analytics_update',
  NOTIFICATION_UPDATE = 'notification_update',
  ERROR = 'error',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
}

// Define WebSocket message interface
export interface WebSocketMessage {
  type: WebSocketEventType;
  payload?: any;
  channel?: string;
  timestamp: string;
}

// Define WebSocket client interface
export interface WebSocketClient {
  id: string;
  userId?: string;
  subscriptions: Set<string>;
  lastActivity: Date;
}

/**
 * WebSocket Server for real-time analytics
 */
class WebSocketServer {
  private static instance: WebSocketServer;
  private realtimeClient: RealtimeClient | null = null;
  private channel: RealtimeChannel | null = null;
  private clients: Map<string, WebSocketClient> = new Map();
  private channels: Map<string, Set<string>> = new Map();
  private reconnectAttempts = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnected = false;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the WebSocket server instance (Singleton pattern)
   */
  public static getInstance(): WebSocketServer {
    if (!WebSocketServer.instance) {
      WebSocketServer.instance = new WebSocketServer();
    }
    return WebSocketServer.instance;
  }

  /**
   * Initialize the WebSocket server
   */
  public async initialize(): Promise<void> {
    try {
      // Get Supabase URL from the environment
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
      }

      // Create Realtime client
      this.realtimeClient = new RealtimeClient(supabaseUrl);
      
      // Create a channel for analytics events
      this.channel = this.realtimeClient.channel('analytics');
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Connect to the channel
      this.channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to analytics channel');
          this.isConnected = true;
          this.reconnectAttempts = 0;
        }
      });

      // Start heartbeat
      this.startHeartbeat();

      console.log('WebSocket server initialized');
    } catch (error) {
      console.error('Failed to initialize WebSocket server:', error);
      this.handleReconnect();
    }
  }

  /**
   * Set up event listeners for the Realtime client
   */
  private setupEventListeners(): void {
    if (!this.channel) return;

    // Listen for connection state changes
    this.channel.on('presence', { event: 'sync' }, () => {
      console.log('Presence state synchronized');
    });

    this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log(`User ${key} joined with state:`, newPresences);
    });

    this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log(`User ${key} left with state:`, leftPresences);
      this.isConnected = false;
      this.handleReconnect();
    });

    this.channel.on('broadcast', { event: 'error' }, (payload) => {
      console.error('WebSocket error:', payload);
      this.isConnected = false;
      this.handleReconnect();
    });
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error(`Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached`);
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

    setTimeout(() => {
      this.initialize();
    }, RECONNECT_INTERVAL);
  }

  /**
   * Start the heartbeat to keep the connection alive
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.channel) {
        // Send a ping to keep the connection alive
        this.channel.send({
          type: 'broadcast',
          event: 'heartbeat',
          payload: { timestamp: new Date().toISOString() }
        });
      }
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * Register a new client
   */
  public registerClient(clientId: string, userId?: string): void {
    this.clients.set(clientId, {
      id: clientId,
      userId,
      subscriptions: new Set(),
      lastActivity: new Date(),
    });
    console.log(`Client registered: ${clientId}`);
  }

  /**
   * Unregister a client
   */
  public unregisterClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      // Remove client from all channels
      client.subscriptions.forEach((channel) => {
        this.unsubscribeFromChannel(clientId, channel);
      });
      this.clients.delete(clientId);
      console.log(`Client unregistered: ${clientId}`);
    }
  }

  /**
   * Subscribe a client to a channel
   */
  public subscribeToChannel(clientId: string, channel: string): void {
    // Update client subscriptions
    const client = this.clients.get(clientId);
    if (client) {
      client.subscriptions.add(channel);
      client.lastActivity = new Date();
    }

    // Update channel subscribers
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)?.add(clientId);

    console.log(`Client ${clientId} subscribed to channel: ${channel}`);
  }

  /**
   * Unsubscribe a client from a channel
   */
  public unsubscribeFromChannel(clientId: string, channel: string): void {
    // Update client subscriptions
    const client = this.clients.get(clientId);
    if (client) {
      client.subscriptions.delete(channel);
      client.lastActivity = new Date();
    }

    // Update channel subscribers
    const channelSubscribers = this.channels.get(channel);
    if (channelSubscribers) {
      channelSubscribers.delete(clientId);
      if (channelSubscribers.size === 0) {
        this.channels.delete(channel);
      }
    }

    console.log(`Client ${clientId} unsubscribed from channel: ${channel}`);
  }

  /**
   * Broadcast a message to all clients subscribed to a channel
   */
  public broadcastToChannel(channelName: string, message: WebSocketMessage): void {
    const channelSubscribers = this.channels.get(channelName);
    if (!channelSubscribers || channelSubscribers.size === 0) {
      return;
    }

    console.log(`Broadcasting to channel ${channelName}: ${JSON.stringify(message)}`);

    // Send message to all subscribers
    channelSubscribers.forEach((clientId) => {
      this.sendToClient(clientId, message);
    });

    // Also broadcast through the Supabase Realtime channel
    if (this.channel && this.isConnected) {
      this.channel.send({
        type: 'broadcast',
        event: channelName,
        payload: message
      });
    }
  }

  /**
   * Send a message to a specific client
   */
  public sendToClient(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client) {
      console.warn(`Attempted to send message to unknown client: ${clientId}`);
      return;
    }

    // In a real implementation, this would send the message through the WebSocket
    // For now, we'll just log it
    console.log(`Sending to client ${clientId}: ${JSON.stringify(message)}`);
  }

  /**
   * Broadcast an analytics event to all relevant channels
   */
  public broadcastAnalyticsEvent(event: FilterAnalyticsEvent): void {
    const message: WebSocketMessage = {
      type: WebSocketEventType.ANALYTICS_UPDATE,
      payload: event,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to the general analytics channel
    this.broadcastToChannel('analytics', message);

    // Broadcast to specific event type channel
    this.broadcastToChannel(`analytics:${event.eventType}`, message);

    // If it's a filter event, broadcast to the filter channel
    if (
      event.eventType === AnalyticsEventType.FILTER_APPLY ||
      event.eventType === AnalyticsEventType.FILTER_REMOVE ||
      event.eventType === AnalyticsEventType.FILTER_CLEAR
    ) {
      this.broadcastToChannel('analytics:filters', message);
    }

    // If it's a search event, broadcast to the search channel
    if (event.eventType === AnalyticsEventType.SEARCH) {
      this.broadcastToChannel('analytics:search', message);
    }

    // If it's a listing event, broadcast to the listing channel
    if (
      event.eventType === AnalyticsEventType.LISTING_VIEW ||
      event.eventType === AnalyticsEventType.LISTING_CLICK
    ) {
      this.broadcastToChannel('analytics:listings', message);
    }
  }

  /**
   * Clean up inactive clients
   */
  public cleanupInactiveClients(maxInactiveTime: number = 3600000): void {
    const now = new Date();
    this.clients.forEach((client, clientId) => {
      const inactiveTime = now.getTime() - client.lastActivity.getTime();
      if (inactiveTime > maxInactiveTime) {
        this.unregisterClient(clientId);
      }
    });
  }

  /**
   * Get the number of connected clients
   */
  public getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get the number of active channels
   */
  public getChannelCount(): number {
    return this.channels.size;
  }

  /**
   * Shutdown the WebSocket server
   */
  public shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }

    if (this.realtimeClient) {
      this.realtimeClient.disconnect();
      this.realtimeClient = null;
    }

    this.clients.clear();
    this.channels.clear();
    this.isConnected = false;
    console.log('WebSocket server shut down');
  }
}

export default WebSocketServer;
