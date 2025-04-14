"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product, ProductFiles, Model } from "@/lib/types";
import { Loader2, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

// Schema validation cho form
const productSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
  price: z.number().positive("Giá sản phẩm phải là số dương"),
  storage: z.number().positive("Dung lượng lưu trữ phải là số dương"),
  ram: z.number().positive("Dung lượng RAM phải là số dương"),
  screenSize: z.number().positive("Kích thước màn hình phải là số dương"),
  battery: z.number().positive("Dung lượng pin phải là số dương"),
  chip: z.string().min(2, "Tên chip phải có ít nhất 2 ký tự"),
  operatingSystem: z.string().min(2, "Hệ điều hành phải có ít nhất 2 ký tự"),
  modelId: z.string().min(1, "Vui lòng chọn model"),
});

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name?: string;
    price?: number;
    storage?: number;
    ram?: number;
    screenSize?: number;
    battery?: number;
    chip?: string;
    operatingSystem?: string;
    modelId?: string;
    files: FileList | null;
    filesToDelete?: string[];
  }) => Promise<void>;
  initialData?: Product;
  models: Model[]; // Nhận models qua props
  isLoading: boolean;
}

export function ProductForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  models, // Nhận models từ props
  isLoading,
}: ProductFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentFiles, setCurrentFiles] = useState<ProductFiles[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

  // Khởi tạo form với react-hook-form
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price || 0,
      storage: initialData?.storage || 0,
      ram: initialData?.ram || 0,
      screenSize: initialData?.screenSize || 0,
      battery: initialData?.battery || 0,
      chip: initialData?.chip || "",
      operatingSystem: initialData?.operatingSystem || "",
      modelId: initialData?.modelId || "",
    },
  });

  // Cập nhật form khi initialData thay đổi
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        price: initialData.price || 0,
        storage: initialData.storage || 0,
        ram: initialData.ram || 0,
        screenSize: initialData.screenSize || 0,
        battery: initialData.battery || 0,
        chip: initialData.chip || "",
        operatingSystem: initialData.operatingSystem || "",
        modelId: initialData.modelId || "",
      });
      setCurrentFiles(initialData.productFiles || []);
      setFilesToDelete([]);
      setFiles([]);
      setPreviews([]);
    } else {
      form.reset({
        name: "",
        price: 0,
        storage: 0,
        ram: 0,
        screenSize: 0,
        battery: 0,
        chip: "",
        operatingSystem: "",
        modelId: "",
      });
      setCurrentFiles([]);
      setFilesToDelete([]);
      setFiles([]);
      setPreviews([]);
    }
  }, [initialData, form]);

  // Xử lý khi người dùng chọn file mới
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  };

  // Xử lý xóa file mới đã chọn
  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviews((prevPreviews) => {
      const newPreviews = prevPreviews.filter((_, i) => i !== index);
      URL.revokeObjectURL(prevPreviews[index]);
      return newPreviews;
    });
  };

  // Xử lý xóa file hiện tại
  const handleRemoveCurrentFile = (fileId: string) => {
    setFilesToDelete((prev) => [...prev, fileId]);
    setCurrentFiles((prev) => prev.filter((file) => file.fileId !== fileId));
  };

  // Chuyển danh sách file thành FileList để gửi lên server
  const createFileList = (files: File[]): FileList => {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  };

  // Giải phóng các URL preview khi component unmount hoặc form đóng
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const handleSubmit = async (values: z.infer<typeof productSchema>) => {
    const data: {
      name?: string;
      price?: number;
      storage?: number;
      ram?: number;
      screenSize?: number;
      battery?: number;
      chip?: string;
      operatingSystem?: string;
      modelId?: string;
      files: FileList | null;
      filesToDelete?: string[];
    } = {
      files: files.length > 0 ? createFileList(files) : null,
      filesToDelete: filesToDelete.length > 0 ? filesToDelete : undefined,
    };

    if (initialData) {
      if (values.name !== initialData.name) data.name = values.name;
      if (values.price !== initialData.price) data.price = values.price;
      if (values.storage !== initialData.storage) data.storage = values.storage;
      if (values.ram !== initialData.ram) data.ram = values.ram;
      if (values.screenSize !== initialData.screenSize)
        data.screenSize = values.screenSize;
      if (values.battery !== initialData.battery) data.battery = values.battery;
      if (values.chip !== initialData.chip) data.chip = values.chip;
      if (values.operatingSystem !== initialData.operatingSystem)
        data.operatingSystem = values.operatingSystem;
      if (values.modelId !== initialData.modelId) data.modelId = values.modelId;
    } else {
      Object.assign(data, values);
    }

    if (
      initialData &&
      Object.keys(data).length === 2 &&
      data.files === null &&
      (!data.filesToDelete || data.filesToDelete.length === 0)
    ) {
      onOpenChange(false);
      return;
    }

    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {initialData ? "Sửa sản phẩm" : "Thêm sản phẩm"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Tên sản phẩm
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên sản phẩm"
                        {...field}
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Giá sản phẩm (VNĐ)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nhập giá sản phẩm"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="storage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Dung lượng lưu trữ (GB)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nhập dung lượng lưu trữ"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Dung lượng RAM (GB)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nhập dung lượng RAM"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="screenSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Kích thước màn hình (inch)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Nhập kích thước màn hình"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="battery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Dung lượng pin (mAh)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nhập dung lượng pin"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Chip</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên chip"
                        {...field}
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="operatingSystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Hệ điều hành
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập hệ điều hành"
                        {...field}
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modelId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="text-sm sm:text-base">
                      Model
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="text-sm sm:text-base">
                          <SelectValue placeholder="Chọn model" />
                        </SelectTrigger>
                        <SelectContent>
                          {models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name} ({model.brand.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </div>

            {/* Hiển thị danh sách ảnh hiện tại */}
            {currentFiles.length > 0 && (
              <div>
                <FormLabel className="text-sm sm:text-base">
                  Ảnh hiện tại
                </FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {currentFiles.map((productFile) => (
                    <div key={productFile.fileId} className="relative">
                      <div className="relative w-full h-24">
                        <Image
                          src={productFile.file.url}
                          alt="Product image"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      {productFile.isMain && (
                        <p className="text-xs text-green-600 mt-1">Ảnh chính</p>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1"
                        onClick={() =>
                          handleRemoveCurrentFile(productFile.fileId)
                        }
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input để chọn nhiều ảnh mới */}
            <div>
              <FormLabel className="text-sm sm:text-base">
                Ảnh sản phẩm
              </FormLabel>
              <Input
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*"
                className="mt-1 text-sm sm:text-base"
              />
            </div>

            {/* Hiển thị danh sách file mới đã chọn với preview */}
            {files.length > 0 && (
              <div>
                <FormLabel className="text-sm sm:text-base">
                  Ảnh mới đã chọn
                </FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {files.map((file, index) => (
                    <div key={index} className="relative">
                      <div className="relative w-full h-24">
                        <Image
                          src={previews[index]}
                          alt={file.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <p className="text-xs truncate mt-1">{file.name}</p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
