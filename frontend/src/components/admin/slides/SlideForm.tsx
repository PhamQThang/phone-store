"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Trash, Loader2 } from "lucide-react";
import Image from "next/image";
import { File as FileType } from "@/lib/types";

const slideSchema = z.object({
  title: z.string().optional(),
  link: z.string().optional(),
  isActive: z.boolean(),
  displayOrder: z.number().min(0, "Thứ tự hiển thị không được nhỏ hơn 0"),
  file: z.instanceof(File).nullable().optional(),
  currentImage: z.string().optional(),
});

interface SlideFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title?: string;
    link?: string;
    isActive: boolean;
    displayOrder: number;
    file: File | null;
    currentImage?: string;
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
}

export function SlideForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: SlideFormProps) {
  const form = useForm<z.infer<typeof slideSchema>>({
    resolver: zodResolver(slideSchema),
    defaultValues: {
      title: "",
      link: "",
      isActive: true,
      displayOrder: 0,
      file: null,
      currentImage: "",
    },
  });

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        link: initialData.link || "",
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
        displayOrder: initialData.displayOrder || 0,
        file: null,
        currentImage: initialData.image?.url || "",
      });
      setPreview(null);
    } else {
      form.reset({
        title: "",
        link: "",
        isActive: true,
        displayOrder: 0,
        file: null,
        currentImage: "",
      });
      setPreview(null);
    }
  }, [initialData, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      form.setValue("file", selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveFile = () => {
    form.setValue("file", null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = async (values: z.infer<typeof slideSchema>) => {
    if (!values.file && !values.currentImage && !initialData) {
      toast.error("File ảnh là bắt buộc khi tạo mới slide");
      return;
    }

    try {
      await onSubmit({
        title: values.title || undefined,
        link: values.link || undefined,
        isActive: values.isActive,
        displayOrder: values.displayOrder,
        file: values.file,
        currentImage: values.currentImage || undefined,
      });
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
          <DialogTitle className="text-lg sm:text-xl">
            {initialData ? "Sửa Slide" : "Thêm Slide"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm sm:text-base">
              Tiêu đề
            </Label>
            <Input
              id="title"
              {...form.register("title")}
              className="mt-1 text-sm sm:text-base"
              disabled={isLoading}
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="link" className="text-sm sm:text-base">
              Link
            </Label>
            <Input
              id="link"
              {...form.register("link")}
              className="mt-1 text-sm sm:text-base"
              disabled={isLoading}
            />
            {form.formState.errors.link && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {form.formState.errors.link.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="isActive" className="text-sm sm:text-base">
              Trạng thái
            </Label>
            <Select
              value={form.watch("isActive").toString()}
              onValueChange={(value) =>
                form.setValue("isActive", value === "true")
              }
              disabled={isLoading}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Hoạt động</SelectItem>
                <SelectItem value="false">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.isActive && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {form.formState.errors.isActive.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="displayOrder" className="text-sm sm:text-base">
              Thứ tự hiển thị
            </Label>
            <Input
              id="displayOrder"
              type="number"
              {...form.register("displayOrder", { valueAsNumber: true })}
              className="mt-1 text-sm sm:text-base"
              disabled={isLoading}
            />
            {form.formState.errors.displayOrder && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {form.formState.errors.displayOrder.message}
              </p>
            )}
          </div>
          {form.watch("currentImage") && (
            <div>
              <Label className="text-sm sm:text-base">Hình ảnh hiện tại</Label>
              <div className="relative w-full h-24 mt-2">
                <Image
                  src={form.watch("currentImage")}
                  alt="Slide image"
                  fill
                  className="object-cover rounded"
                />
              </div>
            </div>
          )}
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
              disabled={isLoading}
            />
            {form.formState.errors.file && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {form.formState.errors.file.message}
              </p>
            )}
          </div>
          {preview && (
            <div>
              <Label className="text-sm sm:text-base">
                Hình ảnh mới đã chọn
              </Label>
              <div className="relative w-full h-24 mt-2">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover rounded"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1"
                  onClick={handleRemoveFile}
                  disabled={isLoading}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs truncate mt-1">
                {form.watch("file")?.name}
              </p>
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
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : initialData ? (
                "Cập nhật"
              ) : (
                "Thêm"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
