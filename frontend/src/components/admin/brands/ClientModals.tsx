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
import { Brand } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandForm } from "@/components/admin/brands/BrandForm";
import { BrandDetail } from "@/components/admin/brands/BrandDetail";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientModalsProps {
  brands: Brand[];
  role: string;
  addBrandAction: (formData: FormData) => Promise<any>;
  editBrandAction: (id: string, formData: FormData) => Promise<any>;
  deleteBrandAction: (id: string) => Promise<any>;
  getBrandDetailAction: (id: string) => Promise<any>;
}

export default function ClientModals({
  brands,
  role,
  addBrandAction,
  editBrandAction,
  deleteBrandAction,
  getBrandDetailAction,
}: ClientModalsProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc danh sách thương hiệu dựa trên từ khóa tìm kiếm
  const filteredBrands = brands.filter((brand) =>
    [brand.name, brand.slug]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Thêm thương hiệu
  const handleAddBrand = async (data: { name: string }) => {
    setIsAdding(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);

      const result = await addBrandAction(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Thêm thương hiệu thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Thêm thương hiệu thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Sửa thương hiệu
  const handleEditBrand = async (data: { name: string }) => {
    if (!selectedBrand) return;
    setIsEditing(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);

      const result = await editBrandAction(selectedBrand.id, formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Cập nhật thương hiệu thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Cập nhật thương hiệu thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsEditing(false);
    }
  };

  // Xóa thương hiệu
  const handleDeleteBrand = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) {
      setIsDeleting(true);
      try {
        const result = await deleteBrandAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error("Xóa thương hiệu thất bại", {
            description: result.error || "Vui lòng thử lại sau.",
            duration: 2000,
          });
        }
      } catch (error: any) {
        toast.error("Xóa thương hiệu thất bại", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Xem chi tiết thương hiệu
  const handleViewDetail = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getBrandDetailAction(id);
      if (result.success) {
        setSelectedBrand(result.brand);
        setIsDetailOpen(true);
        toast.success("Tải chi tiết thương hiệu thành công");
      } else {
        toast.error("Lỗi khi lấy chi tiết thương hiệu", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết thương hiệu", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsViewing(false);
    }
  };

  // Mở form chỉnh sửa và lấy dữ liệu thương hiệu
  const handleOpenEdit = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getBrandDetailAction(id);
      if (result.success) {
        setSelectedBrand(result.brand);
        setIsEditOpen(true);
        toast.success("Tải thông tin thương hiệu thành công");
      } else {
        toast.error("Lỗi khi lấy thông tin thương hiệu", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy thông tin thương hiệu", {
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
          Quản lý thương hiệu
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm thương hiệu..."
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
      ) : filteredBrands.length === 0 ? (
        <p className="text-center text-gray-500">
          {searchTerm
            ? "Không tìm thấy thương hiệu nào."
            : "Không có thương hiệu nào."}
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
                {filteredBrands.map((brand) => (
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
                          disabled={isLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {role === "Admin" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(brand.id)}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBrand(brand.id)}
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

          {/* Hiển thị dạng danh sách trên mobile */}
          <div className="block md:hidden space-y-4">
            {filteredBrands.map((brand) => (
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
                          onClick={() => handleOpenEdit(brand.id)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBrand(brand.id)}
                          disabled={isLoading}
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

      {/* Modal Thêm thương hiệu */}
      {role === "Admin" && (
        <BrandForm
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSubmit={handleAddBrand}
          isLoading={isAdding}
        />
      )}

      {/* Modal Sửa thương hiệu */}
      {role === "Admin" && (
        <BrandForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleEditBrand}
          initialData={selectedBrand || undefined}
          isLoading={isEditing}
        />
      )}

      {/* Modal Xem chi tiết thương hiệu */}
      <BrandDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        brand={selectedBrand}
      />
    </div>
  );
}
