# VowSwap Order Management System

This document outlines the implementation of the order management system for the VowSwap marketplace, focusing on the core functionality for processing orders, payments, and shipping.

## Overview

The order management system enables users to buy and sell wedding-related items through a structured workflow that includes:

1. Order creation
2. Payment processing
3. Order fulfillment
4. Shipping tracking
5. Order history

The system is designed to handle the entire lifecycle of an order, from initial purchase to final delivery, with appropriate status tracking and notifications.

## Database Schema

The order management system uses the following tables:

### Orders Table

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  status order_status NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Order Items Table

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Payments Table

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR,
  amount DECIMAL(10,2) NOT NULL,
  status payment_status NOT NULL,
  payment_method VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Shipping Details Table

```sql
CREATE TABLE shipping_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  address_line1 VARCHAR NOT NULL,
  address_line2 VARCHAR,
  city VARCHAR NOT NULL,
  state VARCHAR NOT NULL,
  postal_code VARCHAR NOT NULL,
  country VARCHAR NOT NULL DEFAULT 'US',
  tracking_number VARCHAR,
  carrier VARCHAR,
  status shipping_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Order Status History Table

```sql
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Status Enums

The system uses the following status enums to track the state of orders, payments, and shipping:

### Order Status

```typescript
enum OrderStatus {
  PENDING = 'pending',
  PAYMENT_PROCESSING = 'payment_processing',
  PAID = 'paid',
  PREPARING = 'preparing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}
```

### Payment Status

```typescript
enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  DISPUTED = 'disputed'
}
```

### Shipping Status

```typescript
enum ShippingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED = 'returned'
}
```

## Order Flow

The typical order flow in the system is as follows:

1. **Order Creation**
   - Buyer selects items and proceeds to checkout
   - System creates an order with status `PENDING`
   - Order items are recorded with current prices

2. **Payment Processing**
   - System creates a payment intent with Stripe
   - Order status changes to `PAYMENT_PROCESSING`
   - Upon successful payment, status changes to `PAID`

3. **Order Preparation**
   - Seller is notified of the new order
   - Seller marks the order as `PREPARING`

4. **Shipping**
   - Seller adds tracking information
   - Order status changes to `SHIPPED`
   - Shipping status is updated to `SHIPPED`

5. **Delivery**
   - When delivered, status changes to `DELIVERED`
   - Shipping status is updated to `DELIVERED`

6. **Cancellation/Refund (if needed)**
   - Order can be cancelled by buyer or seller (with restrictions)
   - Refunds can be processed if payment was made

## API Endpoints

The system provides the following API endpoints:

### Orders

- `GET /api/orders` - Get all orders for the current buyer
- `POST /api/orders` - Create a new order
- `GET /api/orders/seller` - Get all orders for the current seller
- `GET /api/orders/:orderId` - Get a specific order
- `PATCH /api/orders/:orderId` - Update an order's status
- `PATCH /api/orders/:orderId/shipping` - Update shipping information

## Frontend Components

The system includes the following frontend components:

### Buyer Dashboard

- Order history view
- Order details view
- Order cancellation functionality
- Tracking information display

### Seller Dashboard

- Order management view
- Order fulfillment workflow
- Shipping information management
- Order status updates

## Payment Integration

The system integrates with Stripe for payment processing:

1. **Payment Intent Creation**
   - Creates a payment intent when an order is placed
   - Securely handles payment information

2. **Webhook Handling**
   - Processes Stripe webhook events
   - Updates order status based on payment events

3. **Refund Processing**
   - Handles refund requests
   - Updates payment and order status accordingly

## Security Considerations

The order management system implements the following security measures:

1. **Authentication**
   - All endpoints require authentication
   - Order access is restricted to the buyer and seller

2. **Authorization**
   - Buyers can only view and manage their own orders
   - Sellers can only view and manage orders for their listings

3. **Data Validation**
   - All input is validated before processing
   - Status transitions are validated to prevent invalid state changes

4. **Error Handling**
   - Comprehensive error handling for all operations
   - Detailed error messages for debugging

## Future Enhancements

Potential future enhancements to the order management system:

1. **Multi-seller Orders**
   - Support for orders with items from multiple sellers
   - Split payment processing

2. **Advanced Shipping Integration**
   - Integration with shipping carriers for label generation
   - Automated tracking updates

3. **Dispute Resolution**
   - Built-in dispute resolution workflow
   - Mediation tools for resolving issues

4. **Analytics Dashboard**
   - Sales analytics for sellers
   - Order metrics and insights

5. **Subscription Orders**
   - Support for recurring subscription orders
   - Automated billing and fulfillment

## Usage Guidelines

When working with the order management system, consider the following guidelines:

1. **Status Updates**
   - Always use the provided API endpoints for status updates
   - Validate status transitions to ensure they are valid

2. **Payment Handling**
   - Never store sensitive payment information
   - Use the payment service for all payment operations

3. **Error Handling**
   - Implement proper error handling for all operations
   - Provide clear error messages to users

4. **Testing**
   - Test all order flows thoroughly
   - Use test mode for payment processing during development
