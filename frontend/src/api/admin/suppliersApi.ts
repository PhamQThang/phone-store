import { Supplier } from "@/lib/types";
import axiosInstance from "../axiosConfig";

interface DeleteResponse {
  message: string;
}

export const getSuppliers = async (): Promise<Supplier[]> => {
  const response = await axiosInstance.get("/suppliers");
  return response.data;
};

export const getSupplierById = async (id: string): Promise<Supplier> => {
  const response = await axiosInstance.get(`/suppliers/${id}`);
  return response.data;
};

export const createSupplier = async (data: FormData): Promise<Supplier> => {
  const response = await axiosInstance.post("/suppliers", data);
  return response.data;
};

export const updateSupplier = async (
  id: string,
  data: FormData
): Promise<Supplier> => {
  const response = await axiosInstance.patch(`/suppliers/${id}`, data);
  return response.data;
};

export const deleteSupplier = async (id: string): Promise<DeleteResponse> => {
  const response = await axiosInstance.delete(`/suppliers/${id}`);
  return response.data;
};
