// api/admin/modelsApi.ts
import { Model } from "@/lib/types";
import axiosInstance from "../axiosConfig";

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

export const getModels = async (token?: string): Promise<Model[]> => {
  const response: ModelsResponse = await axiosInstance.get("/models", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
};

export const getModelById = async (
  id: string,
  token?: string
): Promise<Model> => {
  const response: ModelResponse = await axiosInstance.get(`/models/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
};

export const createModel = async (
  data: { name: string; brandId: string },
  token?: string
): Promise<Model> => {
  const response: ModelResponse = await axiosInstance.post("/models", data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
};

export const updateModel = async (
  id: string,
  data: { name?: string; brandId?: string },
  token?: string
): Promise<Model> => {
  const response: ModelResponse = await axiosInstance.patch(
    `/models/${id}`,
    data,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
  return response.data;
};

export const deleteModel = async (
  id: string,
  token?: string
): Promise<DeleteResponse> => {
  const response: DeleteResponse = await axiosInstance.delete(`/models/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response;
};
