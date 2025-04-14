// app/admin/layout.tsx
import { redirect } from "next/navigation";
import { logout } from "@/api/auth/authApi";
import ClientAdminLayout from "@/components/admin/ClientAdminLayout";
import { getCookieValue, clearCookies } from "@/lib/cookieUtils";

// Hàm bất đồng bộ để kiểm tra cookies và quyền truy cập
async function checkAccess() {
  const role = await getCookieValue("role");

  if (!role || (role !== "Admin" && role !== "Employee")) {
    await clearCookies(); // Xóa cookies nếu không có quyền
    redirect("/auth/login");
  }

  return role;
}

// Server Action để xử lý đăng xuất
async function handleLogoutAction() {
  "use server";
  try {
    await logout(); // Gọi API logout
  } catch (error: any) {
    console.error("Lỗi khi đăng xuất:", error.message);
  }

  await clearCookies(); // Xóa tất cả cookies
  redirect("/auth/login"); // Redirect đến trang đăng nhập
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Kiểm tra quyền truy cập trên server
  const role = await checkAccess();

  return (
    <ClientAdminLayout role={role} handleLogoutAction={handleLogoutAction}>
      {children}
    </ClientAdminLayout>
  );
}
