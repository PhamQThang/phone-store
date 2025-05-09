"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { getAuthData, clearAuthData } from "@/lib/authUtils";
import { Loader2 } from "lucide-react";

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

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
          const purchaseOrdersData = await getPurchaseOrders();
          if (isMounted) {
            setPurchaseOrders(purchaseOrdersData);
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

  const addPurchaseOrderAction = async (formData: FormData) => {
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
      const newPurchaseOrder = await createPurchaseOrder({
        supplierId,
        note: note || undefined,
        details,
      });
      setPurchaseOrders((prev) => [newPurchaseOrder, ...prev]);
      return {
        success: true,
        message: "Thêm đơn nhập hàng thành công",
        purchaseOrder: newPurchaseOrder,
      };
    } catch (error: any) {
      return {
        error: error.message || "Thêm đơn nhập hàng thất bại",
      };
    }
  };

  const editPurchaseOrderAction = async (id: string, formData: FormData) => {
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
      const updatedPurchaseOrder = await updatePurchaseOrder(id, {
        status,
        details: details.length > 0 ? details : undefined,
        detailsToDelete:
          detailsToDelete.length > 0 ? detailsToDelete : undefined,
        detailsToUpdate:
          detailsToUpdate.length > 0 ? detailsToUpdate : undefined,
      });
      setPurchaseOrders((prev) =>
        prev.map((order) => (order.id === id ? updatedPurchaseOrder : order))
      );
      return {
        success: true,
        message: "Cập nhật đơn nhập hàng thành công",
        purchaseOrder: updatedPurchaseOrder,
      };
    } catch (error: any) {
      return {
        error: error.message || "Cập nhật đơn nhập hàng thất bại",
      };
    }
  };

  const deletePurchaseOrderAction = async (id: string) => {
    try {
      await deletePurchaseOrder(id);
      setPurchaseOrders((prev) => prev.filter((order) => order.id !== id));
      return { success: true, message: "Xóa đơn nhập hàng thành công" };
    } catch (error: any) {
      return {
        error: error.message || "Xóa đơn nhập hàng thất bại",
      };
    }
  };

  const getPurchaseOrderDetailAction = async (id: string) => {
    try {
      const purchaseOrder = await getPurchaseOrderById(id);
      return { success: true, purchaseOrder };
    } catch (error: any) {
      return { error: error.message || "Lỗi khi lấy chi tiết đơn nhập hàng" };
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
      <ClientPurchaseOrders
        purchaseOrders={purchaseOrders}
        role={role!}
        addPurchaseOrderAction={addPurchaseOrderAction}
        editPurchaseOrderAction={editPurchaseOrderAction}
        deletePurchaseOrderAction={deletePurchaseOrderAction}
        getPurchaseOrderDetailAction={getPurchaseOrderDetailAction}
      />
    </div>
  );
}
