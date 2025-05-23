"use client";

import { useEffect } from "react";
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
import { Supplier } from "@/lib/types";
import { Loader2 } from "lucide-react";

const supplierSchema = z.object({
  name: z.string().min(2, "Tên nhà cung cấp phải có ít nhất 2 ký tự"),
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 chữ số"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
});

interface SupplierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: Supplier;
  isLoading: boolean;
}

export function SupplierForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: SupplierFormProps) {
  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        address: initialData.address || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
      });
    } else {
      form.reset({
        name: "",
        address: "",
        phone: "",
        email: "",
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (values: z.infer<typeof supplierSchema>) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("address", values.address);
    formData.append("phone", values.phone);
    if (values.email) formData.append("email", values.email);

    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {initialData ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}
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
                    Tên nhà cung cấp
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên nhà cung cấp"
                      {...field}
                      className="text-sm sm:text-base"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Địa chỉ
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập địa chỉ"
                      {...field}
                      className="text-sm sm:text-base"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Số điện thoại
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập số điện thoại"
                      {...field}
                      className="text-sm sm:text-base"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập email"
                      {...field}
                      className="text-sm sm:text-base"
                      disabled={isLoading}
                    />
                  </FormControl>
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
