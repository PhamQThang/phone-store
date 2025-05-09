import axiosInstance from "../axiosConfig";

// Interface cho chi tiết đơn hàng trong thống kê
interface OrderDetailStat {
  orderId: string;
  productId: string;
  productName: string;
  importPrice: number;
  sellingPrice: number;
  profit: number;
  imei: string;
}

// Interface cho thống kê hàng ngày
export interface DailyStat {
  date: string;
  totalPurchaseAmount: number;
  totalSellingPrice: number;
  totalProfit: number;
  totalOrders: number;
  totalProcessing: number;
  totalDelivered: number;
  totalCancelled: number;
  totalProductsSold: number;
  totalReturnAmount: number;
  totalReturnTickets: number;
  totalProcessedReturnTickets: number;
  totalPendingReturnTickets: number;
  orders: OrderDetailStat[];
}

// Interface cho phản hồi từ API thống kê đơn hàng và nhập hàng
export type OrderStatsResponse = {
  message: string;
  data: DailyStat[];
};

// Interface cho phần summary trong thống kê lợi nhuận hàng ngày
interface DailyProfitSummary {
  totalPurchaseAmount: number;
  totalSellingPrice: number;
  totalProfit: number;
  totalRevenue: number;
  totalReturnAmount: number;
  netRevenue: number;
}

// Interface cho phản hồi từ API thống kê lợi nhuận hàng ngày
export type DailyProfitStatsResponse = {
  message: string;
  data: {
    summary: DailyProfitSummary;
    details: OrderDetailStat[];
    returnTickets: {
      id: string;
      productIdentityId: string;
      imei: string;
      originalPrice: number | null;
      discountedPrice: number | null;
      status: string;
      startDate: Date;
      endDate: Date;
      note: string | null;
      createdAt: Date;
    }[];
  };
};

// Interface cho thống kê tổng quan của cửa hàng
export interface StoreSummaryStats {
  totalProducts: number; // Thêm tổng số sản phẩm (giả định từ totalProductsSold + tồn kho)
  totalProductsSold: number;
  totalPurchaseAmount: number;
  totalSellingPrice: number;
  totalProfit: number;
  totalOrders: number;
}

// Lấy thống kê đơn hàng và nhập hàng trong khoảng thời gian
export const getOrderStats = async (
  startDate: string,
  endDate: string
): Promise<OrderStatsResponse> => {
  const response = await axiosInstance.get("/statistics/order-stats", {
    params: { startDate, endDate },
  });
  return response;
};

// Lấy thống kê lợi nhuận trong ngày
export const getDailyProfitStats = async (
  date?: string
): Promise<DailyProfitStatsResponse> => {
  const response = await axiosInstance.get("/statistics/profit-daily", {
    params: { date },
  });
  return response;
};

// Lấy thống kê tổng quan của cửa hàng
export const getStoreSummaryStats = async (): Promise<StoreSummaryStats> => {
  const response = await axiosInstance.get("/statistics/store-summary");
  return response;
};
