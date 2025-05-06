"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Product, Model } from "@/lib/types";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from "@/api/admin/productsApi";
import { getModels } from "@/api/admin/modelsApi";
import ClientModals from "@/components/admin/products/ClientModals";
import { getAuthData, clearAuthData } from "@/lib/authUtils";
import { Loader2 } from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Kiểm tra auth và lấy dữ liệu khi component mount
  useEffect(() => {
    const authData = getAuthData();
    if (!authData || !["Admin", "Employee"].includes(authData.role || "")) {
      clearAuthData();
      router.push("/auth/login");
    } else {
      setRole(authData.role);
      let isMounted = true;

      startTransition(async () => {
        try {
          const [productsData, modelsData] = await Promise.all([
            getProducts(),
            getModels(),
          ]);
          if (isMounted) {
            setProducts(productsData.data);
            setModels(modelsData);
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu:", error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      });

      return () => {
        isMounted = false;
      };
    }
  }, [router]);

  const addProductAction = async (formData: FormData) => {
    const name = formData.get("name")?.toString();
    const price = parseFloat(formData.get("price")?.toString() || "0");
    const storage = parseInt(formData.get("storage")?.toString() || "0");
    const ram = parseInt(formData.get("ram")?.toString() || "0");
    const screenSize = parseFloat(
      formData.get("screenSize")?.toString() || "0"
    );
    const battery = parseInt(formData.get("battery")?.toString() || "0");
    const chip = formData.get("chip")?.toString();
    const operatingSystem = formData.get("operatingSystem")?.toString();
    const modelId = formData.get("modelId")?.toString();
    const files = formData.getAll("files") as File[];

    if (!name || name.length < 2) {
      return { error: "Tên sản phẩm phải có ít nhất 2 ký tự" };
    }
    if (isNaN(price) || price <= 0) {
      return { error: "Giá sản phẩm phải là số dương" };
    }
    if (isNaN(storage) || storage <= 0) {
      return { error: "Dung lượng lưu trữ phải là số dương" };
    }
    if (isNaN(ram) || ram <= 0) {
      return { error: "Dung lượng RAM phải là số dương" };
    }
    if (isNaN(screenSize) || screenSize <= 0) {
      return { error: "Kích thước màn hình phải là số dương" };
    }
    if (isNaN(battery) || battery <= 0) {
      return { error: "Dung lượng pin phải là số dương" };
    }
    if (!chip || chip.length < 2) {
      return { error: "Tên chip phải có ít nhất 2 ký tự" };
    }
    if (!operatingSystem || operatingSystem.length < 2) {
      return { error: "Hệ điều hành phải có ít nhất 2 ký tự" };
    }
    if (!modelId) {
      return { error: "Vui lòng chọn model" };
    }

    try {
      const newProduct = await createProduct({
        name,
        price,
        storage,
        ram,
        screenSize,
        battery,
        chip,
        operatingSystem,
        modelId,
        files: files.length > 0 ? createFileList(files) : undefined,
      });
      setProducts((prev) => [newProduct, ...prev]);
      return {
        success: true,
        message: "Thêm sản phẩm thành công",
        product: newProduct,
      };
    } catch (error: any) {
      return {
        error: error.message || "Thêm sản phẩm thất bại",
      };
    }
  };

  const editProductAction = async (id: string, formData: FormData) => {
    const name = formData.get("name")?.toString();
    const price = parseFloat(formData.get("price")?.toString() || "0");
    const storage = parseInt(formData.get("storage")?.toString() || "0");
    const ram = parseInt(formData.get("ram")?.toString() || "0");
    const screenSize = parseFloat(
      formData.get("screenSize")?.toString() || "0"
    );
    const battery = parseInt(formData.get("battery")?.toString() || "0");
    const chip = formData.get("chip")?.toString();
    const operatingSystem = formData.get("operatingSystem")?.toString();
    const modelId = formData.get("modelId")?.toString();
    const files = formData.getAll("files") as File[];
    const filesToDelete = formData.getAll("filesToDelete[]") as string[];

    if (name && name.length < 2) {
      return { error: "Tên sản phẩm phải có ít nhất 2 ký tự" };
    }
    if (price && (isNaN(price) || price <= 0)) {
      return { error: "Giá sản phẩm phải là số dương" };
    }
    if (storage && (isNaN(storage) || storage <= 0)) {
      return { error: "Dung lượng lưu trữ phải là số dương" };
    }
    if (ram && (isNaN(ram) || ram <= 0)) {
      return { error: "Dung lượng RAM phải là số dương" };
    }
    if (screenSize && (isNaN(screenSize) || screenSize <= 0)) {
      return { error: "Kích thước màn hình phải là số dương" };
    }
    if (battery && (isNaN(battery) || battery <= 0)) {
      return { error: "Dung lượng pin phải là số dương" };
    }
    if (chip && chip.length < 2) {
      return { error: "Tên chip phải có ít nhất 2 ký tự" };
    }
    if (operatingSystem && operatingSystem.length < 2) {
      return { error: "Hệ điều hành phải có ít nhất 2 ký tự" };
    }

    try {
      const updatedProduct = await updateProduct(id, {
        ...(name && { name }),
        ...(price && !isNaN(price) && { price }),
        ...(storage && !isNaN(storage) && { storage }),
        ...(ram && !isNaN(ram) && { ram }),
        ...(screenSize && !isNaN(screenSize) && { screenSize }),
        ...(battery && !isNaN(battery) && { battery }),
        ...(chip && { chip }),
        ...(operatingSystem && { operatingSystem }),
        ...(modelId && { modelId }),
        files: files.length > 0 ? createFileList(files) : undefined,
        filesToDelete: filesToDelete.length > 0 ? filesToDelete : undefined,
      });
      setProducts((prev) =>
        prev.map((product) => (product.id === id ? updatedProduct : product))
      );
      return {
        success: true,
        message: "Cập nhật sản phẩm thành công",
        product: updatedProduct,
      };
    } catch (error: any) {
      return {
        error: error.message || "Cập nhật sản phẩm thất bại",
      };
    }
  };

  const deleteProductAction = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
      return { success: true, message: "Xóa sản phẩm thành công" };
    } catch (error: any) {
      return {
        error: error.message || "Xóa sản phẩm thất bại",
      };
    }
  };

  const getProductDetailAction = async (id: string) => {
    try {
      const product = await getProductById(id);
      return { success: true, product };
    } catch (error: any) {
      return { error: error.message || "Lỗi khi lấy chi tiết sản phẩm" };
    }
  };

  // Tạo FileList từ mảng File
  const createFileList = (files: File[]): FileList => {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ClientModals
        products={products}
        models={models}
        role={role!}
        addProductAction={addProductAction}
        editProductAction={editProductAction}
        deleteProductAction={deleteProductAction}
        getProductDetailAction={getProductDetailAction}
      />
    </div>
  );
}
