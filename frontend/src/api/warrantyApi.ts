// warrantyApi.ts
import axiosInstance from "./axiosConfig";

interface ProductIdentity {
  product: { name: string; imageUrl?: string };
  color: { name: string };
  orderDetail?: { order: { id: string; createdAt: string } };
}

interface WarrantyRequest {
  id: string;
  userId: number;
  productIdentityId: string;
  reason: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  status: string;
  requestDate: string;
  createdAt: string;
  updatedAt: string;
  user: { id: number; fullName: string };
  productIdentity: { product: { id: string; name: string } };
}

interface Warranty {
  id: string;
  userId: number;
  productIdentityId: string;
  startDate: string;
  endDate: string;
  status: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  warrantyRequestId?: string;
  user: { id: number; fullName: string };
  productIdentity: ProductIdentity;
  warrantyRequest?: WarrantyRequest;
}

interface WarrantyResponse {
  message: string;
  data: Warranty;
}

interface WarrantiesResponse {
  message: string;
  data: Warranty[];
}

interface WarrantyRequestResponse {
  message: string;
  data: WarrantyRequest;
}

interface WarrantyRequestsResponse {
  message: string;
  data: WarrantyRequest[];
}

interface CreateWarrantyRequestData {
  productIdentityId: string;
  reason: string;
  fullName: string;
  phoneNumber: string;
  email: string;
}

interface UpdateWarrantyRequestStatusData {
  status: string;
}

// Lấy danh sách phiếu bảo hành
export const getWarranties = async (): Promise<Warranty[]> => {
  const response: WarrantiesResponse = await axiosInstance.get("/warranty");
  return response.data;
};

// Lấy chi tiết phiếu bảo hành
export const getWarrantyDetails = async (
  warrantyId: string
): Promise<Warranty> => {
  const response: WarrantyResponse = await axiosInstance.get(
    `/warranty/${warrantyId}`
  );
  return response.data;
};

// Lấy danh sách yêu cầu bảo hành
export const getWarrantyRequests = async (): Promise<WarrantyRequest[]> => {
  const response: WarrantyRequestsResponse = await axiosInstance.get(
    "/warranty/requests"
  );
  return response.data;
};

// Lấy chi tiết yêu cầu bảo hành
export const getWarrantyRequestDetails = async (
  requestId: string
): Promise<WarrantyRequest> => {
  const response: WarrantyRequestResponse = await axiosInstance.get(
    `/warranty/request/${requestId}`
  );
  return response.data;
};

// Tạo yêu cầu bảo hành mới
export const createWarrantyRequest = async (
  data: CreateWarrantyRequestData
): Promise<WarrantyRequest> => {
  const response: WarrantyRequestResponse = await axiosInstance.post(
    "/warranty/request",
    data
  );
  return response.data;
};

// Cập nhật trạng thái yêu cầu bảo hành
export const updateWarrantyRequestStatus = async (
  requestId: string,
  data: UpdateWarrantyRequestStatusData
): Promise<WarrantyRequest> => {
  const response: WarrantyRequestResponse = await axiosInstance.patch(
    `/warranty/request/${requestId}/status`,
    data
  );
  return response.data;
};

// Cập nhật trạng thái phiếu bảo hành
export const updateWarrantyStatus = async (
  warrantyId: string,
  data: UpdateWarrantyRequestStatusData
): Promise<Warranty> => {
  const response: WarrantyResponse = await axiosInstance.patch(
    `/warranty/${warrantyId}/status`,
    data
  );
  return response.data;
};
