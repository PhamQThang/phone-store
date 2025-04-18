import { Promotion } from "@/lib/types";
import axiosInstance from "../axiosConfig";

interface PromotionResponse {
  message: string;
  data: Promotion;
}

interface PromotionsResponse {
  message: string;
  data: Promotion[];
}

interface DeleteResponse {
  message: string;
}

interface AddProductToPromotionResponse {
  message: string;
  data: {
    productId: string;
    promotionId: string;
    createdAt: string;
    updatedAt: string;
    product: {
      id: string;
      name: string;
      price: number;
    };
  };
}

export const getPromotions = async (): Promise<Promotion[]> => {
  const response = await axiosInstance.get("/promotions");
  return response.data;
};

export const getPromotionById = async (id: string): Promise<Promotion> => {
  const response = await axiosInstance.get(`/promotions/${id}`);
  return response.data;
};

export const createPromotion = async (data: {
  code: string;
  description?: string;
  discount: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}): Promise<Promotion> => {
  const response = await axiosInstance.post("/promotions", data);
  return response.data;
};

export const updatePromotion = async (
  id: string,
  data: {
    code?: string;
    description?: string;
    discount?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }
): Promise<Promotion> => {
  const response = await axiosInstance.patch(`/promotions/${id}`, data);
  return response.data;
};

export const deletePromotion = async (id: string): Promise<DeleteResponse> => {
  const response = await axiosInstance.delete(`/promotions/${id}`);
  return response.data;
};

export const addProductToPromotion = async (
  promotionId: string,
  productId: string
): Promise<AddProductToPromotionResponse> => {
  const response = await axiosInstance.post(
    `/promotions/${promotionId}/products`,
    { productId }
  );
  return response.data;
};

export const removeProductFromPromotion = async (
  promotionId: string,
  productId: string
): Promise<DeleteResponse> => {
  const response = await axiosInstance.delete(
    `/promotions/${promotionId}/products/${productId}`
  );
  return response.data;
};
