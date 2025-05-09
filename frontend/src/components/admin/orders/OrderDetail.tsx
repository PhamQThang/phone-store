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
      <DialogContent className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Chi tiết đơn hàng #{order.id.substring(0, 8)}...
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-gray-700">
          <div className="flex flex-col">
            <span className="font-medium">Mã đơn hàng:</span>
            <span className="text-gray-600">{order.id}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Địa chỉ:</span>
            <span className="text-gray-600">{order.address}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Số điện thoại:</span>
            <span className="text-gray-600">
              {order.phoneNumber || "Không có"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Tổng tiền:</span>
            <span className="text-gray-600">
              {order.totalAmount.toLocaleString("vi-VN")} VNĐ
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Phương thức thanh toán:</span>
            <span className="text-gray-600">
              {order.paymentMethod === "COD"
                ? "Thanh toán khi nhận hàng"
                : "Thanh toán trực tuyến"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Trạng thái thanh toán:</span>
            <span className="text-gray-600">
              {order.paymentStatus === "Completed"
                ? "Đã thanh toán"
                : order.paymentStatus === "Pending"
                ? "Chưa thanh toán"
                : "Thanh toán thất bại"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Trạng thái:</span>
            <span className="text-gray-600">
              {translateStatus(order.status)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Ngày tạo:</span>
            <span className="text-gray-600">
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Người dùng:</span>
            <span className="text-gray-600">{`${order.user.fullName}`}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Sản phẩm:</span>
            <ul className="list-disc ml-6 mt-2 text-gray-600">
              {order.orderDetails.map((item: OrderDetail, index: number) => (
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
      </DialogContent>
    </Dialog>
  );
}
