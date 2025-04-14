// frontend/api/admin/colorsApi.ts
import { Color } from "@/lib/types";
import axiosInstance from "../axiosConfig";
interface ColorsResponse {
  message: string;
  data: Color[];
}

export const getColors = async (): Promise<Color[]> => {
  const response: ColorsResponse = await axiosInstance.get("/colors");
  return response.data;
};
