import axiosInstance from '@/lib/axios';
import type {
  Order,
  PaymentMethod,
  OrderItem as CreateOrderItem,
} from '@/types/gen/shop/shared/orders/order';
import type {
  UpdatePaymentResponse,
  GetOrdersResponse,
} from '@/types/gen/shop/shop/shop/shop';

/**
 * Order Repository
 * Handles all order-related API calls
 */

export interface CreateOrderPayload {
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  shippingAddress: {
    address: string;
    ward?: string;
    district?: string;
    city: string;
    cityId?: number;
    districtId?: number;
    wardId?: number;
  };
  items: CreateOrderItem[];
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface CreateOrderFromCartPayload {
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  shippingAddress: {
    address: string;
    ward: string;
    district: string;
    city: string;
    cityId: number;
    districtId: number;
    wardId: number;
  };
  paymentMethod: string;
  note?: string;
  selectedItems: Array<{
    productId: string;
    variantId?: string;
  }>;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
}

class OrderRepository {
  /**
   * Create order directly with items
   */
  createOrder = async (data: CreateOrderPayload): Promise<Order> => {
    const request = {
      customer: {
        name: data.customer.name,
        phone: data.customer.phone,
        email: data.customer.email,
      },
      shippingAddress: {
        address: data.shippingAddress.address,
        ward: data.shippingAddress.ward,
        district: data.shippingAddress.district,
        city: data.shippingAddress.city,
      },
      items: data.items,
      paymentMethod: data.paymentMethod,
      note: data.note,
    };
    const response = await axiosInstance.post<Order>('/shop/orders', request);
    return response.data;
  };

  /**
   * Create order from cart (for cart page checkout)
   */
  createOrderFromCart = async (data: CreateOrderFromCartPayload): Promise<Order> => {
    const response = await axiosInstance.post<Order>('/shop/orders/from-cart', data);
    return response.data;
  };

  /**
   * Get user's order history with pagination
   */
  getOrders = async (params?: GetOrdersParams): Promise<GetOrdersResponse> => {
    const response = await axiosInstance.get<GetOrdersResponse>('/shop/orders', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
      },
    });
    return response.data;
  };

  /**
   * Get order by ID
   */
  getOrderById = async (orderId: string): Promise<Order> => {
    const response =
      await axiosInstance.get<Order>(`/shop/orders/${orderId}`);
    return response.data;
  };

  /**
   * Get order by ID
   */
  getOrderByIdFormatResponse = async (orderId: string): Promise<any> => {
    const response =
      await axiosInstance.get<Order>(`/shop/orders/${orderId}`);
    return response.data;
  };

  /**
   * Get order by order number (public endpoint - no auth required)
   */
  getOrderByNumber = async (orderNumber: string): Promise<Order> => {
    const response =
      await axiosInstance.get<Order>(`/shop/orders/number/${orderNumber}`);
    return response.data;
  };

  /**
   * Update payment method for an existing order
   */
  updateOrderPayment = async (
    orderId: string,
    paymentMethod: PaymentMethod
  ): Promise<UpdatePaymentResponse> => {
    const response = await axiosInstance.patch<UpdatePaymentResponse>(
      `/shop/orders/${orderId}/payment`,
      { orderId, paymentMethod }
    );
    return response.data;
  };

  /**
   * Get order by confirmation token (public endpoint - no auth required)
   */
  getOrderByToken = async (token: string): Promise<Order> => {
    const response = await axiosInstance.get<Order>(
      `/shop/orders/by-token/${token}`
    );
    return response.data;
  };
}

// Export singleton instance
export const orderRepository = new OrderRepository();
