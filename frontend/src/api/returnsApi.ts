import axiosInstance from "./axiosConfig";

interface ProductIdentity {
  product: { id: string; name: string; imageUrl?: string };
  color: { id: string; name: string };
  orderDetail?: { order: { id: string; createdAt: string } }[];
}

interface ProductReturn {
  id: string;
  userId: number;
  productIdentityId: string;
  reason: string;
  returnDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  user: { id: number; fullName: string };
  productIdentity: ProductIdentity;
}

interface ReturnTicket {
  id: string;
  userId: number;
  productIdentityId: string;
  startDate: string;
  endDate: string;
  status: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  productReturnId: string;
  originalPrice?: number;
  discountedPrice?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  user: { id: number; fullName: string };
  productIdentity: ProductIdentity;
  productReturn: ProductReturn;
}

interface ReturnResponse {
  message: string;
  data: ProductReturn;
}

interface ReturnsResponse {
  message: string;
  data: ProductReturn[];
}

interface ReturnTicketResponse {
  message: string;
  data: ReturnTicket;
}

interface ReturnTicketsResponse {
  message: string;
  data: ReturnTicket[];
}

interface CreateReturnRequestData {
  productIdentityId: string;
  reason: string;
  fullName: string;
  phoneNumber: string;
  address: string;
}

interface UpdateReturnStatusData {
  status: string;
}

interface UpdateReturnTicketStatusData {
  status: string;
}

// Lấy danh sách yêu cầu đổi trả
export const getReturns = async (): Promise<ProductReturn[]> => {
  const response: ReturnsResponse = await axiosInstance.get(
    "/returns/requests"
  );
  return response.data;
};

// Lấy chi tiết yêu cầu đổi trả
export const getReturnDetails = async (
  returnId: string
): Promise<ProductReturn> => {
  const response: ReturnResponse = await axiosInstance.get(
    `/returns/request/${returnId}`
  );
  return response.data;
};

// Lấy danh sách phiếu đổi trả
export const getReturnTickets = async (): Promise<ReturnTicket[]> => {
  const response: ReturnTicketsResponse = await axiosInstance.get(
    "/returns/tickets"
  );
  return response.data;
};

// Lấy chi tiết phiếu đổi trả
export const getReturnTicketDetails = async (
  returnTicketId: string
): Promise<ReturnTicket> => {
  const response: ReturnTicketResponse = await axiosInstance.get(
    `/returns/ticket/${returnTicketId}`
  );
  return response.data;
};

// Tạo yêu cầu đổi trả mới
export const createReturnRequest = async (
  data: CreateReturnRequestData
): Promise<ProductReturn> => {
  const response: ReturnResponse = await axiosInstance.post(
    "/returns/request",
    data
  );
  return response.data;
};

// Cập nhật trạng thái yêu cầu đổi trả
export const updateReturnStatus = async (
  returnId: string,
  data: UpdateReturnStatusData
): Promise<ProductReturn> => {
  const response: ReturnResponse = await axiosInstance.patch(
    `/returns/${returnId}/status`,
    data
  );
  return response.data;
};

// Cập nhật trạng thái phiếu đổi trả
export const updateReturnTicketStatus = async (
  returnTicketId: string,
  data: UpdateReturnTicketStatusData
): Promise<ReturnTicket> => {
  const response: ReturnTicketResponse = await axiosInstance.patch(
    `/returns/ticket/${returnTicketId}/status`,
    data
  );
  return response.data;
};
