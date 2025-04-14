// api/admin/suppliersApi.ts
import { cache } from "react";
import { Supplier } from "@/lib/types";
import axiosInstance from "../axiosConfig";

interface SupplierResponse {
  message: string;
  data: Supplier;
}

interface SuppliersResponse {
  message: string;
  data: Supplier[];
}

interface DeleteResponse {
  message: string;
}

export const getSuppliers = cache(
  async (token?: string): Promise<Supplier[]> => {
    const response: SuppliersResponse = await axiosInstance.get("/suppliers", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  }
);

export const getSupplierById = async (
  id: string,
  token?: string
): Promise<Supplier> => {
  const response: SupplierResponse = await axiosInstance.get(
    `/suppliers/${id}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
  return response.data;
};

export const createSupplier = async (
  data: { name: string; address: string; phone: string; email?: string },
  token?: string
): Promise<Supplier> => {
  const response: SupplierResponse = await axiosInstance.post(
    "/suppliers",
    data,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
  return response.data;
};

export const updateSupplier = async (
  id: string,
  data: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string | null;
  },
  token?: string
): Promise<Supplier> => {
  const response: SupplierResponse = await axiosInstance.patch(
    `/suppliers/${id}`,
    data,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
  return response.data;
};

export const deleteSupplier = async (
  id: string,
  token?: string
): Promise<DeleteResponse> => {
  const response: DeleteResponse = await axiosInstance.delete(
    `/suppliers/${id}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
  return response;
};
