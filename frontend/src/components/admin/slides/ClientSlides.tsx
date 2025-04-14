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
import { Edit, Trash, Eye, Plus, Loader2 } from "lucide-react";
import { Slide } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlideForm } from "@/components/admin/slides/SlideForm";
import { SlideDetail } from "@/components/admin/slides/SlideDetail";

interface ClientSlidesProps {
  slides: Slide[];
  role: string;
  token: string;
  addSlideAction: (formData: FormData) => Promise<any>;
  editSlideAction: (id: string, formData: FormData) => Promise<any>;
  deleteSlideAction: (id: string) => Promise<any>;
  getSlideDetailAction: (id: string) => Promise<any>;
}

export default function ClientSlides({
  slides: initialSlides,
  role,
  token,
  addSlideAction,
  editSlideAction,
  deleteSlideAction,
  getSlideDetailAction,
}: ClientSlidesProps) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  // Thêm Slide
  const handleAddSlide = async (data: {
    title?: string;
    link?: string;
    isActive: boolean;
    displayOrder: number;
    file: File | null;
  }) => {
    setIsAdding(true);
    try {
      const formData = new FormData();
      if (data.title) formData.append("title", data.title);
      if (data.link) formData.append("link", data.link);
      formData.append("isActive", data.isActive.toString());
      formData.append("displayOrder", data.displayOrder.toString());
      if (data.file) formData.append("file", data.file);

      const result = await addSlideAction(formData);
      if (result.success) {
        setSlides([...slides, result.slide]);
        toast.success(result.message);
        setIsAddOpen(false);
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

  // Sửa Slide
  const handleEditSlide = async (data: {
    title?: string;
    link?: string;
    isActive: boolean;
    displayOrder: number;
    file: File | null;
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

      const result = await editSlideAction(selectedSlide.id, formData);
      if (result.success) {
        setSlides(
          slides.map((slide) =>
            slide.id === result.slide.id ? result.slide : slide
          )
        );
        toast.success(result.message);
        setIsEditOpen(false);
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

  // Xóa Slide
  const handleDeleteSlide = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa slide này?")) {
      setIsDeleting(true);
      try {
        const result = await deleteSlideAction(id);
        if (result.success) {
          setSlides(slides.filter((slide) => slide.id !== id));
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

  // Xem chi tiết Slide
  const handleViewDetail = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getSlideDetailAction(id);
      if (result.success) {
        setSelectedSlide(result.slide);
        setIsDetailOpen(true);
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

  // Mở form chỉnh sửa và lấy dữ liệu Slide
  const handleOpenEdit = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getSlideDetailAction(id);
      if (result.success) {
        setSelectedSlide(result.slide);
        setIsEditOpen(true);
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

  const isLoading = loading || isAdding || isEditing || isDeleting || isViewing;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-0">
          Quản lý Slide
        </h2>
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

      {isLoading && !isAdding && !isEditing ? (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      ) : slides.length === 0 ? (
        <p className="text-center text-gray-500">Không có slide nào.</p>
      ) : (
        <>
          {/* Hiển thị dạng bảng trên màn hình lớn (PC, tablet) */}
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
                {slides.map((slide) => (
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

          {/* Hiển thị dạng danh sách trên mobile */}
          <div className="block md:hidden space-y-4">
            {slides.map((slide) => (
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

      {/* Modal Thêm Slide */}
      {role === "Admin" && (
        <SlideForm
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSubmit={handleAddSlide}
          isLoading={isAdding}
          token={token}
        />
      )}

      {/* Modal Sửa Slide */}
      {role === "Admin" && (
        <SlideForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleEditSlide}
          initialData={selectedSlide || undefined}
          isLoading={isEditing}
          token={token}
        />
      )}

      {/* Modal Xem chi tiết Slide */}
      <SlideDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        slide={selectedSlide}
      />
    </div>
  );
}
