"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Supplier } from "@/lib/types";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierById,
} from "@/api/admin/suppliersApi";
import { getAuthData, clearAuthData } from "@/lib/authUtils";
import { Loader2 } from "lucide-react";
import ClientSuppliers from "@/components/admin/suppliers/ClientModals";

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const authData = getAuthData();
    if (!authData || authData.role !== "Admin") {
      clearAuthData();
      router.push("/auth/login");
    } else {
      setRole(authData.role);
      let isMounted = true;

      startTransition(async () => {
        try {
          const suppliersData = await getSuppliers();
          if (isMounted) {
            setSuppliers(suppliersData);
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

  const addSupplierAction = async (formData: FormData) => {
    const name = formData.get("name")?.toString();
    const address = formData.get("address")?.toString();
    const phone = formData.get("phone")?.toString();

    if (!name || name.length < 2) {
      return { error: "Tên nhà cung cấp phải có ít nhất 2 ký tự" };
    }
    if (!address || address.length < 5) {
      return { error: "Địa chỉ phải có ít nhất 5 ký tự" };
    }
    if (!phone || !/^[0-9]{10,11}$/.test(phone)) {
      return { error: "Số điện thoại phải có 10-11 chữ số" };
    }

    try {
      const newSupplier = await createSupplier(formData);
      setSuppliers((prev) => [newSupplier, ...prev]);
      return {
        success: true,
        message: "Thêm nhà cung cấp thành công",
        supplier: newSupplier,
      };
    } catch (error: any) {
      return {
        error: error.message || "Thêm nhà cung cấp thất bại",
      };
    }
  };

  const editSupplierAction = async (id: string, formData: FormData) => {
    const name = formData.get("name")?.toString();
    const address = formData.get("address")?.toString();
    const phone = formData.get("phone")?.toString();

    if (!name || name.length < 2) {
      return { error: "Tên nhà cung cấp phải có ít nhất 2 ký tự" };
    }
    if (!address || address.length < 5) {
      return { error: "Địa chỉ phải có ít nhất 5 ký tự" };
    }
    if (!phone || !/^[0-9]{10,11}$/.test(phone)) {
      return { error: "Số điện thoại phải có 10-11 chữ số" };
    }

    try {
      const updatedSupplier = await updateSupplier(id, formData);
      setSuppliers((prev) =>
        prev.map((supplier) =>
          supplier.id === id ? updatedSupplier : supplier
        )
      );
      return {
        success: true,
        message: "Cập nhật nhà cung cấp thành công",
        supplier: updatedSupplier,
      };
    } catch (error: any) {
      return {
        error: error.message || "Cập nhật nhà cung cấp thất bại",
      };
    }
  };

  const deleteSupplierAction = async (id: string) => {
    try {
      await deleteSupplier(id);
      setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
      return { success: true, message: "Xóa nhà cung cấp thành công" };
    } catch (error: any) {
      return {
        error: error.message || "Xóa nhà cung cấp thất bại",
      };
    }
  };

  const getSupplierDetailAction = async (id: string) => {
    try {
      const supplier = await getSupplierById(id);
      return { success: true, supplier };
    } catch (error: any) {
      return { error: error.message || "Lỗi khi lấy chi tiết nhà cung cấp" };
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
      <ClientSuppliers
        suppliers={suppliers}
        role={role!}
        addSupplierAction={addSupplierAction}
        editSupplierAction={editSupplierAction}
        deleteSupplierAction={deleteSupplierAction}
        getSupplierDetailAction={getSupplierDetailAction}
      />
    </div>
  );
}
