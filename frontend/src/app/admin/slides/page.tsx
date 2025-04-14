// app/admin/slides/page.tsx
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
  getSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  getSlideById,
} from "@/api/admin/slidesApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearLocalStorage } from "@/lib/utils";
import { Slide } from "@/lib/types";
import { SlideForm } from "@/components/admin/slides/SlideForm";
import { SlideDetail } from "@/components/admin/slides/SlideDetail";

export default function SlidesPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
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
      fetchSlides();
    }
  }, [router]);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const data = await getSlides();
      setSlides(data);
    } catch (error: any) {
      toast.error("Lỗi khi lấy danh sách slide", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Thêm Slide
  const handleAddSlide = async (data: {
    title?: string;
    link?: string;
    isActive: boolean;
    displayOrder: number;
    file: File | null;
  }) => {
    try {
      const formData = new FormData();
      if (data.title) formData.append("title", data.title);
      if (data.link) formData.append("link", data.link);
      formData.append("isActive", data.isActive.toString());
      formData.append("displayOrder", data.displayOrder.toString());
      if (data.file) formData.append("file", data.file);

      const newSlide = await createSlide(formData);
      setSlides([...slides, newSlide]);
      toast.success("Thêm slide thành công");
    } catch (error: any) {
      toast.error("Thêm slide thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
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
    try {
      const formData = new FormData();
      if (data.title) formData.append("title", data.title);
      if (data.link) formData.append("link", data.link);
      formData.append("isActive", data.isActive.toString());
      formData.append("displayOrder", data.displayOrder.toString());
      if (data.file) formData.append("file", data.file);

      const updatedSlide = await updateSlide(selectedSlide.id, formData);
      setSlides(
        slides.map((slide) =>
          slide.id === updatedSlide.id ? updatedSlide : slide
        )
      );
      toast.success("Cập nhật slide thành công");
    } catch (error: any) {
      toast.error("Cập nhật slide thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  // Xóa Slide
  const handleDeleteSlide = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa slide này?")) {
      try {
        await deleteSlide(id);
        setSlides(slides.filter((slide) => slide.id !== id));
        toast.success("Xóa slide thành công");
      } catch (error: any) {
        toast.error("Xóa slide thất bại", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    }
  };

  // Xem chi tiết Slide
  const handleViewDetail = async (id: string) => {
    try {
      const slide = await getSlideById(id);
      setSelectedSlide(slide);
      setIsDetailOpen(true);
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết slide", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  // Mở form chỉnh sửa và lấy dữ liệu Slide
  const handleOpenEdit = async (id: string) => {
    try {
      const slide = await getSlideById(id);
      setSelectedSlide(slide);
      setIsEditOpen(true);
    } catch (error: any) {
      toast.error("Lỗi khi lấy thông tin slide", {
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
          Quản lý Slide
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
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {role === "Admin" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(slide.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSlide(slide.id)}
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
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSlide(slide.id)}
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
        />
      )}

      {/* Modal Sửa Slide */}
      {role === "Admin" && (
        <SlideForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleEditSlide}
          initialData={selectedSlide || undefined}
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
