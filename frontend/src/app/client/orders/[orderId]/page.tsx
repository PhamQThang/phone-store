"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrderDetails, updateOrderStatus } from "@/api/orderApi";
import { Order } from "@/lib/types";

const OrderDetailsPage = ({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Unwrap params với React.use
  const unwrappedParams = React.use(params);
  const orderId = unwrappedParams.orderId;

  // Kiểm tra đăng nhập
  const user = localStorage.getItem("fullName");

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const orderData = await getOrderDetails(orderId);
        setOrder(orderData);
        setNewStatus(orderData.status);
      } catch (error: any) {
        setError(
          error.response?.data?.message || "Không thể lấy chi tiết đơn hàng"
        );
        toast.error("Lỗi", {
          description:
            error.response?.data?.message || "Không thể lấy chi tiết đơn hàng",
          duration: 2000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [user, orderId, router]);

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

  // Xử lý cập nhật trạng thái (chỉ cho phép hủy đơn hàng khi trạng thái là Pending)
  const handleUpdateStatus = async () => {
    if (newStatus !== "Canceled") {
      toast.error("Bạn chỉ có thể hủy đơn hàng", { duration: 2000 });
      return;
    }

    if (order?.status !== "Pending") {
      toast.error("Bạn chỉ có thể hủy đơn hàng ở trạng thái Đang chờ", {
        duration: 2000,
      });
      return;
    }

    try {
      const response = await updateOrderStatus(orderId, {
        status: newStatus,
      });
      setOrder(response);
      setNewStatus("Canceled");
      toast.success("Hủy đơn hàng thành công", { duration: 2000 });
    } catch (error: any) {
      toast.error("Lỗi", {
        description: error.response?.data?.message || "Không thể hủy đơn hàng",
        duration: 2000,
      });
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center mt-4 text-red-600">{error}</div>;
  }

  if (!order) {
    return <div className="text-center mt-4">Không tìm thấy đơn hàng.</div>;
  }

  return (
    <div className="container mx-auto py-4 px-3">
      <p className="text-2xl font-semibold mb-4">Chi tiết đơn hàng</p>
      <Card className="py-3">
        <CardContent className="px-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Thông tin đơn hàng */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
              <div className="space-y-2">
                <p>
                  <strong>Mã đơn hàng:</strong> {order.id}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {order.address}
                </p>
                <p>
                  <strong>Số điện thoại:</strong>{" "}
                  {order.phoneNumber || "Không có"}
                </p>
                <p>
                  <strong>Tổng tiền:</strong>{" "}
                  {order.totalAmount.toLocaleString("vi-VN")} VNĐ
                </p>
                <p>
                  <strong>Phương thức thanh toán:</strong>{" "}
                  {order.paymentMethod === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : "Thanh toán trực tuyến"}
                </p>
                <p>
                  <strong>Trạng thái thanh toán:</strong>{" "}
                  {order.paymentStatus === "Completed"
                    ? "Đã thanh toán"
                    : order.paymentStatus === "Pending"
                    ? "Chưa thanh toán"
                    : "Thanh toán thất bại"}
                </p>
                <p>
                  <strong>Trạng thái:</strong> {translateStatus(order.status)}
                </p>
                <p>
                  <strong>Ngày tạo:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>

              {/* Cập nhật trạng thái (chỉ hiển thị nếu trạng thái là Pending) */}
              {order.status === "Pending" && (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold mb-2">
                    Cập nhật trạng thái
                  </h2>
                  <Select
                    onValueChange={(value) => setNewStatus(value)}
                    value={newStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={order.status}>
                        {translateStatus(order.status)}
                      </SelectItem>
                      <SelectItem value="Canceled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleUpdateStatus} className="mt-2">
                    Cập nhật
                  </Button>
                </div>
              )}
            </div>

            {/* Danh sách sản phẩm */}
            <div>
              <h2 className="text-lg font-semibold mt-2 mb-2">
                Sản phẩm trong đơn hàng
              </h2>
              {order.orderDetails.length === 0 ? (
                <p>Không có sản phẩm nào trong đơn hàng này.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Màu sắc</TableHead>
                      <TableHead>Giá</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orderDetails.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.color.name}</TableCell>
                        <TableCell>
                          {(item.product.discountedPrice ?? 0).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
                          {(item.product.discountedPrice ?? 0) <
                            item.product.price && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              {item.product.price.toLocaleString("vi-VN")} VNĐ
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailsPage;
