"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Warranty, WarrantyRequest } from "@/lib/types";
import {
  getWarrantyRequests,
  getWarranties,
  updateWarrantyRequestStatus,
  updateWarrantyStatus,
  getWarrantyRequestDetails,
  getWarrantyDetails,
} from "@/api/warrantyApi";
import ClientModals from "@/components/admin/warranties/ClientModals";
import { getAuthData, clearAuthData } from "@/lib/authUtils";
import { Loader2 } from "lucide-react";

export default function WarrantyManagementPage() {
  const router = useRouter();
  const [warrantyRequests, setWarrantyRequests] = useState<any[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
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
          const [warrantyRequestsData, warrantiesData] = await Promise.all([
            getWarrantyRequests(),
            getWarranties(),
          ]);
          if (isMounted) {
            setWarrantyRequests(warrantyRequestsData);
            setWarranties(warrantiesData);
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu bảo hành:", error);
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

  const updateWarrantyRequestStatusAction = async (
    requestId: string,
    status: string
  ) => {
    try {
      const updatedRequest = await updateWarrantyRequestStatus(requestId, {
        status,
      });
      setWarrantyRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? updatedRequest : request
        )
      );
      if (status === "Approved") {
        const updatedWarranties = await getWarranties();
        setWarranties(updatedWarranties);
      }
      return {
        success: true,
        message: "Cập nhật trạng thái yêu cầu bảo hành thành công",
      };
    } catch (error: any) {
      return {
        error: error.message || "Cập nhật trạng thái yêu cầu bảo hành thất bại",
      };
    }
  };

  const updateWarrantyStatusAction = async (
    warrantyId: string,
    status: string
  ) => {
    try {
      const updatedWarranty = await updateWarrantyStatus(warrantyId, {
        status,
      });
      setWarranties((prev) =>
        prev.map((warranty) =>
          warranty.id === warrantyId ? updatedWarranty : warranty
        )
      );
      return {
        success: true,
        message: "Cập nhật trạng thái phiếu bảo hành thành công",
      };
    } catch (error: any) {
      return {
        error: error.message || "Cập nhật trạng thái phiếu bảo hành thất bại",
      };
    }
  };

  const getWarrantyRequestDetailAction = async (requestId: string) => {
    try {
      const request = await getWarrantyRequestDetails(requestId);
      return { success: true, request };
    } catch (error: any) {
      return {
        error: error.message || "Lỗi khi lấy chi tiết yêu cầu bảo hành",
      };
    }
  };

  const getWarrantyDetailAction = async (warrantyId: string) => {
    try {
      const warranty = await getWarrantyDetails(warrantyId);
      return { success: true, warranty };
    } catch (error: any) {
      return { error: error.message || "Lỗi khi lấy chi tiết phiếu bảo hành" };
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
        warrantyRequests={warrantyRequests}
        warranties={warranties}
        role={role!}
        updateWarrantyRequestStatusAction={updateWarrantyRequestStatusAction}
        updateWarrantyStatusAction={updateWarrantyStatusAction}
        getWarrantyRequestDetailAction={getWarrantyRequestDetailAction}
        getWarrantyDetailAction={getWarrantyDetailAction}
      />
    </div>
  );
}
