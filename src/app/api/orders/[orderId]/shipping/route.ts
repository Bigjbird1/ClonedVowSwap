import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../../../libs/supabaseClient';
import { getOrderById, updateShippingStatus } from '../../../../../services/orderService';
import { ShippingStatus } from '../../../../../../models/supabaseOrder';

/**
 * PATCH /api/orders/[orderId]/shipping
 * Updates shipping information for an order
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the order to check permissions
    const { order, error: getOrderError } = await getOrderById(orderId);

    if (getOrderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if the user is the seller
    if (order.seller_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const status = body.status as ShippingStatus;
    const trackingNumber = body.trackingNumber as string | undefined;
    const carrier = body.carrier as string | undefined;

    // Update shipping status
    const { success, error } = await updateShippingStatus(
      orderId,
      status,
      trackingNumber,
      carrier
    );

    if (error) {
      console.error('Error updating shipping status:', error);
      return NextResponse.json(
        { error: 'Failed to update shipping status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error in PATCH /api/orders/[orderId]/shipping:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
