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
      <DialogContent className="w-full max-w-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Cập nhật trạng thái đơn hàng #{initialData.id.substring(0, 8)}...
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3 text-sm sm:text-base">
            <div>
              <strong>Mã đơn hàng:</strong> {initialData.id}
            </div>
            <div>
              <strong>Địa chỉ:</strong> {initialData.address}
            </div>
            <div>
              <strong>Số điện thoại:</strong>{" "}
              {initialData.phoneNumber || "Không có"}
            </div>
            <div>
              <strong>Tổng tiền:</strong>{" "}
              {initialData.totalAmount.toLocaleString("vi-VN")} VNĐ
            </div>
            <div>
              <strong>Phương thức thanh toán:</strong>{" "}
              {initialData.paymentMethod === "COD"
                ? "Thanh toán khi nhận hàng"
                : "Thanh toán trực tuyến"}
            </div>
            <div>
              <strong>Trạng thái thanh toán:</strong>{" "}
              {initialData.paymentStatus === "Completed"
                ? "Đã thanh toán"
                : initialData.paymentStatus === "Pending"
                ? "Chưa thanh toán"
                : "Thanh toán thất bại"}
            </div>
            <div>
              <strong>Ngày tạo:</strong>{" "}
              {new Date(initialData.createdAt).toLocaleString()}
            </div>
            <div>
              <strong>Người dùng:</strong> {`${initialData.user.fullName}`}
            </div>
            <div>
              <strong>Sản phẩm:</strong>
              <ul className="list-disc ml-5 mt-1">
                {initialData.orderDetails.map((item, index) => (
                  <li key={index}>
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
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Trạng thái
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-sm sm:text-base">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                            className="text-sm sm:text-base"
                          >
                            {translateStatus(status)}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
