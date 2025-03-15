import supabase from '../libs/supabaseClient';

// Order status enum
export enum OrderStatus {
  PENDING = 'pending',
  PAYMENT_PROCESSING = 'payment_processing',
  PAID = 'paid',
  PREPARING = 'preparing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// Shipping status enum
export enum ShippingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED = 'returned'
}

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  DISPUTED = 'disputed'
}

// Order interface
export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

// Order item interface
export interface OrderItem {
  id: string;
  order_id: string;
  listing_id: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
}

// Payment interface
export interface Payment {
  id: string;
  order_id: string;
  stripe_payment_intent_id: string | null;
  amount: number;
  status: PaymentStatus;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

// Shipping details interface
export interface ShippingDetails {
  id: string;
  order_id: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  tracking_number: string | null;
  carrier: string | null;
  status: ShippingStatus;
  created_at: string;
  updated_at: string;
}

// Order status history interface
export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
}

// Order with related data
export interface OrderWithDetails extends Order {
  items?: OrderItem[];
  payment?: Payment;
  shipping?: ShippingDetails;
  status_history?: OrderStatusHistory[];
}

// Create a new order
export async function createOrder(
  buyerId: string,
  sellerId: string,
  totalAmount: number,
  items: { listing_id: string; quantity: number; price: number }[]
): Promise<{ order: Order | null; error: Error | null }> {
  try {
    // Start a transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: buyerId,
        seller_id: sellerId,
        status: OrderStatus.PENDING,
        total_amount: totalAmount
      })
      .select()
      .single();

    if (orderError) throw orderError;
    if (!order) throw new Error('Failed to create order');

    // Insert order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      listing_id: item.listing_id,
      quantity: item.quantity,
      price_at_time: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return { order, error: null };
  } catch (error) {
    console.error('Error creating order:', error);
    return { order: null, error: error as Error };
  }
}

// Get order by ID with all related data
export async function getOrderById(orderId: string): Promise<{ order: OrderWithDetails | null; error: Error | null }> {
  try {
    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;
    if (!order) throw new Error('Order not found');

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    // Get payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (paymentError && paymentError.code !== 'PGRST116') throw paymentError;

    // Get shipping details
    const { data: shipping, error: shippingError } = await supabase
      .from('shipping_details')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (shippingError && shippingError.code !== 'PGRST116') throw shippingError;

    // Get status history
    const { data: statusHistory, error: historyError } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (historyError) throw historyError;

    // Combine all data
    const orderWithDetails: OrderWithDetails = {
      ...order,
      items: items || [],
      payment: payment || undefined,
      shipping: shipping || undefined,
      status_history: statusHistory || []
    };

    return { order: orderWithDetails, error: null };
  } catch (error) {
    console.error('Error getting order:', error);
    return { order: null, error: error as Error };
  }
}

// Get orders for a buyer
export async function getBuyerOrders(buyerId: string): Promise<{ orders: Order[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { orders: data || [], error: null };
  } catch (error) {
    console.error('Error getting buyer orders:', error);
    return { orders: [], error: error as Error };
  }
}

// Get orders for a seller
export async function getSellerOrders(sellerId: string): Promise<{ orders: Order[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { orders: data || [], error: null };
  } catch (error) {
    console.error('Error getting seller orders:', error);
    return { orders: [], error: error as Error };
  }
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  notes?: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;

    // Add notes to status history if provided
    if (notes) {
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status,
          notes
        });

      if (historyError) throw historyError;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error as Error };
  }
}

// Create or update payment for an order
export async function createOrUpdatePayment(
  orderId: string,
  paymentData: Partial<Payment>
): Promise<{ payment: Payment | null; error: Error | null }> {
  try {
    // Check if payment exists
    const { data: existingPayment, error: checkError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    let payment;

    if (existingPayment) {
      // Update existing payment
      const { data, error } = await supabase
        .from('payments')
        .update(paymentData)
        .eq('id', existingPayment.id)
        .select()
        .single();

      if (error) throw error;
      payment = data;
    } else {
      // Create new payment
      const { data, error } = await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          ...paymentData
        })
        .select()
        .single();

      if (error) throw error;
      payment = data;
    }

    return { payment, error: null };
  } catch (error) {
    console.error('Error with payment:', error);
    return { payment: null, error: error as Error };
  }
}

// Create or update shipping details for an order
export async function createOrUpdateShipping(
  orderId: string,
  shippingData: Partial<ShippingDetails>
): Promise<{ shipping: ShippingDetails | null; error: Error | null }> {
  try {
    // Check if shipping details exist
    const { data: existingShipping, error: checkError } = await supabase
      .from('shipping_details')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    let shipping;

    if (existingShipping) {
      // Update existing shipping details
      const { data, error } = await supabase
        .from('shipping_details')
        .update(shippingData)
        .eq('id', existingShipping.id)
        .select()
        .single();

      if (error) throw error;
      shipping = data;
    } else {
      // Create new shipping details
      const { data, error } = await supabase
        .from('shipping_details')
        .insert({
          order_id: orderId,
          ...shippingData
        })
        .select()
        .single();

      if (error) throw error;
      shipping = data;
    }

    return { shipping, error: null };
  } catch (error) {
    console.error('Error with shipping details:', error);
    return { shipping: null, error: error as Error };
  }
}
