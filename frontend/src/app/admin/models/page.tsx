"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Model, Brand } from "@/lib/types";
import {
  getModels,
  createModel,
  updateModel,
  deleteModel,
  getModelById,
} from "@/api/admin/modelsApi";
import { getBrands } from "@/api/admin/brandsApi";
import ClientModals from "@/components/admin/models/ClientModals";
import { getAuthData, clearAuthData } from "@/lib/authUtils";
import { Loader2 } from "lucide-react";

export default function ModelsPage() {
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
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
          const [modelsData, brandsData] = await Promise.all([
            getModels(),
            getBrands(),
          ]);
          if (isMounted) {
            setModels(modelsData);
            setBrands(brandsData);
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

  const addModelAction = async (formData: FormData) => {
    const name = formData.get("name")?.toString();
    const brandId = formData.get("brandId")?.toString();

    if (!name || name.length < 2) {
      return { error: "Tên model phải có ít nhất 2 ký tự" };
    }
    if (!brandId) {
      return { error: "Vui lòng chọn thương hiệu" };
    }

    try {
      const newModel = await createModel({ name, brandId });
      setModels((prev) => [...prev, newModel]);
      return {
        success: true,
        message: "Thêm model thành công",
        model: newModel,
      };
    } catch (error: any) {
      return {
        error: error.message || "Thêm model thất bại",
      };
    }
  };

  const editModelAction = async (id: string, formData: FormData) => {
    const name = formData.get("name")?.toString();
    const brandId = formData.get("brandId")?.toString();

    if (!name || name.length < 2) {
      return { error: "Tên model phải có ít nhất 2 ký tự" };
    }
    if (!brandId) {
      return { error: "Vui lòng chọn thương hiệu" };
    }

    try {
      const updatedModel = await updateModel(id, { name, brandId });
      setModels((prev) =>
        prev.map((model) => (model.id === id ? updatedModel : model))
      );
      return {
        success: true,
        message: "Cập nhật model thành công",
        model: updatedModel,
      };
    } catch (error: any) {
      return {
        error: error.message || "Cập nhật model thất bại",
      };
    }
  };

  const deleteModelAction = async (id: string) => {
    try {
      await deleteModel(id);
      setModels((prev) => prev.filter((model) => model.id !== id));
      return { success: true, message: "Xóa model thành công" };
    } catch (error: any) {
      return {
        error: error.message || "Xóa model thất bại",
      };
    }
  };

  const getModelDetailAction = async (id: string) => {
    try {
      const model = await getModelById(id);
      return { success: true, model };
    } catch (error: any) {
      return { error: error.message || "Lỗi khi lấy chi tiết model" };
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
        models={models}
        brands={brands}
        role={role!}
        addModelAction={addModelAction}
        editModelAction={editModelAction}
        deleteModelAction={deleteModelAction}
        getModelDetailAction={getModelDetailAction}
      />
    </div>
  );
}
