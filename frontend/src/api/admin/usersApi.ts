import { User } from "@/lib/types";
import axiosInstance from "../axiosConfig";

// Định nghĩa interface cho response của các endpoint xóa mềm và khôi phục
interface MessageResponse {
  message: string;
}

// Lấy thông tin người dùng hiện tại
export const getProfile = async (): Promise<User> => {
  const response = await axiosInstance.get("/users/profile");
  return response.data;
};

// Cập nhật thông tin người dùng hiện tại
export const updateProfile = async (data: {
  fullName?: string;
  address?: string;
  phoneNumber?: string;
}): Promise<User> => {
  const response = await axiosInstance.patch("/users/profile", data);
  return response.data;
};

// Lấy danh sách tất cả người dùng (chỉ admin)
export const getUsers = async (): Promise<User[]> => {
  const response = await axiosInstance.get("/users");
  return response.data;
};

// Lấy thông tin chi tiết một người dùng (chỉ admin)
export const getUserById = async (id: number): Promise<User> => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};

// Cập nhật thông tin một người dùng (chỉ admin)
export const updateUser = async (
  id: number,
  data: {
    fullName?: string;
    address?: string;
    phoneNumber?: string;
    password?: string;
  }
): Promise<User> => {
  const response = await axiosInstance.patch(`/users/${id}`, data);
  return response.data;
};

// Xóa mềm người dùng (chỉ admin)
export const softDeleteUser = async (id: number): Promise<MessageResponse> => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};

// Lấy danh sách người dùng đã bị xóa mềm (chỉ admin)
export const getDeletedUsers = async (): Promise<User[]> => {
  const response = await axiosInstance.get("/users/deleted");
  return response.data;
};

// Khôi phục người dùng đã bị xóa mềm (chỉ admin)
export const restoreUser = async (id: number): Promise<MessageResponse> => {
  const response = await axiosInstance.post(`/users/${id}/restore`);
  return response.data;
};
