import { PurchaseOrder } from "@/lib/types";
import axiosInstance from "../axiosConfig";

interface PurchaseOrderResponse {
  message: string;
  data: PurchaseOrder;
}

interface PurchaseOrdersResponse {
  message: string;
  data: PurchaseOrder[];
}

interface DeleteResponse {
  message: string;
}

export interface PurchaseOrderDetailInput {
  productId: string;
  colorId: string;
  imei: string;
  importPrice: number;
}

// Lấy danh sách đơn nhập hàng
export const getPurchaseOrders = async (
  token: string
): Promise<PurchaseOrder[]> => {
  const response: PurchaseOrdersResponse = await axiosInstance.get(
    "/purchase-orders",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// Lấy chi tiết một đơn nhập hàng
export const getPurchaseOrderById = async (
  id: string,
  token: string
): Promise<PurchaseOrder> => {
  const response: PurchaseOrderResponse = await axiosInstance.get(
    `/purchase-orders/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// Tạo đơn nhập hàng mới
export const createPurchaseOrder = async (
  data: {
    supplierId: string;
    note?: string;
    details: PurchaseOrderDetailInput[];
  },
  token: string
): Promise<PurchaseOrder> => {
  const response: PurchaseOrderResponse = await axiosInstance.post(
    "/purchase-orders",
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// Cập nhật đơn nhập hàng
export const updatePurchaseOrder = async (
  id: string,
  data: {
    status: string;
    details?: PurchaseOrderDetailInput[];
    detailsToDelete?: string[];
    detailsToUpdate?: (PurchaseOrderDetailInput & { id: string })[];
  },
  token: string
): Promise<PurchaseOrder> => {
  const response: PurchaseOrderResponse = await axiosInstance.patch(
    `/purchase-orders/${id}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// Xóa đơn nhập hàng
export const deletePurchaseOrder = async (
  id: string,
  token: string
): Promise<DeleteResponse> => {
  const response: DeleteResponse = await axiosInstance.delete(
    `/purchase-orders/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response;
};
