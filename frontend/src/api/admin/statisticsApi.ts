import axiosInstance from "../axiosConfig";

// Interface cho chi tiết đơn hàng trong thống kê
interface OrderDetailStat {
  orderId: string;
  productId: string;
  productName: string;
  importPrice: number;
  sellingPrice: number;
  profit: number;
}

// Interface cho thống kê hàng ngày
interface DailyStat {
  date: string;
  totalPurchaseAmount: number;
  totalSellingPrice: number;
  totalProfit: number;
  totalOrders: number;
  totalProcessing: number;
  totalDelivered: number;
  totalCancelled: number;
  totalProductsSold: number;
  orders: OrderDetailStat[];
}

// Interface cho phản hồi từ API thống kê đơn hàng và nhập hàng
export type OrderStatsResponse = {
  message: string;
  data: DailyStat[];
};

// Interface cho phần summary trong thống kê lợi nhuận hàng ngày
interface DailyProfitSummary {
  totalProfit: number;
}

// Interface cho phản hồi từ API thống kê lợi nhuận hàng ngày
export type DailyProfitStatsResponse = {
  message: string;
  data: {
    summary: DailyProfitSummary;
    details: OrderDetailStat[];
  };
};

// Lấy thống kê đơn hàng và nhập hàng trong khoảng thời gian
export const getOrderStats = async (
  startDate: string,
  endDate: string
): Promise<OrderStatsResponse> => {
  const response = await axiosInstance.get("/statistics/order-stats", {
    params: { startDate, endDate },
  });
  return response.data;
};

// Lấy thống kê lợi nhuận trong ngày
export const getDailyProfitStats = async (
  date?: string
): Promise<DailyProfitStatsResponse> => {
  const response = await axiosInstance.get("/statistics/profit-daily", {
    params: { date },
  });
  return response.data;
};
