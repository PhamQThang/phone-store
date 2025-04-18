"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Promotion, Product } from "@/lib/types";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionById,
  addProductToPromotion,
  removeProductFromPromotion,
} from "@/api/admin/promotionsApi";
import { getProducts } from "@/api/admin/productsApi";
import ClientModals from "@/components/admin/promotions/ClientModals";
import { Loader2 } from "lucide-react";
import { getAuthData, clearAuthData } from "@/lib/authUtils";

export default function PromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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
          const [promotionsData, productsData] = await Promise.all([
            getPromotions(),
            getProducts(), // Giả định API này không cần token, giống brandsApi.ts
          ]);
          if (isMounted) {
            setPromotions(promotionsData);
            setProducts(productsData);
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

  const addPromotionAction = async (formData: FormData) => {
    const code = formData.get("code")?.toString();
    const description = formData.get("description")?.toString();
    const discount = parseInt(formData.get("discount")?.toString() || "0");
    const startDate = formData.get("startDate")?.toString();
    const endDate = formData.get("endDate")?.toString();
    const isActive = formData.get("isActive") === "true";
    const productIds = formData.getAll("productIds[]") as string[];

    // Validation cơ bản
    if (!code || code.length < 2) {
      return { error: "Mã khuyến mãi phải có ít nhất 2 ký tự" };
    }
    if (isNaN(discount) || discount <= 0) {
      return { error: "Số tiền giảm giá phải là số dương" };
    }
    if (!startDate) {
      return { error: "Vui lòng chọn ngày bắt đầu" };
    }
    if (!endDate) {
      return { error: "Vui lòng chọn ngày kết thúc" };
    }
    if (new Date(startDate) >= new Date(endDate)) {
      return { error: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc" };
    }

    try {
      const newPromotion = await createPromotion({
        code,
        description: description || undefined,
        discount,
        startDate,
        endDate,
        isActive,
      });

      // Thêm sản phẩm vào khuyến mãi
      for (const productId of productIds) {
        await addProductToPromotion(newPromotion.id, productId);
      }

      // Lấy lại thông tin khuyến mãi để bao gồm danh sách sản phẩm
      const updatedPromotion = await getPromotionById(newPromotion.id);
      setPromotions((prev) => [...prev, updatedPromotion]);
      return {
        success: true,
        message: "Thêm khuyến mãi thành công",
        promotion: updatedPromotion,
      };
    } catch (error: any) {
      return {
        error: error.message || "Thêm khuyến mãi thất bại",
      };
    }
  };

  const editPromotionAction = async (id: string, formData: FormData) => {
    const code = formData.get("code")?.toString();
    const description = formData.get("description")?.toString();
    const discount = parseInt(formData.get("discount")?.toString() || "0");
    const startDate = formData.get("startDate")?.toString();
    const endDate = formData.get("endDate")?.toString();
    const isActive = formData.get("isActive") === "true";

    // Validation cơ bản nếu có thay đổi
    if (code && code.length < 2) {
      return { error: "Mã khuyến mãi phải có ít nhất 2 ký tự" };
    }
    if (discount && (isNaN(discount) || discount <= 0)) {
      return { error: "Số tiền giảm giá phải là số dương" };
    }
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return { error: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc" };
    }

    try {
      const updatedPromotion = await updatePromotion(id, {
        ...(code && { code }),
        ...(description !== undefined && { description }),
        ...(discount && !isNaN(discount) && { discount }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        isActive: isActive !== undefined ? isActive : undefined,
      });

      setPromotions((prev) =>
        prev.map((promo) => (promo.id === id ? updatedPromotion : promo))
      );
      return {
        success: true,
        message: "Cập nhật khuyến mãi thành công",
        promotion: updatedPromotion,
      };
    } catch (error: any) {
      return {
        error: error.message || "Cập nhật khuyến mãi thất bại",
      };
    }
  };

  const deletePromotionAction = async (id: string) => {
    try {
      await deletePromotion(id);
      setPromotions((prev) => prev.filter((promo) => promo.id !== id));
      return { success: true, message: "Xóa khuyến mãi thành công" };
    } catch (error: any) {
      return {
        error: error.message || "Xóa khuyến mãi thất bại",
      };
    }
  };

  const getPromotionDetailAction = async (id: string) => {
    try {
      const promotion = await getPromotionById(id);
      return { success: true, promotion };
    } catch (error: any) {
      return { error: error.message || "Lỗi khi lấy chi tiết khuyến mãi" };
    }
  };

  const checkPromotionStatusAction = async (id: string) => {
    try {
      const promotion = await getPromotionById(id);
      const currentDate = new Date();
      const startDate = new Date(promotion.startDate);
      const endDate = new Date(promotion.endDate);
      const isActive =
        promotion.isActive &&
        currentDate >= startDate &&
        currentDate <= endDate;
      return { success: true, isActive };
    } catch (error: any) {
      return {
        success: false,
        error: "Lỗi khi kiểm tra trạng thái khuyến mãi",
      };
    }
  };

  const addProductToPromotionAction = async (
    promotionId: string,
    productId: string
  ) => {
    try {
      const result = await addProductToPromotion(promotionId, productId);
      const updatedPromotion = await getPromotionById(promotionId);
      setPromotions((prev) =>
        prev.map((promo) =>
          promo.id === promotionId ? updatedPromotion : promo
        )
      );
      return {
        success: true,
        message: "Thêm sản phẩm vào khuyến mãi thành công",
      };
    } catch (error: any) {
      return {
        error: error.message || "Thêm sản phẩm vào khuyến mãi thất bại",
      };
    }
  };

  const removeProductFromPromotionAction = async (
    promotionId: string,
    productId: string
  ) => {
    try {
      const result = await removeProductFromPromotion(promotionId, productId);
      const updatedPromotion = await getPromotionById(promotionId);
      setPromotions((prev) =>
        prev.map((promo) =>
          promo.id === promotionId ? updatedPromotion : promo
        )
      );
      return {
        success: true,
        message: "Xóa sản phẩm khỏi khuyến mãi thành công",
      };
    } catch (error: any) {
      return {
        error: error.message || "Xóa sản phẩm khỏi khuyến mãi thất bại",
      };
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
        promotions={promotions}
        products={products}
        role={role!}
        addPromotionAction={addPromotionAction}
        editPromotionAction={editPromotionAction}
        deletePromotionAction={deletePromotionAction}
        getPromotionDetailAction={getPromotionDetailAction}
        addProductToPromotionAction={addProductToPromotionAction}
        removeProductFromPromotionAction={removeProductFromPromotionAction}
        checkPromotionStatusAction={checkPromotionStatusAction}
      />
    </div>
  );
}
