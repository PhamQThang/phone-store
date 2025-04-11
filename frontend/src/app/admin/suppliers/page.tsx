// app/admin/suppliers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Edit, Trash, Eye, Plus } from "lucide-react";
import {
  Supplier,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierById,
} from "@/api/admin/suppliersApi";
import { SupplierForm } from "@/components/admin/suppliers/SupplierForm";
import { SupplierDetail } from "@/components/admin/suppliers/SupplierDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearLocalStorage } from "@/lib/utils";

export default function SuppliersPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    setRole(userRole);

    if (!userRole || userRole !== "Admin") {
      toast.error("Không có quyền truy cập", {
        description: "Chỉ Admin mới được truy cập trang này.",
        duration: 2000,
      });
      clearLocalStorage();
      router.push("/auth/login");
    } else {
      fetchSuppliers();
    }
  }, [router]);

  // Lấy danh sách nhà cung cấp
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error: any) {
      toast.error("Lỗi khi lấy danh sách nhà cung cấp", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Thêm nhà cung cấp
  const handleAddSupplier = async (data: {
    name: string;
    address: string;
    phone: string;
    email?: string;
  }) => {
    try {
      const newSupplier = await createSupplier(data);
      setSuppliers([...suppliers, newSupplier]);
      toast.success("Thêm nhà cung cấp thành công");
    } catch (error: any) {
      toast.error("Thêm nhà cung cấp thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  // Sửa nhà cung cấp
  const handleEditSupplier = async (data: {
    name: string;
    address: string;
    phone: string;
    email?: string;
  }) => {
    if (!selectedSupplier) return;
    try {
      const updatedSupplier = await updateSupplier(selectedSupplier.id, data);
      setSuppliers(
        suppliers.map((supplier) =>
          supplier.id === updatedSupplier.id ? updatedSupplier : supplier
        )
      );
      toast.success("Cập nhật nhà cung cấp thành công");
    } catch (error: any) {
      toast.error("Cập nhật nhà cung cấp thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  // Xóa nhà cung cấp
  const handleDeleteSupplier = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
      try {
        await deleteSupplier(id);
        setSuppliers(suppliers.filter((supplier) => supplier.id !== id));
        toast.success("Xóa nhà cung cấp thành công");
      } catch (error: any) {
        toast.error("Xóa nhà cung cấp thất bại", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    }
  };

  // Xem chi tiết nhà cung cấp
  const handleViewDetail = async (id: string) => {
    try {
      const supplier = await getSupplierById(id);
      setSelectedSupplier(supplier);
      setIsDetailOpen(true);
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết nhà cung cấp", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  if (!role) {
    return (
      <p className="text-center text-gray-500">
        Đang kiểm tra quyền truy cập...
      </p>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-0">
          Quản lý nhà cung cấp
        </h2>
        {role === "Admin" && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Đang tải...</p>
      ) : suppliers.length === 0 ? (
        <p className="text-center text-gray-500">Không có nhà cung cấp nào.</p>
      ) : (
        <>
          {/* Hiển thị dạng bảng trên màn hình lớn (PC, tablet) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">ID</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Tên nhà cung cấp
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Địa chỉ</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Số điện thoại
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Email</TableHead>
                  <TableHead className="text-xs sm:text-sm">Ngày tạo</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
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
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {role === "Admin" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setIsEditOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSupplier(supplier.id)}
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

          {/* Hiển thị dạng danh sách trên mobile */}
          <div className="block md:hidden space-y-4">
            {suppliers.map((supplier) => (
              <Card key={supplier.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {supplier.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
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
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(supplier.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Xem
                    </Button>
                    {role === "Admin" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setIsEditOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSupplier(supplier.id)}
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

      {/* Modal Thêm nhà cung cấp */}
      {role === "Admin" && (
        <SupplierForm
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSubmit={handleAddSupplier}
        />
      )}

      {/* Modal Sửa nhà cung cấp */}
      {role === "Admin" && (
        <SupplierForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleEditSupplier}
          initialData={selectedSupplier || undefined}
        />
      )}

      {/* Modal Xem chi tiết nhà cung cấp */}
      <SupplierDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        supplier={selectedSupplier}
      />
    </div>
  );
}
