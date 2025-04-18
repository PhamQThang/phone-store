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
import { Promotion, Product } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PromotionForm } from "@/components/admin/promotions/PromotionForm";
import { PromotionDetail } from "@/components/admin/promotions/PromotionDetail";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientModalsProps {
  promotions: Promotion[];
  products: Product[];
  role: string;
  addPromotionAction: (formData: FormData) => Promise<any>;
  editPromotionAction: (id: string, formData: FormData) => Promise<any>;
  deletePromotionAction: (id: string) => Promise<any>;
  getPromotionDetailAction: (id: string) => Promise<any>;
  addProductToPromotionAction: (
    promotionId: string,
    productId: string
  ) => Promise<any>;
  removeProductFromPromotionAction: (
    promotionId: string,
    productId: string
  ) => Promise<any>;
  checkPromotionStatusAction: (id: string) => Promise<any>;
}

export default function ClientModals({
  promotions,
  products,
  role,
  addPromotionAction,
  editPromotionAction,
  deletePromotionAction,
  getPromotionDetailAction,
  addProductToPromotionAction,
  removeProductFromPromotionAction,
  checkPromotionStatusAction,
}: ClientModalsProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPromotions = promotions.filter((promotion) =>
    [promotion.code, promotion.description || ""]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleAddPromotion = async (data: {
    code?: string;
    description?: string;
    discount?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    productIds?: string[];
  }) => {
    setIsAdding(true);
    try {
      const formData = new FormData();
      if (data.code) formData.append("code", data.code);
      if (data.description) formData.append("description", data.description);
      if (data.discount) formData.append("discount", data.discount.toString());
      if (data.startDate) formData.append("startDate", data.startDate);
      if (data.endDate) formData.append("endDate", data.endDate);
      formData.append("isActive", (data.isActive ?? true).toString());
      if (data.productIds) {
        data.productIds.forEach((id) => formData.append("productIds[]", id));
      }

      const result = await addPromotionAction(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Thêm khuyến mãi thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Thêm khuyến mãi thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditPromotion = async (data: {
    code?: string;
    description?: string;
    discount?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    productIds?: string[];
  }) => {
    if (!selectedPromotion) return;
    setIsEditing(true);
    try {
      const formData = new FormData();
      if (data.code) formData.append("code", data.code);
      if (data.description !== undefined)
        formData.append("description", data.description);
      if (data.discount) formData.append("discount", data.discount.toString());
      if (data.startDate) formData.append("startDate", data.startDate);
      if (data.endDate) formData.append("endDate", data.endDate);
      if (data.isActive !== undefined)
        formData.append("isActive", data.isActive.toString());

      const result = await editPromotionAction(selectedPromotion.id, formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Cập nhật khuyến mãi thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Cập nhật khuyến mãi thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
      setIsDeleting(true);
      try {
        const result = await deletePromotionAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error("Xóa khuyến mãi thất bại", {
            description: result.error || "Vui lòng thử lại sau.",
            duration: 2000,
          });
        }
      } catch (error: any) {
        toast.error("Xóa khuyến mãi thất bại", {
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
      const result = await getPromotionDetailAction(id);
      if (result.success) {
        setSelectedPromotion(result.promotion);
        setIsDetailOpen(true);
        toast.success("Tải chi tiết khuyến mãi thành công");
      } else {
        toast.error("Lỗi khi lấy chi tiết khuyến mãi", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết khuyến mãi", {
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
      const result = await getPromotionDetailAction(id);
      if (result.success) {
        setSelectedPromotion(result.promotion);
        setIsEditOpen(true);
        toast.success("Tải thông tin khuyến mãi thành công");
      } else {
        toast.error("Lỗi khi lấy thông tin khuyến mãi", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy thông tin khuyến mãi", {
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
          Quản lý khuyến mãi
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm khuyến mãi..."
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
      ) : filteredPromotions.length === 0 ? (
        <p className="text-center text-gray-500">
          {searchTerm
            ? "Không tìm thấy khuyến mãi nào."
            : "Không có khuyến mãi nào."}
        </p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">ID</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Mã khuyến mãi
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Mô tả</TableHead>
                  <TableHead className="text-xs sm:text-sm">Giảm giá</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Ngày tạo</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {promotion.id}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {promotion.code}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {promotion.description || "-"}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {promotion.discount} VNĐ
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {promotion.isActive ? "Hoạt động" : "Không hoạt động"}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(promotion.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(promotion.id)}
                          disabled={isLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {role === "Admin" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(promotion.id)}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeletePromotion(promotion.id)
                              }
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
            {filteredPromotions.map((promotion) => (
              <Card key={promotion.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {promotion.code}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <p>
                    <strong>ID:</strong> {promotion.id}
                  </p>
                  <p>
                    <strong>Mô tả:</strong> {promotion.description || "-"}
                  </p>
                  <p>
                    <strong>Giảm giá:</strong> {promotion.discount} VNĐ
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {promotion.isActive ? "Hoạt động" : "Không hoạt động"}
                  </p>
                  <p>
                    <strong>Ngày tạo:</strong>{" "}
                    {new Date(promotion.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(promotion.id)}
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
                          onClick={() => handleOpenEdit(promotion.id)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePromotion(promotion.id)}
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

      {role === "Admin" && (
        <PromotionForm
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSubmit={handleAddPromotion}
          products={products}
          isLoading={isAdding}
          addProductToPromotionAction={addProductToPromotionAction}
          removeProductFromPromotionAction={removeProductFromPromotionAction}
          getPromotionDetailAction={getPromotionDetailAction}
        />
      )}

      {role === "Admin" && (
        <PromotionForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleEditPromotion}
          initialData={selectedPromotion || undefined}
          products={products}
          isLoading={isEditing}
          checkPromotionStatusAction={checkPromotionStatusAction}
          addProductToPromotionAction={addProductToPromotionAction}
          removeProductFromPromotionAction={removeProductFromPromotionAction}
          getPromotionDetailAction={getPromotionDetailAction}
        />
      )}

      <PromotionDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        promotion={selectedPromotion}
        products={products}
        role={role}
        checkPromotionStatusAction={checkPromotionStatusAction}
      />
    </div>
  );
}
