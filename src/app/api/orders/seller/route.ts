import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../../libs/supabaseClient';
import { getSellerOrdersWithDetails } from '../../../../services/orderService';

/**
 * GET /api/orders/seller
 * Gets all orders for the current seller
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

    const { orders, error } = await getSellerOrdersWithDetails(session.user.id);

    if (error) {
      console.error('Error getting seller orders:', error);
      return NextResponse.json(
        { error: 'Failed to get orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error in GET /api/orders/seller:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
