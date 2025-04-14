// app/admin/models/page.tsx
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCookieValue } from "@/lib/cookieUtils";
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

// Server-side function để lấy thông tin role và token
async function getAuthInfo() {
  const role = await getCookieValue("role");
  const token = await getCookieValue("accessToken");
  return { role, token };
}

// Server-side function để lấy danh sách model
async function fetchModels(token?: string): Promise<Model[]> {
  try {
    return await getModels(token);
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách model:", error.message);
    return [];
  }
}

// Server-side function để lấy danh sách thương hiệu
async function fetchBrands(token?: string): Promise<Brand[]> {
  try {
    return await getBrands(token);
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách thương hiệu:", error.message);
    return [];
  }
}

// Server Action để thêm model
async function addModelAction(formData: FormData) {
  "use server";
  const name = formData.get("name")?.toString();
  const brandId = formData.get("brandId")?.toString();

  if (!name || name.length < 2) {
    return { error: "Tên model phải có ít nhất 2 ký tự" };
  }
  if (!brandId) {
    return { error: "Vui lòng chọn thương hiệu" };
  }

  try {
    const token = await getCookieValue("accessToken");
    const newModel = await createModel({ name, brandId }, token);
    revalidatePath("/admin/models");
    return { success: true, message: "Thêm model thành công", model: newModel };
  } catch (error: any) {
    if (error.statusCode === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Thêm model thất bại",
    };
  }
}

// Server Action để sửa model
async function editModelAction(id: string, formData: FormData) {
  "use server";
  const name = formData.get("name")?.toString();
  const brandId = formData.get("brandId")?.toString();

  if (!name || name.length < 2) {
    return { error: "Tên model phải có ít nhất 2 ký tự" };
  }
  if (!brandId) {
    return { error: "Vui lòng chọn thương hiệu" };
  }

  try {
    const token = await getCookieValue("accessToken");
    const updatedModel = await updateModel(id, { name, brandId }, token);
    revalidatePath("/admin/models");
    return {
      success: true,
      message: "Cập nhật model thành công",
      model: updatedModel,
    };
  } catch (error: any) {
    if (error.statusCode === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Cập nhật model thất bại",
    };
  }
}

// Server Action để xóa model
async function deleteModelAction(id: string) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    await deleteModel(id, token);
    revalidatePath("/admin/models");
    return { success: true, message: "Xóa model thành công" };
  } catch (error: any) {
    if (error.statusCode === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Xóa model thất bại",
    };
  }
}

// Server Action để lấy chi tiết model
async function getModelDetailAction(id: string) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    const model = await getModelById(id, token);
    return { success: true, model };
  } catch (error: any) {
    if (error.statusCode === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return { error: error.message || "Lỗi khi lấy chi tiết model" };
  }
}

export default async function ModelsPage() {
  // Lấy role và token trên server
  const { role, token } = await getAuthInfo();

  // Lấy dữ liệu models và brands trên server
  const models = await fetchModels(token);
  const brands = await fetchBrands(token);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ClientModals
        models={models}
        brands={brands}
        role={role || ""}
        addModelAction={addModelAction}
        editModelAction={editModelAction}
        deleteModelAction={deleteModelAction}
        getModelDetailAction={getModelDetailAction}
      />
    </div>
  );
}
