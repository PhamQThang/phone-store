"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ProductReturn, ReturnTicket } from "@/lib/types";
import {
  getReturns,
  getReturnTickets,
  updateReturnStatus,
  updateReturnTicketStatus,
  getReturnDetails,
  getReturnTicketDetails,
} from "@/api/returnsApi";
import ClientModals from "@/components/admin/returns/ClientModals";
import { getAuthData, clearAuthData } from "@/lib/authUtils";
import { Loader2 } from "lucide-react";

export default function ReturnManagementPage() {
  const router = useRouter();
  const [returns, setReturns] = useState<ProductReturn[]>([]);
  const [returnTickets, setReturnTickets] = useState<ReturnTicket[]>([]);
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
          const [returnsData, returnTicketsData] = await Promise.all([
            getReturns(),
            getReturnTickets(),
          ]);
          if (isMounted) {
            setReturns(returnsData);
            setReturnTickets(returnTicketsData);
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu đổi trả:", error);
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

  const updateReturnStatusAction = async (returnId: string, status: string) => {
    try {
      const updatedReturn = await updateReturnStatus(returnId, { status });
      setReturns((prev) =>
        prev.map((returnItem) =>
          returnItem.id === returnId ? updatedReturn : returnItem
        )
      );
      if (status === "Approved") {
        const updatedReturnTickets = await getReturnTickets();
        setReturnTickets(updatedReturnTickets);
      }
      return {
        success: true,
        message: "Cập nhật trạng thái yêu cầu đổi trả thành công",
      };
    } catch (error: any) {
      return {
        error: error.message || "Cập nhật trạng thái yêu cầu đổi trả thất bại",
      };
    }
  };

  const updateReturnTicketStatusAction = async (
    returnTicketId: string,
    status: string
  ) => {
    try {
      const updatedReturnTicket = await updateReturnTicketStatus(
        returnTicketId,
        {
          status,
        }
      );
      setReturnTickets((prev) =>
        prev.map((returnTicket) =>
          returnTicket.id === returnTicketId
            ? updatedReturnTicket
            : returnTicket
        )
      );
      return {
        success: true,
        message: "Cập nhật trạng thái phiếu đổi trả thành công",
      };
    } catch (error: any) {
      return {
        error: error.message || "Cập nhật trạng thái phiếu đổi trả thất bại",
      };
    }
  };

  const getReturnDetailAction = async (returnId: string) => {
    try {
      const returnDetail = await getReturnDetails(returnId);
      return { success: true, returnDetail };
    } catch (error: any) {
      return {
        error: error.message || "Lỗi khi lấy chi tiết yêu cầu đổi trả",
      };
    }
  };

  const getReturnTicketDetailAction = async (returnTicketId: string) => {
    try {
      const returnTicket = await getReturnTicketDetails(returnTicketId);
      return { success: true, returnTicket };
    } catch (error: any) {
      return { error: error.message || "Lỗi khi lấy chi tiết phiếu đổi trả" };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-600 text-lg flex items-center">
          <Loader2 className="h-8 w-8 animate-spin mr-2 text-blue-500" />
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ClientModals
        returns={returns}
        returnTickets={returnTickets}
        role={role!}
        updateReturnStatusAction={updateReturnStatusAction}
        updateReturnTicketStatusAction={updateReturnTicketStatusAction}
        getReturnDetailAction={getReturnDetailAction}
        getReturnTicketDetailAction={getReturnTicketDetailAction}
      />
    </div>
  );
}
