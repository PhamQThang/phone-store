// app/admin/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logout } from "@/api/auth/authApi";
import { clearAuthData, getAuthData } from "@/lib/authUtils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const authData = getAuthData();
    if (
      !authData?.token ||
      !["Admin", "Employee"].includes(authData.role || "")
    ) {
      clearAuthData();
      router.push("/auth/login");
    } else {
      setRole(authData.role);
    }
  }, [router]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      clearAuthData();
      toast.success("Đăng xuất thành công");
      router.push("/auth/login");
    } catch (error: any) {
      toast.error("Đăng xuất thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
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
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </>
              )}
            </Button>
          </header>

          <main className="flex-1 p-6 bg-gray-100">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
