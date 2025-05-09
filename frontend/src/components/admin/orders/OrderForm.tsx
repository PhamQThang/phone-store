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
import { Order } from "@/lib/types";
import { Loader2 } from "lucide-react";

const orderSchema = z.object({
  status: z.enum(
    ["Pending", "Confirmed", "Shipping", "Delivered", "Canceled"],
    {
      required_error: "Vui lòng chọn trạng thái",
    }
  ),
});

interface OrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { status: string }) => Promise<void>;
  initialData?: Order;
  isLoading: boolean;
}

export function OrderForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: OrderFormProps) {
  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      status: initialData?.status || "Pending",
    },
  });

  useEffect(() => {
    form.reset({
      status: initialData?.status || "Pending",
    });
  }, [initialData, form]);

  const handleSubmit = async (values: z.infer<typeof orderSchema>) => {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Hàm dịch trạng thái sang tiếng Việt
  const translateStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Pending: "Đang chờ",
      Confirmed: "Đã xác nhận",
      Shipping: "Đang giao",
      Delivered: "Đã giao",
      Canceled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  if (!initialData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Cập nhật trạng thái đơn hàng #{initialData.id.substring(0, 8)}...
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4 text-gray-700">
            <div className="flex flex-col">
              <span className="font-medium">Mã đơn hàng:</span>
              <span className="text-gray-600">{initialData.id}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Địa chỉ:</span>
              <span className="text-gray-600">{initialData.address}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Số điện thoại:</span>
              <span className="text-gray-600">
                {initialData.phoneNumber || "Không có"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Tổng tiền:</span>
              <span className="text-gray-600">
                {initialData.totalAmount.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Phương thức thanh toán:</span>
              <span className="text-gray-600">
                {initialData.paymentMethod === "COD"
                  ? "Thanh toán khi nhận hàng"
                  : "Thanh toán trực tuyến"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Trạng thái thanh toán:</span>
              <span className="text-gray-600">
                {initialData.paymentStatus === "Completed"
                  ? "Đã thanh toán"
                  : initialData.paymentStatus === "Pending"
                  ? "Chưa thanh toán"
                  : "Thanh toán thất bại"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Ngày tạo:</span>
              <span className="text-gray-600">
                {new Date(initialData.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Người dùng:</span>
              <span className="text-gray-600">{`${initialData.user.fullName}`}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Sản phẩm:</span>
              <ul className="list-disc ml-6 mt-2 text-gray-600">
                {initialData.orderDetails.map((item, index) => (
                  <li key={index} className="mb-1">
                    {item.product.name} - Màu: {item.color.name} - Giá:{" "}
                    {item.discountedPrice?.toLocaleString("vi-VN")} VNĐ
                    {item.discountedPrice &&
                      item.originalPrice &&
                      item.discountedPrice < item.originalPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {item.originalPrice.toLocaleString("vi-VN")} VNĐ
                        </span>
                      )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Trạng thái
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      className="w-full"
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-gray-300 rounded-md shadow-lg">
                        {[
                          "Pending",
                          "Confirmed",
                          "Shipping",
                          "Delivered",
                          "Canceled",
                        ].map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="text-sm hover:bg-gray-100 transition-colors duration-200"
                          >
                            {translateStatus(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500 text-xs mt-1" />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-all duration-200"
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-all duration-200"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
