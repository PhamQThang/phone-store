// app/auth/login/page.tsx
"use client";

import { useState, useEffect } from "react";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, Loader2 } from "lucide-react";
import { login } from "@/api/auth/authApi";
import Cookies from "js-cookie";

// Định nghĩa schema cho form
const loginSchema = z.object({
  email: z.string().email("Vui lòng nhập email hợp lệ"),
  password: z.string().min(5, "Mật khẩu phải có ít nhất 5 ký tự"),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailFromQuery = searchParams.get("email") || "";

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailFromQuery,
      password: "",
    },
  });

  useEffect(() => {
    form.setValue("email", emailFromQuery);
  }, [emailFromQuery, form]);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setError(null);
    setLoading(true);
    try {
      const response = await login(values);
      // Lưu thông tin vào cookies bằng js-cookie
      Cookies.set("accessToken", response.accessToken, { path: "/" });
      Cookies.set("userEmail", response.user.email, { path: "/" });
      Cookies.set("role", response.user.role, { path: "/" });
      Cookies.set(
        "fullName",
        `${response.user.firstName} ${response.user.lastName}`,
        { path: "/" }
      );
      Cookies.set("address", response.user.address, { path: "/" });
      Cookies.set("phoneNumber", response.user.phoneNumber, { path: "/" });
      Cookies.set("cartId", response.user.cartId, { path: "/" });

      const role = response.user.role;
      if (!role) {
        throw new Error("Không nhận được vai trò từ server.");
      }

      toast.success("Đăng nhập thành công", {
        description: `Chào mừng ${
          role === "Admin"
            ? "Quản trị viên"
            : role === "Employee"
            ? "Nhân viên"
            : "Khách hàng"
        }!`,
        duration: 2000,
      });

      if (role === "Customer") {
        router.push("/client");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Đăng nhập thất bại.";
      setError(errorMessage);
      toast.error("Đăng nhập thất bại", {
        description: errorMessage,
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-center">
            Vui lòng nhập thông tin để đăng nhập
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          placeholder="email@example.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="********"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
