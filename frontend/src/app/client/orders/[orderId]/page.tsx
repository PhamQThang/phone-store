"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrderDetails, updateOrderStatus } from "@/api/orderApi";
import {
  createWarrantyRequest,
  getWarrantyRequests,
  getWarranties,
} from "@/api/warrantyApi";
import { Order, WarrantyRequest, Warranty } from "@/lib/types";

const OrderDetailsPage = ({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [warrantyRequests, setWarrantyRequests] = useState<WarrantyRequest[]>(
    []
  );
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const unwrappedParams = React.use(params);
  const orderId = unwrappedParams.orderId;

  const user = localStorage.getItem("fullName");
  const userEmail = localStorage.getItem("userEmail");
  const userPhone = localStorage.getItem("phoneNumber");

  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [selectedProductIdentityId, setSelectedProductIdentityId] = useState<
    string | null
  >(null);
  const [warrantyForm, setWarrantyForm] = useState({
    reason: "",
    fullName: user || "",
    phoneNumber: userPhone || "",
    email: userEmail || "",
  });

  const fetchData = useCallback(async () => {
    try {
      const orderData = await getOrderDetails(orderId);
      setOrder(orderData);

      const [warrantyRequestsData, warrantiesData] = await Promise.all([
        getWarrantyRequests(),
        getWarranties(),
      ]);
      setWarrantyRequests(warrantyRequestsData);
      setWarranties(warrantiesData);
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
  }, [orderId]);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    fetchData();
  }, [user, orderId, router, fetchData]);

  // Làm mới dữ liệu khi người dùng quay lại trang
  useEffect(() => {
    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchData]);

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

  const isWithinWarrantyPeriod = (warrantyEndDate: string | undefined) => {
    if (!warrantyEndDate) return false;
    const currentDate = new Date();
    const endDate = new Date(warrantyEndDate);
    return currentDate <= endDate;
  };

  const hasPendingWarrantyRequest = (productIdentityId: string) => {
    // Lấy tất cả warrantyRequest liên quan đến productIdentityId
    const relatedRequests = warrantyRequests.filter(
      (request) => request.productIdentityId === productIdentityId
    );

    // Nếu không có warrantyRequest nào, cho phép tạo yêu cầu mới
    if (!relatedRequests.length) {
      return false;
    }

    // Kiểm tra xem có bất kỳ warrantyRequest nào không ở trạng thái Completed hoặc Rejected không
    const hasUnfinishedRequest = relatedRequests.some(
      (request) => !["Completed", "Rejected"].includes(request.status)
    );

    return hasUnfinishedRequest;
  };

  const handleOpenWarrantyModal = (productIdentityId: string) => {
    setSelectedProductIdentityId(productIdentityId);
    setWarrantyForm({
      reason: "",
      fullName: user || "",
      phoneNumber: userPhone || "",
      email: userEmail || "",
    });
    setIsWarrantyModalOpen(true);
  };

  const handleWarrantyFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWarrantyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitWarrantyRequest = async () => {
    if (!selectedProductIdentityId) return;

    try {
      const warrantyRequestData = {
        productIdentityId: selectedProductIdentityId,
        reason: warrantyForm.reason,
        fullName: warrantyForm.fullName,
        phoneNumber: warrantyForm.phoneNumber,
        email: warrantyForm.email,
      };

      const response = await createWarrantyRequest(warrantyRequestData);
      setWarrantyRequests((prev) => [...prev, response]);
      setIsWarrantyModalOpen(false);
      toast.success("Tạo yêu cầu bảo hành thành công", { duration: 2000 });

      await fetchData();
    } catch (error: any) {
      toast.error("Lỗi", {
        description:
          error.response?.data?.message || "Không thể tạo yêu cầu bảo hành",
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
                        <TableHead className="text-gray-700 font-semibold">
                          Thời hạn bảo hành
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                          Số lần bảo hành
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                          Hành động
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.orderDetails.map((item, index) => {
                        const withinWarranty = isWithinWarrantyPeriod(
                          item.productIdentity.warrantyEndDate
                        );
                        const hasWarrantyRequest = hasPendingWarrantyRequest(
                          item.productIdentityId
                        );
                        const isOrderDelivered = order.status === "Delivered";

                        return (
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
                            <TableCell className="text-gray-600">
                              {item.productIdentity.warrantyEndDate ? (
                                withinWarranty ? (
                                  <span className="text-green-600">
                                    Còn hạn đến{" "}
                                    {new Date(
                                      item.productIdentity.warrantyEndDate
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                ) : (
                                  <span className="text-red-600">
                                    Hết hạn{" "}
                                    {new Date(
                                      item.productIdentity.warrantyEndDate
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                )
                              ) : (
                                "Không có"
                              )}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {item.productIdentity.warrantyCount || 0} lần
                            </TableCell>
                            <TableCell>
                              {withinWarranty &&
                              !hasWarrantyRequest &&
                              isOrderDelivered ? (
                                <Dialog
                                  open={isWarrantyModalOpen}
                                  onOpenChange={setIsWarrantyModalOpen}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      onClick={() =>
                                        handleOpenWarrantyModal(
                                          item.productIdentityId
                                        )
                                      }
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      Yêu cầu bảo hành
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Yêu cầu bảo hành
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label
                                          htmlFor="reason"
                                          className="text-right"
                                        >
                                          Lý do
                                        </Label>
                                        <Input
                                          id="reason"
                                          name="reason"
                                          value={warrantyForm.reason}
                                          onChange={handleWarrantyFormChange}
                                          className="col-span-3"
                                          required
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label
                                          htmlFor="fullName"
                                          className="text-right"
                                        >
                                          Họ tên
                                        </Label>
                                        <Input
                                          id="fullName"
                                          name="fullName"
                                          value={warrantyForm.fullName}
                                          onChange={handleWarrantyFormChange}
                                          className="col-span-3"
                                          required
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label
                                          htmlFor="phoneNumber"
                                          className="text-right"
                                        >
                                          Số điện thoại
                                        </Label>
                                        <Input
                                          id="phoneNumber"
                                          name="phoneNumber"
                                          value={warrantyForm.phoneNumber}
                                          onChange={handleWarrantyFormChange}
                                          className="col-span-3"
                                          required
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label
                                          htmlFor="email"
                                          className="text-right"
                                        >
                                          Email
                                        </Label>
                                        <Input
                                          id="email"
                                          name="email"
                                          type="email"
                                          value={warrantyForm.email}
                                          onChange={handleWarrantyFormChange}
                                          className="col-span-3"
                                          required
                                        />
                                      </div>
                                    </div>
                                    <Button
                                      onClick={handleSubmitWarrantyRequest}
                                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      Gửi yêu cầu
                                    </Button>
                                  </DialogContent>
                                </Dialog>
                              ) : hasWarrantyRequest ? (
                                <span className="text-yellow-600">
                                  Đang xử lý bảo hành
                                </span>
                              ) : !isOrderDelivered ? (
                                <span className="text-gray-600">
                                  Đơn hàng chưa được giao
                                </span>
                              ) : (
                                <span className="text-gray-600">
                                  Không thể yêu cầu
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
