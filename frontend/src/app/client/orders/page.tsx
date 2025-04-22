"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrders } from "@/api/orderApi";

interface OrderDetail {
  product: { name: string };
  color: { name: string };
  price: number;
}

interface Order {
  id: string;
  address: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  phoneNumber?: string;
  paymentMethod: string;
  paymentStatus: string;
  user: { firstName: string; lastName: string };
  orderDetails: OrderDetail[];
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Kiểm tra đăng nhập
  const user = localStorage.getItem("fullName");

  useEffect(() => {
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
  }, [user, router]);

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

  // Lọc đơn hàng theo trạng thái
  const filterOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.status === status);
  };

  // Chuyển hướng đến trang chi tiết đơn hàng
  const handleViewDetails = (orderId: string) => {
    router.push(`/client/orders/${orderId}`);
  };

  if (loading) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto py-4 px-3">
      <Card className="!px-3">
        <p className="px-3 text-2xl font-semibold">Danh sách đơn hàng của bạn</p>
        <CardContent className="!p-0">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-2 h-auto">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="Pending">Đang chờ</TabsTrigger>
              <TabsTrigger value="Confirmed">Đã xác nhận</TabsTrigger>
              <TabsTrigger value="Shipping">Đang giao</TabsTrigger>
              <TabsTrigger value="Delivered">Đã giao</TabsTrigger>
              <TabsTrigger value="Canceled">Đã hủy</TabsTrigger>
            </TabsList>

            {/* Tab: Tất cả đơn hàng */}
            <TabsContent value="all">
              {orders.length === 0 ? (
                <p className="text-center mt-4">Bạn chưa có đơn hàng nào.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn hàng</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className=" !truncate">{order.id}</TableCell>
                        <TableCell>{order.address}</TableCell>
                        <TableCell>
                          {order.totalAmount.toLocaleString("vi-VN")} VNĐ
                        </TableCell>
                        <TableCell>{translateStatus(order.status)}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button onClick={() => handleViewDetails(order.id)}>
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Tab: Đang chờ */}
            <TabsContent value="Pending">
              {filterOrdersByStatus("Pending").length === 0 ? (
                <p className="text-center mt-4">
                  Không có đơn hàng nào đang chờ.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn hàng</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterOrdersByStatus("Pending").map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.address}</TableCell>
                        <TableCell>
                          {order.totalAmount.toLocaleString("vi-VN")} VNĐ
                        </TableCell>
                        <TableCell>{translateStatus(order.status)}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button onClick={() => handleViewDetails(order.id)}>
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Tab: Đã xác nhận */}
            <TabsContent value="Confirmed">
              {filterOrdersByStatus("Confirmed").length === 0 ? (
                <p className="text-center mt-4">
                  Không có đơn hàng nào đã xác nhận.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn hàng</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterOrdersByStatus("Confirmed").map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.address}</TableCell>
                        <TableCell>
                          {order.totalAmount.toLocaleString("vi-VN")} VNĐ
                        </TableCell>
                        <TableCell>{translateStatus(order.status)}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button onClick={() => handleViewDetails(order.id)}>
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Tab: Đang giao */}
            <TabsContent value="Shipping">
              {filterOrdersByStatus("Shipping").length === 0 ? (
                <p className="text-center mt-4">
                  Không có đơn hàng nào đang giao.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn hàng</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterOrdersByStatus("Shipping").map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.address}</TableCell>
                        <TableCell>
                          {order.totalAmount.toLocaleString("vi-VN")} VNĐ
                        </TableCell>
                        <TableCell>{translateStatus(order.status)}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button onClick={() => handleViewDetails(order.id)}>
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Tab: Đã giao */}
            <TabsContent value="Delivered">
              {filterOrdersByStatus("Delivered").length === 0 ? (
                <p className="text-center mt-4">
                  Không có đơn hàng nào đã giao.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn hàng</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterOrdersByStatus("Delivered").map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.address}</TableCell>
                        <TableCell>
                          {order.totalAmount.toLocaleString("vi-VN")} VNĐ
                        </TableCell>
                        <TableCell>{translateStatus(order.status)}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button onClick={() => handleViewDetails(order.id)}>
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Tab: Đã hủy */}
            <TabsContent value="Canceled">
              {filterOrdersByStatus("Canceled").length === 0 ? (
                <p className="text-center mt-4">
                  Không có đơn hàng nào đã hủy.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn hàng</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterOrdersByStatus("Canceled").map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.address}</TableCell>
                        <TableCell>
                          {order.totalAmount.toLocaleString("vi-VN")} VNĐ
                        </TableCell>
                        <TableCell>{translateStatus(order.status)}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button onClick={() => handleViewDetails(order.id)}>
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersPage;
