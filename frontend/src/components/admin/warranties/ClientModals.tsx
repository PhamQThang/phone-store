"use client";

import { useState, useMemo } from "react";
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
import { Eye, Search, X } from "lucide-react";
import { Warranty, WarrantyRequest } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WarrantyRequestDetail } from "@/components/admin/warranties/WarrantyRequestDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarrantyDetail } from "./WarrantyDetail";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientModalsProps {
  warrantyRequests: WarrantyRequest[];
  warranties: Warranty[];
  role: string;
  updateWarrantyRequestStatusAction: (
    requestId: string,
    status: string
  ) => Promise<any>;
  updateWarrantyStatusAction: (
    warrantyId: string,
    status: string
  ) => Promise<any>;
  getWarrantyRequestDetailAction: (requestId: string) => Promise<any>;
  getWarrantyDetailAction: (warrantyId: string) => Promise<any>;
}

export default function ClientModals({
  warrantyRequests,
  warranties,
  role,
  updateWarrantyRequestStatusAction,
  updateWarrantyStatusAction,
  getWarrantyRequestDetailAction,
  getWarrantyDetailAction,
}: ClientModalsProps) {
  const [isWarrantyRequestDetailOpen, setIsWarrantyRequestDetailOpen] =
    useState(false);
  const [isWarrantyDetailOpen, setIsWarrantyDetailOpen] = useState(false);
  const [selectedWarrantyRequest, setSelectedWarrantyRequest] =
    useState<WarrantyRequest | null>(null);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("all");
  const [warrantyStatusFilter, setWarrantyStatusFilter] =
    useState<string>("all");

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
    };
    return statusMap[status] || status;
  };

  // Lọc danh sách yêu cầu bảo hành dựa trên từ khóa tìm kiếm và trạng thái
  const filteredWarrantyRequests = useMemo(() => {
    return warrantyRequests.filter((request) => {
      const matchesSearch = [
        request.productIdentity.product.name,
        request.user.fullName,
        request.reason,
        request.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        requestStatusFilter === "all" || request.status === requestStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [warrantyRequests, searchTerm, requestStatusFilter]);

  // Lọc danh sách phiếu bảo hành dựa trên từ khóa tìm kiếm và trạng thái
  const filteredWarranties = useMemo(() => {
    return warranties.filter((warranty) => {
      const matchesSearch = [
        warranty.productIdentity.product.name,
        warranty.user.fullName,
        warranty.status,
        warranty.productIdentity.imei,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        warrantyStatusFilter === "all" ||
        warranty.status === warrantyStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [warranties, searchTerm, warrantyStatusFilter]);

  // Cập nhật trạng thái yêu cầu bảo hành
  const handleUpdateWarrantyRequestStatus = async (
    requestId: string,
    status: string
  ) => {
    setIsUpdating(requestId);
    try {
      const result = await updateWarrantyRequestStatusAction(requestId, status);
      if (result.success) {
        toast.success(result.message);
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
      setIsUpdating(null);
    }
  };

  // Cập nhật trạng thái phiếu bảo hành
  const handleUpdateWarrantyStatus = async (
    warrantyId: string,
    status: string
  ) => {
    setIsUpdating(warrantyId);
    try {
      const result = await updateWarrantyStatusAction(warrantyId, status);
      if (result.success) {
        toast.success(result.message);
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
      setIsUpdating(null);
    }
  };

  // Xem chi tiết yêu cầu bảo hành
  const handleViewWarrantyRequestDetail = async (requestId: string) => {
    try {
      const result = await getWarrantyRequestDetailAction(requestId);
      if (result.success) {
        setSelectedWarrantyRequest(result.request);
        setIsWarrantyRequestDetailOpen(true);
        toast.success("Tải chi tiết yêu cầu bảo hành thành công");
      } else {
        toast.error("Lỗi khi lấy chi tiết yêu cầu bảo hành", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết yêu cầu bảo hành", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  // Xem chi tiết phiếu bảo hành
  const handleViewWarrantyDetail = async (warrantyId: string) => {
    try {
      const result = await getWarrantyDetailAction(warrantyId);
      if (result.success) {
        setSelectedWarranty(result.warranty);
        setIsWarrantyDetailOpen(true);
        toast.success("Tải chi tiết phiếu bảo hành thành công");
      } else {
        toast.error("Lỗi khi lấy chi tiết phiếu bảo hành", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết phiếu bảo hành", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  const isLoading = isUpdating !== null;

  return (
    <Card className="max-w-5xl mx-auto shadow-lg border border-gray-100 rounded-xl bg-white">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Quản lý bảo hành
          </h2>
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm..."
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

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="requests">Yêu cầu bảo hành</TabsTrigger>
            <TabsTrigger value="warranties">Phiếu bảo hành</TabsTrigger>
          </TabsList>

          {/* Tab Yêu cầu bảo hành */}
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
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              ) : filteredWarrantyRequests.length === 0 ? (
                <p className="text-center text-gray-500">
                  {searchTerm
                    ? "Không tìm thấy yêu cầu bảo hành nào."
                    : "Không có yêu cầu bảo hành nào."}
                </p>
              ) : (
                <>
                  {/* Hiển thị dạng bảng trên màn hình lớn (PC, tablet) */}
                  <div className="hidden md:block overflow-x-auto">
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
                            Người yêu cầu
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
                              {request.user.fullName}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {request.reason}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={request.status}
                                onValueChange={(value) =>
                                  handleUpdateWarrantyRequestStatus(
                                    request.id,
                                    value
                                  )
                                }
                                disabled={isUpdating === request.id}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue>
                                    {translateWarrantyRequestStatus(
                                      request.status
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">
                                    {translateWarrantyRequestStatus("Pending")}
                                  </SelectItem>
                                  <SelectItem value="Approved">
                                    {translateWarrantyRequestStatus("Approved")}
                                  </SelectItem>
                                  <SelectItem value="Rejected">
                                    {translateWarrantyRequestStatus("Rejected")}
                                  </SelectItem>
                                  <SelectItem value="Completed">
                                    {translateWarrantyRequestStatus(
                                      "Completed"
                                    )}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(request.requestDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleViewWarrantyRequestDetail(request.id)
                                }
                                disabled={isLoading}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Hiển thị dạng danh sách trên mobile */}
                  <div className="block md:hidden space-y-4">
                    {filteredWarrantyRequests.map((request) => (
                      <Card key={request.id} className="shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">
                            {request.productIdentity.product.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-2">
                          <p>
                            <strong>IMEI:</strong>{" "}
                            {request.productIdentity.imei || "Không có"}
                          </p>
                          <p>
                            <strong>Người yêu cầu:</strong>{" "}
                            {request.user.fullName}
                          </p>
                          <p>
                            <strong>Lý do:</strong> {request.reason}
                          </p>
                          <p>
                            <strong>Trạng thái:</strong>{" "}
                            <Select
                              value={request.status}
                              onValueChange={(value) =>
                                handleUpdateWarrantyRequestStatus(
                                  request.id,
                                  value
                                )
                              }
                              disabled={isUpdating === request.id}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue>
                                  {translateWarrantyRequestStatus(
                                    request.status
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">
                                  {translateWarrantyRequestStatus("Pending")}
                                </SelectItem>
                                <SelectItem value="Approved">
                                  {translateWarrantyRequestStatus("Approved")}
                                </SelectItem>
                                <SelectItem value="Rejected">
                                  {translateWarrantyRequestStatus("Rejected")}
                                </SelectItem>
                                <SelectItem value="Completed">
                                  {translateWarrantyRequestStatus("Completed")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </p>
                          <p>
                            <strong>Ngày yêu cầu:</strong>{" "}
                            {new Date(request.requestDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                          <div className="flex space-x-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewWarrantyRequestDetail(request.id)
                              }
                              disabled={isLoading}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Xem
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Tab Phiếu bảo hành */}
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
                  </SelectContent>
                </Select>
              </div>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              ) : filteredWarranties.length === 0 ? (
                <p className="text-center text-gray-500">
                  {searchTerm
                    ? "Không tìm thấy phiếu bảo hành nào."
                    : "Không có phiếu bảo hành nào."}
                </p>
              ) : (
                <>
                  {/* Hiển thị dạng bảng trên màn hình lớn (PC, tablet) */}
                  <div className="hidden md:block overflow-x-auto">
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
                            Người dùng
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Thời gian bảo hành
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Trạng thái
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Ngày bắt đầu
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
                              {warranty.user.fullName}
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
                              <Select
                                value={warranty.status}
                                onValueChange={(value) =>
                                  handleUpdateWarrantyStatus(warranty.id, value)
                                }
                                disabled={isUpdating === warranty.id}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue>
                                    {translateWarrantyStatus(warranty.status)}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Requested">
                                    {translateWarrantyStatus("Requested")}
                                  </SelectItem>
                                  <SelectItem value="Processing">
                                    {translateWarrantyStatus("Processing")}
                                  </SelectItem>
                                  <SelectItem value="Repairing">
                                    {translateWarrantyStatus("Repairing")}
                                  </SelectItem>
                                  <SelectItem value="Repaired">
                                    {translateWarrantyStatus("Repaired")}
                                  </SelectItem>
                                  <SelectItem value="Returned">
                                    {translateWarrantyStatus("Returned")}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(warranty.startDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleViewWarrantyDetail(warranty.id)
                                }
                                disabled={isLoading}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Hiển thị dạng danh sách trên mobile */}
                  <div className="block md:hidden space-y-4">
                    {filteredWarranties.map((warranty) => (
                      <Card key={warranty.id} className="shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">
                            {warranty.productIdentity.product.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-2">
                          <p>
                            <strong>IMEI:</strong>{" "}
                            {warranty.productIdentity.imei || "Không có"}
                          </p>
                          <p>
                            <strong>Người dùng:</strong>{" "}
                            {warranty.user.fullName}
                          </p>
                          <p>
                            <strong>Thời gian bảo hành:</strong>{" "}
                            {new Date(warranty.startDate).toLocaleDateString(
                              "vi-VN"
                            )}{" "}
                            -{" "}
                            {new Date(warranty.endDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                          <p>
                            <strong>Trạng thái:</strong>{" "}
                            <Select
                              value={warranty.status}
                              onValueChange={(value) =>
                                handleUpdateWarrantyStatus(warranty.id, value)
                              }
                              disabled={isUpdating === warranty.id}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue>
                                  {translateWarrantyStatus(warranty.status)}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Requested">
                                  {translateWarrantyStatus("Requested")}
                                </SelectItem>
                                <SelectItem value="Processing">
                                  {translateWarrantyStatus("Processing")}
                                </SelectItem>
                                <SelectItem value="Repairing">
                                  {translateWarrantyStatus("Repairing")}
                                </SelectItem>
                                <SelectItem value="Repaired">
                                  {translateWarrantyStatus("Repaired")}
                                </SelectItem>
                                <SelectItem value="Returned">
                                  {translateWarrantyStatus("Returned")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </p>
                          <p>
                            <strong>Ngày bắt đầu:</strong>{" "}
                            {new Date(warranty.startDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                          <div className="flex space-x-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewWarrantyDetail(warranty.id)
                              }
                              disabled={isLoading}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Xem
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal Xem chi tiết yêu cầu bảo hành */}
        <WarrantyRequestDetail
          open={isWarrantyRequestDetailOpen}
          onOpenChange={setIsWarrantyRequestDetailOpen}
          warrantyRequest={selectedWarrantyRequest}
        />

        {/* Modal Xem chi tiết phiếu bảo hành */}
        <WarrantyDetail
          open={isWarrantyDetailOpen}
          onOpenChange={setIsWarrantyDetailOpen}
          warranty={selectedWarranty}
        />
      </div>
    </Card>
  );
}
