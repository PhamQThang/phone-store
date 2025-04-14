// app/admin/suppliers/page.tsx
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCookieValue } from "@/lib/cookieUtils";
import { Supplier } from "@/lib/types";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierById,
} from "@/api/admin/suppliersApi";
import ClientModals from "@/components/admin/suppliers/ClientModals";

// Server-side function để lấy thông tin role và token
async function getAuthInfo() {
  const role = await getCookieValue("role");
  const token = await getCookieValue("accessToken");
  return { role, token };
}

// Server-side function để lấy danh sách nhà cung cấp
async function fetchSuppliers(token?: string): Promise<Supplier[]> {
  try {
    return await getSuppliers(token);
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách nhà cung cấp:", error.message);
    return [];
  }
}

// Server Action để thêm nhà cung cấp
async function addSupplierAction(formData: FormData) {
  "use server";
  const name = formData.get("name")?.toString();
  const address = formData.get("address")?.toString();
  const phone = formData.get("phone")?.toString();
  const email = formData.get("email")?.toString();

  if (!name || name.length < 2) {
    return { error: "Tên nhà cung cấp phải có ít nhất 2 ký tự" };
  }
  if (!address || address.length < 5) {
    return { error: "Địa chỉ phải có ít nhất 5 ký tự" };
  }
  if (!phone || !/^[0-9]{10,11}$/.test(phone)) {
    return { error: "Số điện thoại phải có 10-11 chữ số" };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email không hợp lệ" };
  }

  try {
    const token = await getCookieValue("accessToken");
    const newSupplier = await createSupplier(
      { name, address, phone, email },
      token
    );
    revalidatePath("/admin/suppliers");
    return {
      success: true,
      message: "Thêm nhà cung cấp thành công",
      supplier: newSupplier,
    };
  } catch (error: any) {
    if (error.statusCode === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Thêm nhà cung cấp thất bại",
    };
  }
}

// Server Action để sửa nhà cung cấp
async function editSupplierAction(id: string, formData: FormData) {
  "use server";
  const name = formData.get("name")?.toString();
  const address = formData.get("address")?.toString();
  const phone = formData.get("phone")?.toString();
  const email = formData.get("email")?.toString();

  if (!name || name.length < 2) {
    return { error: "Tên nhà cung cấp phải có ít nhất 2 ký tự" };
  }
  if (!address || address.length < 5) {
    return { error: "Địa chỉ phải có ít nhất 5 ký tự" };
  }
  if (!phone || !/^[0-9]{10,11}$/.test(phone)) {
    return { error: "Số điện thoại phải có 10-11 chữ số" };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email không hợp lệ" };
  }

  try {
    const token = await getCookieValue("accessToken");
    const updatedSupplier = await updateSupplier(
      id,
      { name, address, phone, email },
      token
    );
    revalidatePath("/admin/suppliers");
    return {
      success: true,
      message: "Cập nhật nhà cung cấp thành công",
      supplier: updatedSupplier,
    };
  } catch (error: any) {
    if (error.statusCode === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Cập nhật nhà cung cấp thất bại",
    };
  }
}

// Server Action để xóa nhà cung cấp
async function deleteSupplierAction(id: string) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    await deleteSupplier(id, token);
    revalidatePath("/admin/suppliers");
    return { success: true, message: "Xóa nhà cung cấp thành công" };
  } catch (error: any) {
    if (error.statusCode === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Xóa nhà cung cấp thất bại",
    };
  }
}

// Server Action để lấy chi tiết nhà cung cấp
async function getSupplierDetailAction(id: string) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    const supplier = await getSupplierById(id, token);
    return { success: true, supplier };
  } catch (error: any) {
    if (error.statusCode === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return { error: error.message || "Lỗi khi lấy chi tiết nhà cung cấp" };
  }
}

export default async function SuppliersPage() {
  // Lấy role và token trên server
  const { role, token } = await getAuthInfo();

  // Lấy dữ liệu nhà cung cấp trên server
  const suppliers = await fetchSuppliers(token);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ClientModals
        suppliers={suppliers}
        role={role || ""}
        addSupplierAction={addSupplierAction}
        editSupplierAction={editSupplierAction}
        deleteSupplierAction={deleteSupplierAction}
        getSupplierDetailAction={getSupplierDetailAction}
      />
    </div>
  );
}
