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
import { Slide } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlideForm } from "@/components/admin/slides/SlideForm";
import { SlideDetail } from "@/components/admin/slides/SlideDetail";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientSlidesProps {
  slides: Slide[];
  role: string;
  addSlideAction: (formData: FormData) => Promise<any>;
  editSlideAction: (id: string, formData: FormData) => Promise<any>;
  deleteSlideAction: (id: string) => Promise<any>;
  getSlideDetailAction: (id: string) => Promise<any>;
}

export default function ClientSlides({
  slides,
  role,
  addSlideAction,
  editSlideAction,
  deleteSlideAction,
  getSlideDetailAction,
}: ClientSlidesProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSlides = slides.filter((slide) =>
    [
      slide.title || "",
      slide.link || "",
      slide.isActive ? "Hoạt động" : "Không hoạt động",
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleAddSlide = async (data: {
    title?: string;
    link?: string;
    isActive: boolean;
    displayOrder: number;
    file: File | null;
    currentImage?: string;
  }) => {
    setIsAdding(true);
    try {
      const formData = new FormData();
      if (data.title) formData.append("title", data.title);
      if (data.link) formData.append("link", data.link);
      formData.append("isActive", data.isActive.toString());
      formData.append("displayOrder", data.displayOrder.toString());
      if (data.file) formData.append("file", data.file);
      if (data.currentImage) formData.append("currentImage", data.currentImage);

      const result = await addSlideAction(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Thêm slide thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Thêm slide thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditSlide = async (data: {
    title?: string;
    link?: string;
    isActive: boolean;
    displayOrder: number;
    file: File | null;
    currentImage?: string;
  }) => {
    if (!selectedSlide) return;
    setIsEditing(true);
    try {
      const formData = new FormData();
      if (data.title) formData.append("title", data.title);
      if (data.link) formData.append("link", data.link);
      formData.append("isActive", data.isActive.toString());
      formData.append("displayOrder", data.displayOrder.toString());
      if (data.file) formData.append("file", data.file);
      if (data.currentImage) formData.append("currentImage", data.currentImage);

      const result = await editSlideAction(selectedSlide.id, formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Cập nhật slide thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Cập nhật slide thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa slide này?")) {
      setIsDeleting(true);
      try {
        const result = await deleteSlideAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error("Xóa slide thất bại", {
            description: result.error || "Vui lòng thử lại sau.",
            duration: 2000,
          });
        }
      } catch (error: any) {
        toast.error("Xóa slide thất bại", {
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
      const result = await getSlideDetailAction(id);
      if (result.success) {
        setSelectedSlide(result.slide);
        setIsDetailOpen(true);
        toast.success("Tải chi tiết slide thành công");
      } else {
        toast.error("Lỗi khi lấy chi tiết slide", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết slide", {
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
      const result = await getSlideDetailAction(id);
      if (result.success) {
        setSelectedSlide(result.slide);
        setIsEditOpen(true);
        toast.success("Tải thông tin slide thành công");
      } else {
        toast.error("Lỗi khi lấy thông tin slide", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy thông tin slide", {
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
          Quản lý Slide
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm slide..."
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
      ) : filteredSlides.length === 0 ? (
        <p className="text-center text-gray-500">
          {searchTerm ? "Không tìm thấy slide nào." : "Không có slide nào."}
        </p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Tiêu đề</TableHead>
                  <TableHead className="text-xs sm:text-sm">Link</TableHead>
                  <TableHead className="text-xs sm:text-sm">Hình ảnh</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Thứ tự hiển thị
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Ngày tạo</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSlides.map((slide) => (
                  <TableRow key={slide.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {slide.title || "N/A"}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {slide.link || "N/A"}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <img
                        src={slide.image.url}
                        alt={slide.title || "Slide"}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {slide.isActive ? "Hoạt động" : "Không hoạt động"}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {slide.displayOrder}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(slide.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(slide.id)}
                          disabled={isLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {role === "Admin" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(slide.id)}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSlide(slide.id)}
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
            {filteredSlides.map((slide) => (
              <Card key={slide.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {slide.title || "Không có tiêu đề"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <p>
                    <strong>ID:</strong> {slide.id}
                  </p>
                  <p>
                    <strong>Link:</strong> {slide.link || "N/A"}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {slide.isActive ? "Hoạt động" : "Không hoạt động"}
                  </p>
                  <p>
                    <strong>Thứ tự hiển thị:</strong> {slide.displayOrder}
                  </p>
                  <p>
                    <strong>Ngày tạo:</strong>{" "}
                    {new Date(slide.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-center">
                    <img
                      src={slide.image.url}
                      alt={slide.title || "Slide"}
                      className="w-32 h-32 object-cover rounded"
                    />
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(slide.id)}
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
                          onClick={() => handleOpenEdit(slide.id)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSlide(slide.id)}
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
        <>
          <SlideForm
            open={isAddOpen}
            onOpenChange={setIsAddOpen}
            onSubmit={handleAddSlide}
            isLoading={isAdding}
          />
          <SlideForm
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            onSubmit={handleEditSlide}
            initialData={selectedSlide || undefined}
            isLoading={isEditing}
          />
        </>
      )}

      <SlideDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        slide={selectedSlide}
      />
    </div>
  );
}
