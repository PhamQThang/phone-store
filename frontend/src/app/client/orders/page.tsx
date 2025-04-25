"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getOrders } from "@/api/orderApi";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { Order } from "@/lib/types";

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const formatOrderId = (id: string) => {
    return `${id.substring(0, 8)}...`;
  };

  useEffect(() => {
    const user = localStorage.getItem("fullName");
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const ordersData = await getOrders();
        setOrders(ordersData);
      } catch (error: any) {
        setError(
          error.response?.data?.message || "Không thể lấy danh sách đơn hàng"
        );
        toast.error("Lỗi", {
          description:
            error.response?.data?.message || "Không thể lấy danh sách đơn hàng",
          duration: 2000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const orderId = searchParams.get("orderId");
    const success = searchParams.get("success");

    if (orderId && success) {
      if (success === "true") {
        toast.success("Thanh toán thành công", {
          description: `Đơn hàng ${formatOrderId(orderId)} đã được xác nhận`,
          duration: 3000,
        });
      } else {
        toast.error("Thanh toán thất bại", {
          description: `Đơn hàng ${formatOrderId(orderId)} đã bị hủy`,
          duration: 3000,
        });
      }

      router.replace("/client/orders");
    }
  }, [router, searchParams]);

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

  const filterOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.status === status);
  };

  const handleViewDetails = (orderId: string) => {
    router.push(`/client/orders/${orderId}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4 mr-1" />;
      case "Confirmed":
        return <Package className="w-4 h-4 mr-1" />;
      case "Shipping":
        return <Truck className="w-4 h-4 mr-1" />;
      case "Delivered":
        return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case "Canceled":
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "Confirmed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "Shipping":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "Delivered":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "Canceled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="bg-red-50 p-6 rounded-lg max-w-md text-center mx-4">
          <h3 className="text-lg font-medium text-red-800">Đã xảy ra lỗi</h3>
          <p className="mt-2 text-red-600">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Danh sách đơn hàng
          </h1>
          <p className="mt-1 sm:mt-2 text-gray-600 text-sm sm:text-base">
            Xem lại các đơn hàng bạn đã đặt
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="flex w-max sm:w-full">
              <TabsTrigger
                value="all"
                className="flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-full mr-2"
              >
                Tất cả
              </TabsTrigger>
              <TabsTrigger
                value="Pending"
                className="flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-full mr-2"
              >
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Đang chờ</span>
                <span className="sm:hidden">Chờ</span>
              </TabsTrigger>
              <TabsTrigger
                value="Confirmed"
                className="flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-full mr-2"
              >
                <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Đã xác nhận</span>
                <span className="sm:hidden">Xác nhận</span>
              </TabsTrigger>
              <TabsTrigger
                value="Shipping"
                className="flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-full mr-2"
              >
                <Truck className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Đang giao</span>
                <span className="sm:hidden">Giao</span>
              </TabsTrigger>
              <TabsTrigger
                value="Delivered"
                className="flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-full mr-2"
              >
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Đã giao</span>
                <span className="sm:hidden">Giao</span>
              </TabsTrigger>
              <TabsTrigger
                value="Canceled"
                className="flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-full"
              >
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Đã hủy</span>
                <span className="sm:hidden">Hủy</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all">
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
                <ShoppingCart className="mx-auto h-10 w-10 text-gray-400" />
                <h3 className="mt-3 text-lg font-medium text-gray-900">
                  Không có đơn hàng
                </h3>
                <p className="mt-1 text-gray-500 text-sm sm:text-base">
                  Bạn chưa có đơn hàng nào.
                </p>
                <Button
                  onClick={() => router.push("/client/products")}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Mua sắm ngay
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card
                    key={order.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="sm:hidden mb-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-500 text-sm">
                              #{formatOrderId(order.id)}
                            </span>
                            <Badge
                              className={`${getStatusColor(
                                order.status
                              )} text-xs`}
                            >
                              {translateStatus(order.status)}
                            </Badge>
                          </div>
                          <div className="text-lg font-bold text-blue-600 mt-1">
                            {order.totalAmount.toLocaleString("vi-VN")}₫
                          </div>
                        </div>

                        <div className="hidden sm:block">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 text-sm mr-3">
                              #{formatOrderId(order.id)}
                            </span>
                            <Badge
                              className={`${getStatusColor(
                                order.status
                              )} text-xs`}
                            >
                              {getStatusIcon(order.status)}
                              {translateStatus(order.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <CalendarDays className="w-4 h-4 mr-1" />
                            {new Date(order.createdAt).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "numeric",
                                month: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="hidden sm:block text-lg font-bold text-blue-600">
                            {order.totalAmount.toLocaleString("vi-VN")}₫
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 mt-1">
                            {order.paymentMethod} •{" "}
                            {order.paymentStatus === "Completed"
                              ? "Đã thanh toán"
                              : order.paymentStatus === "Pending"
                              ? "Chưa thanh toán"
                              : "Thanh toán thất bại"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Sản phẩm
                        </h4>
                        <div className="space-y-3">
                          {order.orderDetails.map((detail, index) => (
                            <div key={index} className="flex items-start">
                              <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-md overflow-hidden mr-3">
                                <Image
                                  src={
                                    detail.product.imageUrl ||
                                    "/placeholder-product.jpg"
                                  }
                                  alt={detail.product.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 56px, 64px"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {detail.product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Màu: {detail.color.name}
                                </p>
                                <p className="text-sm font-medium mt-1">
                                  {detail.discountedPrice?.toLocaleString(
                                    "vi-VN"
                                  )}
                                  ₫
                                  {detail.discountedPrice &&
                                    detail.originalPrice &&
                                    detail.discountedPrice <
                                      detail.originalPrice && (
                                      <span className="text-sm text-gray-500 line-through ml-2">
                                        {detail.originalPrice.toLocaleString(
                                          "vi-VN"
                                        )}
                                        ₫
                                      </span>
                                    )}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button
                          onClick={() => handleViewDetails(order.id)}
                          variant="outline"
                          className="flex items-center text-sm sm:text-base"
                          size="sm"
                        >
                          Xem chi tiết <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {["Pending", "Confirmed", "Shipping", "Delivered", "Canceled"].map(
            (status) => (
              <TabsContent key={status} value={status}>
                {filterOrdersByStatus(status).length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
                    <Package className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-3 text-lg font-medium text-gray-900">
                      Không có đơn hàng {translateStatus(status).toLowerCase()}
                    </h3>
                    <Button
                      onClick={() => router.push("/client/products")}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      Mua sắm ngay
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filterOrdersByStatus(status).map((order) => (
                      <Card
                        key={order.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="sm:hidden mb-3">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-500 text-sm">
                                  #{formatOrderId(order.id)}
                                </span>
                                <Badge
                                  className={`${getStatusColor(
                                    order.status
                                  )} text-xs`}
                                >
                                  {translateStatus(order.status)}
                                </Badge>
                              </div>
                              <div className="text-lg font-bold text-blue-600 mt-1">
                                {order.totalAmount.toLocaleString("vi-VN")}₫
                              </div>
                            </div>

                            <div className="hidden sm:block">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-500 text-sm mr-3">
                                  #{formatOrderId(order.id)}
                                </span>
                                <Badge
                                  className={`${getStatusColor(
                                    order.status
                                  )} text-xs`}
                                >
                                  {getStatusIcon(order.status)}
                                  {translateStatus(order.status)}
                                </Badge>
                              </div>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <CalendarDays className="w-4 h-4 mr-1" />
                                {new Date(order.createdAt).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    day: "numeric",
                                    month: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="hidden sm:block text-lg font-bold text-blue-600">
                                {order.totalAmount.toLocaleString("vi-VN")}₫
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                {order.paymentMethod} •{" "}
                                {order.paymentStatus === "Completed"
                                  ? "Đã thanh toán"
                                  : order.paymentStatus === "Pending"
                                  ? "Chưa thanh toán"
                                  : "Thanh toán thất bại"}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Sản phẩm
                            </h4>
                            <div className="space-y-3">
                              {order.orderDetails.map((detail, index) => (
                                <div key={index} className="flex items-start">
                                  <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-md overflow-hidden mr-3">
                                    <Image
                                      src={
                                        detail.product.imageUrl ||
                                        "/placeholder-product.jpg"
                                      }
                                      alt={detail.product.name}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 640px) 56px, 64px"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {detail.product.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Màu: {detail.color.name}
                                    </p>
                                    <p className="text-sm font-medium mt-1">
                                      {detail.discountedPrice?.toLocaleString(
                                        "vi-VN"
                                      )}
                                      ₫
                                      {detail.discountedPrice &&
                                        detail.originalPrice &&
                                        detail.discountedPrice <
                                          detail.originalPrice && (
                                          <span className="text-sm text-gray-500 line-through ml-2">
                                            {detail.originalPrice.toLocaleString(
                                              "vi-VN"
                                            )}
                                            ₫
                                          </span>
                                        )}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <Button
                              onClick={() => handleViewDetails(order.id)}
                              variant="outline"
                              className="flex items-center text-sm sm:text-base"
                              size="sm"
                            >
                              Xem chi tiết{" "}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default OrdersPage;
