// frontend/api/admin/brandsApi.ts
import { Brand } from "@/lib/types";
import axiosInstance from "../axiosConfig";
import { cache } from "react";

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

export const getBrands = cache(async (token?: string): Promise<Brand[]> => {
  const response: BrandsResponse = await axiosInstance.get("/brands", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
});

export const getBrandById = async (
  id: string,
  token?: string
): Promise<Brand> => {
  const response: BrandResponse = await axiosInstance.get(`/brands/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
};

export const createBrand = async (
  data: { name: string },
  token?: string
): Promise<Brand> => {
  const response: BrandResponse = await axiosInstance.post("/brands", data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
};

export const updateBrand = async (
  id: string,
  data: { name?: string },
  token?: string
): Promise<Brand> => {
  const response: BrandResponse = await axiosInstance.patch(
    `/brands/${id}`,
    data,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
  return response.data;
};

export const deleteBrand = async (
  id: string,
  token?: string
): Promise<DeleteResponse> => {
  const response: DeleteResponse = await axiosInstance.delete(`/brands/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response;
};
