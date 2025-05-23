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
  models: Model[];
  isLoading: boolean;
}

export function ProductForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  models,
  isLoading,
}: ProductFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentFiles, setCurrentFiles] = useState<ProductFiles[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      storage: 0,
      ram: 0,
      screenSize: 0,
      battery: 0,
      chip: "",
      operatingSystem: "",
      modelId: "",
    },
  });

  // Reset form and state when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      // Reset form and state when dialog opens
      form.reset({
        name: initialData?.name || "",
        price: initialData?.price || 0,
        storage: initialData?.storage || 0,
        ram: initialData?.ram || 0,
        screenSize: initialData?.screenSize || 0,
        battery: initialData?.battery || 0,
        chip: initialData?.chip || "",
        operatingSystem: initialData?.operatingSystem || "",
        modelId: initialData?.modelId || "",
      });
      setCurrentFiles(initialData?.productFiles || []);
      setFilesToDelete([]);
      setFiles([]);
      setPreviews([]);
    }
  }, [open, initialData, form]);

  // Clean up previews when dialog closes
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviews((prevPreviews) => {
      const newPreviews = prevPreviews.filter((_, i) => i !== index);
      URL.revokeObjectURL(prevPreviews[index]);
      return newPreviews;
    });
  };

  const handleRemoveCurrentFile = (fileId: string) => {
    setFilesToDelete((prev) => [...prev, fileId]);
    setCurrentFiles((prev) => prev.filter((file) => file.fileId !== fileId));
  };

  const createFileList = (files: File[]): FileList => {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  };

  const handleSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
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
        name: values.name,
        price: values.price,
        storage: values.storage,
        ram: values.ram,
        screenSize: values.screenSize,
        battery: values.battery,
        chip: values.chip,
        operatingSystem: values.operatingSystem,
        modelId: values.modelId,
        files: files.length > 0 ? createFileList(files) : null,
        filesToDelete: filesToDelete.length > 0 ? filesToDelete : undefined,
      };

      await onSubmit(data);
      // Reset form and state after successful submission
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
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Handle dialog close to ensure state is reset
  const handleDialogClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      // Reset form and state when dialog closes
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
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
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
                          field.onChange(parseFloat(e.target.value) || 0)
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
                          field.onChange(parseInt(e.target.value) || 0)
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
                          field.onChange(parseInt(e.target.value) || 0)
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
                          field.onChange(parseFloat(e.target.value) || 0)
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
                          field.onChange(parseInt(e.target.value) || 0)
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-sm sm:text-base">
                          <SelectValue placeholder="Chọn model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem
                            key={model.id}
                            value={model.id}
                            className="text-sm sm:text-base"
                          >
                            {model.name} (
                            {model.brand?.name || "Không có thương hiệu"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </div>

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
                        disabled={isLoading}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                disabled={isLoading}
              />
            </div>

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
                        disabled={isLoading}
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
                onClick={() => handleDialogClose(false)}
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
