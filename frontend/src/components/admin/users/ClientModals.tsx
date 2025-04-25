"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash, Eye, Search, X, RotateCcw, Plus } from "lucide-react";
import { User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "@/components/admin/users/UserForm";
import { UserCreateForm } from "@/components/admin/users/UserCreateForm";
import { UserDetail } from "@/components/admin/users/UserDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Role {
  id: number;
  name: string;
}

interface ClientModalsProps {
  users: User[];
  role: string;
  createUserAction: (formData: FormData) => Promise<any>;
  updateUserAction: (id: number, formData: FormData) => Promise<any>;
  deleteUserAction: (id: number) => Promise<any>;
  restoreUserAction: (id: number) => Promise<any>;
  getUserDetailAction: (id: number) => Promise<any>;
}

export default function ClientModals({
  users,
  role,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  restoreUserAction,
  getUserDetailAction,
}: ClientModalsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Set cứng danh sách roles
  const roles: Role[] = [
    { id: 2, name: "Employee" },
    { id: 3, name: "Customer" },
  ];

  // Lọc danh sách người dùng theo vai trò
  const customers = users.filter((user) => user.role.name === "Customer");
  const employees = users.filter((user) =>
    ["Employee", "Admin"].includes(user.role.name)
  );

  // Lọc danh sách người dùng dựa trên từ khóa tìm kiếm
  const filteredCustomers = customers.filter((user) =>
    [user.email, user.fullName]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredEmployees = employees.filter((user) =>
    [user.email, user.fullName]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Tạo người dùng mới
  const handleCreateUser = async (data: {
    email: string;
    password: string;
    fullName: string;
    address: string;
    phoneNumber: string;
    roleId: number;
  }) => {
    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("fullName", data.fullName);
      formData.append("address", data.address);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("roleId", data.roleId.toString());

      const result = await createUserAction(formData);
      if (result.success) {
        toast.success(result.message);
        setIsCreateOpen(false);
      } else {
        toast.error("Tạo người dùng thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Tạo người dùng thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Sửa người dùng
  const handleEditUser = async (data: {
    fullName: string;
    address?: string;
    phoneNumber?: string;
    password?: string;
  }) => {
    if (!selectedUser) return;
    setIsEditing(true);
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      if (data.address) formData.append("address", data.address);
      if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
      if (data.password) formData.append("password", data.password);

      const result = await updateUserAction(selectedUser.id, formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Cập nhật người dùng thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Cập nhật người dùng thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsEditing(false);
    }
  };

  // Xóa mềm người dùng
  const handleDeleteUser = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa mềm người dùng này?")) {
      setIsDeleting(true);
      try {
        const result = await deleteUserAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error("Xóa người dùng thất bại", {
            description: result.error || "Vui lòng thử lại sau.",
            duration: 2000,
          });
        }
      } catch (error: any) {
        toast.error("Xóa người dùng thất bại", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Khôi phục người dùng
  const handleRestoreUser = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn khôi phục người dùng này?")) {
      setIsRestoring(true);
      try {
        const result = await restoreUserAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error("Khôi phục người dùng thất bại", {
            description: result.error || "Vui lòng thử lại sau.",
            duration: 2000,
          });
        }
      } catch (error: any) {
        toast.error("Khôi phục người dùng thất bại", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      } finally {
        setIsRestoring(false);
      }
    }
  };

  // Xem chi tiết người dùng
  const handleViewDetail = async (id: number) => {
    setIsViewing(true);
    try {
      const result = await getUserDetailAction(id);
      if (result.success) {
        setSelectedUser(result.user);
        setIsDetailOpen(true);
        toast.success("Tải chi tiết người dùng thành công");
      } else {
        toast.error("Lỗi khi lấy chi tiết người dùng", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết người dùng", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsViewing(false);
    }
  };

  // Mở form chỉnh sửa và lấy dữ liệu người dùng
  const handleOpenEdit = async (id: number) => {
    setIsViewing(true);
    try {
      const result = await getUserDetailAction(id);
      if (result.success) {
        setSelectedUser(result.user);
        setIsEditOpen(true);
        toast.success("Tải thông tin người dùng thành công");
      } else {
        toast.error("Lỗi khi lấy thông tin người dùng", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy thông tin người dùng", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsViewing(false);
    }
  };

  const isLoading =
    isEditing || isCreating || isDeleting || isRestoring || isViewing;

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          Quản lý người dùng
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9 text-sm sm:text-base w-full"
              disabled={isLoading}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {role === "Admin" && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo người dùng
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customers">Khách hàng</TabsTrigger>
          <TabsTrigger value="employees">Nhân viên</TabsTrigger>
        </TabsList>

        {/* Tab: Quản lý khách hàng */}
        <TabsContent value="customers">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <p className="text-center text-gray-500">
              {searchTerm
                ? "Không tìm thấy khách hàng nào."
                : "Không có khách hàng nào."}
            </p>
          ) : (
            <>
              {/* Hiển thị dạng bảng trên màn hình lớn (PC, tablet) */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">ID</TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Email
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Họ tên
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Vai trò
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Trạng thái
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Hành động
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-xs sm:text-sm">
                          {user.id}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {user.fullName}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {user.role.name}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {user.isActive ? "Đang hoạt động" : "Đã xóa mềm"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(user.id)}
                              disabled={isLoading}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {role === "Admin" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEdit(user.id)}
                                  disabled={isLoading}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {user.isActive ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={isLoading}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRestoreUser(user.id)}
                                    disabled={isLoading}
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Hiển thị dạng danh sách trên mobile */}
              <div className="block md:hidden space-y-4">
                {filteredCustomers.map((user) => (
                  <Card
                    key={user.id}
                    className={`shadow-sm ${
                      !user.isActive ? "opacity-50" : ""
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        {user.fullName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <p>
                        <strong>ID:</strong> {user.id}
                      </p>
                      <p>
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p>
                        <strong>Vai trò:</strong> {user.role.name}
                      </p>
                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        {user.isActive ? "Đang hoạt động" : "Đã xóa mềm"}
                      </p>
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(user.id)}
                          disabled={isLoading}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        {role === "Admin" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(user.id)}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Sửa
                            </Button>
                            {user.isActive ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={isLoading}
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                Xóa
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestoreUser(user.id)}
                                disabled={isLoading}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Khôi phục
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Tab: Quản lý nhân viên */}
        <TabsContent value="employees">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <p className="text-center text-gray-500">
              {searchTerm
                ? "Không tìm thấy nhân viên nào."
                : "Không có nhân viên nào."}
            </p>
          ) : (
            <>
              {/* Hiển thị dạng bảng trên màn hình lớn (PC, tablet) */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">ID</TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Email
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Họ tên
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Vai trò
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Trạng thái
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Hành động
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-xs sm:text-sm">
                          {user.id}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {user.fullName}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {user.role.name}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {user.isActive ? "Đang hoạt động" : "Đã xóa mềm"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(user.id)}
                              disabled={isLoading}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {role === "Admin" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEdit(user.id)}
                                  disabled={isLoading}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {user.isActive ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={isLoading}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRestoreUser(user.id)}
                                    disabled={isLoading}
                                  >
                                    | <RotateCcw className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Hiển thị dạng danh sách trên mobile */}
              <div className="block md:hidden space-y-4">
                {filteredEmployees.map((user) => (
                  <Card
                    key={user.id}
                    className={`shadow-sm ${
                      !user.isActive ? "opacity-50" : ""
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        {user.fullName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <p>
                        <strong>ID:</strong> {user.id}
                      </p>
                      <p>
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p>
                        <strong>Vai trò:</strong> {user.role.name}
                      </p>
                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        {user.isActive ? "Đang hoạt động" : "Đã xóa mềm"}
                      </p>
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(user.id)}
                          disabled={isLoading}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        {role === "Admin" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(user.id)}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Sửa
                            </Button>
                            {user.isActive ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={isLoading}
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                Xóa
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestoreUser(user.id)}
                                disabled={isLoading}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Khôi phục
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal Tạo người dùng */}
      {role === "Admin" && (
        <UserCreateForm
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreateUser}
          isLoading={isCreating}
          roles={roles}
        />
      )}

      {/* Modal Sửa người dùng */}
      {role === "Admin" && (
        <UserForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleEditUser}
          initialData={selectedUser || undefined}
          isLoading={isEditing}
        />
      )}

      {/* Modal Xem chi tiết người dùng */}
      <UserDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        user={selectedUser}
      />
    </div>
  );
}
