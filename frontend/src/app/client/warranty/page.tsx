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
  getWarrantyRequests,
  getWarranties,
  getWarrantyRequestDetails,
  getWarrantyDetails,
} from "@/api/warrantyApi";
import { WarrantyRequest, Warranty } from "@/lib/types";

const WarrantyManagementPage = () => {
  const [warrantyRequests, setWarrantyRequests] = useState<WarrantyRequest[]>(
    []
  );
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("all");
  const [warrantyStatusFilter, setWarrantyStatusFilter] =
    useState<string>("all");

  // State cho Dialog
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isWarrantyDialogOpen, setIsWarrantyDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<WarrantyRequest | null>(null);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(
    null
  );
  const [dialogLoading, setDialogLoading] = useState(false);

  const router = useRouter();
  const user = localStorage.getItem("fullName");

  const fetchData = useCallback(async () => {
    try {
      const [warrantyRequestsData, warrantiesData] = await Promise.all([
        getWarrantyRequests(),
        getWarranties(),
      ]);
      setWarrantyRequests(warrantyRequestsData);
      setWarranties(warrantiesData);
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Không thể lấy dữ liệu bảo hành"
      );
      toast.error("Lỗi", {
        description:
          error.response?.data?.message || "Không thể lấy dữ liệu bảo hành",
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

  const translateWarrantyRequestStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Pending: "Đang chờ",
      Approved: "Đã duyệt",
      Rejected: "Bị từ chối",
      Completed: "Hoàn tất",
    };
    return statusMap[status] || status;
  };

  const translateWarrantyStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Requested: "Đã yêu cầu",
      Processing: "Đang xử lý",
      Repairing: "Đang sửa chữa",
      Repaired: "Đã sửa xong",
      Returned: "Đã trả máy",
      Canceled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  // Lọc và tìm kiếm danh sách yêu cầu bảo hành
  const filteredWarrantyRequests = useMemo(() => {
    return warrantyRequests.filter((request) => {
      const matchesSearch = request.productIdentity.product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        requestStatusFilter === "all" || request.status === requestStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [warrantyRequests, searchTerm, requestStatusFilter]);

  // Lọc và tìm kiếm danh sách phiếu bảo hành
  const filteredWarranties = useMemo(() => {
    return warranties.filter((warranty) => {
      const matchesSearch = warranty.productIdentity.product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        warrantyStatusFilter === "all" ||
        warranty.status === warrantyStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [warranties, searchTerm, warrantyStatusFilter]);

  const handleViewRequestDetails = async (requestId: string) => {
    try {
      setDialogLoading(true);
      const requestDetails = await getWarrantyRequestDetails(requestId);
      setSelectedRequest(requestDetails);
      setIsRequestDialogOpen(true);
    } catch (error: any) {
      toast.error("Lỗi", {
        description:
          error.response?.data?.message ||
          "Không thể lấy chi tiết yêu cầu bảo hành",
        duration: 2000,
      });
    } finally {
      setDialogLoading(false);
    }
  };

  const handleViewWarrantyDetails = async (warrantyId: string) => {
    try {
      setDialogLoading(true);
      const warrantyDetails = await getWarrantyDetails(warrantyId);
      setSelectedWarranty(warrantyDetails);
      setIsWarrantyDialogOpen(true);
    } catch (error: any) {
      toast.error("Lỗi", {
        description:
          error.response?.data?.message ||
          "Không thể lấy chi tiết phiếu bảo hành",
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
            Quản lý bảo hành
          </h1>

          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-1/2"
            />
          </div>

          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="requests">Yêu cầu bảo hành</TabsTrigger>
              <TabsTrigger value="warranties">Phiếu bảo hành</TabsTrigger>
            </TabsList>

            {/* Yêu cầu bảo hành */}
            <TabsContent value="requests">
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                    Danh sách yêu cầu bảo hành
                  </h2>
                  <Select
                    value={requestStatusFilter}
                    onValueChange={setRequestStatusFilter}
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
                {filteredWarrantyRequests.length === 0 ? (
                  <p className="text-gray-600 py-4">
                    Bạn chưa có yêu cầu bảo hành nào hoặc không tìm thấy kết
                    quả.
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
                        {filteredWarrantyRequests.map((request) => (
                          <TableRow
                            key={request.id}
                            className="hover:bg-blue-50 transition-colors"
                          >
                            <TableCell className="font-medium text-gray-800">
                              {request.productIdentity.product.name}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {request.productIdentity.imei || "Không có"}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {request.reason}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  request.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : request.status === "Approved"
                                    ? "bg-blue-100 text-blue-800"
                                    : request.status === "Rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {translateWarrantyRequestStatus(request.status)}
                              </span>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(request.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </TableCell>
                            <TableCell>
                              <Dialog
                                open={isRequestDialogOpen}
                                onOpenChange={(open) => {
                                  setIsRequestDialogOpen(open);
                                  if (!open) setSelectedRequest(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    onClick={() =>
                                      handleViewRequestDetails(request.id)
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Xem chi tiết
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Chi tiết yêu cầu bảo hành
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
                                  ) : selectedRequest ? (
                                    <div className="space-y-4">
                                      <div>
                                        <strong className="text-gray-800">
                                          Mã yêu cầu:
                                        </strong>{" "}
                                        {selectedRequest.id.substring(0, 8)}...
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Sản phẩm:
                                        </strong>{" "}
                                        {
                                          selectedRequest.productIdentity
                                            .product.name
                                        }
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          IMEI:
                                        </strong>{" "}
                                        {selectedRequest.productIdentity.imei ||
                                          "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Lý do:
                                        </strong>{" "}
                                        {selectedRequest.reason}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Trạng thái:
                                        </strong>{" "}
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            selectedRequest.status === "Pending"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : selectedRequest.status ===
                                                "Approved"
                                              ? "bg-blue-100 text-blue-800"
                                              : selectedRequest.status ===
                                                "Rejected"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-green-100 text-green-800"
                                          }`}
                                        >
                                          {translateWarrantyRequestStatus(
                                            selectedRequest.status
                                          )}
                                        </span>
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Họ tên:
                                        </strong>{" "}
                                        {selectedRequest.fullName}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Số điện thoại:
                                        </strong>{" "}
                                        {selectedRequest.phoneNumber}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Email:
                                        </strong>{" "}
                                        {selectedRequest.email}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Ngày yêu cầu:
                                        </strong>{" "}
                                        {new Date(
                                          selectedRequest.createdAt
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

            {/* Phiếu bảo hành */}
            <TabsContent value="warranties">
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                    Danh sách phiếu bảo hành
                  </h2>
                  <Select
                    value={warrantyStatusFilter}
                    onValueChange={setWarrantyStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="Requested">Đã yêu cầu</SelectItem>
                      <SelectItem value="Processing">Đang xử lý</SelectItem>
                      <SelectItem value="Repairing">Đang sửa chữa</SelectItem>
                      <SelectItem value="Repaired">Đã sửa xong</SelectItem>
                      <SelectItem value="Returned">Đã trả máy</SelectItem>
                      <SelectItem value="Canceled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {filteredWarranties.length === 0 ? (
                  <p className="text-gray-600 py-4">
                    Bạn chưa có phiếu bảo hành nào hoặc không tìm thấy kết quả.
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
                            Thời gian bảo hành
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
                        {filteredWarranties.map((warranty) => (
                          <TableRow
                            key={warranty.id}
                            className="hover:bg-blue-50 transition-colors"
                          >
                            <TableCell className="font-medium text-gray-800">
                              {warranty.productIdentity.product.name}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {warranty.productIdentity.imei || "Không có"}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(warranty.startDate).toLocaleDateString(
                                "vi-VN"
                              )}{" "}
                              -{" "}
                              {new Date(warranty.endDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  warranty.status === "Requested"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : warranty.status === "Processing"
                                    ? "bg-blue-100 text-blue-800"
                                    : warranty.status === "Repairing"
                                    ? "bg-purple-100 text-purple-800"
                                    : warranty.status === "Repaired"
                                    ? "bg-orange-100 text-orange-800"
                                    : warranty.status === "Returned"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {translateWarrantyStatus(warranty.status)}
                              </span>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(warranty.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </TableCell>
                            <TableCell>
                              <Dialog
                                open={isWarrantyDialogOpen}
                                onOpenChange={(open) => {
                                  setIsWarrantyDialogOpen(open);
                                  if (!open) setSelectedWarranty(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    onClick={() =>
                                      handleViewWarrantyDetails(warranty.id)
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Xem chi tiết
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Chi tiết phiếu bảo hành
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
                                  ) : selectedWarranty ? (
                                    <div className="space-y-4">
                                      <div>
                                        <strong className="text-gray-800">
                                          Mã phiếu:
                                        </strong>{" "}
                                        {selectedWarranty.id.substring(0, 8)}...
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Sản phẩm:
                                        </strong>{" "}
                                        {
                                          selectedWarranty.productIdentity
                                            .product.name
                                        }
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          IMEI:
                                        </strong>{" "}
                                        {selectedWarranty.productIdentity
                                          .imei || "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Màu sắc:
                                        </strong>{" "}
                                        {selectedWarranty.productIdentity.color
                                          ?.name || "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Thời gian bảo hành:
                                        </strong>{" "}
                                        {new Date(
                                          selectedWarranty.startDate
                                        ).toLocaleDateString("vi-VN")}{" "}
                                        -{" "}
                                        {new Date(
                                          selectedWarranty.endDate
                                        ).toLocaleDateString("vi-VN")}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Trạng thái:
                                        </strong>{" "}
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            selectedWarranty.status ===
                                            "Requested"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : selectedWarranty.status ===
                                                "Processing"
                                              ? "bg-blue-100 text-blue-800"
                                              : selectedWarranty.status ===
                                                "Repairing"
                                              ? "bg-purple-100 text-purple-800"
                                              : selectedWarranty.status ===
                                                "Repaired"
                                              ? "bg-orange-100 text-orange-800"
                                              : selectedWarranty.status ===
                                                "Returned"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {translateWarrantyStatus(
                                            selectedWarranty.status
                                          )}
                                        </span>
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Ghi chú:
                                        </strong>{" "}
                                        {selectedWarranty.note || "Không có"}
                                      </div>
                                      <div>
                                        <strong className="text-gray-800">
                                          Ngày tạo:
                                        </strong>{" "}
                                        {new Date(
                                          selectedWarranty.createdAt
                                        ).toLocaleDateString("vi-VN")}
                                      </div>
                                      {selectedWarranty.warrantyRequest && (
                                        <div className="border-t pt-4">
                                          <h3 className="text-lg font-semibold text-gray-800">
                                            Thông tin yêu cầu bảo hành liên quan
                                          </h3>
                                          <div className="space-y-2 mt-2">
                                            <div>
                                              <strong className="text-gray-800">
                                                Mã yêu cầu:
                                              </strong>{" "}
                                              {selectedWarranty.warrantyRequest.id.substring(
                                                0,
                                                8
                                              )}
                                              ...
                                            </div>
                                            <div>
                                              <strong className="text-gray-800">
                                                Lý do:
                                              </strong>{" "}
                                              {
                                                selectedWarranty.warrantyRequest
                                                  .reason
                                              }
                                            </div>
                                            <div>
                                              <strong className="text-gray-800">
                                                Ngày yêu cầu:
                                              </strong>{" "}
                                              {new Date(
                                                selectedWarranty.warrantyRequest.createdAt
                                              ).toLocaleDateString("vi-VN")}
                                            </div>
                                          </div>
                                        </div>
                                      )}
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

export default WarrantyManagementPage;
