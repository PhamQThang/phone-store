// app/admin/purchase-orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Eye, Plus, Loader2, Trash, Edit } from "lucide-react";
import {
  PurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById, // Thêm import
  updatePurchaseOrder,
  deletePurchaseOrder,
} from "@/api/admin/purchaseOrdersApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clearLocalStorage } from "@/lib/utils";
import { PurchaseOrderForm } from "@/components/admin/purchase-orders/PurchaseOrderForm";
import { PurchaseOrderDetail } from "@/components/admin/purchase-orders/PurchaseOrderDetail";

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    setRole(userRole);

    if (!userRole || (userRole !== "Admin" && userRole !== "Employee")) {
      toast.error("Không có quyền truy cập", {
        description: "Chỉ Admin và Employee mới được truy cập trang này.",
        duration: 2000,
      });
      clearLocalStorage();
      router.push("/auth/login");
    } else {
      fetchPurchaseOrders();
    }
  }, [router]);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const data = await getPurchaseOrders();
      setPurchaseOrders(data);
      setSelectedPurchaseOrder(null);
    } catch (error: any) {
      toast.error("Lỗi khi lấy danh sách đơn nhập hàng", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePurchaseOrder = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa đơn nhập hàng này?")) {
      try {
        await deletePurchaseOrder(id);
        setPurchaseOrders(purchaseOrders.filter((order) => order.id !== id));
        toast.success("Xóa đơn nhập hàng thành công");
      } catch (error: any) {
        toast.error("Xóa đơn nhập hàng thất bại", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const updatedOrder = await updatePurchaseOrder(id, { status });
      if (!updatedOrder || !updatedOrder.id) {
        throw new Error("Dữ liệu trả về từ API không hợp lệ");
      }
      setPurchaseOrders(
        purchaseOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      toast.success("Cập nhật trạng thái đơn nhập hàng thành công");
    } catch (error: any) {
      toast.error("Cập nhật trạng thái thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  const handleViewDetail = async (order: PurchaseOrder) => {
    setSelectedPurchaseOrder(order);
    setIsDetailOpen(true);
  };

  const handleEditPurchaseOrder = async (order: PurchaseOrder) => {
    if (order.status !== "Pending") {
      toast.error("Chỉ có thể chỉnh sửa đơn nhập hàng ở trạng thái Pending");
      return;
    }
    try {
      const detailedOrder = await getPurchaseOrderById(order.id);
      console.log("Initial data for edit:", detailedOrder); // Thêm log
      setSelectedPurchaseOrder(detailedOrder);
      setIsEditOpen(true);
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết đơn nhập hàng", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  const handleEditClose = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      setSelectedPurchaseOrder(null);
    }
  };
  if (!role) {
    return (
      <p className="text-center text-gray-500">
        Đang kiểm tra quyền truy cập...
      </p>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-0">
          Quản lý nhập hàng
        </h2>
        {(role === "Admin" || role === "Employee") && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      ) : purchaseOrders.length === 0 ? (
        <p className="text-center text-gray-500">Không có đơn nhập hàng nào.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">ID</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Nhà cung cấp
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Ngày nhập
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Tổng chi phí
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Người tạo
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {order.id}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {order.supplier.name}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(order.importDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {order.totalCost.toLocaleString()} VNĐ
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {role === "Admin" || role === "Employee" ? (
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            handleUpdateStatus(order.id, value)
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        order.status
                      )}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {order.createdBy
                        ? `${order.createdBy.firstName} ${order.createdBy.lastName}`
                        : "Không xác định"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(role === "Admin" || role === "Employee") && (
                          <>
                            {order.status === "Pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPurchaseOrder(order)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeletePurchaseOrder(order.id)
                              }
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="block md:hidden space-y-4">
            {purchaseOrders.map((order) => (
              <Card key={order.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Đơn nhập hàng #{order.id}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <p>
                    <strong>Nhà cung cấp:</strong> {order.supplier.name}
                  </p>
                  <p>
                    <strong>Ngày nhập:</strong>{" "}
                    {new Date(order.importDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Tổng chi phí:</strong>{" "}
                    {order.totalCost.toLocaleString()} VNĐ
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {role === "Admin" || role === "Employee" ? (
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          handleUpdateStatus(order.id, value)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      order.status
                    )}
                  </p>
                  <p>
                    <strong>Người tạo:</strong>{" "}
                    {order.createdBy
                      ? `${order.createdBy.firstName} ${order.createdBy.lastName}`
                      : "Không xác định"}
                  </p>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Xem
                    </Button>
                    {(role === "Admin" || role === "Employee") && (
                      <>
                        {order.status === "Pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPurchaseOrder(order)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Cập nhật
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePurchaseOrder(order.id)}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {(role === "Admin" || role === "Employee") && (
        <>
          <PurchaseOrderForm
            open={isAddOpen}
            onOpenChange={setIsAddOpen}
            onSuccess={fetchPurchaseOrders}
          />
          <PurchaseOrderForm
            open={isEditOpen}
            onOpenChange={handleEditClose}
            onSuccess={fetchPurchaseOrders}
            initialData={selectedPurchaseOrder || undefined}
          />
        </>
      )}

      <PurchaseOrderDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        purchaseOrder={selectedPurchaseOrder}
      />
    </div>
  );
}
