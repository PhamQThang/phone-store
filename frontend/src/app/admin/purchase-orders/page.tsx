import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { PurchaseOrder } from "@/lib/types";
import {
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrderById,
  PurchaseOrderDetailInput,
} from "@/api/admin/purchaseOrdersApi";
import ClientPurchaseOrders from "@/components/admin/purchase-orders/ClientPurchaseOrders";
import { getCookieValue } from "@/lib/cookieUtils";

// Server-side function để lấy thông tin role và token
async function getAuthInfo() {
  const role = await getCookieValue("role");
  const token = await getCookieValue("accessToken");
  if (!token) {
    redirect("/auth/login");
  }
  if (!role || (role !== "Admin" && role !== "Employee")) {
    const { clearCookies } = await import("@/lib/cookieUtils");
    await clearCookies();
    redirect("/auth/login");
  }
  return { role, token };
}

// Server-side function để lấy danh sách đơn nhập hàng
async function fetchPurchaseOrders(token: string): Promise<PurchaseOrder[]> {
  try {
    return await getPurchaseOrders(token);
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    console.error("Lỗi khi lấy danh sách đơn nhập hàng:", error.message);
    return [];
  }
}

// Server Action để thêm đơn nhập hàng
async function addPurchaseOrderAction(formData: FormData) {
  "use server";
  const supplierId = formData.get("supplierId")?.toString();
  const note = formData.get("note")?.toString();
  const details = JSON.parse(
    formData.get("details") as string
  ) as PurchaseOrderDetailInput[];

  if (!supplierId) {
    return { error: "Vui lòng chọn nhà cung cấp" };
  }
  if (!details || details.length === 0) {
    return { error: "Vui lòng thêm ít nhất một sản phẩm vào đơn nhập hàng" };
  }

  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    const newPurchaseOrder = await createPurchaseOrder(
      {
        supplierId,
        note: note || undefined,
        details,
      },
      token
    );
    revalidatePath("/admin/purchase-orders");
    return {
      success: true,
      message: "Thêm đơn nhập hàng thành công",
      purchaseOrder: newPurchaseOrder,
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Thêm đơn nhập hàng thất bại",
    };
  }
}

// Server Action để sửa đơn nhập hàng
async function editPurchaseOrderAction(id: string, formData: FormData) {
  "use server";
  const status = formData.get("status")?.toString();
  const details = JSON.parse(
    formData.get("details") as string
  ) as PurchaseOrderDetailInput[];
  const detailsToDelete = JSON.parse(
    formData.get("detailsToDelete") as string
  ) as string[];
  const detailsToUpdate = JSON.parse(
    formData.get("detailsToUpdate") as string
  ) as (PurchaseOrderDetailInput & { id: string })[];

  if (!status) {
    return { error: "Trạng thái không được để trống" };
  }

  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    const updatedPurchaseOrder = await updatePurchaseOrder(
      id,
      {
        status,
        details: details.length > 0 ? details : undefined,
        detailsToDelete:
          detailsToDelete.length > 0 ? detailsToDelete : undefined,
        detailsToUpdate:
          detailsToUpdate.length > 0 ? detailsToUpdate : undefined,
      },
      token
    );
    revalidatePath("/admin/purchase-orders");
    return {
      success: true,
      message: "Cập nhật đơn nhập hàng thành công",
      purchaseOrder: updatedPurchaseOrder,
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Cập nhật đơn nhập hàng thất bại",
    };
  }
}

// Server Action để xóa đơn nhập hàng
async function deletePurchaseOrderAction(id: string) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    await deletePurchaseOrder(id, token);
    revalidatePath("/admin/purchase-orders");
    return { success: true, message: "Xóa đơn nhập hàng thành công" };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return {
      error: error.message || "Xóa đơn nhập hàng thất bại",
    };
  }
}

// Server Action để lấy chi tiết đơn nhập hàng
async function getPurchaseOrderDetailAction(id: string) {
  "use server";
  try {
    const token = await getCookieValue("accessToken");
    if (!token) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    const purchaseOrder = await getPurchaseOrderById(id, token);
    return { success: true, purchaseOrder };
  } catch (error: any) {
    if (error.response?.status === 401) {
      const { clearCookies } = await import("@/lib/cookieUtils");
      await clearCookies();
      redirect("/auth/login");
    }
    return { error: error.message || "Lỗi khi lấy chi tiết đơn nhập hàng" };
  }
}

export default async function PurchaseOrdersPage() {
  // Lấy role và token trên server
  const { role, token } = await getAuthInfo();

  // Lấy dữ liệu đơn nhập hàng trên server
  const purchaseOrders = await fetchPurchaseOrders(token);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ClientPurchaseOrders
        purchaseOrders={purchaseOrders}
        role={role}
        token={token} // Truyền token xuống ClientPurchaseOrders
        addPurchaseOrderAction={addPurchaseOrderAction}
        editPurchaseOrderAction={editPurchaseOrderAction}
        deletePurchaseOrderAction={deletePurchaseOrderAction}
        getPurchaseOrderDetailAction={getPurchaseOrderDetailAction}
      />
    </div>
  );
}
