"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash, Eye, Search, X } from "lucide-react";
import { Order } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderDetail } from "./OrderDetail";
import { OrderForm } from "./OrderForm";

interface ClientOrdersProps {
  orders: Order[];
  role: string;
  updateOrderStatusAction: (id: string, status: string) => Promise<any>;
  getOrderDetailAction: (id: string) => Promise<any>;
}

export default function ClientOrders({
  orders,
  role,
  updateOrderStatusAction,
  getOrderDetailAction,
}: ClientOrdersProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

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

  // Lọc danh sách đơn hàng dựa trên từ khóa tìm kiếm và trạng thái
  const filteredOrders = orders
    .filter((order) =>
      activeTab === "all" ? true : order.status === activeTab
    )
    .filter((order) =>
      [order.id, order.address]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  // Cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = async (data: { status: string }) => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const result = await updateOrderStatusAction(
        selectedOrder.id,
        data.status
      );
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Cập nhật trạng thái đơn hàng thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Cập nhật trạng thái đơn hàng thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Xem chi tiết đơn hàng
  const handleViewDetail = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getOrderDetailAction(id);
      if (result.success) {
        setSelectedOrder(result.order);
        setIsDetailOpen(true);
        toast.success("Tải chi tiết đơn hàng thành công");
      } else {
        toast.error("Lỗi khi lấy chi tiết đơn hàng", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết đơn hàng", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsViewing(false);
    }
  };

  // Mở form chỉnh sửa và lấy dữ liệu đơn hàng
  const handleOpenEdit = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getOrderDetailAction(id);
      if (result.success) {
        setSelectedOrder(result.order);
        setIsEditOpen(true);
        toast.success("Tải thông tin đơn hàng thành công");
      } else {
        toast.error("Lỗi khi lấy thông tin đơn hàng", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy thông tin đơn hàng", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsViewing(false);
    }
  };

  const isLoading = isUpdating || isDeleting || isViewing;

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          Quản lý đơn hàng
        </h2>
        <div className="relative flex-1 sm:flex-none sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm đơn hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 text-sm sm:text-base w-full"
            disabled={isLoading}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-4"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="Pending">Đang chờ</TabsTrigger>
          <TabsTrigger value="Confirmed">Đã xác nhận</TabsTrigger>
          <TabsTrigger value="Shipping">Đang giao</TabsTrigger>
          <TabsTrigger value="Delivered">Đã giao</TabsTrigger>
          <TabsTrigger value="Canceled">Đã hủy</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500">
          {searchTerm
            ? "Không tìm thấy đơn hàng nào."
            : "Không có đơn hàng nào."}
        </p>
      ) : (
        <>
          {/* Hiển thị dạng bảng trên màn hình lớn (PC, tablet) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">
                    Mã đơn hàng
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Địa chỉ</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Tổng tiền
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Ngày tạo</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {order.id}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {order.address}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {order.totalAmount.toLocaleString("vi-VN")} VNĐ
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {translateStatus(order.status)}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(order.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(order.id)}
                          disabled={isLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(order.id)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Hiển thị dạng danh sách trên mobile */}
          <div className="block md:hidden space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Mã đơn hàng: {order.id}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <p>
                    <strong>Địa chỉ:</strong> {order.address}
                  </p>
                  <p>
                    <strong>Tổng tiền:</strong>{" "}
                    {order.totalAmount.toLocaleString("vi-VN")} VNĐ
                  </p>
                  <p>
                    <strong>Trạng thái:</strong> {translateStatus(order.status)}
                  </p>
                  <p>
                    <strong>Ngày tạo:</strong>{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(order.id)}
                      disabled={isLoading}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Xem
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(order.id)}
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Sửa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Modal Sửa trạng thái đơn hàng */}
      <OrderForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSubmit={handleUpdateOrderStatus}
        initialData={selectedOrder || undefined}
        isLoading={isUpdating}
      />

      {/* Modal Xem chi tiết đơn hàng */}
      <OrderDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        order={selectedOrder}
      />
    </div>
  );
}
