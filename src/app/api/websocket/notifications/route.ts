import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import WebSocketServer, { WebSocketEventType } from '../../../../websocket/server';
import { NotificationEventType } from '../../../../services/notificationService';
import supabase from '../../../../../libs/supabaseClient';
import WebSocketMiddleware from '../../../../websocket/middleware';
import ChannelManager, { ChannelType } from '../../../../websocket/channels';

/**
 * WebSocket handler for notifications
 */
export async function GET(request: NextRequest) {
  // Check if the request is a WebSocket upgrade request
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected a WebSocket upgrade request', { status: 400 });
  }
  
  try {
    // Get authentication token from request headers
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : undefined;

    // Authenticate the client
    const middleware = WebSocketMiddleware.getInstance();
    const authResult = await middleware.authenticateClient(token);

    if (!authResult) {
      return new Response('Authentication failed', { status: 401 });
    }

    const { clientId, userId } = authResult;

    // Create a WebSocket connection
    const { socket, response } = Deno.upgradeWebSocket(request);

    // Get WebSocket server instance
    const channelManager = ChannelManager.getInstance();
    const wsServer = channelManager.wsServer;
    
    // Register the client with the WebSocket server
    wsServer.registerClient(clientId, userId);
    
    // Subscribe to notification channels
    if (userId) {
      channelManager.subscribeToChannel(clientId, `notifications:user:${userId}` as ChannelType);
    }
    
    // Send a welcome message
    socket.send(JSON.stringify({
      type: WebSocketEventType.CONNECT,
      clientId,
      userId,
      timestamp: new Date().toISOString(),
    }));
    
    // Handle messages from the client
    socket.onmessage = async (event) => {
      try {
        // Check rate limiting
        if (middleware.isRateLimited(clientId)) {
          socket.send(JSON.stringify({
            type: WebSocketEventType.ERROR,
            payload: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Rate limit exceeded. Please try again later.',
            },
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // Increment message count for rate limiting
        middleware.incrementMessageCount(clientId);

        // Parse the message
        const message = JSON.parse(event.data as string);
        
        // Handle different message types
        switch (message.type) {
          case WebSocketEventType.SUBSCRIBE:
            // Check if the client can subscribe to more channels
            if (!middleware.canSubscribeToChannel(clientId)) {
              socket.send(JSON.stringify({
                type: WebSocketEventType.ERROR,
                payload: {
                  code: 'MAX_SUBSCRIPTIONS_EXCEEDED',
                  message: 'Maximum number of subscriptions reached.',
                },
                timestamp: new Date().toISOString(),
              }));
              return;
            }

            // Subscribe to the channel
            if (message.channel) {
              channelManager.subscribeToChannel(clientId, message.channel as ChannelType);
              middleware.incrementSubscriptionCount(clientId);
            }
            break;
            
          case WebSocketEventType.UNSUBSCRIBE:
            if (message.channel) {
              channelManager.unsubscribeFromChannel(clientId, message.channel as ChannelType);
              middleware.decrementSubscriptionCount(clientId);
            }
            break;
            
          case WebSocketEventType.NOTIFICATION_UPDATE:
            // Handle notification updates
            if (message.notificationType === NotificationEventType.NOTIFICATION_READ) {
              // Mark notification as read
              if (message.notificationId && userId) {
                const { error } = await supabase.rpc('mark_notification_read', {
                  notification_uuid: message.notificationId,
                  user_uuid: userId,
                });
                
                if (error) {
                  console.error('Error marking notification as read:', error);
                }
              }
            }
            break;
            
          default:
            // Unknown message type
            socket.send(JSON.stringify({
              type: WebSocketEventType.ERROR,
              payload: {
                code: 'UNKNOWN_MESSAGE_TYPE',
                message: `Unknown message type: ${message.type}`,
              },
              timestamp: new Date().toISOString(),
            }));
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        socket.send(JSON.stringify({
          type: WebSocketEventType.ERROR,
          payload: {
            code: 'MESSAGE_PROCESSING_ERROR',
            message: 'Error processing message',
          },
          timestamp: new Date().toISOString(),
        }));
      }
    };
    
    // Handle WebSocket close
    socket.onclose = () => {
      // Unregister the client
      wsServer.unregisterClient(clientId);
    };
    
    // Return the WebSocket response
    return response;
  } catch (error) {
    console.error('Error setting up WebSocket connection:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Add Deno namespace for TypeScript
declare namespace Deno {
  function upgradeWebSocket(request: Request): {
    socket: WebSocket;
    response: Response;
  };
}
