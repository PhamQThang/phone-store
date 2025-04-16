"use client";

import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { clearClientCookies } from "@/lib/clientCookieUtils";

interface ClientAdminLayoutProps {
  children: React.ReactNode;
  role: string;
  handleLogoutAction: () => Promise<void>;
}

export default function ClientAdminLayout({
  children,
  role,
  handleLogoutAction,
}: ClientAdminLayoutProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await handleLogoutAction();
      clearClientCookies();
      toast.success("Đăng xuất thành công", {
        description: "Bạn đã đăng xuất khỏi hệ thống.",
        duration: 2000,
      });
    } catch (error: any) {
      toast.error("Đăng xuất thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <form action={handleLogout}>
              <Button type="submit" variant="destructive" disabled={isLoading}>
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
            </form>
          </header>

          <main className="flex-1 p-6 bg-gray-100">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
