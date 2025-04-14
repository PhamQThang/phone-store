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
import { Model, Brand } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelForm } from "@/components/admin/models/ModelForm";
import { ModelDetail } from "@/components/admin/models/ModelDetail";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientModalsProps {
  models: Model[];
  brands: Brand[];
  role: string;
  addModelAction: (formData: FormData) => Promise<any>;
  editModelAction: (id: string, formData: FormData) => Promise<any>;
  deleteModelAction: (id: string) => Promise<any>;
  getModelDetailAction: (id: string) => Promise<any>;
}

export default function ClientModals({
  models,
  brands,
  role,
  addModelAction,
  editModelAction,
  deleteModelAction,
  getModelDetailAction,
}: ClientModalsProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc danh sách model dựa trên từ khóa tìm kiếm
  const filteredModels = models.filter((model) =>
    [model.name, model.slug, model.brand?.name || ""]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Thêm model
  const handleAddModel = async (data: { name: string; brandId: string }) => {
    setIsAdding(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("brandId", data.brandId);

      const result = await addModelAction(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Thêm model thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Thêm model thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Sửa model
  const handleEditModel = async (data: { name: string; brandId: string }) => {
    if (!selectedModel) return;
    setIsEditing(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("brandId", data.brandId);

      const result = await editModelAction(selectedModel.id, formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Cập nhật model thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Cập nhật model thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsEditing(false);
    }
  };

  // Xóa model
  const handleDeleteModel = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa model này?")) {
      setIsDeleting(true);
      try {
        const result = await deleteModelAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error("Xóa model thất bại", {
            description: result.error || "Vui lòng thử lại sau.",
            duration: 2000,
          });
        }
      } catch (error: any) {
        toast.error("Xóa model thất bại", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Xem chi tiết model
  const handleViewDetail = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getModelDetailAction(id);
      if (result.success) {
        setSelectedModel(result.model);
        setIsDetailOpen(true);
      } else {
        toast.error("Lỗi khi lấy chi tiết model", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết model", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsViewing(false);
    }
  };

  // Mở form chỉnh sửa và lấy dữ liệu model
  const handleOpenEdit = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getModelDetailAction(id);
      if (result.success) {
        setSelectedModel(result.model);
        setIsEditOpen(true);
      } else {
        toast.error("Lỗi khi lấy thông tin model", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy thông tin model", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsViewing(false);
    }
  };

  const isLoading = isAdding || isEditing || isDeleting || isViewing;

  return (
    <>
      {/* Header và tìm kiếm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          Quản lý model
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm model..."
              value={searchTerm}
              onChange={(e) => e.target.value}
              className="pl-9 pr-9 text-sm sm:text-base w-full"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
      ) : filteredModels.length === 0 ? (
        <p className="text-center text-gray-500">
          {searchTerm ? "Không tìm thấy model nào." : "Không có model nào."}
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
                    Tên model
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Slug</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Thương hiệu
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Ngày tạo</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {model.id}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {model.name}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {model.slug}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {model.brand?.name || "Không có thương hiệu"}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(model.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(model.id)}
                          disabled={isLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {role === "Admin" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(model.id)}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteModel(model.id)}
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
            {filteredModels.map((model) => (
              <Card key={model.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {model.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <p>
                    <strong>ID:</strong> {model.id}
                  </p>
                  <p>
                    <strong>Slug:</strong> {model.slug}
                  </p>
                  <p>
                    <strong>Thương hiệu:</strong>{" "}
                    {model.brand?.name || "Không có thương hiệu"}
                  </p>
                  <p>
                    <strong>Ngày tạo:</strong>{" "}
                    {new Date(model.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(model.id)}
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
                          onClick={() => handleOpenEdit(model.id)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteModel(model.id)}
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

      {/* Modal Thêm model */}
      {role === "Admin" && (
        <ModelForm
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSubmit={handleAddModel}
          brands={brands}
          isLoading={isAdding}
        />
      )}

      {/* Modal Sửa model */}
      {role === "Admin" && (
        <ModelForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleEditModel}
          initialData={selectedModel || undefined}
          brands={brands}
          isLoading={isEditing}
        />
      )}

      {/* Modal Xem chi tiết model */}
      <ModelDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        model={selectedModel}
      />
    </>
  );
}
