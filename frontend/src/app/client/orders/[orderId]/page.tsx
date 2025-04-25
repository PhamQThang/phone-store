"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const unwrappedParams = React.use(params);
  const orderId = unwrappedParams.orderId;

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

  const handleUpdateStatus = async () => {
    if (order?.status !== "Pending") {
      toast.error("Bạn chỉ có thể hủy đơn hàng ở trạng thái Đang chờ", {
        duration: 2000,
      });
      return;
    }

    try {
      const response = await updateOrderStatus(orderId, {
        status: "Canceled",
      });
      setOrder(response);
      toast.success("Hủy đơn hàng thành công", { duration: 2000 });
    } catch (error: any) {
      toast.error("Lỗi", {
        description: error.response?.data?.message || "Không thể hủy đơn hàng",
        duration: 2000,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-600 text-lg flex items-center">
          <svg
            className="animate-spin h-6 w-6 mr-2 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Đang tải...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-red-600 text-lg bg-white p-6 rounded-lg shadow-md">
          {error}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-600 text-lg bg-white p-6 rounded-lg shadow-md">
          Không tìm thấy đơn hàng.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <Card className="max-w-4xl mx-auto shadow-lg border border-gray-100 rounded-xl bg-white relative">
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
            Chi tiết đơn hàng #{order.id.substring(0, 8)}...
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Thông tin đơn hàng
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong className="font-medium text-gray-800">
                    Mã đơn hàng:
                  </strong>{" "}
                  {order.id}
                </p>
                <p className="text-gray-700">
                  <strong className="font-medium text-gray-800">
                    Địa chỉ:
                  </strong>{" "}
                  {order.address}
                </p>
                <p className="text-gray-700">
                  <strong className="font-medium text-gray-800">
                    Số điện thoại:
                  </strong>{" "}
                  {order.phoneNumber || "Không có"}
                </p>
                <p className="text-gray-700">
                  <strong className="font-medium text-gray-800">
                    Tổng tiền:
                  </strong>{" "}
                  <span className="text-blue-600 font-semibold">
                    {order.totalAmount.toLocaleString("vi-VN")} VNĐ
                  </span>
                </p>
                <p className="text-gray-700">
                  <strong className="font-medium text-gray-800">
                    Phương thức thanh toán:
                  </strong>{" "}
                  {order.paymentMethod === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : "Thanh toán trực tuyến"}
                </p>
                <p className="text-gray-700">
                  <strong className="font-medium text-gray-800">
                    Trạng thái thanh toán:
                  </strong>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === "Completed"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.paymentStatus === "Completed"
                      ? "Đã thanh toán"
                      : order.paymentStatus === "Pending"
                      ? "Chưa thanh toán"
                      : "Thanh toán thất bại"}
                  </span>
                </p>
                <p className="text-gray-700">
                  <strong className="font-medium text-gray-800">
                    Trạng thái:
                  </strong>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "Confirmed"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "Shipping"
                        ? "bg-purple-100 text-purple-800"
                        : order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {translateStatus(order.status)}
                  </span>
                </p>
                <p className="text-gray-700">
                  <strong className="font-medium text-gray-800">
                    Ngày tạo:
                  </strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Sản phẩm trong đơn hàng
              </h2>
              {order.orderDetails.length === 0 ? (
                <p className="text-gray-600 py-4">
                  Không có sản phẩm nào trong đơn hàng này.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-gray-700 font-semibold">
                          Sản phẩm
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                          Màu sắc
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                          Giá
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.orderDetails.map((item, index) => (
                        <TableRow
                          key={index}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <TableCell className="font-medium text-gray-800">
                            {item.product.name}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {item.color.name}
                          </TableCell>
                          <TableCell className="text-gray-800">
                            <span className="font-semibold text-blue-600">
                              {item.discountedPrice?.toLocaleString("vi-VN")}{" "}
                              VNĐ
                            </span>
                            {item.discountedPrice &&
                              item.originalPrice &&
                              item.discountedPrice < item.originalPrice && (
                                <span className="text-sm text-gray-400 line-through ml-2">
                                  {item.originalPrice.toLocaleString("vi-VN")}{" "}
                                  VNĐ
                                </span>
                              )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          {order.status === "Pending" && (
            <div className="mt-6 lg:absolute lg:bottom-8 lg:right-8 lg:w-auto">
              <Button
                onClick={handleUpdateStatus}
                className="w-full lg:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Hủy đơn hàng
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OrderDetailsPage;
