// frontend/api/admin/purchaseOrdersApi.ts
import axiosInstance from "../axiosConfig";
import { Product } from "./productsApi";

export interface PurchaseOrderDetail {
  id: string;
  importId: string;
  productId: string;
  product: Product;
  colorId: string;
  color: {
    id: string;
    name: string;
  };
  productIdentityId: string | null;
  productIdentity: {
    id: string;
    imei: string;
    isSold: boolean;
  } | null;
  imei?: string;
  importPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplier: {
    id: string;
    name: string;
    address: string;
    phone: string;
    email?: string;
  };
  importDate: string;
  totalCost: number;
  status: string;
  note?: string;
  createdById?: number;
  createdBy?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  purchaseOrderDetails: PurchaseOrderDetail[];
}

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
export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  const response: PurchaseOrdersResponse = await axiosInstance.get(
    "/purchase-orders"
  );
  return response.data;
};

// Lấy chi tiết một đơn nhập hàng
export const getPurchaseOrderById = async (
  id: string
): Promise<PurchaseOrder> => {
  const response: PurchaseOrderResponse = await axiosInstance.get(
    `/purchase-orders/${id}`
  );
  return response.data;
};

// Tạo đơn nhập hàng mới
export const createPurchaseOrder = async (data: {
  supplierId: string;
  note?: string;
  details: PurchaseOrderDetailInput[];
}): Promise<PurchaseOrder> => {
  const response: PurchaseOrderResponse = await axiosInstance.post(
    "/purchase-orders",
    data
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
  }
): Promise<PurchaseOrder> => {
  const response: PurchaseOrderResponse = await axiosInstance.patch(
    `/purchase-orders/${id}`,
    data
  );
  return response.data;
};

// Xóa đơn nhập hàng
export const deletePurchaseOrder = async (id: string): Promise<void> => {
  const response: DeleteResponse = await axiosInstance.delete(
    `/purchase-orders/${id}`
  );
  return response;
};
