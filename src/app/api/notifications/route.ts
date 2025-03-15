import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../libs/supabaseClient';
import NotificationService from '../../../services/notificationService';

/**
 * GET /api/notifications
 * Get notifications for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeRead = searchParams.get('includeRead') === 'true';
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get notifications
    const notificationService = NotificationService.getInstance();
    const notifications = await notificationService.getUserNotifications(
      session.user.id,
      limit,
      offset,
      includeRead
    );
    
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Mark notifications as read
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { notificationId, markAllAsRead } = body;
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const notificationService = NotificationService.getInstance();
    
    // Mark notification(s) as read
    if (markAllAsRead) {
      const count = await notificationService.markAllAsRead(session.user.id);
      return NextResponse.json({ success: true, count });
    } else if (notificationId) {
      const success = await notificationService.markAsRead(notificationId, session.user.id);
      return NextResponse.json({ success });
    } else {
      return NextResponse.json(
        { error: 'Missing notificationId or markAllAsRead parameter' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Delete a notification
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get notification ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const notificationId = searchParams.get('id');
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing notification ID' },
        { status: 400 }
      );
    }
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Delete notification
    const notificationService = NotificationService.getInstance();
    const success = await notificationService.deleteNotification(notificationId, session.user.id);
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
