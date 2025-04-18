import { Color } from "@/lib/types";
import axiosInstance from "../axiosConfig";

interface ColorResponse {
  message: string;
  data: Color;
}

interface ColorsResponse {
  message: string;
  data: Color[];
}

interface DeleteResponse {
  message: string;
}

export const getColors = async (): Promise<Color[]> => {
  const response = await axiosInstance.get("/colors");
  return response.data;
};

export const getColorById = async (id: string): Promise<Color> => {
  const response = await axiosInstance.get(`/colors/${id}`);
  return response.data;
};

export const createColor = async (data: { name: string }): Promise<Color> => {
  const response = await axiosInstance.post("/colors", data);
  return response.data;
};

export const updateColor = async (
  id: string,
  data: { name?: string }
): Promise<Color> => {
  const response = await axiosInstance.patch(`/colors/${id}`, data);
  return response.data;
};

export const deleteColor = async (id: string): Promise<DeleteResponse> => {
  const response = await axiosInstance.delete(`/colors/${id}`);
  return response.data;
};
