// api/axiosConfig.ts
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

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError<ApiError>) => {
    const errorResponse: ApiError = {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message || error.message || "Đã có lỗi xảy ra",
      error: error.response?.data?.error || error.name,
    };

    return Promise.reject(errorResponse);
  }
);

export default axiosInstance;
