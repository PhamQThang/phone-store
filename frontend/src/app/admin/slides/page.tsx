"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Slide } from "@/lib/types";
import {
  getSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  getSlideById,
} from "@/api/admin/slidesApi";
import ClientSlides from "@/components/admin/slides/ClientSlides";
import { getAuthData, clearAuthData } from "@/lib/authUtils";
import { Loader2 } from "lucide-react";

export default function SlidesPage() {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const authData = getAuthData();
    if (!authData || authData.role !== "Admin") {
      clearAuthData();
      router.push("/auth/login");
    } else {
      setRole(authData.role);
      let isMounted = true;

      startTransition(async () => {
        try {
          const slidesData = await getSlides();
          if (isMounted) {
            setSlides(slidesData);
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

  const addSlideAction = async (formData: FormData) => {
    const file = formData.get("file") as File;

    if (!file && !formData.get("currentImage")) {
      return { error: "File ảnh là bắt buộc khi tạo mới slide" };
    }

    try {
      const newSlide = await createSlide(formData);
      setSlides((prev) => [...prev, newSlide]);
      return {
        success: true,
        message: "Thêm slide thành công",
        slide: newSlide,
      };
    } catch (error: any) {
      return {
        error: error.message || "Thêm slide thất bại",
      };
    }
  };

  const editSlideAction = async (id: string, formData: FormData) => {
    try {
      const updatedSlide = await updateSlide(id, formData);
      setSlides((prev) =>
        prev.map((slide) => (slide.id === id ? updatedSlide : slide))
      );
      return {
        success: true,
        message: "Cập nhật slide thành công",
        slide: updatedSlide,
      };
    } catch (error: any) {
      return {
        error: error.message || "Cập nhật slide thất bại",
      };
    }
  };

  const deleteSlideAction = async (id: string) => {
    try {
      await deleteSlide(id);
      setSlides((prev) => prev.filter((slide) => slide.id !== id));
      return { success: true, message: "Xóa slide thành công" };
    } catch (error: any) {
      return {
        error: error.message || "Xóa slide thất bại",
      };
    }
  };

  const getSlideDetailAction = async (id: string) => {
    try {
      const slide = await getSlideById(id);
      return { success: true, slide };
    } catch (error: any) {
      return { error: error.message || "Lỗi khi lấy chi tiết slide" };
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
      <ClientSlides
        slides={slides}
        role={role!}
        addSlideAction={addSlideAction}
        editSlideAction={editSlideAction}
        deleteSlideAction={deleteSlideAction}
        getSlideDetailAction={getSlideDetailAction}
      />
    </div>
  );
}
