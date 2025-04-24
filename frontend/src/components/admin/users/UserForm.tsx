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
import { User } from "@/lib/types";
import { Loader2 } from "lucide-react";

const userSchema = z.object({
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 5,
      "Mật khẩu phải có ít nhất 5 ký tự hoặc để trống"
    ),
});

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    fullName: string;
    address?: string;
    phoneNumber?: string;
    password?: string;
  }) => Promise<void>;
  initialData?: User;
  isLoading: boolean;
}

export function UserForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: UserFormProps) {
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      address: initialData?.address || "",
      phoneNumber: initialData?.phoneNumber || "",
      password: "", // Mật khẩu mặc định là rỗng
    },
  });

  useEffect(() => {
    form.reset({
      fullName: initialData?.fullName || "",
      address: initialData?.address || "",
      phoneNumber: initialData?.phoneNumber || "",
      password: "", // Không điền sẵn mật khẩu
    });
  }, [initialData, form]);

  const handleSubmit = async (values: z.infer<typeof userSchema>) => {
    try {
      // Loại bỏ password khỏi dữ liệu gửi đi nếu không được nhập
      const submitData = { ...values };
      if (!submitData.password) {
        delete submitData.password;
      }
      await onSubmit(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Sửa thông tin người dùng
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Tên</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên"
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
                      value={field.value ?? ""}
                      className="text-sm sm:text-base"
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Số điện thoại
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập số điện thoại"
                      {...field}
                      value={field.value ?? ""}
                      className="text-sm sm:text-base"
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Mật khẩu mới (để trống nếu không muốn thay đổi)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nhập mật khẩu mới"
                      {...field}
                      className="text-sm sm:text-base"
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
                ) : (
                  "Cập nhật"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
