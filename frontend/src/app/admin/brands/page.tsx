"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/lib/types";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandById,
} from "@/api/admin/brandsApi";
import ClientModals from "@/components/admin/brands/ClientModals";
import { getAuthData, clearAuthData } from "@/lib/authUtils";
import { Loader2 } from "lucide-react";

export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
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
          const data = await getBrands();
          if (isMounted) {
            setBrands(data);
          }
        } catch (error) {
          console.error("Lỗi khi lấy danh sách thương hiệu:", error);
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

  const addBrandAction = async (formData: FormData) => {
    const name = formData.get("name")?.toString();
    if (!name || name.length < 2) {
      return { error: "Tên thương hiệu phải có ít nhất 2 ký tự" };
    }

    try {
      const newBrand = await createBrand({ name });
      setBrands((prev) => [newBrand, ...prev]);
      return {
        success: true,
        message: "Thêm thương hiệu thành công",
        brand: newBrand,
      };
    } catch (error: any) {
      return {
        error: error.message || "Thêm thương hiệu thất bại",
      };
    }
  };

  const editBrandAction = async (id: string, formData: FormData) => {
    const name = formData.get("name")?.toString();
    if (!name || name.length < 2) {
      return { error: "Tên thương hiệu phải có ít nhất 2 ký tự" };
    }

    try {
      const updatedBrand = await updateBrand(id, { name });
      setBrands((prev) =>
        prev.map((brand) => (brand.id === id ? updatedBrand : brand))
      );
      return {
        success: true,
        message: "Cập nhật thương hiệu thành công",
        brand: updatedBrand,
      };
    } catch (error: any) {
      return {
        error: error.message || "Thêm thương hiệu thất bại",
      };
    }
  };

  const deleteBrandAction = async (id: string) => {
    try {
      await deleteBrand(id);
      setBrands((prev) => prev.filter((brand) => brand.id !== id));
      return { success: true, message: "Xóa thương hiệu thành công" };
    } catch (error: any) {
      return {
        error: error.message || "Xóa thương hiệu thất bại",
      };
    }
  };

  const getBrandDetailAction = async (id: string) => {
    try {
      const brand = await getBrandById(id);
      return { success: true, brand };
    } catch (error: any) {
      return { error: error.message || "Lỗi khi lấy chi tiết thương hiệu" };
    }
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
        brands={brands}
        role={role!}
        addBrandAction={addBrandAction}
        editBrandAction={editBrandAction}
        deleteBrandAction={deleteBrandAction}
        getBrandDetailAction={getBrandDetailAction}
      />
    </div>
  );
}
