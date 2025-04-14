import { Color } from "@/lib/types";
import axiosInstance from "../axiosConfig";

interface ColorsResponse {
  message: string;
  data: Color[];
}

// Lấy danh sách màu sắc
export const getColors = async (token: string): Promise<Color[]> => {
  const response: ColorsResponse = await axiosInstance.get("/colors", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
