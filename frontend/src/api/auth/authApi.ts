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

  // Kiểm tra xem response có phải là lỗi hay không
  if (response.statusCode && response.statusCode >= 400) {
    throw new Error(response.message || "Đăng nhập thất bại");
  }

  if (!response.accessToken) {
    throw new Error("Không nhận được accessToken từ server");
  }

  localStorage.setItem("accessToken", response.accessToken);
  return response;
};

export const logout = async (): Promise<LogoutResponse> => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Không tìm thấy token");
  }
  const response = await axiosInstance.post("/auth/logout", { token });
  localStorage.removeItem("accessToken");
  return response;
};
