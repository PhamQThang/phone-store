// lib/axiosConfig.ts
import axios, { AxiosInstance, AxiosError } from "axios";

interface ApiError {
  statusCode?: number;
  message: string;
  error?: string;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ApiError>) => {
    const errorResponse: ApiError = {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message || error.message || "Đã có lỗi xảy ra",
      error: error.response?.data?.error || error.name,
    };

    if (error.response?.status === 401) {
      // Xử lý khi token hết hạn
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(errorResponse);
  }
);

export default axiosInstance;
