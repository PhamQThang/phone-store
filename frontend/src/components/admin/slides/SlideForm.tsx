"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash } from "lucide-react";
import Image from "next/image";
import { File as FileType } from "@/lib/types";

interface SlideFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title?: string;
    link?: string;
    isActive: boolean;
    displayOrder: number;
    file: File | null;
  }) => Promise<void>;
  initialData?: Partial<{
    id: string;
    title: string;
    link: string;
    isActive: boolean;
    displayOrder: number;
    image: FileType;
  }>;
  isLoading: boolean;
  token: string;
}

export function SlideForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
  token,
}: SlideFormProps) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<FileType | null>(null);

  // Cập nhật state khi initialData thay đổi
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setLink(initialData.link || "");
      setIsActive(
        initialData.isActive !== undefined ? initialData.isActive : true
      );
      setDisplayOrder(
        initialData.displayOrder ? initialData.displayOrder.toString() : ""
      );
      setCurrentImage(initialData.image || null);
      setFile(null);
      setPreview(null);
    } else {
      setTitle("");
      setLink("");
      setIsActive(true);
      setDisplayOrder("");
      setFile(null);
      setPreview(null);
      setCurrentImage(null);
    }
  }, [initialData]);

  // Xử lý khi người dùng chọn file mới
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Xử lý xóa file mới đã chọn
  const handleRemoveFile = () => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  // Giải phóng URL preview khi component unmount hoặc form đóng
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const parsedDisplayOrder = parseInt(displayOrder) || 0;

      const data: {
        title?: string;
        link?: string;
        isActive: boolean;
        displayOrder: number;
        file: File | null;
      } = {
        isActive,
        displayOrder: parsedDisplayOrder,
        file,
      };

      // Chỉ gửi các trường nếu giá trị thay đổi so với initialData
      if (initialData) {
        if (title && title !== initialData.title) {
          data.title = title;
        }
        if (link && link !== initialData.link) {
          data.link = link;
        }
      } else {
        // Trường hợp thêm mới, gửi tất cả các trường
        data.title = title || undefined;
        data.link = link || undefined;
        if (!file) {
          throw new Error("File ảnh là bắt buộc khi tạo mới slide");
        }
      }

      // Kiểm tra nếu không có thay đổi và không có file mới
      if (initialData && Object.keys(data).length === 2 && data.file === null) {
        toast.info("Không có thay đổi để cập nhật");
        return;
      }

      await onSubmit(data);
      onOpenChange(false);
      // Reset form sau khi submit thành công
      setTitle("");
      setLink("");
      setIsActive(true);
      setDisplayOrder("");
      setFile(null);
      setPreview(null);
      setCurrentImage(null);
    } catch (error: any) {
      toast.error("Lỗi khi lưu slide", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa Slide" : "Thêm Slide"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm sm:text-base">
              Tiêu đề
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 text-sm sm:text-base"
            />
          </div>
          <div>
            <Label htmlFor="link" className="text-sm sm:text-base">
              Link
            </Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="mt-1 text-sm sm:text-base"
            />
          </div>
          <div>
            <Label htmlFor="isActive" className="text-sm sm:text-base">
              Trạng thái
            </Label>
            <Select
              value={isActive.toString()}
              onValueChange={(value) => setIsActive(value === "true")}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Hoạt động</SelectItem>
                <SelectItem value="false">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="displayOrder" className="text-sm sm:text-base">
              Thứ tự hiển thị
            </Label>
            <Input
              id="displayOrder"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              required
              className="mt-1 text-sm sm:text-base"
            />
          </div>

          {/* Hiển thị hình ảnh hiện tại */}
          {currentImage && (
            <div>
              <Label className="text-sm sm:text-base">Hình ảnh hiện tại</Label>
              <div className="relative w-full h-24 mt-2">
                <Image
                  src={currentImage.url}
                  alt="Slide image"
                  fill
                  className="object-cover rounded"
                />
              </div>
            </div>
          )}

          {/* Input để chọn file mới */}
          <div>
            <Label htmlFor="file" className="text-sm sm:text-base">
              Hình ảnh Slide
            </Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="mt-1"
              required={!initialData}
            />
          </div>

          {/* Hiển thị preview của file mới đã chọn */}
          {file && preview && (
            <div>
              <Label className="text-sm sm:text-base">
                Hình ảnh mới đã chọn
              </Label>
              <div className="relative w-full h-24 mt-2">
                <Image
                  src={preview}
                  alt={file.name}
                  fill
                  className="object-cover rounded"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1"
                  onClick={handleRemoveFile}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs truncate mt-1">{file.name}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : initialData ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
