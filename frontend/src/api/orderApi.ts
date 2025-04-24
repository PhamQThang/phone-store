import axiosInstance from "./axiosConfig";

// Định nghĩa kiểu dữ liệu cho Order và OrderDetail
interface OrderDetail {
  product: { name: string };
  color: { name: string };
  price: number;
}

interface Order {
  id: string;
  address: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  phoneNumber?: string;
  paymentMethod: string;
  paymentStatus: string;
  user: { firstName: string; lastName: string };
  orderDetails: OrderDetail[];
}

interface OrderResponse {
  message: string;
  data: {
    order: Order;
    paymentUrl?: string;
  };
}

interface OrdersResponse {
  message: string;
  data: Order[];
}

interface UpdateStatusResponse {
  message: string;
  data: Order;
}

interface CreateOrderData {
  address: string;
  paymentMethod: string;
  note?: string;
  cartId: string;
  phoneNumber?: string;
  cartItemIds: string[];
}

interface UpdateOrderStatusData {
  status: string;
}

// Lấy danh sách đơn hàng
export const getOrders = async (): Promise<Order[]> => {
  const response: OrdersResponse = await axiosInstance.get("/order");
  return response.data;
};

// Lấy chi tiết đơn hàng
export const getOrderDetails = async (orderId: string): Promise<Order> => {
  const response: OrderResponse = await axiosInstance.get(`/order/${orderId}`);
  return response.data;
};

// Tạo đơn hàng mới
export const createOrder = async (
  data: CreateOrderData
): Promise<{ order: Order; paymentUrl?: string }> => {
  const response: OrderResponse = await axiosInstance.post("/order", data);
  return response.data;
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (
  orderId: string,
  data: UpdateOrderStatusData
): Promise<Order> => {
  const response: UpdateStatusResponse = await axiosInstance.patch(
    `/order/${orderId}/status`,
    data
  );
  return response.data;
};
