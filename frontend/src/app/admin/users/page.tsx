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
import { register } from "@/api/auth/authApi";

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

  const createUserAction = async (formData: FormData) => {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const fullName = formData.get("fullName")?.toString();
    const address = formData.get("address")?.toString();
    const phoneNumber = formData.get("phoneNumber")?.toString();
    const roleId = parseInt(formData.get("roleId")?.toString() || "0");

    // Validation
    if (!email || !email.includes("@")) {
      return { error: "Email không hợp lệ" };
    }
    if (!password || password.length < 5) {
      return { error: "Mật khẩu phải có ít nhất 5 ký tự" };
    }
    if (!fullName || fullName.length < 2) {
      return { error: "Họ và tên phải có ít nhất 2 ký tự" };
    }
    if (!address) {
      return { error: "Địa chỉ không được để trống" };
    }
    if (!phoneNumber) {
      return { error: "Số điện thoại không được để trống" };
    }
    if (!roleId) {
      return { error: "Vui lòng chọn vai trò" };
    }

    try {
      const response = await register({
        email,
        password,
        fullName,
        address,
        phoneNumber,
        roleId,
      });
      const newUser: User = {
        id: response.user.id,
        email: response.user.email,
        fullName: response.user.fullName,
        address: response.user.address,
        phoneNumber: response.user.phoneNumber,
        role: { id: roleId, name: response.user.role },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        deletedAt: null,
      };
      setUsers((prev) => [newUser, ...prev]);
      return {
        success: true,
        message: "Tạo người dùng thành công",
      };
    } catch (error: any) {
      return {
        error: error.message || "Tạo người dùng thất bại",
      };
    }
  };

  const updateUserAction = async (id: number, formData: FormData) => {
    const fullName = formData.get("fullName")?.toString();
    const address = formData.get("address")?.toString();
    const phoneNumber = formData.get("phoneNumber")?.toString();
    const password = formData.get("password")?.toString();

    // Validation
    if (fullName && fullName.length < 2) {
      return { error: "Họ và tên phải có ít nhất 2 ký tự" };
    }
    if (password && password.length < 5) {
      return { error: "Mật khẩu phải có ít nhất 5 ký tự" };
    }

    try {
      const updatedUser = await updateUser(id, {
        fullName,
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
        createUserAction={createUserAction}
        updateUserAction={updateUserAction}
        deleteUserAction={deleteUserAction}
        restoreUserAction={restoreUserAction}
        getUserDetailAction={getUserDetailAction}
      />
    </div>
  );
}
