import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../../libs/supabaseClient';
import { getOrderById, updateOrderStatus, cancelOrder } from '../../../../services/orderService';
import { OrderStatus } from '../../../../../models/supabaseOrder';

/**
 * GET /api/orders/[orderId]
 * Gets a specific order by ID
 */
export async function GET(
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

    // Get the order
    const { order, error } = await getOrderById(orderId);

    if (error) {
      console.error('Error getting order:', error);
      return NextResponse.json(
        { error: 'Failed to get order' },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if the user is the buyer or seller
    if (order.buyer_id !== session.user.id && order.seller_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error in GET /api/orders/[orderId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[orderId]
 * Updates an order's status
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

    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
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

    // Check if the user is authorized to update the order
    const isBuyer = order.buyer_id === session.user.id;
    const isSeller = order.seller_id === session.user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Different status updates are allowed for buyers and sellers
    const status = body.status as OrderStatus;
    const notes = body.notes as string | undefined;

    // Validate status transitions based on user role
    if (isBuyer && !isValidBuyerStatusTransition(order.status, status)) {
      return NextResponse.json(
        { error: 'Invalid status transition for buyer' },
        { status: 400 }
      );
    }

    if (isSeller && !isValidSellerStatusTransition(order.status, status)) {
      return NextResponse.json(
        { error: 'Invalid status transition for seller' },
        { status: 400 }
      );
    }

    // Handle cancellation separately
    if (status === OrderStatus.CANCELLED) {
      const reason = notes || 'No reason provided';
      const { success, error } = await cancelOrder(orderId, reason);

      if (error) {
        console.error('Error cancelling order:', error);
        return NextResponse.json(
          { error: 'Failed to cancel order' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success });
    }

    // Update the order status
    const { success, error } = await updateOrderStatus(orderId, status, notes);

    if (error) {
      console.error('Error updating order status:', error);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error in PATCH /api/orders/[orderId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Validates if a status transition is valid for a buyer
 */
function isValidBuyerStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  // Buyers can only cancel orders in certain states
  if (newStatus === OrderStatus.CANCELLED) {
    return [
      OrderStatus.PENDING,
      OrderStatus.PAYMENT_PROCESSING,
      OrderStatus.PAID,
      OrderStatus.PREPARING
    ].includes(currentStatus);
  }

  // Buyers can't change to other statuses
  return false;
}

/**
 * Validates if a status transition is valid for a seller
 */
function isValidSellerStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  // Define valid transitions for sellers
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CANCELLED],
    [OrderStatus.PAYMENT_PROCESSING]: [OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.REFUNDED]: []
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}
