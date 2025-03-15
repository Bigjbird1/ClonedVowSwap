'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../../../../libs/supabaseClient';
import { OrderWithDetails, OrderStatus, ShippingStatus } from '../../../../../models/supabaseOrder';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const router = useRouter();

  // Fetch seller orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        
        // Get the current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/sign-in');
          return;
        }

        // Fetch orders from the API
        const response = await fetch('/api/orders/seller');
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [router]);

  // Filter orders by status
  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.status === statusFilter);

  // Update order status
  async function updateOrderStatus(orderId: string, status: OrderStatus, notes?: string) {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      // Refresh orders
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return { ...order, status };
        }
        return order;
      });
      
      setOrders(updatedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating order status:', err);
    } finally {
      setLoading(false);
    }
  }

  // Update shipping information
  async function updateShipping(
    orderId: string,
    trackingNumber: string,
    carrier: string
  ) {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/orders/${orderId}/shipping`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: ShippingStatus.SHIPPED,
          trackingNumber,
          carrier,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update shipping information');
      }
      
      // Refresh orders
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status: OrderStatus.SHIPPED,
            shipping: order.shipping ? {
              ...order.shipping,
              status: ShippingStatus.SHIPPED,
              tracking_number: trackingNumber,
              carrier,
            } : undefined,
          } as OrderWithDetails;
        }
        return order;
      });
      
      setOrders(updatedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating shipping information:', err);
    } finally {
      setLoading(false);
    }
  }

  // Cancel order
  async function cancelOrder(orderId: string, reason: string) {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: OrderStatus.CANCELLED,
          notes: reason,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }
      
      // Refresh orders
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: OrderStatus.CANCELLED };
        }
        return order;
      });
      
      setOrders(updatedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error cancelling order:', err);
    } finally {
      setLoading(false);
    }
  }

  // Format date
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Format currency
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  // Get status badge color
  function getStatusColor(status: OrderStatus) {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PAYMENT_PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.PAID:
        return 'bg-green-100 text-green-800';
      case OrderStatus.PREPARING:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.SHIPPED:
        return 'bg-indigo-100 text-indigo-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case OrderStatus.REFUNDED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seller Orders</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Filter Controls */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Filter Orders</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-md ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            All
          </button>
          {Object.values(OrderStatus).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-md ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      
      {/* Orders List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* View Details Button */}
                        <button
                          onClick={() => router.push(`/dashboard/seller/orders/${order.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
                        
                        {/* Status Update Buttons */}
                        {order.status === OrderStatus.PAID && (
                          <button
                            onClick={() => updateOrderStatus(order.id, OrderStatus.PREPARING)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Prepare
                          </button>
                        )}
                        
                        {order.status === OrderStatus.PREPARING && (
                          <button
                            onClick={() => {
                              const trackingNumber = prompt('Enter tracking number:');
                              const carrier = prompt('Enter carrier:');
                              if (trackingNumber && carrier) {
                                updateShipping(order.id, trackingNumber, carrier);
                              }
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Ship
                          </button>
                        )}
                        
                        {order.status === OrderStatus.SHIPPED && (
                          <button
                            onClick={() => updateOrderStatus(order.id, OrderStatus.DELIVERED)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark Delivered
                          </button>
                        )}
                        
                        {/* Cancel Button */}
                        {[OrderStatus.PENDING, OrderStatus.PAYMENT_PROCESSING, OrderStatus.PAID, OrderStatus.PREPARING].includes(order.status) && (
                          <button
                            onClick={() => {
                              const reason = prompt('Enter reason for cancellation:');
                              if (reason) {
                                cancelOrder(order.id, reason);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
