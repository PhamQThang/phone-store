"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import {
  getUsers,
  getUserById,
  updateUser,
  softDeleteUser,
  restoreUser,
} from "@/api/admin/usersApi";
import ClientModals from "@/components/admin/users/ClientModals";
import { getAuthData, clearAuthData } from "@/lib/authUtils";
import { Loader2 } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Kiểm tra auth và lấy dữ liệu khi component mount
  useEffect(() => {
    const authData = getAuthData();
    if (!authData || !["Admin"].includes(authData.role || "")) {
      clearAuthData();
      router.push("/auth/login");
    } else {
      setRole(authData.role);
      let isMounted = true;

      startTransition(async () => {
        try {
          const allUsers = await getUsers();
          console.log("allUsers", allUsers);

          if (isMounted) {
            setUsers(allUsers);
          }
        } catch (error) {
          console.error("Lỗi khi lấy danh sách người dùng:", error);
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

  const updateUserAction = async (id: number, formData: FormData) => {
    const firstName = formData.get("firstName")?.toString();
    const lastName = formData.get("lastName")?.toString();
    const address = formData.get("address")?.toString();
    const phoneNumber = formData.get("phoneNumber")?.toString();
    const password = formData.get("password")?.toString();

    // Validation
    if (firstName && firstName.length < 2) {
      return { error: "Tên phải có ít nhất 2 ký tự" };
    }
    if (lastName && lastName.length < 2) {
      return { error: "Họ phải có ít nhất 2 ký tự" };
    }
    if (password && password.length < 5) {
      return { error: "Mật khẩu phải có ít nhất 5 ký tự" };
    }

    try {
      const updatedUser = await updateUser(id, {
        firstName,
        lastName,
        address,
        phoneNumber,
        password,
      });
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user))
      );
      return {
        success: true,
        message: "Cập nhật người dùng thành công",
        user: updatedUser,
      };
    } catch (error: any) {
      return {
        error: error.message || "Cập nhật người dùng thất bại",
      };
    }
  };

  const deleteUserAction = async (id: number) => {
    try {
      await softDeleteUser(id);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id
            ? { ...user, isActive: false, deletedAt: new Date().toISOString() }
            : user
        )
      );
      return { success: true, message: "Xóa mềm người dùng thành công" };
    } catch (error: any) {
      return {
        error: error.message || "Xóa người dùng thất bại",
      };
    }
  };

  const restoreUserAction = async (id: number) => {
    try {
      await restoreUser(id);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id
            ? { ...user, isActive: true, deletedAt: undefined }
            : user
        )
      );
      return { success: true, message: "Khôi phục người dùng thành công" };
    } catch (error: any) {
      return {
        error: error.message || "Khôi phục người dùng thất bại",
      };
    }
  };

  const getUserDetailAction = async (id: number) => {
    try {
      const user = await getUserById(id);
      return { success: true, user };
    } catch (error: any) {
      return { error: error.message || "Lỗi khi lấy chi tiết người dùng" };
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
      <ClientModals
        users={users}
        role={role!}
        updateUserAction={updateUserAction}
        deleteUserAction={deleteUserAction}
        restoreUserAction={restoreUserAction}
        getUserDetailAction={getUserDetailAction}
      />
    </div>
  );
}
