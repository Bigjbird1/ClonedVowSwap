"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChannelType } from '../websocket/channels';
import { WebSocketEventType } from '../websocket/server';
import { AnalyticsEventType, FilterAnalyticsEvent } from '../services/analyticsService';

// WebSocket connection states
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

// WebSocket hook options
interface WebSocketOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (message: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

// WebSocket hook return type
interface WebSocketHook {
  connectionState: ConnectionState;
  lastMessage: any | null;
  sendMessage: (message: any) => void;
  subscribe: (channel: ChannelType) => void;
  unsubscribe: (channel: ChannelType) => void;
  isSubscribed: (channel: ChannelType) => boolean;
  reconnect: () => void;
  disconnect: () => void;
}

/**
 * Custom hook for WebSocket connections
 */
export const useWebSocket = (
  url: string,
  options: WebSocketOptions = {}
): WebSocketHook => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.DISCONNECTED
  );
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [subscriptions, setSubscriptions] = useState<Set<ChannelType>>(new Set());
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clientIdRef = useRef<string>(uuidv4());

  const {
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  /**
   * Connect to the WebSocket server
   */
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      setConnectionState(ConnectionState.CONNECTING);
      
      // Create a new WebSocket connection
      const ws = new WebSocket(url);
      wsRef.current = ws;

      // Set up event handlers
      ws.onopen = () => {
        setConnectionState(ConnectionState.CONNECTED);
        reconnectAttemptsRef.current = 0;
        
        // Send client ID to the server
        ws.send(JSON.stringify({
          type: WebSocketEventType.CONNECT,
          clientId: clientIdRef.current,
          timestamp: new Date().toISOString(),
        }));

        // Resubscribe to channels
        subscriptions.forEach((channel) => {
          ws.send(JSON.stringify({
            type: WebSocketEventType.SUBSCRIBE,
            channel,
            clientId: clientIdRef.current,
            timestamp: new Date().toISOString(),
          }));
        });

        if (onConnect) onConnect();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
          if (onMessage) onMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setConnectionState(ConnectionState.DISCONNECTED);
        if (onDisconnect) onDisconnect();
        
        // Attempt to reconnect if enabled
        if (autoReconnect) {
          handleReconnect();
        }
      };

      ws.onerror = (error) => {
        setConnectionState(ConnectionState.ERROR);
        if (onError) onError(error);
        
        // Close the connection on error
        ws.close();
      };
    } catch (error) {
      setConnectionState(ConnectionState.ERROR);
      if (onError) onError(error);
      
      // Attempt to reconnect if enabled
      if (autoReconnect) {
        handleReconnect();
      }
    }
  }, [url, autoReconnect, onConnect, onDisconnect, onError, onMessage, subscriptions]);

  /**
   * Handle reconnection logic
   */
  const handleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error(`Maximum reconnection attempts (${maxReconnectAttempts}) reached`);
      return;
    }

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    reconnectAttemptsRef.current++;
    console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);

    reconnectTimerRef.current = setTimeout(() => {
      connect();
    }, reconnectInterval);
  }, [connect, maxReconnectAttempts, reconnectInterval]);

  /**
   * Send a message to the WebSocket server
   */
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return;
    }

    try {
      const fullMessage = {
        ...message,
        clientId: clientIdRef.current,
        timestamp: new Date().toISOString(),
      };
      
      wsRef.current.send(JSON.stringify(fullMessage));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }, []);

  /**
   * Subscribe to a channel
   */
  const subscribe = useCallback((channel: ChannelType) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      // Add to subscriptions to resubscribe when connected
      setSubscriptions((prev) => new Set([...prev, channel]));
      return;
    }

    sendMessage({
      type: WebSocketEventType.SUBSCRIBE,
      channel,
    });

    setSubscriptions((prev) => new Set([...prev, channel]));
  }, [sendMessage]);

  /**
   * Unsubscribe from a channel
   */
  const unsubscribe = useCallback((channel: ChannelType) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      sendMessage({
        type: WebSocketEventType.UNSUBSCRIBE,
        channel,
      });
    }

    setSubscriptions((prev) => {
      const newSubscriptions = new Set(prev);
      newSubscriptions.delete(channel);
      return newSubscriptions;
    });
  }, [sendMessage]);

  /**
   * Check if subscribed to a channel
   */
  const isSubscribed = useCallback((channel: ChannelType) => {
    return subscriptions.has(channel);
  }, [subscriptions]);

  /**
   * Manually reconnect
   */
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  /**
   * Disconnect from the WebSocket server
   */
  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnectionState(ConnectionState.DISCONNECTED);
  }, []);

  // Connect on mount and disconnect on unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionState,
    lastMessage,
    sendMessage,
    subscribe,
    unsubscribe,
    isSubscribed,
    reconnect,
    disconnect,
  };
};

/**
 * Custom hook for analytics WebSocket connections
 */
export const useAnalyticsWebSocket = (
  options: WebSocketOptions = {}
): WebSocketHook & {
  analyticsEvents: FilterAnalyticsEvent[];
  clearEvents: () => void;
} => {
  const [analyticsEvents, setAnalyticsEvents] = useState<FilterAnalyticsEvent[]>([]);
  
  // Handle analytics messages
  const handleMessage = useCallback((message: any) => {
    if (message.type === WebSocketEventType.ANALYTICS_UPDATE && message.payload) {
      setAnalyticsEvents((prev) => [...prev, message.payload]);
    }
    
    if (options.onMessage) {
      options.onMessage(message);
    }
  }, [options]);

  // Use the base WebSocket hook with analytics-specific options
  const wsHook = useWebSocket(
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/websocket/analytics`,
    {
      ...options,
      onMessage: handleMessage,
    }
  );

  // Clear analytics events
  const clearEvents = useCallback(() => {
    setAnalyticsEvents([]);
  }, []);

  return {
    ...wsHook,
    analyticsEvents,
    clearEvents,
  };
};

export default useWebSocket;
