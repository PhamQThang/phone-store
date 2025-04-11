// app/admin/brands/page.tsx
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
import { Edit, Trash, Eye, Plus, Loader2 } from "lucide-react";
import {
  Brand,
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandById,
} from "@/api/admin/brandsApi";
import { BrandForm } from "@/components/admin/brands/BrandForm";
import { BrandDetail } from "@/components/admin/brands/BrandDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearLocalStorage } from "@/lib/utils";

export default function BrandsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    setRole(userRole);

    if (!userRole || (userRole !== "Admin" && userRole !== "Employee")) {
      toast.error("Không có quyền truy cập", {
        description: "Chỉ Admin và Nhân viên mới được truy cập trang này.",
        duration: 2000,
      });
      clearLocalStorage();
      router.push("/auth/login");
    } else {
      fetchBrands();
    }
  }, [router]);

  // Lấy danh sách thương hiệu
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (error: any) {
      toast.error("Lỗi khi lấy danh sách thương hiệu", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Thêm thương hiệu
  const handleAddBrand = async (data: { name: string }) => {
    try {
      const newBrand = await createBrand(data);
      setBrands([...brands, newBrand]);
      toast.success("Thêm thương hiệu thành công");
    } catch (error: any) {
      toast.error("Thêm thương hiệu thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  // Sửa thương hiệu
  const handleEditBrand = async (data: { name: string }) => {
    if (!selectedBrand) return;
    try {
      const updatedBrand = await updateBrand(selectedBrand.id, data);
      setBrands(
        brands.map((brand) =>
          brand.id === updatedBrand.id ? updatedBrand : brand
        )
      );
      toast.success("Cập nhật thương hiệu thành công");
    } catch (error: any) {
      toast.error("Cập nhật thương hiệu thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  // Xóa thương hiệu
  const handleDeleteBrand = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) {
      try {
        await deleteBrand(id);
        setBrands(brands.filter((brand) => brand.id !== id));
        toast.success("Xóa thương hiệu thành công");
      } catch (error: any) {
        toast.error("Xóa thương hiệu thất bại", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    }
  };

  // Xem chi tiết thương hiệu
  const handleViewDetail = async (id: string) => {
    try {
      const brand = await getBrandById(id);
      setSelectedBrand(brand);
      setIsDetailOpen(true);
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết thương hiệu", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  const handleOpenEdit = async (id: string) => {
    try {
      const brand = await getBrandById(id);
      setSelectedBrand(brand);
      setIsEditOpen(true);
    } catch (error: any) {
      toast.error("Lỗi khi lấy thông tin thương hiệu", {
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
          Quản lý thương hiệu
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
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      ) : brands.length === 0 ? (
        <p className="text-center text-gray-500">Không có thương hiệu nào.</p>
      ) : (
        <>
          {/* Hiển thị dạng bảng trên màn hình lớn (PC, tablet) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">ID</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Tên thương hiệu
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Slug</TableHead>
                  <TableHead className="text-xs sm:text-sm">Ngày tạo</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {brand.id}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {brand.name}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {brand.slug}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(brand.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(brand.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {role === "Admin" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(brand.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBrand(brand.id)}
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
            {brands.map((brand) => (
              <Card key={brand.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {brand.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <p>
                    <strong>ID:</strong> {brand.id}
                  </p>
                  <p>
                    <strong>Slug:</strong> {brand.slug}
                  </p>
                  <p>
                    <strong>Ngày tạo:</strong>{" "}
                    {new Date(brand.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(brand.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Xem
                    </Button>
                    {role === "Admin" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(brand.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBrand(brand.id)}
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
        <BrandForm
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSubmit={handleAddBrand}
        />
      )}

      {role === "Admin" && (
        <BrandForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleEditBrand}
          initialData={selectedBrand || undefined}
        />
      )}

      <BrandDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        brand={selectedBrand}
      />
    </div>
  );
}
