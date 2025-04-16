import { PurchaseOrder } from "@/lib/types";
import axiosInstance from "../axiosConfig";

interface DeleteResponse {
  message: string;
}

export interface PurchaseOrderDetailInput {
  productId: string;
  colorId: string;
  imei: string;
  importPrice: number;
}

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  const response = await axiosInstance.get("/purchase-orders");
  return response.data;
};

export const getPurchaseOrderById = async (
  id: string
): Promise<PurchaseOrder> => {
  const response = await axiosInstance.get(`/purchase-orders/${id}`);
  return response.data;
};

export const createPurchaseOrder = async (data: {
  supplierId: string;
  note?: string;
  details: PurchaseOrderDetailInput[];
}): Promise<PurchaseOrder> => {
  const response = await axiosInstance.post("/purchase-orders", data);
  return response.data;
};

export const updatePurchaseOrder = async (
  id: string,
  data: {
    status: string;
    details?: PurchaseOrderDetailInput[];
    detailsToDelete?: string[];
    detailsToUpdate?: (PurchaseOrderDetailInput & { id: string })[];
  }
): Promise<PurchaseOrder> => {
  const response = await axiosInstance.patch(`/purchase-orders/${id}`, data);
  return response.data;
};

export const deletePurchaseOrder = async (
  id: string
): Promise<DeleteResponse> => {
  const response = await axiosInstance.delete(`/purchase-orders/${id}`);
  return response.data;
};
