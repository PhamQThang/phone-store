// app/admin/brands/page.tsx
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCookieValue } from "@/lib/cookieUtils";
import { Brand } from "@/lib/types";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandById,
} from "@/api/admin/brandsApi";
import ClientModals from "@/components/admin/brands/ClientModals";

// Server-side function để lấy thông tin role và token
async function getAuthInfo() {
  const role = await getCookieValue("role");
  const token = await getCookieValue("accessToken");
  return { role, token };
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

// Server Action để thêm thương hiệu
async function addBrandAction(formData: FormData) {
  "use server";
  const name = formData.get("name")?.toString();
  if (!name || name.length < 2) {
    return { error: "Tên thương hiệu phải có ít nhất 2 ký tự" };
  }

  try {
    const token = await getCookieValue("accessToken");
    const newBrand = await createBrand({ name }, token);
    revalidatePath("/admin/brands");
    return {
      success: true,
      message: "Thêm thương hiệu thành công",
      brand: newBrand,
    };
  } catch (error: any) {
    if (error.statusCode === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Thêm thương hiệu thất bại",
    };
  }
}

// Server Action để sửa thương hiệu
async function editBrandAction(id: string, formData: FormData) {
  "use server";
  const name = formData.get("name")?.toString();
  if (!name || name.length < 2) {
    return { error: "Tên thương hiệu phải có ít nhất 2 ký tự" };
  }

  try {
    const token = await getCookieValue("accessToken");
    const updatedBrand = await updateBrand(id, { name }, token);
    revalidatePath("/admin/brands");
    return {
      success: true,
      message: "Cập nhật thương hiệu thành công",
      brand: updatedBrand,
    };
  } catch (error: any) {
    if (error.statusCode === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Cập nhật thương hiệu thất bại",
    };
  }
}

// Server Action để xóa thương hiệu
async function deleteBrandAction(id: string) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    await deleteBrand(id, token);
    revalidatePath("/admin/brands");
    return { success: true, message: "Xóa thương hiệu thành công" };
  } catch (error: any) {
    if (error.statusCode === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Xóa thương hiệu thất bại",
    };
  }
}

// Server Action để lấy chi tiết thương hiệu
async function getBrandDetailAction(id: string) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    const brand = await getBrandById(id, token);
    return { success: true, brand };
  } catch (error: any) {
    if (error.statusCode === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return { error: error.message || "Lỗi khi lấy chi tiết thương hiệu" };
  }
}

export default async function BrandsPage() {
  // Lấy role và token trên server
  const { role, token } = await getAuthInfo();

  // Lấy dữ liệu thương hiệu trên server
  const brands = await fetchBrands(token);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ClientModals
        brands={brands}
        role={role || ""}
        addBrandAction={addBrandAction}
        editBrandAction={editBrandAction}
        deleteBrandAction={deleteBrandAction}
        getBrandDetailAction={getBrandDetailAction}
      />
    </div>
  );
}
