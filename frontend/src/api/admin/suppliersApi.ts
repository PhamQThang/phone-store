// frontend/api/admin/suppliersApi.ts
import axiosInstance from "../axiosConfig";

export interface Supplier {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export const getSuppliers = async (): Promise<Supplier[]> => {
  const response: SuppliersResponse = await axiosInstance.get("/suppliers");
  return response.data;
};

export const getSupplierById = async (id: string): Promise<Supplier> => {
  const response: SupplierResponse = await axiosInstance.get(
    `/suppliers/${id}`
  );
  return response.data;
};

export const createSupplier = async (data: {
  name: string;
  address: string;
  phone: string;
  email?: string;
}): Promise<Supplier> => {
  const response: SupplierResponse = await axiosInstance.post(
    "/suppliers",
    data
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
  }
): Promise<Supplier> => {
  const response: SupplierResponse = await axiosInstance.patch(
    `/suppliers/${id}`,
    data
  );
  return response.data;
};

export const deleteSupplier = async (id: string): Promise<void> => {
  const response: DeleteResponse = await axiosInstance.delete(
    `/suppliers/${id}`
  );
  return response;
};
