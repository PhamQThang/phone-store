"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/lib/types";
import { getOrders, updateOrderStatus, getOrderDetails } from "@/api/orderApi";
import { getAuthData, clearAuthData } from "@/lib/authUtils";
import { Loader2 } from "lucide-react";
import ClientOrders from "@/components/admin/orders/ClientOrders";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
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
          const ordersData = await getOrders();
          if (isMounted) {
            setOrders(ordersData);
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

  const updateOrderStatusAction = async (id: string, status: string) => {
    try {
      const updatedOrder = await updateOrderStatus(id, { status });
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? updatedOrder : order))
      );
      return {
        success: true,
        message: "Cập nhật trạng thái đơn hàng thành công",
        order: updatedOrder,
      };
    } catch (error: any) {
      return {
        error: error.message || "Cập nhật trạng thái đơn hàng thất bại",
      };
    }
  };

  const getOrderDetailAction = async (id: string) => {
    try {
      const order = await getOrderDetails(id);
      return { success: true, order };
    } catch (error: any) {
      return { error: error.message || "Lỗi khi lấy chi tiết đơn hàng" };
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
      <ClientOrders
        orders={orders}
        role={role!}
        updateOrderStatusAction={updateOrderStatusAction}
        getOrderDetailAction={getOrderDetailAction}
      />
    </div>
  );
}
