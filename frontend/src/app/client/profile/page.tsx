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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getAuthData, setAuthData } from "@/lib/authUtils";
import { updateProfile } from "@/api/admin/usersApi";

// Schema validation
const profileSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  phoneNumber: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa số"),
});

type FormData = z.infer<typeof profileSchema>;

export default function UpdateProfilePage() {
  const [initialData, setInitialData] = useState<{
    email: string;
    fullName: string;
    address: string;
    phoneNumber: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      address: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    const authData = getAuthData();
    if (authData) {
      setInitialData({
        email: authData.email || "",
        fullName: authData.fullName || "",
        address: authData.address || "",
        phoneNumber: authData.phoneNumber || "",
      });
      form.reset({
        fullName: authData.fullName || "",
        address: authData.address || "",
        phoneNumber: authData.phoneNumber || "",
      });
    }
  }, [form]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const updatedData = await updateProfile(data);
      if (updatedData) {
        setAuthData({
          accessToken: getAuthData()?.token || "",
          id: parseInt(getAuthData()?.id || "0"),
          email: initialData?.email || "",
          fullName: data.fullName,
          address: data.address,
          phoneNumber: data.phoneNumber,
          role: getAuthData()?.role || "",
          cartId: getAuthData()?.cartId || "",
        });
        toast.success("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Cập nhật thông tin thất bại. Vui lòng thử lại.", {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialData)
    return <div className="text-center text-gray-500 mt-10">Đang tải...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          Cập nhật thông tin cá nhân
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={initialData.email}
                      disabled
                      className="bg-gray-100 border-gray-300 text-gray-600 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Họ và tên
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập họ và tên"
                      {...field}
                      className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 hover:border-blue-300"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Địa chỉ
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập địa chỉ"
                      {...field}
                      className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 hover:border-blue-300"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Số điện thoại
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập số điện thoại"
                      {...field}
                      className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 hover:border-blue-300"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-1" />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset(initialData)}
                disabled={isLoading}
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 rounded-md"
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 rounded-md"
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
      </div>
    </div>
  );
}
