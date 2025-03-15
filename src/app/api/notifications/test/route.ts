import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import NotificationService, { 
  NotificationType, 
  NotificationPriority,
  Notification
} from '../../../../services/notificationService';
import WebSocketServer, { WebSocketEventType } from '../../../../websocket/server';
import supabase from '../../../../../libs/supabaseClient';

/**
 * API endpoint for creating test notifications
 */
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    if (!body.type || !body.priority || !body.title || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate notification type
    if (!Object.values(NotificationType).includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }
    
    // Validate notification priority
    if (!Object.values(NotificationPriority).includes(body.priority)) {
      return NextResponse.json(
        { error: 'Invalid notification priority' },
        { status: 400 }
      );
    }
    
    // Create notification
    const notification: Notification = {
      id: uuidv4(),
      type: body.type,
      priority: body.priority,
      title: body.title,
      message: body.message,
      isRead: false,
      createdAt: new Date().toISOString(),
      userId,
    };
    
    // Insert notification into database
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        id: notification.id,
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        is_read: notification.isRead,
        created_at: notification.createdAt,
        user_id: notification.userId,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating test notification:', error);
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }
    
    // Broadcast notification to WebSocket clients
    const wsServer = WebSocketServer.getInstance();
    wsServer.broadcastToChannel(`notifications:user:${userId}`, {
      type: WebSocketEventType.NOTIFICATION_UPDATE,
      payload: {
        notificationType: 'NOTIFICATION_CREATED',
        notification,
      },
      timestamp: new Date().toISOString(),
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      notification: data,
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
