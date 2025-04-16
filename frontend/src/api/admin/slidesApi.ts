import { Slide } from "@/lib/types";
import axiosInstance from "../axiosConfig";

interface DeleteResponse {
  message: string;
}

export const getSlides = async (): Promise<Slide[]> => {
  const response = await axiosInstance.get("/slides");
  return response.data;
};

export const getSlideById = async (id: string): Promise<Slide> => {
  const response = await axiosInstance.get(`/slides/${id}`);
  return response.data;
};

export const createSlide = async (data: FormData): Promise<Slide> => {
  const response = await axiosInstance.post("/slides", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateSlide = async (
  id: string,
  data: FormData
): Promise<Slide> => {
  const response = await axiosInstance.patch(`/slides/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteSlide = async (id: string): Promise<DeleteResponse> => {
  const response = await axiosInstance.delete(`/slides/${id}`);
  return response.data;
};
