import { NextRequest } from 'next/server';
import { WebSocketEventType } from '../../../../websocket/server';
import ChannelManager, { ChannelType } from '../../../../websocket/channels';
import WebSocketMiddleware from '../../../../websocket/middleware';

/**
 * WebSocket handler for analytics
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
            const channelManager = ChannelManager.getInstance();
            channelManager.subscribeToChannel(clientId, message.channel as ChannelType);
            middleware.incrementSubscriptionCount(clientId);
            break;

          case WebSocketEventType.UNSUBSCRIBE:
            // Unsubscribe from the channel
            const channelMgr = ChannelManager.getInstance();
            channelMgr.unsubscribeFromChannel(clientId, message.channel as ChannelType);
            middleware.decrementSubscriptionCount(clientId);
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
      const wsServer = ChannelManager.getInstance().wsServer;
      wsServer.unregisterClient(clientId);
    };

    // Send a welcome message
    socket.send(JSON.stringify({
      type: WebSocketEventType.CONNECT,
      payload: {
        clientId,
        userId,
        message: 'Connected to analytics WebSocket',
        availableChannels: Object.values(ChannelType),
      },
      timestamp: new Date().toISOString(),
    }));

    // Return the WebSocket response
    return response;
  } catch (error) {
    console.error('Error handling WebSocket connection:', error);
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
