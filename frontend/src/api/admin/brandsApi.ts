// api/admin/brandsApi.ts
import { Brand } from "@/lib/types";
import axiosInstance from "../axiosConfig";

interface BrandResponse {
  message: string;
  data: Brand;
}

interface BrandsResponse {
  message: string;
  data: Brand[];
}

interface DeleteResponse {
  message: string;
}

export const getBrands = async (): Promise<Brand[]> => {
  const response = await axiosInstance.get("/brands");
  return response.data;
};

export const getBrandById = async (id: string): Promise<Brand> => {
  const response = await axiosInstance.get(`/brands/${id}`);
  return response.data;
};

export const createBrand = async (data: { name: string }): Promise<Brand> => {
  const response = await axiosInstance.post("/brands", data);
  return response.data;
};

export const updateBrand = async (
  id: string,
  data: { name?: string }
): Promise<Brand> => {
  const response = await axiosInstance.patch(`/brands/${id}`, data);
  return response.data;
};

export const deleteBrand = async (id: string): Promise<DeleteResponse> => {
  const response = await axiosInstance.delete(`/brands/${id}`);
  return response.data;
};
