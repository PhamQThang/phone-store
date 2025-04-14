// app/api/authApi.ts
import axiosInstance from "../axiosConfig";

interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string; // Thêm address
  phoneNumber: string; // Thêm phoneNumber
  roleId: number;
}

interface LoginDto {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  accessToken: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    phoneNumber: string;
    role: string;
    cartId: string;
  };
}

interface LogoutResponse {
  message: string;
}

export const register = async (data: RegisterDto): Promise<AuthResponse> => {
  return axiosInstance.post("/auth/register", data);
};

export const login = async (data: LoginDto): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/auth/login", data);
  return response;
};

export const logout = async (): Promise<LogoutResponse> => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Không tìm thấy token");
  }
  const response = await axiosInstance.post("/auth/logout", { token });
  return response;
};
