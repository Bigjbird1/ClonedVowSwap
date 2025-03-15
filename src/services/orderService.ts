import { 
  Order, 
  OrderStatus, 
  OrderWithDetails, 
  ShippingDetails, 
  ShippingStatus,
  createOrder,
  getOrderById as getOrderByIdFromModel,
  getBuyerOrders as getBuyerOrdersFromModel,
  getSellerOrders as getSellerOrdersFromModel,
  updateOrderStatus as updateOrderStatusFromModel,
  createOrUpdateShipping
} from '../../models/supabaseOrder';
import { createPaymentIntent } from './paymentService';
import { SupabaseListing, getSupabaseListingById } from '../../models/supabaseListing';

/**
 * Interface for cart items
 */
export interface CartItem {
  listingId: string;
  quantity: number;
}

/**
 * Interface for shipping information
 */
export interface ShippingInfo {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Gets an order by ID with all related data
 * @param orderId The ID of the order
 */
export async function getOrderById(orderId: string): Promise<{ order: OrderWithDetails | null; error: Error | null }> {
  return getOrderByIdFromModel(orderId);
}

/**
 * Updates an order's status
 * @param orderId The ID of the order
 * @param status The new status
 * @param notes Optional notes about the status change
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  notes?: string
): Promise<{ success: boolean; error: Error | null }> {
  return updateOrderStatusFromModel(orderId, status, notes);
}

/**
 * Creates a new order from cart items
 * @param buyerId The ID of the buyer
 * @param cartItems The items in the cart
 * @param shippingInfo The shipping information
 */
export async function createOrderFromCart(
  buyerId: string,
  cartItems: CartItem[],
  shippingInfo: ShippingInfo
): Promise<{ order: OrderWithDetails | null; clientSecret: string | null; error: Error | null }> {
  try {
    // Fetch all listings to get their details
    const listingPromises = cartItems.map(item => getSupabaseListingById(item.listingId));
    const listings = await Promise.all(listingPromises);

    // Calculate the total amount
    let totalAmount = 0;
    const orderItems = listings.map((listing, index) => {
      const cartItem = cartItems[index];
      const itemTotal = listing.price * cartItem.quantity;
      totalAmount += itemTotal;
      
      return {
        listing_id: listing.id!,
        quantity: cartItem.quantity,
        price: listing.price
      };
    });

    // Get the seller ID from the first listing
    // In a real implementation, you would handle multiple sellers
    const sellerId = listings[0].sellerId;

    // Create the order
    const { order, error: orderError } = await createOrder(
      buyerId,
      sellerId,
      totalAmount,
      orderItems
    );

    if (orderError || !order) {
      throw orderError || new Error('Failed to create order');
    }

    // Create shipping details
    const { shipping, error: shippingError } = await createOrUpdateShipping(
      order.id,
      {
        address_line1: shippingInfo.addressLine1,
        address_line2: shippingInfo.addressLine2 || null,
        city: shippingInfo.city,
        state: shippingInfo.state,
        postal_code: shippingInfo.postalCode,
        country: shippingInfo.country,
        status: ShippingStatus.PENDING
      }
    );

    if (shippingError) {
      throw shippingError;
    }

    // Create a payment intent
    const { clientSecret, error: paymentError } = await createPaymentIntent(
      order.id,
      Math.round(totalAmount * 100), // Convert to cents
      'usd',
      {
        buyerId,
        sellerId
      }
    );

    if (paymentError) {
      throw paymentError;
    }

    // Get the full order with details
    const { order: orderWithDetails, error: getOrderError } = await getOrderById(order.id);

    if (getOrderError || !orderWithDetails) {
      throw getOrderError || new Error('Failed to get order details');
    }

    return { order: orderWithDetails, clientSecret, error: null };
  } catch (error) {
    console.error('Error creating order from cart:', error);
    return { order: null, clientSecret: null, error: error as Error };
  }
}

/**
 * Gets orders for a buyer
 * @param buyerId The ID of the buyer
 */
export async function getBuyerOrdersWithDetails(
  buyerId: string
): Promise<{ orders: OrderWithDetails[]; error: Error | null }> {
  try {
    // Get all orders for the buyer
    const { orders, error } = await getBuyerOrdersFromModel(buyerId);

    if (error) {
      throw error;
    }

    // Get details for each order
    const orderDetailsPromises = orders.map(order => getOrderByIdFromModel(order.id));
    const orderDetailsResults = await Promise.all(orderDetailsPromises);

    // Filter out any errors
    const ordersWithDetails = orderDetailsResults
      .filter(result => !result.error && result.order)
      .map(result => result.order as OrderWithDetails);

    return { orders: ordersWithDetails, error: null };
  } catch (error) {
    console.error('Error getting buyer orders with details:', error);
    return { orders: [], error: error as Error };
  }
}

/**
 * Gets orders for a seller
 * @param sellerId The ID of the seller
 */
export async function getSellerOrdersWithDetails(
  sellerId: string
): Promise<{ orders: OrderWithDetails[]; error: Error | null }> {
  try {
    // Get all orders for the seller
    const { orders, error } = await getSellerOrdersFromModel(sellerId);

    if (error) {
      throw error;
    }

    // Get details for each order
    const orderDetailsPromises = orders.map(order => getOrderByIdFromModel(order.id));
    const orderDetailsResults = await Promise.all(orderDetailsPromises);

    // Filter out any errors
    const ordersWithDetails = orderDetailsResults
      .filter(result => !result.error && result.order)
      .map(result => result.order as OrderWithDetails);

    return { orders: ordersWithDetails, error: null };
  } catch (error) {
    console.error('Error getting seller orders with details:', error);
    return { orders: [], error: error as Error };
  }
}

/**
 * Updates the shipping status of an order
 * @param orderId The ID of the order
 * @param status The new shipping status
 * @param trackingNumber The tracking number (optional)
 * @param carrier The carrier (optional)
 */
export async function updateShippingStatus(
  orderId: string,
  status: ShippingStatus,
  trackingNumber?: string,
  carrier?: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Update the shipping details
    const shippingData: Partial<ShippingDetails> = { status };
    
    if (trackingNumber) {
      shippingData.tracking_number = trackingNumber;
    }
    
    if (carrier) {
      shippingData.carrier = carrier;
    }

    const { error: shippingError } = await createOrUpdateShipping(orderId, shippingData);

    if (shippingError) {
      throw shippingError;
    }

    // Update the order status based on the shipping status
    let orderStatus: OrderStatus;
    let notes: string | undefined;

    switch (status) {
      case ShippingStatus.SHIPPED:
        orderStatus = OrderStatus.SHIPPED;
        notes = trackingNumber 
          ? `Order shipped with ${carrier || 'carrier'}, tracking number: ${trackingNumber}`
          : 'Order shipped';
        break;
      case ShippingStatus.DELIVERED:
        orderStatus = OrderStatus.DELIVERED;
        notes = 'Order delivered';
        break;
      case ShippingStatus.RETURNED:
        orderStatus = OrderStatus.CANCELLED;
        notes = 'Order returned';
        break;
      default:
        // Don't update the order status for other shipping statuses
        return { success: true, error: null };
    }

    const { success, error: orderError } = await updateOrderStatusFromModel(orderId, orderStatus, notes);

    if (orderError) {
      throw orderError;
    }

    return { success, error: null };
  } catch (error) {
    console.error('Error updating shipping status:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Cancels an order
 * @param orderId The ID of the order
 * @param reason The reason for cancellation
 */
export async function cancelOrder(
  orderId: string,
  reason: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Get the order to check its status
    const { order, error: getOrderError } = await getOrderByIdFromModel(orderId);

    if (getOrderError || !order) {
      throw getOrderError || new Error('Failed to get order');
    }

    // Only allow cancellation for certain statuses
    const allowedStatuses = [
      OrderStatus.PENDING,
      OrderStatus.PAYMENT_PROCESSING,
      OrderStatus.PAID,
      OrderStatus.PREPARING
    ];

    if (!allowedStatuses.includes(order.status)) {
      return { 
        success: false, 
        error: new Error(`Cannot cancel order with status ${order.status}`) 
      };
    }

    // Update the order status
    const { success, error } = await updateOrderStatusFromModel(
      orderId,
      OrderStatus.CANCELLED,
      `Order cancelled: ${reason}`
    );

    if (error) {
      throw error;
    }

    // In a real implementation, you would also handle refunds if payment was made
    // This would involve calling the payment service to issue a refund

    return { success, error: null };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return { success: false, error: error as Error };
  }
}
