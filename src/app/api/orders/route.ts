import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../libs/supabaseClient';
import { createOrderFromCart, getBuyerOrdersWithDetails } from '../../../services/orderService';
import { CartItem, ShippingInfo } from '../../../services/orderService';

/**
 * GET /api/orders
 * Gets all orders for the current user
 */
export async function GET(req: NextRequest) {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orders, error } = await getBuyerOrdersWithDetails(session.user.id);

    if (error) {
      console.error('Error getting orders:', error);
      return NextResponse.json(
        { error: 'Failed to get orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Creates a new order from cart items
 */
export async function POST(req: NextRequest) {
  try {
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
    if (!body.cartItems || !Array.isArray(body.cartItems) || body.cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      );
    }

    if (!body.shippingInfo) {
      return NextResponse.json(
        { error: 'Shipping information is required' },
        { status: 400 }
      );
    }

    const cartItems: CartItem[] = body.cartItems;
    const shippingInfo: ShippingInfo = body.shippingInfo;

    // Create the order
    const { order, clientSecret, error } = await createOrderFromCart(
      session.user.id,
      cartItems,
      shippingInfo
    );

    if (error) {
      console.error('Error creating order:', error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ order, clientSecret });
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
