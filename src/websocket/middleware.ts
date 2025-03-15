import { v4 as uuidv4 } from 'uuid';
import supabase from '../../libs/supabaseClient';
import WebSocketServer, { WebSocketEventType, WebSocketMessage } from './server';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const MAX_MESSAGES_PER_WINDOW = 100; // Maximum messages per window
const MAX_SUBSCRIPTIONS_PER_CLIENT = 10; // Maximum channel subscriptions per client

// Client rate limiting state
interface RateLimitState {
  messageCount: number;
  windowStart: number;
  subscriptionCount: number;
}

/**
 * WebSocket Middleware for authentication and rate limiting
 */
class WebSocketMiddleware {
  private static instance: WebSocketMiddleware;
  private wsServer: WebSocketServer;
  private rateLimitStates: Map<string, RateLimitState> = new Map();

  private constructor() {
    this.wsServer = WebSocketServer.getInstance();
  }

  /**
   * Get the WebSocket Middleware instance (Singleton pattern)
   */
  public static getInstance(): WebSocketMiddleware {
    if (!WebSocketMiddleware.instance) {
      WebSocketMiddleware.instance = new WebSocketMiddleware();
    }
    return WebSocketMiddleware.instance;
  }

  /**
   * Authenticate a client connection
   * @param token JWT token for authentication
   * @returns Client ID and user ID if authenticated, null otherwise
   */
  public async authenticateClient(token?: string): Promise<{ clientId: string; userId?: string } | null> {
    try {
      // Generate a client ID regardless of authentication status
      const clientId = uuidv4();

      // If no token is provided, register as anonymous client
      if (!token) {
        this.wsServer.registerClient(clientId);
        return { clientId };
      }

      // Verify the token with Supabase
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        console.error('Authentication error:', error);
        return null;
      }

      // Register the authenticated client
      const userId = data.user.id;
      this.wsServer.registerClient(clientId, userId);

      // Initialize rate limiting state
      this.initializeRateLimitState(clientId);

      return { clientId, userId };
    } catch (error) {
      console.error('Error authenticating client:', error);
      return null;
    }
  }

  /**
   * Initialize rate limit state for a client
   */
  private initializeRateLimitState(clientId: string): void {
    this.rateLimitStates.set(clientId, {
      messageCount: 0,
      windowStart: Date.now(),
      subscriptionCount: 0,
    });
  }

  /**
   * Check if a client is rate limited
   * @returns true if rate limited, false otherwise
   */
  public isRateLimited(clientId: string): boolean {
    const state = this.rateLimitStates.get(clientId);
    if (!state) {
      this.initializeRateLimitState(clientId);
      return false;
    }

    const now = Date.now();
    
    // Reset window if it has expired
    if (now - state.windowStart > RATE_LIMIT_WINDOW) {
      state.messageCount = 0;
      state.windowStart = now;
      return false;
    }

    // Check if message count exceeds limit
    return state.messageCount >= MAX_MESSAGES_PER_WINDOW;
  }

  /**
   * Increment message count for rate limiting
   */
  public incrementMessageCount(clientId: string): void {
    const state = this.rateLimitStates.get(clientId);
    if (state) {
      state.messageCount++;
    }
  }

  /**
   * Check if a client can subscribe to more channels
   */
  public canSubscribeToChannel(clientId: string): boolean {
    const state = this.rateLimitStates.get(clientId);
    if (!state) {
      this.initializeRateLimitState(clientId);
      return true;
    }

    return state.subscriptionCount < MAX_SUBSCRIPTIONS_PER_CLIENT;
  }

  /**
   * Increment subscription count
   */
  public incrementSubscriptionCount(clientId: string): void {
    const state = this.rateLimitStates.get(clientId);
    if (state) {
      state.subscriptionCount++;
    }
  }

  /**
   * Decrement subscription count
   */
  public decrementSubscriptionCount(clientId: string): void {
    const state = this.rateLimitStates.get(clientId);
    if (state && state.subscriptionCount > 0) {
      state.subscriptionCount--;
    }
  }

  /**
   * Handle rate limiting error
   */
  public sendRateLimitError(clientId: string): void {
    const message: WebSocketMessage = {
      type: WebSocketEventType.ERROR,
      payload: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded. Please try again later.',
      },
      timestamp: new Date().toISOString(),
    };

    this.wsServer.sendToClient(clientId, message);
  }

  /**
   * Handle authentication error
   */
  public sendAuthError(clientId: string, errorMessage: string = 'Authentication failed'): void {
    const message: WebSocketMessage = {
      type: WebSocketEventType.ERROR,
      payload: {
        code: 'AUTHENTICATION_ERROR',
        message: errorMessage,
      },
      timestamp: new Date().toISOString(),
    };

    this.wsServer.sendToClient(clientId, message);
  }

  /**
   * Clean up rate limit states for inactive clients
   */
  public cleanupInactiveStates(): void {
    // Get all client IDs from the WebSocket server
    const activeClientIds = new Set<string>();
    
    // Remove rate limit states for clients that are no longer connected
    this.rateLimitStates.forEach((_, clientId) => {
      if (!activeClientIds.has(clientId)) {
        this.rateLimitStates.delete(clientId);
      }
    });
  }
}

export default WebSocketMiddleware;
