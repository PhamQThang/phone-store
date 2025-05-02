"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getReturns,
  getReturnDetails,
  getReturnTickets,
  getReturnTicketDetails,
} from "@/api/returnsApi";
import { ProductReturn, ReturnTicket } from "@/lib/types";

const ReturnManagementPage = () => {
  const [returns, setReturns] = useState<ProductReturn[]>([]);
  const [returnTickets, setReturnTickets] = useState<ReturnTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [returnStatusFilter, setReturnStatusFilter] = useState<string>("all");
  const [returnTicketStatusFilter, setReturnTicketStatusFilter] =
    useState<string>("all");

  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isReturnTicketDialogOpen, setIsReturnTicketDialogOpen] =
    useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ProductReturn | null>(
    null
  );
  const [selectedReturnTicket, setSelectedReturnTicket] =
    useState<ReturnTicket | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  const router = useRouter();
  const user = localStorage.getItem("fullName");

  const fetchData = useCallback(async () => {
    try {
      const [returnsData, returnTicketsData] = await Promise.all([
        getReturns(),
        getReturnTickets(),
      ]);
      setReturns(returnsData);
      setReturnTickets(returnTicketsData);
      console.log("Return Tickets Data:", returnTicketsData); // Debug log
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Không thể lấy dữ liệu đổi trả"
      );
      toast.error("Lỗi", {
        description:
          error.response?.data?.message || "Không thể lấy dữ liệu đổi trả",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    fetchData();
  }, [user, router, fetchData]);

  const translateReturnStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Pending: "Đang chờ",
      Approved: "Đã duyệt",
      Rejected: "Bị từ chối",
      Completed: "Hoàn tất",
    };
    return statusMap[status] || status;
  };

  const translateReturnTicketStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Requested: "Đã yêu cầu",
      Processing: "Đang xử lý",
      Processed: "Đã xử lý",
      Returned: "Đã trả hàng",
      Canceled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const translatePaymentMethod = (method: string) => {
    const methodMap: { [key: string]: string } = {
      COD: "Thanh toán khi nhận hàng",
      Online: "Thanh toán trực tuyến",
    };
    return methodMap[method] || method;
  };

  const translatePaymentStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Pending: "Chưa thanh toán",
      Completed: "Đã thanh toán",
      Failed: "Thanh toán thất bại",
    };
    return statusMap[status] || status;
  };

  const filteredReturns = useMemo(() => {
    return returns.filter((returnItem) => {
      const matchesSearch = returnItem.productIdentity.product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        returnStatusFilter === "all" ||
        returnItem.status === returnStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [returns, searchTerm, returnStatusFilter]);

  const filteredReturnTickets = useMemo(() => {
    const filtered = returnTickets.filter((returnTicket) => {
      const matchesSearch = returnTicket.productIdentity.product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        returnTicketStatusFilter === "all" ||
        returnTicket.status === returnTicketStatusFilter;
      return matchesSearch && matchesStatus;
    });
    console.log("Filtered Return Tickets:", filtered); // Debug log
    return filtered;
  }, [returnTickets, searchTerm, returnTicketStatusFilter]);

  const handleViewReturnDetails = async (returnId: string) => {
    try {
      setDialogLoading(true);
      const returnDetails = await getReturnDetails(returnId);
      setSelectedReturn(returnDetails);
      setIsReturnDialogOpen(true);
    } catch (error: any) {
      toast.error("Lỗi", {
        description:
          error.response?.data?.message ||
          "Không thể lấy chi tiết yêu cầu đổi trả",
        duration: 2000,
      });
    } finally {
      setDialogLoading(false);
    }
  };

  const handleViewReturnTicketDetails = async (returnTicketId: string) => {
    try {
      setDialogLoading(true);
      const returnTicketDetails = await getReturnTicketDetails(returnTicketId);
      setSelectedReturnTicket(returnTicketDetails);
      setIsReturnTicketDialogOpen(true);
    } catch (error: any) {
      toast.error("Lỗi", {
        description:
          error.response?.data?.message ||
          "Không thể lấy chi tiết phiếu đổi trả",
        duration: 2000,
      });
    } finally {
      setDialogLoading(false);
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

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <Card className="max-w-5xl mx-auto shadow-lg border border-gray-100 rounded-xl bg-white">
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
            Quản lý đổi trả
          </h1>

          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-1/2"
            />
          </div>

          <Tabs defaultValue="returns" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="returns">Yêu cầu đổi trả</TabsTrigger>
              <TabsTrigger value="returnTickets">Phiếu đổi trả</TabsTrigger>
            </TabsList>

            <TabsContent value="returns">
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                    Danh sách yêu cầu đổi trả
                  </h2>
                  <Select
                    value={returnStatusFilter}
                    onValueChange={setReturnStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="Pending">Đang chờ</SelectItem>
                      <SelectItem value="Approved">Đã duyệt</SelectItem>
                      <SelectItem value="Rejected">Bị từ chối</SelectItem>
                      <SelectItem value="Completed">Hoàn tất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {filteredReturns.length === 0 ? (
                  <p className="text-gray-600 py-4">
                    Bạn chưa có yêu cầu đổi trả nào hoặc không tìm thấy kết quả.
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
                            IMEI
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Lý do
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Trạng thái
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Ngày yêu cầu
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Hành động
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReturns.map((returnItem) => (
                          <TableRow
                            key={returnItem.id}
                            className="hover:bg-blue-50 transition-colors"
                          >
                            <TableCell className="font-medium text-gray-800">
                              {returnItem.productIdentity.product.name}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {returnItem.productIdentity.imei || "Không có"}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {returnItem.reason}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  returnItem.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : returnItem.status === "Approved"
                                    ? "bg-blue-100 text-blue-800"
                                    : returnItem.status === "Rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {translateReturnStatus(returnItem.status)}
                              </span>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(
                                returnItem.returnDate
                              ).toLocaleDateString("vi-VN")}
                            </TableCell>
                            <TableCell>
                              <Dialog
                                open={isReturnDialogOpen}
                                onOpenChange={(open) => {
                                  setIsReturnDialogOpen(open);
                                  if (!open) setSelectedReturn(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    onClick={() =>
                                      handleViewReturnDetails(returnItem.id)
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Xem chi tiết
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Chi tiết yêu cầu đổi trả
                                    </DialogTitle>
                                  </DialogHeader>
                                  {dialogLoading ? (
                                    <div className="flex items-center justify-center py-4">
                                      <svg
                                        className="animate-spin h-6 w-6 text-blue-500"
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
                                    </div>
                                  ) : selectedReturn ? (
                                    <div className="space-y-4">
                                      <div>
                                        <strong className="text-gray-800">
                                          Mã yêu cầu:
                                        </strong>{" "}
                                        {selectedReturn.id.substring(0, 8)}...
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Sản phẩm:
                                        </strong>{" "}
                                        {
                                          selectedReturn.productIdentity.product
                                            .name
                                        }
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          IMEI:
                                        </strong>{" "}
                                        {selectedReturn.productIdentityId ||
                                          "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Họ tên:
                                        </strong>{" "}
                                        {selectedReturn.fullName || "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Số điện thoại:
                                        </strong>{" "}
                                        {selectedReturn.phoneNumber ||
                                          "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Địa chỉ:
                                        </strong>{" "}
                                        {selectedReturn.address || "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Lý do:
                                        </strong>{" "}
                                        {selectedReturn.reason}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Trạng thái:
                                        </strong>{" "}
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            selectedReturn.status === "Pending"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : selectedReturn.status ===
                                                "Approved"
                                              ? "bg-blue-100 text-blue-800"
                                              : selectedReturn.status ===
                                                "Rejected"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-green-100 text-green-800"
                                          }`}
                                        >
                                          {translateReturnStatus(
                                            selectedReturn.status
                                          )}
                                        </span>
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Ngày yêu cầu:
                                        </strong>{" "}
                                        {new Date(
                                          selectedReturn.returnDate
                                        ).toLocaleDateString("vi-VN")}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-gray-600">
                                      Không có dữ liệu.
                                    </p>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="returnTickets">
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                    Danh sách phiếu đổi trả
                  </h2>
                  <Select
                    value={returnTicketStatusFilter}
                    onValueChange={setReturnTicketStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="Requested">Đã yêu cầu</SelectItem>
                      <SelectItem value="Processing">Đang xử lý</SelectItem>
                      <SelectItem value="Processed">Đã xử lý</SelectItem>
                      <SelectItem value="Returned">Đã trả hàng</SelectItem>
                      <SelectItem value="Canceled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {filteredReturnTickets.length === 0 ? (
                  <p className="text-gray-600 py-4">
                    Bạn chưa có phiếu đổi trả nào hoặc không tìm thấy kết quả.
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
                            IMEI
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Thời gian đổi trả
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Trạng thái
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Ngày tạo
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Hành động
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReturnTickets.map((returnTicket) => (
                          <TableRow
                            key={returnTicket.id}
                            className="hover:bg-blue-50 transition-colors"
                          >
                            <TableCell className="font-medium text-gray-800">
                              {returnTicket.productIdentity.product.name}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {returnTicket.productIdentity.imei || "Không có"}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(
                                returnTicket.startDate
                              ).toLocaleDateString("vi-VN")}{" "}
                              -{" "}
                              {new Date(
                                returnTicket.endDate
                              ).toLocaleDateString("vi-VN")}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  returnTicket.status === "Requested"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : returnTicket.status === "Processing"
                                    ? "bg-blue-100 text-blue-800"
                                    : returnTicket.status === "Processed"
                                    ? "bg-purple-100 text-purple-800"
                                    : returnTicket.status === "Returned"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {translateReturnTicketStatus(
                                  returnTicket.status
                                )}
                              </span>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(
                                returnTicket.createdAt
                              ).toLocaleDateString("vi-VN")}
                            </TableCell>
                            <TableCell>
                              <Dialog
                                open={isReturnTicketDialogOpen}
                                onOpenChange={(open) => {
                                  setIsReturnTicketDialogOpen(open);
                                  if (!open) setSelectedReturnTicket(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    onClick={() =>
                                      handleViewReturnTicketDetails(
                                        returnTicket.id
                                      )
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Xem chi tiết
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Chi tiết phiếu đổi trả
                                    </DialogTitle>
                                  </DialogHeader>
                                  {dialogLoading ? (
                                    <div className="flex items-center justify-center py-4">
                                      <svg
                                        className="animate-spin h-6 w-6 text-blue-500"
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
                                    </div>
                                  ) : selectedReturnTicket ? (
                                    <div className="space-y-4">
                                      <div>
                                        <strong className="text-gray-800">
                                          Mã phiếu:
                                        </strong>{" "}
                                        {selectedReturnTicket.id.substring(
                                          0,
                                          8
                                        )}
                                        ...
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Người dùng:
                                        </strong>{" "}
                                        {selectedReturnTicket.user.fullName ||
                                          "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Sản phẩm:
                                        </strong>{" "}
                                        {
                                          selectedReturnTicket.productIdentity
                                            .product.name
                                        }
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          IMEI:
                                        </strong>{" "}
                                        {selectedReturnTicket.productIdentity
                                          .imei || "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Màu sắc:
                                        </strong>{" "}
                                        {selectedReturnTicket.productIdentity
                                          .color?.name || "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Giá gốc:
                                        </strong>{" "}
                                        {selectedReturnTicket.originalPrice
                                          ? `${selectedReturnTicket.originalPrice.toLocaleString(
                                              "vi-VN"
                                            )} VNĐ`
                                          : "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Giá giảm:
                                        </strong>{" "}
                                        {selectedReturnTicket.discountedPrice
                                          ? `${selectedReturnTicket.discountedPrice.toLocaleString(
                                              "vi-VN"
                                            )} VNĐ`
                                          : "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Phương thức thanh toán:
                                        </strong>{" "}
                                        {selectedReturnTicket.paymentMethod
                                          ? translatePaymentMethod(
                                              selectedReturnTicket.paymentMethod
                                            )
                                          : "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Trạng thái thanh toán:
                                        </strong>{" "}
                                        {selectedReturnTicket.paymentStatus
                                          ? translatePaymentStatus(
                                              selectedReturnTicket.paymentStatus
                                            )
                                          : "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Họ tên:
                                        </strong>{" "}
                                        {selectedReturnTicket.fullName ||
                                          "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Số điện thoại:
                                        </strong>{" "}
                                        {selectedReturnTicket.phoneNumber ||
                                          "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Địa chỉ:
                                        </strong>{" "}
                                        {selectedReturnTicket.address ||
                                          "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Thời gian đổi trả:
                                        </strong>{" "}
                                        {new Date(
                                          selectedReturnTicket.startDate
                                        ).toLocaleDateString("vi-VN")}{" "}
                                        -{" "}
                                        {new Date(
                                          selectedReturnTicket.endDate
                                        ).toLocaleDateString("vi-VN")}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Trạng thái:
                                        </strong>{" "}
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            selectedReturnTicket.status ===
                                            "Requested"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : selectedReturnTicket.status ===
                                                "Processing"
                                              ? "bg-blue-100 text-blue-800"
                                              : selectedReturnTicket.status ===
                                                "Processed"
                                              ? "bg-purple-100 text-purple-800"
                                              : selectedReturnTicket.status ===
                                                "Returned"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {translateReturnTicketStatus(
                                            selectedReturnTicket.status
                                          )}
                                        </span>
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Ghi chú:
                                        </strong>{" "}
                                        {selectedReturnTicket.note ||
                                          "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Ngày tạo:
                                        </strong>{" "}
                                        {new Date(
                                          selectedReturnTicket.createdAt
                                        ).toLocaleDateString("vi-VN")}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-gray-600">
                                      Không có dữ liệu.
                                    </p>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default ReturnManagementPage;
