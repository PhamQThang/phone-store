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
import {
  Order,
  WarrantyRequest,
  Warranty,
  ProductReturn,
  ReturnTicket,
} from "@/lib/types";
import {
  createReturnRequest,
  getReturns,
  getReturnTickets,
} from "@/api/returnsApi";

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
  const [returns, setReturns] = useState<ProductReturn[]>([]);
  const [returnTickets, setReturnTickets] = useState<ReturnTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const unwrappedParams = React.use(params);
  const orderId = unwrappedParams.orderId;

  const user = localStorage.getItem("fullName");
  const userEmail = localStorage.getItem("userEmail");
  const userPhone = localStorage.getItem("phoneNumber");
  const userAddress = localStorage.getItem("address");

  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedProductIdentityId, setSelectedProductIdentityId] = useState<
    string | null
  >(null);
  const [warrantyForm, setWarrantyForm] = useState({
    reason: "",
    fullName: user || "",
    phoneNumber: userPhone || "",
    email: userEmail || "",
  });
  const [returnForm, setReturnForm] = useState({
    reason: "",
    fullName: user || "",
    phoneNumber: userPhone || "",
    address: userAddress || "",
  });

  const fetchData = useCallback(async () => {
    try {
      const [
        orderData,
        warrantyRequestsData,
        warrantiesData,
        returnsData,
        returnTicketsData,
      ] = await Promise.all([
        getOrderDetails(orderId),
        getWarrantyRequests(),
        getWarranties(),
        getReturns(),
        getReturnTickets(),
      ]);
      setOrder(orderData);
      setWarrantyRequests(warrantyRequestsData);
      setWarranties(warrantiesData);
      setReturns(returnsData);
      setReturnTickets(returnTicketsData);
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
      Returned: "Đã đổi trả",
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
      const response = await updateOrderStatus(orderId, { status: "Canceled" });
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
    const relatedRequests = warrantyRequests.filter(
      (request) => request.productIdentityId === productIdentityId
    );
    return relatedRequests.some(
      (request) => !["Completed", "Rejected"].includes(request.status)
    );
  };

  const hasPendingReturnRequest = (productIdentityId: string) => {
    const relatedReturns = returns.filter(
      (ret) => ret.productIdentityId === productIdentityId
    );
    return relatedReturns.some(
      (ret) => !["Completed", "Rejected"].includes(ret.status)
    );
  };

  const hasBeenReturned = (productIdentityId: string) => {
    const relatedReturnTickets = returnTickets.filter(
      (ticket) => ticket.productIdentityId === productIdentityId
    );
    return relatedReturnTickets.some((ticket) => ticket.status === "Returned");
  };

  const canReturn = (
    orderUpdatedAt: string | undefined,
    status: string
  ): boolean => {
    if (!orderUpdatedAt || status !== "Delivered") return false;
    const deliveredDate = new Date(orderUpdatedAt);
    const currentDate = new Date();
    const daysSinceDelivered = Math.floor(
      (currentDate.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const returnWindowDays = 2;
    return daysSinceDelivered <= returnWindowDays;
  };

  const canRequestWarranty = (
    orderUpdatedAt: string | undefined,
    status: string
  ): boolean => {
    if (!orderUpdatedAt || status !== "Delivered") return false;
    const deliveredDate = new Date(orderUpdatedAt);
    const currentDate = new Date();
    const daysSinceDelivered = Math.floor(
      (currentDate.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const returnWindowDays = 7;
    return daysSinceDelivered > returnWindowDays;
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

  const handleOpenReturnModal = (productIdentityId: string) => {
    setSelectedProductIdentityId(productIdentityId);
    setReturnForm({
      reason: "",
      fullName: user || "",
      phoneNumber: userPhone || "",
      address: userAddress || "",
    });
    setIsReturnModalOpen(true);
  };

  const handleWarrantyFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWarrantyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReturnFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setReturnForm((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmitReturnRequest = async () => {
    if (!selectedProductIdentityId) return;

    try {
      const returnRequestData = {
        productIdentityId: selectedProductIdentityId,
        reason: returnForm.reason,
        fullName: returnForm.fullName,
        phoneNumber: returnForm.phoneNumber,
        address: returnForm.address,
      };

      const response = await createReturnRequest(returnRequestData);
      setReturns((prev) => [...prev, response]);
      setIsReturnModalOpen(false);
      toast.success("Tạo yêu cầu đổi trả thành công", { duration: 2000 });
      await fetchData();
    } catch (error: any) {
      toast.error("Lỗi", {
        description:
          error.response?.data?.message || "Không thể tạo yêu cầu đổi trả",
        duration: 2000,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-gray-700 text-xl flex items-center gap-3 bg-white p-6 rounded-xl shadow-lg">
          <svg
            className="animate-spin h-7 w-7 text-indigo-600"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-red-600 text-xl bg-white p-8 rounded-xl shadow-lg border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-gray-700 text-xl bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          Không tìm thấy đơn hàng.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Card className="max-w-5xl mx-auto shadow-2xl border border-gray-200 rounded-2xl bg-white relative overflow-hidden">
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
            Chi tiết đơn hàng #{order.id.substring(0, 8)}...
          </h1>
          <div className="flex flex-col gap-4">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-indigo-100 pb-3">
                Thông tin đơn hàng
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 text-lg">
                  <strong className="font-medium text-gray-900">
                    Mã đơn hàng:
                  </strong>{" "}
                  <span className="text-indigo-600">{order.id}</span>
                </p>
                <p className="text-gray-700 text-lg">
                  <strong className="font-medium text-gray-900">
                    Địa chỉ:
                  </strong>{" "}
                  {order.address}
                </p>
                <p className="text-gray-700 text-lg">
                  <strong className="font-medium text-gray-900">
                    Số điện thoại:
                  </strong>{" "}
                  {order.phoneNumber || "Không có"}
                </p>
                <p className="text-gray-700 text-lg">
                  <strong className="font-medium text-gray-900">
                    Tổng tiền:
                  </strong>{" "}
                  <span className="text-indigo-600 font-semibold">
                    {order.totalAmount.toLocaleString("vi-VN")} VNĐ
                  </span>
                </p>
                <p className="text-gray-700 text-lg">
                  <strong className="font-medium text-gray-900">
                    Phương thức thanh toán:
                  </strong>{" "}
                  {order.paymentMethod === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : "Thanh toán trực tuyến"}
                </p>
                <p className="text-gray-700 text-lg">
                  <strong className="font-medium text-gray-900">
                    Trạng thái thanh toán:
                  </strong>{" "}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm transition-all duration-300 ${
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
                <p className="text-gray-700 text-lg">
                  <strong className="font-medium text-gray-900">
                    Trạng thái:
                  </strong>{" "}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm transition-all duration-300 ${
                      order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "Confirmed"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "Shipping"
                        ? "bg-purple-100 text-purple-800"
                        : order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Returned"
                        ? "bg-red-100 text-red-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {translateStatus(order.status)}
                  </span>
                </p>
                <p className="text-gray-700 text-lg">
                  <strong className="font-medium text-gray-900">
                    Ngày tạo:
                  </strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </p>
                {order.status === "Delivered" && (
                  <p className="text-gray-700 text-lg">
                    <strong className="font-medium text-gray-900">
                      Ngày giao hàng:
                    </strong>{" "}
                    {new Date(order.updatedAt).toLocaleDateString("vi-VN")}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-indigo-100 pb-3">
                Sản phẩm trong đơn hàng
              </h2>
              {order.orderDetails.length === 0 ? (
                <p className="text-gray-600 py-4 text-lg">
                  Không có sản phẩm nào trong đơn hàng này.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-indigo-50">
                        <TableHead className="text-gray-800 font-semibold py-4">
                          Sản phẩm
                        </TableHead>
                        <TableHead className="text-gray-800 font-semibold py-4">
                          Màu sắc
                        </TableHead>
                        <TableHead className="text-gray-800 font-semibold py-4">
                          Giá
                        </TableHead>
                        <TableHead className="text-gray-800 font-semibold py-4">
                          Thời hạn bảo hành
                        </TableHead>
                        <TableHead className="text-gray-800 font-semibold py-4">
                          Số lần bảo hành
                        </TableHead>
                        <TableHead className="text-gray-800 font-semibold py-4">
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
                        const hasReturnRequest = hasPendingReturnRequest(
                          item.productIdentityId
                        );
                        const hasReturned = hasBeenReturned(
                          item.productIdentityId
                        );
                        const isOrderDelivered = order.status === "Delivered";
                        const orderUpdatedAt = order.updatedAt;
                        const isReturnable =
                          isOrderDelivered &&
                          canReturn(orderUpdatedAt, order.status);
                        const isWarrantyRequestable =
                          isOrderDelivered &&
                          canRequestWarranty(orderUpdatedAt, order.status);

                        return (
                          <TableRow
                            key={index}
                            className="hover:bg-indigo-50 transition-colors duration-200"
                          >
                            <TableCell className="font-medium text-gray-800 py-4">
                              {item.product.name}
                            </TableCell>
                            <TableCell className="text-gray-600 py-4">
                              {item.color.name}
                            </TableCell>
                            <TableCell className="text-gray-800 py-4">
                              <span className="font-semibold text-indigo-600">
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
                            <TableCell className="text-gray-600 py-4">
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
                            <TableCell className="text-gray-600 py-4">
                              {item.productIdentity.warrantyCount || 0} lần
                            </TableCell>
                            <TableCell className="py-4">
                              {isOrderDelivered ? (
                                hasReturned ? (
                                  <span className="text-red-600 font-medium">
                                    Đã đổi trả
                                  </span>
                                ) : (
                                  <>
                                    {isReturnable && !hasReturnRequest ? (
                                      <Dialog
                                        open={isReturnModalOpen}
                                        onOpenChange={setIsReturnModalOpen}
                                      >
                                        <DialogTrigger asChild>
                                          <Button
                                            onClick={() =>
                                              handleOpenReturnModal(
                                                item.productIdentityId
                                              )
                                            }
                                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                                          >
                                            Yêu cầu đổi trả
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px] rounded-xl bg-white p-6 shadow-2xl">
                                          <DialogHeader>
                                            <DialogTitle className="text-2xl font-semibold text-gray-900">
                                              Yêu cầu đổi trả
                                            </DialogTitle>
                                          </DialogHeader>
                                          <div className="grid gap-5 py-5">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label
                                                htmlFor="reason"
                                                className="text-right font-medium text-gray-700"
                                              >
                                                Lý do
                                              </Label>
                                              <Input
                                                id="reason"
                                                name="reason"
                                                value={returnForm.reason}
                                                onChange={
                                                  handleReturnFormChange
                                                }
                                                className="col-span-3 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                              />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label
                                                htmlFor="fullName"
                                                className="text-right font-medium text-gray-700"
                                              >
                                                Họ tên
                                              </Label>
                                              <Input
                                                id="fullName"
                                                name="fullName"
                                                value={returnForm.fullName}
                                                onChange={
                                                  handleReturnFormChange
                                                }
                                                className="col-span-3 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                              />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label
                                                htmlFor="phoneNumber"
                                                className="text-right font-medium text-gray-700"
                                              >
                                                Số điện thoại
                                              </Label>
                                              <Input
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                value={returnForm.phoneNumber}
                                                onChange={
                                                  handleReturnFormChange
                                                }
                                                className="col-span-3 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                              />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label
                                                htmlFor="address"
                                                className="text-right font-medium text-gray-700"
                                              >
                                                Địa chỉ
                                              </Label>
                                              <Input
                                                id="address"
                                                name="address"
                                                value={returnForm.address}
                                                onChange={
                                                  handleReturnFormChange
                                                }
                                                className="col-span-3 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                              />
                                            </div>
                                          </div>
                                          <Button
                                            onClick={handleSubmitReturnRequest}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-300"
                                          >
                                            Gửi yêu cầu
                                          </Button>
                                        </DialogContent>
                                      </Dialog>
                                    ) : hasReturnRequest ? (
                                      <span className="text-yellow-600 font-medium">
                                        Đang xử lý đổi trả
                                      </span>
                                    ) : isWarrantyRequestable &&
                                      withinWarranty &&
                                      !hasWarrantyRequest ? (
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
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                                          >
                                            Yêu cầu bảo hành
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px] rounded-xl bg-white p-6 shadow-2xl">
                                          <DialogHeader>
                                            <DialogTitle className="text-2xl font-semibold text-gray-900">
                                              Yêu cầu bảo hành
                                            </DialogTitle>
                                          </DialogHeader>
                                          <div className="grid gap-5 py-5">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label
                                                htmlFor="reason"
                                                className="text-right font-medium text-gray-700"
                                              >
                                                Lý do
                                              </Label>
                                              <Input
                                                id="reason"
                                                name="reason"
                                                value={warrantyForm.reason}
                                                onChange={
                                                  handleWarrantyFormChange
                                                }
                                                className="col-span-3 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                              />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label
                                                htmlFor="fullName"
                                                className="text-right font-medium text-gray-700"
                                              >
                                                Họ tên
                                              </Label>
                                              <Input
                                                id="fullName"
                                                name="fullName"
                                                value={warrantyForm.fullName}
                                                onChange={
                                                  handleWarrantyFormChange
                                                }
                                                className="col-span-3 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                              />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label
                                                htmlFor="phoneNumber"
                                                className="text-right font-medium text-gray-700"
                                              >
                                                Số điện thoại
                                              </Label>
                                              <Input
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                value={warrantyForm.phoneNumber}
                                                onChange={
                                                  handleWarrantyFormChange
                                                }
                                                className="col-span-3 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                              />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label
                                                htmlFor="email"
                                                className="text-right font-medium text-gray-700"
                                              >
                                                Email
                                              </Label>
                                              <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={warrantyForm.email}
                                                onChange={
                                                  handleWarrantyFormChange
                                                }
                                                className="col-span-3 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                              />
                                            </div>
                                          </div>
                                          <Button
                                            onClick={
                                              handleSubmitWarrantyRequest
                                            }
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-300"
                                          >
                                            Gửi yêu cầu
                                          </Button>
                                        </DialogContent>
                                      </Dialog>
                                    ) : hasWarrantyRequest ? (
                                      <span className="text-yellow-600 font-medium">
                                        Đang xử lý bảo hành
                                      </span>
                                    ) : !isReturnable &&
                                      !isWarrantyRequestable ? (
                                      <span className="text-gray-600 font-medium">
                                        Trong thời gian đổi trả
                                      </span>
                                    ) : !withinWarranty ? (
                                      <span className="text-gray-600 font-medium">
                                        Hết thời hạn bảo hành
                                      </span>
                                    ) : (
                                      <span className="text-gray-600 font-medium">
                                        Không thể yêu cầu
                                      </span>
                                    )}
                                  </>
                                )
                              ) : (
                                <span className="text-gray-600 font-medium">
                                  Đơn hàng chưa được giao
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
            <div className="mt-8 lg:absolute lg:bottom-10 lg:right-10 lg:w-auto">
              <Button
                onClick={handleUpdateStatus}
                className="w-full lg:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300"
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
