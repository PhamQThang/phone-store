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
import { Edit, Trash, Eye, Plus, Search, X } from "lucide-react";
import { Supplier } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupplierForm } from "@/components/admin/suppliers/SupplierForm";
import { SupplierDetail } from "@/components/admin/suppliers/SupplierDetail";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientSuppliersProps {
  suppliers: Supplier[];
  role: string;
  addSupplierAction: (formData: FormData) => Promise<any>;
  editSupplierAction: (id: string, formData: FormData) => Promise<any>;
  deleteSupplierAction: (id: string) => Promise<any>;
  getSupplierDetailAction: (id: string) => Promise<any>;
}

export default function ClientSuppliers({
  suppliers,
  role,
  addSupplierAction,
  editSupplierAction,
  deleteSupplierAction,
  getSupplierDetailAction,
}: ClientSuppliersProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSuppliers = suppliers.filter((supplier) =>
    [supplier.name, supplier.address, supplier.phone, supplier.email || ""]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleAddSupplier = async (formData: FormData) => {
    setIsAdding(true);
    try {
      const result = await addSupplierAction(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Thêm nhà cung cấp thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Thêm nhà cung cấp thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditSupplier = async (formData: FormData) => {
    if (!selectedSupplier) return;
    setIsEditing(true);
    try {
      const result = await editSupplierAction(selectedSupplier.id, formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Cập nhật nhà cung cấp thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Cập nhật nhà cung cấp thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
      setIsDeleting(true);
      try {
        const result = await deleteSupplierAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error("Xóa nhà cung cấp thất bại", {
            description: result.error || "Vui lòng thử lại sau.",
            duration: 2000,
          });
        }
      } catch (error: any) {
        toast.error("Xóa nhà cung cấp thất bại", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleViewDetail = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getSupplierDetailAction(id);
      if (result.success) {
        setSelectedSupplier(result.supplier);
        setIsDetailOpen(true);
        toast.success("Tải chi tiết nhà cung cấp thành công");
      } else {
        toast.error("Lỗi khi lấy chi tiết nhà cung cấp", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết nhà cung cấp", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsViewing(false);
    }
  };

  const handleOpenEdit = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getSupplierDetailAction(id);
      if (result.success) {
        setSelectedSupplier(result.supplier);
        setIsEditOpen(true);
        toast.success("Tải thông tin nhà cung cấp thành công");
      } else {
        toast.error("Lỗi khi lấy thông tin nhà cung cấp", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy thông tin nhà cung cấp", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsViewing(false);
    }
  };

  const isLoading = isAdding || isEditing || isDeleting || isViewing;

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          Quản lý nhà cung cấp
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm nhà cung cấp..."
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
              onClick={() => setIsAddOpen(true)}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm
            </Button>
          )}
        </div>
      </div>

      {isLoading && !isAdding && !isEditing ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <p className="text-center text-gray-500">
          {searchTerm
            ? "Không tìm thấy nhà cung cấp nào."
            : "Không có nhà cung cấp nào."}
        </p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm min-w-[80px]">
                    ID
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[150px]">
                    Tên nhà cung cấp
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[200px]">
                    Địa chỉ
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[120px]">
                    Số điện thoại
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[150px]">
                    Email
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[100px]">
                    Ngày tạo
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-[120px]">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {supplier.id}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {supplier.name}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {supplier.address}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {supplier.phone}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {supplier.email || "Không có"}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(supplier.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(supplier.id)}
                          disabled={isLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {role === "Admin" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(supplier.id)}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              disabled={isLoading}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="block md:hidden space-y-4">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {supplier.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-3">
                  <p>
                    <strong>ID:</strong> {supplier.id}
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong> {supplier.address}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {supplier.phone}
                  </p>
                  <p>
                    <strong>Email:</strong> {supplier.email || "Không có"}
                  </p>
                  <p>
                    <strong>Ngày tạo:</strong>{" "}
                    {new Date(supplier.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(supplier.id)}
                      disabled={isLoading}
                      className="flex-1 min-w-[80px]"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Xem
                    </Button>
                    {role === "Admin" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(supplier.id)}
                          disabled={isLoading}
                          className="flex-1 min-w-[80px]"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          disabled={isLoading}
                          className="flex-1 min-w-[80px]"
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {role === "Admin" && (
        <>
          <SupplierForm
            open={isAddOpen}
            onOpenChange={setIsAddOpen}
            onSubmit={handleAddSupplier}
            isLoading={isAdding}
          />
          <SupplierForm
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            onSubmit={handleEditSupplier}
            initialData={selectedSupplier || undefined}
            isLoading={isEditing}
          />
        </>
      )}

      <SupplierDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        supplier={selectedSupplier}
      />
    </div>
  );
}
