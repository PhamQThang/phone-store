import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCookieValue } from "@/lib/cookieUtils";
import { Promotion } from "@/lib/types";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionById,
  addProductToPromotion,
  removeProductFromPromotion,
} from "@/api/admin/promotionsApi";
import ClientModals from "@/components/admin/promotions/ClientModals";
import { getProducts } from "@/api/admin/productsApi";

// Server-side function để lấy thông tin role và token
async function getAuthInfo() {
  const role = await getCookieValue("role");
  const token = await getCookieValue("accessToken");
  if (!token) {
    redirect("/auth/login");
  }
  return { role, token };
}

// Server-side function để lấy danh sách khuyến mãi
async function fetchPromotions(token: string): Promise<Promotion[]> {
  try {
    return await getPromotions(token);
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    console.error("Lỗi khi lấy danh sách khuyến mãi:", error.message);
    return [];
  }
}

// Server-side function để lấy danh sách sản phẩm
async function fetchProducts(token: string) {
  try {
    return await getProducts(undefined, undefined, token);
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    console.error("Lỗi khi lấy danh sách sản phẩm:", error.message);
    return [];
  }
}

// Server Action để thêm khuyến mãi
async function addPromotionAction(formData: FormData) {
  "use server";
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
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    const newPromotion = await createPromotion(
      {
        code,
        description: description || undefined,
        discount,
        startDate,
        endDate,
        isActive,
      },
      token
    );

    // Thêm sản phẩm vào khuyến mãi
    for (const productId of productIds) {
      try {
        await addProductToPromotion(newPromotion.id, productId, token);
      } catch (productError: any) {
        console.error(`Lỗi khi thêm sản phẩm ${productId}:`, productError);
        throw new Error(
          `Không thể thêm sản phẩm ${productId}: ${
            productError.response?.data?.message || productError.message
          }`
        );
      }
    }

    revalidatePath("/admin/promotions");
    return {
      success: true,
      message: "Thêm khuyến mãi thành công",
      promotion: newPromotion,
    };
  } catch (error: any) {
    console.error("Lỗi trong addPromotionAction:", error);
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error:
        error.message ||
        error.response?.data?.message ||
        "Thêm khuyến mãi thất bại. Vui lòng thử lại.",
    };
  }
}
// Server Action để sửa khuyến mãi
async function editPromotionAction(id: string, formData: FormData) {
  "use server";
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
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }

    // Cập nhật thông tin khuyến mãi
    const updateResult = await updatePromotion(
      id,
      {
        ...(code && { code }),
        ...(description !== undefined && { description }),
        ...(discount && !isNaN(discount) && { discount }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        isActive: isActive !== undefined ? isActive : undefined,
      },
      token
    );

    const updatedPromotion = updateResult;

    revalidatePath("/admin/promotions");
    return {
      success: true,
      message: "Cập nhật khuyến mãi thành công",
      promotion: updatedPromotion,
    };
  } catch (error: any) {
    console.error("Lỗi trong editPromotionAction:", error.message);
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error:
        error.message ||
        error.response?.data?.message ||
        "Cập nhật khuyến mãi thất bại",
    };
  }
}

// Server Action để xóa khuyến mãi
async function deletePromotionAction(id: string) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    await deletePromotion(id, token);
    revalidatePath("/admin/promotions");
    return { success: true, message: "Xóa khuyến mãi thành công" };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.response?.data?.message || "Xóa khuyến mãi thất bại",
    };
  }
}

// Server Action để lấy chi tiết khuyến mãi
async function getPromotionDetailAction(id: string) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    const promotion = await getPromotionById(id, token);
    return { success: true, promotion };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.response?.data?.message || "Lỗi khi lấy chi tiết khuyến mãi",
    };
  }
}

// Server Action để kiểm tra trạng thái khuyến mãi
async function checkPromotionStatusAction(id: string) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    const promotion = await getPromotionById(id, token);
    const currentDate = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    const isActive =
      promotion.isActive && currentDate >= startDate && currentDate <= endDate;
    return { success: true, isActive };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return { success: false, error: "Lỗi khi kiểm tra trạng thái khuyến mãi" };
  }
}

// Server Action để thêm sản phẩm vào khuyến mãi
async function addProductToPromotionAction(
  promotionId: string,
  productId: string
) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    const result = await addProductToPromotion(promotionId, productId, token);
    revalidatePath("/admin/promotions");
    return { success: true, message: result.message };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error:
        error.response?.data?.message ||
        "Thêm sản phẩm vào khuyến mãi thất bại",
    };
  }
}

// Server Action để xóa sản phẩm khỏi khuyến mãi
async function removeProductFromPromotionAction(
  promotionId: string,
  productId: string
) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    const result = await removeProductFromPromotion(
      promotionId,
      productId,
      token
    );
    revalidatePath("/admin/promotions");
    return { success: true, message: result.message };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error:
        error.response?.data?.message ||
        "Xóa sản phẩm khỏi khuyến mãi thất bại",
    };
  }
}

export default async function PromotionsPage() {
  const { role, token } = await getAuthInfo();
  const promotions = await fetchPromotions(token);
  const products = await fetchProducts(token);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ClientModals
        promotions={promotions}
        products={products}
        role={role || ""}
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
