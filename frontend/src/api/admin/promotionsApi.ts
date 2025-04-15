import axiosInstance from "../axiosConfig";

interface Promotion {
  id: string;
  code: string;
  description?: string;
  discount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products: Array<{
    productId: string;
    promotionId: string;
    createdAt: string;
    updatedAt: string;
    product: {
      id: string;
      name: string;
      price: number;
    };
  }>;
}

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

// Lấy danh sách khuyến mãi
export const getPromotions = async (token?: string): Promise<Promotion[]> => {
  const response: PromotionsResponse = await axiosInstance.get("/promotions", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
};

// Lấy chi tiết một khuyến mãi
export const getPromotionById = async (
  id: string,
  token?: string
): Promise<Promotion> => {
  const response: PromotionResponse = await axiosInstance.get(
    `/promotions/${id}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
  return response.data;
};

// Tạo khuyến mãi mới
export const createPromotion = async (
  data: {
    code: string;
    description?: string;
    discount: number;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  },
  token?: string
): Promise<Promotion> => {
  const response: PromotionResponse = await axiosInstance.post(
    "/promotions",
    data,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
  return response.data;
};

// Cập nhật khuyến mãi
export const updatePromotion = async (
  id: string,
  data: {
    code?: string;
    description?: string;
    discount?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  },
  token?: string
): Promise<Promotion> => {
  const response: PromotionResponse = await axiosInstance.patch(
    `/promotions/${id}`,
    data,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
  return response.data;
};

// Xóa khuyến mãi
export const deletePromotion = async (
  id: string,
  token?: string
): Promise<DeleteResponse> => {
  const response: DeleteResponse = await axiosInstance.delete(
    `/promotions/${id}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
  return response;
};

// Thêm sản phẩm vào khuyến mãi
export const addProductToPromotion = async (
  promotionId: string,
  productId: string,
  token?: string
): Promise<AddProductToPromotionResponse> => {
  const response: AddProductToPromotionResponse = await axiosInstance.post(
    `/promotions/${promotionId}/products`,
    { productId },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
  return response;
};

// Xóa sản phẩm khỏi khuyến mãi
export const removeProductFromPromotion = async (
  promotionId: string,
  productId: string,
  token?: string
): Promise<DeleteResponse> => {
  const response: DeleteResponse = await axiosInstance.delete(
    `/promotions/${promotionId}/products/${productId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
  return response;
};
