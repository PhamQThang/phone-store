// frontend/components/ui/admin/models/ModelForm.tsx
"use client"; // Thêm "use client" vì đây là client component

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brand, getBrands } from "@/api/admin/brandsApi";
import { Model } from "@/api/admin/modelsApi";
import { toast } from "sonner";

const modelSchema = z.object({
  name: z.string().min(2, "Tên model phải có ít nhất 2 ký tự"),
  brandId: z.string().min(1, "Vui lòng chọn thương hiệu"),
});

interface ModelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; brandId: string }) => Promise<void>;
  initialData?: Model;
}

export function ModelForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: ModelFormProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  const form = useForm<z.infer<typeof modelSchema>>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      name: initialData?.name || "",
      brandId: initialData?.brandId || "",
    },
  });

  // Reset form khi initialData thay đổi
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        brandId: initialData.brandId || "",
      });
    } else {
      form.reset({
        name: "",
        brandId: "",
      });
    }
  }, [initialData, form]);

  // Lấy danh sách thương hiệu khi modal mở
  useEffect(() => {
    if (open) {
      const fetchBrands = async () => {
        setLoadingBrands(true);
        try {
          const data = await getBrands();
          setBrands(data);
        } catch (error: any) {
          toast.error("Lỗi khi lấy danh sách thương hiệu", {
            description: error.message || "Vui lòng thử lại sau.",
            duration: 2000,
          });
        } finally {
          setLoadingBrands(false);
        }
      };
      fetchBrands();
    }
  }, [open]);

  const handleSubmit = async (values: z.infer<typeof modelSchema>) => {
    await onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {initialData ? "Sửa model" : "Thêm model"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Tên model
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên model"
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
              name="brandId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Thương hiệu
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value} // Sử dụng value thay vì defaultValue để đảm bảo giá trị được cập nhật
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue
                          placeholder={
                            loadingBrands ? "Đang tải..." : "Chọn thương hiệu"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem
                          key={brand.id}
                          value={brand.id}
                          className="text-sm sm:text-base"
                        >
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {initialData ? "Cập nhật" : "Thêm"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
