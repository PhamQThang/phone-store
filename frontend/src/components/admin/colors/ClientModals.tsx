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
import { Color } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorForm } from "@/components/admin/colors/ColorForm";
import { ColorDetail } from "@/components/admin/colors/ColorDetail";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientModalsProps {
  colors: Color[];
  role: string;
  addColorAction: (formData: FormData) => Promise<any>;
  editColorAction: (id: string, formData: FormData) => Promise<any>;
  deleteColorAction: (id: string) => Promise<any>;
  getColorDetailAction: (id: string) => Promise<any>;
}

export default function ClientModals({
  colors,
  role,
  addColorAction,
  editColorAction,
  deleteColorAction,
  getColorDetailAction,
}: ClientModalsProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc danh sách màu sắc dựa trên từ khóa tìm kiếm
  const filteredColors = colors.filter((color) =>
    color.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Thêm màu sắc
  const handleAddColor = async (formData: FormData) => {
    setIsAdding(true);
    try {
      const result = await addColorAction(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Thêm màu sắc thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Thêm màu sắc thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Sửa màu sắc
  const handleEditColor = async (formData: FormData) => {
    if (!selectedColor) return;
    setIsEditing(true);
    try {
      const result = await editColorAction(selectedColor.id, formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Cập nhật màu sắc thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Cập nhật màu sắc thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsEditing(false);
    }
  };

  // Xóa màu sắc
  const handleDeleteColor = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa màu sắc này?")) {
      setIsDeleting(true);
      try {
        const result = await deleteColorAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error("Xóa màu sắc thất bại", {
            description: result.error || "Vui lòng thử lại sau.",
            duration: 2000,
          });
        }
      } catch (error: any) {
        toast.error("Xóa màu sắc thất bại", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Xem chi tiết màu sắc
  const handleViewDetail = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getColorDetailAction(id);
      if (result.success) {
        setSelectedColor(result.color);
        setIsDetailOpen(true);
        toast.success("Tải chi tiết màu sắc thành công");
      } else {
        toast.error("Lỗi khi lấy chi tiết màu sắc", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết màu sắc", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsViewing(false);
    }
  };

  // Mở form chỉnh sửa và lấy dữ liệu màu sắc
  const handleOpenEdit = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getColorDetailAction(id);
      if (result.success) {
        setSelectedColor(result.color);
        setIsEditOpen(true);
        toast.success("Tải thông tin màu sắc thành công");
      } else {
        toast.error("Lỗi khi lấy thông tin màu sắc", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy thông tin màu sắc", {
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
          Quản lý màu sắc
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm màu sắc..."
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
      ) : filteredColors.length === 0 ? (
        <p className="text-center text-gray-500">
          {searchTerm ? "Không tìm thấy màu sắc nào." : "Không có màu sắc nào."}
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
                    Tên màu sắc
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Ngày tạo</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColors.map((color) => (
                  <TableRow key={color.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {color.id}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {color.name}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(color.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(color.id)}
                          disabled={isLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {role === "Admin" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(color.id)}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteColor(color.id)}
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
            {filteredColors.map((color) => (
              <Card key={color.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {color.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <p>
                    <strong>ID:</strong> {color.id}
                  </p>
                  <p>
                    <strong>Ngày tạo:</strong>{" "}
                    {new Date(color.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(color.id)}
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
                          onClick={() => handleOpenEdit(color.id)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteColor(color.id)}
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

      {/* Modal Thêm màu sắc */}
      {role === "Admin" && (
        <ColorForm
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSubmit={handleAddColor}
          isLoading={isAdding}
        />
      )}

      {/* Modal Sửa màu sắc */}
      {role === "Admin" && (
        <ColorForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleEditColor}
          initialData={selectedColor || undefined}
          isLoading={isEditing}
        />
      )}

      {/* Modal Xem chi tiết màu sắc */}
      <ColorDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        color={selectedColor}
      />
    </div>
  );
}
