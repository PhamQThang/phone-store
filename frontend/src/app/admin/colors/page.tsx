"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Color } from "@/lib/types";
import {
  getColors,
  createColor,
  updateColor,
  deleteColor,
  getColorById,
} from "@/api/admin/colorsApi";
import ClientModals from "@/components/admin/colors/ClientModals";
import { getAuthData, clearAuthData } from "@/lib/authUtils";
import { Loader2 } from "lucide-react";

export default function ColorsPage() {
  const router = useRouter();
  const [colors, setColors] = useState<Color[]>([]);
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
          const data = await getColors();
          if (isMounted) {
            setColors(data);
          }
        } catch (error) {
          console.error("Lỗi khi lấy danh sách màu sắc:", error);
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

  const addColorAction = async (formData: FormData) => {
    const name = formData.get("name")?.toString();
    if (!name || name.length < 2) {
      return { error: "Tên màu sắc phải có ít nhất 2 ký tự" };
    }

    try {
      const newColor = await createColor({ name });
      setColors((prev) => [newColor, ...prev]);
      return {
        success: true,
        message: "Thêm màu sắc thành công",
        color: newColor,
      };
    } catch (error: any) {
      return {
        error: error.message || "Thêm màu sắc thất bại",
      };
    }
  };

  const editColorAction = async (id: string, formData: FormData) => {
    const name = formData.get("name")?.toString();
    if (!name || name.length < 2) {
      return { error: "Tên màu sắc phải có ít nhất 2 ký tự" };
    }

    try {
      const updatedColor = await updateColor(id, { name });
      setColors((prev) =>
        prev.map((color) => (color.id === id ? updatedColor : color))
      );
      return {
        success: true,
        message: "Cập nhật màu sắc thành công",
        color: updatedColor,
      };
    } catch (error: any) {
      return {
        error: error.message || "Thêm màu sắc thất bại",
      };
    }
  };

  const deleteColorAction = async (id: string) => {
    try {
      await deleteColor(id);
      setColors((prev) => prev.filter((color) => color.id !== id));
      return { success: true, message: "Xóa màu sắc thành công" };
    } catch (error: any) {
      return {
        error: error.message || "Xóa màu sắc thất bại",
      };
    }
  };

  const getColorDetailAction = async (id: string) => {
    try {
      const color = await getColorById(id);
      return { success: true, color };
    } catch (error: any) {
      return { error: error.message || "Lỗi khi lấy chi tiết màu sắc" };
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
        colors={colors}
        role={role!}
        addColorAction={addColorAction}
        editColorAction={editColorAction}
        deleteColorAction={deleteColorAction}
        getColorDetailAction={getColorDetailAction}
      />
    </div>
  );
}
