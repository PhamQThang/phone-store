// frontend/api/admin/productsApi.ts
import axiosInstance from "../axiosConfig";
import { Model } from "./modelsApi";

// Interface cho File
export interface File {
  id: string;
  url: string;
  public_id: string;
  file_type: string;
  size: number;
  uploaded_at: string;
  createdAt: string;
  updatedAt: string;
}

// Interface cho ProductFile (quan hệ giữa Product và File)
export interface ProductFile {
  productId: string;
  fileId: string;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
  file: File;
}

// Interface cho Product
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  storage: number;
  ram: number;
  screenSize: number;
  battery: number;
  chip: string;
  operatingSystem: string;
  modelId: string;
  createdAt: string;
  updatedAt: string;
  model: Model;
  productFiles: ProductFile[];
}

// Interface cho response khi lấy danh sách sản phẩm
interface ProductsResponse {
  message: string;
  data: Product[];
}

// Interface cho response khi lấy chi tiết, tạo hoặc cập nhật sản phẩm
interface ProductResponse {
  message: string;
  data: Product;
}

// Interface cho response khi xóa sản phẩm hoặc file
interface DeleteResponse {
  message: string;
}

// Lấy danh sách sản phẩm
export const getProducts = async (): Promise<Product[]> => {
  const response: ProductsResponse = await axiosInstance.get("/products");
  return response.data;
};

// Lấy chi tiết sản phẩm theo ID
export const getProductById = async (id: string): Promise<Product> => {
  const response: ProductResponse = await axiosInstance.get(`/products/${id}`);
  return response.data;
};

// Tạo sản phẩm mới
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
  files: FileList | null;
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

  // Thêm các file vào FormData
  if (data.files) {
    Array.from(data.files).forEach((file) => {
      formData.append("files", file);
    });
  }

  const response: ProductResponse = await axiosInstance.post(
    "/products",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Cập nhật sản phẩm
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
    files?: FileList | null;
    filesToDelete?: string[];
  }
): Promise<Product> => {
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.price !== undefined && !isNaN(data.price)) {
    formData.append("price", data.price.toString());
  }
  if (data.storage !== undefined && !isNaN(data.storage)) {
    formData.append("storage", data.storage.toString());
  }
  if (data.ram !== undefined && !isNaN(data.ram)) {
    formData.append("ram", data.ram.toString());
  }
  if (data.screenSize !== undefined && !isNaN(data.screenSize)) {
    formData.append("screenSize", data.screenSize.toString());
  }
  if (data.battery !== undefined && !isNaN(data.battery)) {
    formData.append("battery", data.battery.toString());
  }
  if (data.chip) {
    formData.append("chip", data.chip);
  }
  if (data.operatingSystem) {
    formData.append("operatingSystem", data.operatingSystem);
  }
  if (data.modelId) formData.append("modelId", data.modelId);

  // Thêm các file mới nếu có
  if (data.files) {
    Array.from(data.files).forEach((file) => {
      formData.append("files", file);
    });
  }

  // Thêm danh sách fileId cần xóa nếu có
  if (data.filesToDelete && data.filesToDelete.length > 0) {
    data.filesToDelete.forEach((fileId) => {
      formData.append("filesToDelete[]", fileId);
    });
  }

  const response: ProductResponse = await axiosInstance.patch(
    `/products/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Xóa sản phẩm
export const deleteProduct = async (id: string): Promise<void> => {
  const response: DeleteResponse = await axiosInstance.delete(
    `/products/${id}`
  );
  return response;
};

// Xóa file của sản phẩm
export const deleteProductFile = async (
  productId: string,
  fileId: string
): Promise<void> => {
  const response: DeleteResponse = await axiosInstance.delete(
    `/products/${productId}/files/${fileId}`
  );
  return response;
};
