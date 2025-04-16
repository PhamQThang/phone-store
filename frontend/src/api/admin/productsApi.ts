import { Product } from "@/lib/types";
import axiosInstance from "../axiosConfig";

interface DeleteResponse {
  message: string;
}

export const getProducts = async (
  brandSlug?: string,
  modelSlug?: string
): Promise<Product[]> => {
  const response = await axiosInstance.get("/products", {
    params: { brandSlug, modelSlug },
  });
  return response.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: {
  name: string;
  price: number;
  storage: number;
  ram: number;
  screenSize: number;
  battery: number;
  chip: string;
  operatingSystem: string;
  modelId: string;
  files?: FileList;
}): Promise<Product> => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("price", data.price.toString());
  formData.append("storage", data.storage.toString());
  formData.append("ram", data.ram.toString());
  formData.append("screenSize", data.screenSize.toString());
  formData.append("battery", data.battery.toString());
  formData.append("chip", data.chip);
  formData.append("operatingSystem", data.operatingSystem);
  formData.append("modelId", data.modelId);
  if (data.files) {
    Array.from(data.files).forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await axiosInstance.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateProduct = async (
  id: string,
  data: {
    name?: string;
    price?: number;
    storage?: number;
    ram?: number;
    screenSize?: number;
    battery?: number;
    chip?: string;
    operatingSystem?: string;
    modelId?: string;
    files?: FileList;
    filesToDelete?: string[];
  }
): Promise<Product> => {
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.price) formData.append("price", data.price.toString());
  if (data.storage) formData.append("storage", data.storage.toString());
  if (data.ram) formData.append("ram", data.ram.toString());
  if (data.screenSize)
    formData.append("screenSize", data.screenSize.toString());
  if (data.battery) formData.append("battery", data.battery.toString());
  if (data.chip) formData.append("chip", data.chip);
  if (data.operatingSystem)
    formData.append("operatingSystem", data.operatingSystem);
  if (data.modelId) formData.append("modelId", data.modelId);
  if (data.files) {
    Array.from(data.files).forEach((file) => {
      formData.append("files", file);
    });
  }
  if (data.filesToDelete) {
    data.filesToDelete.forEach((fileId) => {
      formData.append("filesToDelete[]", fileId);
    });
  }

  const response = await axiosInstance.patch(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteProduct = async (id: string): Promise<DeleteResponse> => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};
