// frontend/api/admin/modelsApi.ts
import axiosInstance from "../axiosConfig";
import { Brand } from "./brandsApi"; // Import Brand từ brandsApi

export interface Model {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  createdAt: string;
  updatedAt: string;
  brand: Brand;
}

interface ModelResponse {
  message: string;
  data: Model;
}

interface ModelsResponse {
  message: string;
  data: Model[];
}

interface DeleteResponse {
  message: string;
}

export const getModels = async (): Promise<Model[]> => {
  const response: ModelsResponse = await axiosInstance.get("/models");
  return response.data;
};

export const getModelById = async (id: string): Promise<Model> => {
  const response: ModelResponse = await axiosInstance.get(`/models/${id}`);
  return response.data;
};

export const createModel = async (data: {
  name: string;
  brandId: string;
}): Promise<Model> => {
  const response: ModelResponse = await axiosInstance.post("/models", data);
  return response.data;
};

export const updateModel = async (
  id: string,
  data: { name?: string; brandId?: string }
): Promise<Model> => {
  const response: ModelResponse = await axiosInstance.patch(
    `/models/${id}`,
    data
  );
  return response.data;
};

export const deleteModel = async (id: string): Promise<void> => {
  const response: DeleteResponse = await axiosInstance.delete(`/models/${id}`);
  return response;
};
