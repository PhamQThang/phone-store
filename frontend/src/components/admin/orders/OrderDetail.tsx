"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Order, OrderDetail } from "@/lib/types";

interface OrderDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function OrderDetail({ open, onOpenChange, order }: OrderDetailProps) {
  if (!order) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Chi tiết đơn hàng
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm sm:text-base">
          <div>
            <strong>Mã đơn hàng:</strong> {order.id}
          </div>
          <div>
            <strong>Địa chỉ:</strong> {order.address}
          </div>
          <div>
            <strong>Số điện thoại:</strong> {order.phoneNumber || "Không có"}
          </div>
          <div>
            <strong>Tổng tiền:</strong>{" "}
            {order.totalAmount.toLocaleString("vi-VN")} VNĐ
          </div>
          <div>
            <strong>Phương thức thanh toán:</strong>{" "}
            {order.paymentMethod === "COD"
              ? "Thanh toán khi nhận hàng"
              : "Thanh toán trực tuyến"}
          </div>
          <div>
            <strong>Trạng thái thanh toán:</strong>{" "}
            {order.paymentStatus === "Completed"
              ? "Đã thanh toán"
              : "Chưa thanh toán"}
          </div>
          <div>
            <strong>Trạng thái:</strong> {translateStatus(order.status)}
          </div>
          <div>
            <strong>Ngày tạo:</strong>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Người dùng:</strong> {`${order.user.fullName}`}
          </div>
          <div>
            <strong>Sản phẩm:</strong>
            <ul className="list-disc ml-5 mt-1">
              {order.orderDetails.map((item: OrderDetail, index: number) => (
                <li key={index}>
                  {item.product.name} - Màu: {item.color.name} - Giá:{" "}
                  {item.price.toLocaleString("vi-VN")} VNĐ
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
