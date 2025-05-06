import axiosInstance from "../axiosConfig";

// Định nghĩa interface cho ProductIdentity
export interface ProductIdentity {
  id: string;
  imei: string;
  productId: string;
  productName: string;
  brand: string;
  model: string;
  colorId: string;
  colorName: string;
  isSold: boolean;
  importPrice: number;
  warrantyStatus: string | null;
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  returnStatus: string | null;
  returnDate: string | null;
  returnReason: string | null;
  returnTicketStatus: string | null;
  orderId: string | null;
  orderReturnStatus: string | null;
}

interface ProductIdentitiesResponse {
  message: string;
  data: ProductIdentity[];
}

interface ProductIdentityResponse {
  message: string;
  data: ProductIdentity;
}

// Lấy danh sách tất cả ProductIdentity với bộ lọc isSold
export const getProductIdentities = async (
  sold?: string
): Promise<ProductIdentity[]> => {
  const response = await axiosInstance.get<ProductIdentitiesResponse>(
    "/product-identities",
    {
      params: { sold },
    }
  );
  return response.data;
};

// Lấy chi tiết một ProductIdentity theo ID
export const getProductIdentityById = async (
  id: string
): Promise<ProductIdentity> => {
  const response = await axiosInstance.get<ProductIdentityResponse>(
    `/product-identities/${id}`
  );
  return response.data;
};
