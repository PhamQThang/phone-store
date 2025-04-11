// app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { logout } from "@/api/auth/authApi";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  const clearLocalStorage = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
  };

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    setRole(userRole);

    if (!userRole || (userRole !== "Admin" && userRole !== "Employee")) {
      toast.error("Không có quyền truy cập", {
        description: "Chỉ Admin và Nhân viên mới được truy cập khu vực này.",
        duration: 2000,
      });
      clearLocalStorage(); // Xóa localStorage trước khi chuyển hướng
      router.push("/auth/login");
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công", {
        description: "Bạn đã đăng xuất khỏi hệ thống.",
        duration: 2000,
      });
      clearLocalStorage();
      router.push("/auth/login");
    } catch (error: any) {
      toast.error("Đăng xuất thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  if (!role) {
    return <p>Đang kiểm tra quyền truy cập...</p>;
  }

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AppSidebar role={role} />

        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow p-4 flex justify-between items-center">
            <div className="flex items-center">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold ml-4">Khu vực quản trị</h1>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </header>

          <main className="flex-1 p-6 bg-gray-100">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
