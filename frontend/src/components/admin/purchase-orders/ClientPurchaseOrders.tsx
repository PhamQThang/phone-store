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
import { Eye, Plus, Trash, Edit } from "lucide-react";
import { PurchaseOrder } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PurchaseOrderForm } from "@/components/admin/purchase-orders/PurchaseOrderForm";
import { PurchaseOrderDetail } from "@/components/admin/purchase-orders/PurchaseOrderDetail";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientPurchaseOrdersProps {
  purchaseOrders: PurchaseOrder[];
  role: string;
  token: string;
  addPurchaseOrderAction: (formData: FormData) => Promise<any>;
  editPurchaseOrderAction: (id: string, formData: FormData) => Promise<any>;
  deletePurchaseOrderAction: (id: string) => Promise<any>;
  getPurchaseOrderDetailAction: (id: string) => Promise<any>;
}

export default function ClientPurchaseOrders({
  purchaseOrders: initialPurchaseOrders,
  role,
  token,
  addPurchaseOrderAction,
  editPurchaseOrderAction,
  deletePurchaseOrderAction,
  getPurchaseOrderDetailAction,
}: ClientPurchaseOrdersProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    useState<PurchaseOrder | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  // Thêm đơn nhập hàng
  const handleAddPurchaseOrder = async (data: {
    supplierId: string;
    note?: string;
    details: any[];
  }) => {
    setIsAdding(true);
    try {
      const formData = new FormData();
      formData.append("supplierId", data.supplierId);
      if (data.note) formData.append("note", data.note);
      formData.append("details", JSON.stringify(data.details));

      const result = await addPurchaseOrderAction(formData);
      if (result.success) {
        toast.success(result.message);
        setIsAddOpen(false); // Tự động đóng form
      } else {
        toast.error("Thêm đơn nhập hàng thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Thêm đơn nhập hàng thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Sửa đơn nhập hàng
  const handleEditPurchaseOrder = async (data: {
    supplierId: string;
    note?: string;
    status: string;
    details: any[];
    detailsToDelete: string[];
    detailsToUpdate: any[];
  }) => {
    if (!selectedPurchaseOrder) return;
    setIsEditing(true);
    try {
      const formData = new FormData();
      formData.append("status", data.status);
      formData.append("details", JSON.stringify(data.details));
      formData.append("detailsToDelete", JSON.stringify(data.detailsToDelete));
      formData.append("detailsToUpdate", JSON.stringify(data.detailsToUpdate));

      const result = await editPurchaseOrderAction(
        selectedPurchaseOrder.id,
        formData
      );
      if (result.success) {
        toast.success(result.message);
        setIsEditOpen(false); // Tự động đóng form
      } else {
        toast.error("Cập nhật đơn nhập hàng thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Cập nhật đơn nhập hàng thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsEditing(false);
    }
  };

  // Xóa đơn nhập hàng
  const handleDeletePurchaseOrder = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa đơn nhập hàng này?")) {
      setIsDeleting(true);
      try {
        const result = await deletePurchaseOrderAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error("Xóa đơn nhập hàng thất bại", {
            description: result.error || "Vui lòng thử lại sau.",
            duration: 2000,
          });
        }
      } catch (error: any) {
        toast.error("Xóa đơn nhập hàng thất bại", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Cập nhật trạng thái đơn nhập hàng
  const handleUpdateStatus = async (id: string, status: string) => {
    if (!selectedPurchaseOrder) return;
    setIsEditing(true);
    try {
      const formData = new FormData();
      formData.append("status", status);
      formData.append("details", JSON.stringify([]));
      formData.append("detailsToDelete", JSON.stringify([]));
      formData.append("detailsToUpdate", JSON.stringify([]));

      const result = await editPurchaseOrderAction(id, formData);
      if (result.success) {
        toast.success("Cập nhật trạng thái thành công");
      } else {
        toast.error("Cập nhật trạng thái thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Cập nhật trạng thái thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsEditing(false);
    }
  };

  // Xem chi tiết đơn nhập hàng
  const handleViewDetail = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getPurchaseOrderDetailAction(id);
      if (result.success) {
        setSelectedPurchaseOrder(result.purchaseOrder);
        setIsDetailOpen(true);
      } else {
        toast.error("Lỗi khi lấy chi tiết đơn nhập hàng", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết đơn nhập hàng", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsViewing(false);
    }
  };

  // Mở form chỉnh sửa và lấy dữ liệu đơn nhập hàng
  const handleOpenEdit = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getPurchaseOrderDetailAction(id);
      if (result.success) {
        if (result.purchaseOrder.status !== "Pending") {
          toast.error(
            "Chỉ có thể chỉnh sửa đơn nhập hàng ở trạng thái Pending"
          );
          setIsViewing(false);
          return;
        }
        setSelectedPurchaseOrder(result.purchaseOrder);
        setIsEditOpen(true);
      } else {
        toast.error("Lỗi khi lấy thông tin đơn nhập hàng", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy thông tin đơn nhập hàng", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsViewing(false);
    }
  };

  const isLoading = isAdding || isEditing || isDeleting || isViewing;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          Quản lý nhập hàng
        </h2>
        {(role === "Admin" || role === "Employee") && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm
          </Button>
        )}
      </div>

      {isLoading && !isAdding && !isEditing ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : initialPurchaseOrders.length === 0 ? (
        <p className="text-center text-gray-500">Không có đơn nhập hàng nào.</p>
      ) : (
        <>
          {/* Hiển thị dạng bảng trên màn hình lớn (PC, tablet) */}
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
                {initialPurchaseOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {order.id}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {order.supplier?.name ?? "Không xác định"}
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
                          disabled={isLoading || order.status === "Done"} // Vô hiệu hóa nếu trạng thái là Done
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
                          onClick={() => handleViewDetail(order.id)}
                          disabled={isLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(role === "Admin" || role === "Employee") && (
                          <>
                            {order.status === "Pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(order.id)}
                                disabled={isLoading}
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
                              disabled={isLoading}
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

          {/* Hiển thị dạng danh sách trên mobile */}
          <div className="block md:hidden space-y-4">
            {initialPurchaseOrders.map((order) => (
              <Card key={order.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Đơn nhập hàng #{order.id}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <p>
                    <strong>Nhà cung cấp:</strong>{" "}
                    {order.supplier?.name ?? "Không xác định"}
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
                        disabled={isLoading || order.status === "Done"} // Vô hiệu hóa nếu trạng thái là Done
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
                      onClick={() => handleViewDetail(order.id)}
                      disabled={isLoading}
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
                            onClick={() => handleOpenEdit(order.id)}
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Sửa
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePurchaseOrder(order.id)}
                          disabled={isLoading}
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

      {/* Modal Thêm đơn nhập hàng */}
      {(role === "Admin" || role === "Employee") && (
        <>
          <PurchaseOrderForm
            open={isAddOpen}
            onOpenChange={setIsAddOpen}
            onSubmit={handleAddPurchaseOrder}
            isLoading={isAdding}
            token={token}
          />
          <PurchaseOrderForm
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            onSubmit={handleEditPurchaseOrder}
            initialData={selectedPurchaseOrder || undefined}
            isLoading={isEditing}
            token={token}
          />
        </>
      )}

      {/* Modal Xem chi tiết đơn nhập hàng */}
      <PurchaseOrderDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        purchaseOrder={selectedPurchaseOrder}
      />
    </>
  );
}
