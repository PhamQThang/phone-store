import axiosInstance from "../axiosConfig";

// Interface cho ProductIdentity trong thống kê tồn kho
interface ProductIdentity {
  id: string;
  imei: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
}

// Interface cho mục trong thống kê tồn kho
interface InventoryStat {
  productId: string;
  productName: string;
  brand: string;
  model: string;
  colorId: string;
  colorName: string;
  stockQuantity: number;
  productIdentities: ProductIdentity[];
}

// Interface cho phản hồi từ API thống kê tồn kho (chỉ lấy data)
export type InventoryStats = InventoryStat[];

// Interface cho chi tiết trong thống kê doanh thu
interface RevenueDetail {
  orderId: string;
  productId: string;
  productName: string;
  brand: string;
  model: string;
  colorId: string;
  colorName: string;
  imei?: string;
  importPrice: number;
  sellingPrice: number;
  profit: number;
}

// Interface cho phần summary trong thống kê doanh thu
interface RevenueSummary {
  totalRevenue: number;
  totalImportPrice: number;
  totalSellingPrice: number;
  totalProfit: number;
}

// Interface cho phản hồi từ API thống kê doanh thu (chỉ lấy data)
export type RevenueStats = {
  summary: RevenueSummary;
  details: RevenueDetail[];
};

// Interface cho mục trong thống kê doanh thu theo tháng
interface MonthlyRevenueStat {
  month: number;
  revenue: number;
  importPrice: number;
  sellingPrice: number;
  profit: number;
  orderCount: number;
}

// Interface cho phản hồi từ API thống kê doanh thu theo tháng (chỉ lấy data)
export type MonthlyRevenueStats = MonthlyRevenueStat[];

// Interface cho phản hồi từ API thống kê người dùng (chỉ lấy data)
export type UserStats = {
  totalUsers: number;
};

// Lấy thống kê số lượng sản phẩm tồn kho
export const getInventoryStats = async (): Promise<InventoryStats> => {
  const response = await axiosInstance.get("/statistics/inventory");
  return response.data;
};

// Lấy thống kê doanh thu, giá nhập, giá bán và lợi nhuận
export const getRevenueStats = async (): Promise<RevenueStats> => {
  const response = await axiosInstance.get("/statistics/revenue");
  return response.data;
};

// Lấy thống kê doanh thu, giá nhập, giá bán theo tháng trong năm
export const getMonthlyRevenueStats = async (
  year: number
): Promise<MonthlyRevenueStats> => {
  const response = await axiosInstance.get(
    `/statistics/revenue/monthly/${year}`
  );
  return response.data;
};

// Lấy thống kê số lượng người dùng
export const getUserStats = async (): Promise<UserStats> => {
  const response = await axiosInstance.get("/statistics/users");
  return response.data;
};
