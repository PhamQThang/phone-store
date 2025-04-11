// frontend/api/admin/colorsApi.ts
import axiosInstance from "../axiosConfig";

export interface Color {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ColorsResponse {
  message: string;
  data: Color[];
}

export const getColors = async (): Promise<Color[]> => {
  const response: ColorsResponse = await axiosInstance.get("/colors");
  return response.data;
};
