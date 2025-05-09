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
import { ProductReturn, ReturnTicket } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReturnDetail } from "@/components/admin/returns/ReturnDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReturnTicketDetail } from "./ReturnTicketDetail";

interface ClientModalsProps {
  returns: ProductReturn[];
  returnTickets: ReturnTicket[];
  role: string;
  updateReturnStatusAction: (returnId: string, status: string) => Promise<any>;
  updateReturnTicketStatusAction: (
    returnTicketId: string,
    status: string
  ) => Promise<any>;
  getReturnDetailAction: (returnId: string) => Promise<any>;
  getReturnTicketDetailAction: (returnTicketId: string) => Promise<any>;
}

export default function ClientModals({
  returns,
  returnTickets,
  role,
  updateReturnStatusAction,
  updateReturnTicketStatusAction,
  getReturnDetailAction,
  getReturnTicketDetailAction,
}: ClientModalsProps) {
  const [isReturnDetailOpen, setIsReturnDetailOpen] = useState(false);
  const [isReturnTicketDetailOpen, setIsReturnTicketDetailOpen] =
    useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ProductReturn | null>(
    null
  );
  const [selectedReturnTicket, setSelectedReturnTicket] =
    useState<ReturnTicket | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [returnStatusFilter, setReturnStatusFilter] = useState<string>("all");
  const [returnTicketStatusFilter, setReturnTicketStatusFilter] =
    useState<string>("all");

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
    };
    return statusMap[status] || status;
  };

  // Lọc danh sách yêu cầu đổi trả dựa trên từ khóa tìm kiếm và trạng thái
  const filteredReturns = useMemo(() => {
    return returns.filter((returnItem) => {
      const matchesSearch = [
        returnItem.productIdentity.product.name,
        returnItem.user.fullName,
        returnItem.reason,
        returnItem.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        returnStatusFilter === "all" ||
        returnItem.status === returnStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [returns, searchTerm, returnStatusFilter]);

  // Lọc danh sách phiếu đổi trả dựa trên từ khóa tìm kiếm và trạng thái
  const filteredReturnTickets = useMemo(() => {
    return returnTickets.filter((returnTicket) => {
      const matchesSearch = [
        returnTicket.productIdentity.product.name,
        returnTicket.user.fullName,
        returnTicket.status,
        returnTicket.productIdentityId,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        returnTicketStatusFilter === "all" ||
        returnTicket.status === returnTicketStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [returnTickets, searchTerm, returnTicketStatusFilter]);

  // Cập nhật trạng thái yêu cầu đổi trả
  const handleUpdateReturnStatus = async (returnId: string, status: string) => {
    setIsUpdating(returnId);
    try {
      const result = await updateReturnStatusAction(returnId, status);
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

  // Cập nhật trạng thái phiếu đổi trả
  const handleUpdateReturnTicketStatus = async (
    returnTicketId: string,
    status: string
  ) => {
    setIsUpdating(returnTicketId);
    try {
      const result = await updateReturnTicketStatusAction(
        returnTicketId,
        status
      );
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

  // Xem chi tiết yêu cầu đổi trả
  const handleViewReturnDetail = async (returnId: string) => {
    try {
      const result = await getReturnDetailAction(returnId);
      if (result.success) {
        setSelectedReturn(result.returnDetail);
        setIsReturnDetailOpen(true);
        toast.success("Tải chi tiết yêu cầu đổi trả thành công");
      } else {
        toast.error("Lỗi khi lấy chi tiết yêu cầu đổi trả", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết yêu cầu đổi trả", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  // Xem chi tiết phiếu đổi trả
  const handleViewReturnTicketDetail = async (returnTicketId: string) => {
    try {
      const result = await getReturnTicketDetailAction(returnTicketId);
      if (result.success) {
        setSelectedReturnTicket(result.returnTicket);
        setIsReturnTicketDetailOpen(true);
        toast.success("Tải chi tiết phiếu đổi trả thành công");
      } else {
        toast.error("Lỗi khi lấy chi tiết phiếu đổi trả", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết phiếu đổi trả", {
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
            Quản lý đổi trả
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

        <Tabs defaultValue="returns" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="returns">Yêu cầu đổi trả</TabsTrigger>
            <TabsTrigger value="returnTickets">Phiếu đổi trả</TabsTrigger>
          </TabsList>

          {/* Tab Yêu cầu đổi trả */}
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
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              ) : filteredReturns.length === 0 ? (
                <p className="text-center text-gray-500">
                  {searchTerm
                    ? "Không tìm thấy yêu cầu đổi trả nào."
                    : "Không có yêu cầu đổi trả nào."}
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
                              {returnItem.user.fullName}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {returnItem.reason}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={returnItem.status}
                                onValueChange={(value) =>
                                  handleUpdateReturnStatus(returnItem.id, value)
                                }
                                disabled={isUpdating === returnItem.id}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue>
                                    {translateReturnStatus(returnItem.status)}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">
                                    {translateReturnStatus("Pending")}
                                  </SelectItem>
                                  <SelectItem value="Approved">
                                    {translateReturnStatus("Approved")}
                                  </SelectItem>
                                  <SelectItem value="Rejected">
                                    {translateReturnStatus("Rejected")}
                                  </SelectItem>
                                  <SelectItem value="Completed">
                                    {translateReturnStatus("Completed")}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(
                                returnItem.returnDate
                              ).toLocaleDateString("vi-VN")}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleViewReturnDetail(returnItem.id)
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
                    {filteredReturns.map((returnItem) => (
                      <Card key={returnItem.id} className="shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">
                            {returnItem.productIdentity.product.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-2">
                          <p>
                            <strong>IMEI:</strong>{" "}
                            {returnItem.productIdentity.imei || "Không có"}
                          </p>
                          <p>
                            <strong>Người yêu cầu:</strong>{" "}
                            {returnItem.user.fullName}
                          </p>
                          <p>
                            <strong>Lý do:</strong> {returnItem.reason}
                          </p>
                          <p>
                            <strong>Trạng thái:</strong>{" "}
                            <Select
                              value={returnItem.status}
                              onValueChange={(value) =>
                                handleUpdateReturnStatus(returnItem.id, value)
                              }
                              disabled={isUpdating === returnItem.id}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue>
                                  {translateReturnStatus(returnItem.status)}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">
                                  {translateReturnStatus("Pending")}
                                </SelectItem>
                                <SelectItem value="Approved">
                                  {translateReturnStatus("Approved")}
                                </SelectItem>
                                <SelectItem value="Rejected">
                                  {translateReturnStatus("Rejected")}
                                </SelectItem>
                                <SelectItem value="Completed">
                                  {translateReturnStatus("Completed")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </p>
                          <p>
                            <strong>Ngày yêu cầu:</strong>{" "}
                            {new Date(returnItem.returnDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                          <div className="flex space-x-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewReturnDetail(returnItem.id)
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

          {/* Tab Phiếu đổi trả */}
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
                  </SelectContent>
                </Select>
              </div>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              ) : filteredReturnTickets.length === 0 ? (
                <p className="text-center text-gray-500">
                  {searchTerm
                    ? "Không tìm thấy phiếu đổi trả nào."
                    : "Không có phiếu đổi trả nào."}
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
                            Thời gian đổi trả
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
                              {returnTicket.user.fullName}
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
                              <Select
                                value={returnTicket.status}
                                onValueChange={(value) =>
                                  handleUpdateReturnTicketStatus(
                                    returnTicket.id,
                                    value
                                  )
                                }
                                disabled={isUpdating === returnTicket.id}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue>
                                    {translateReturnTicketStatus(
                                      returnTicket.status
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Requested">
                                    {translateReturnTicketStatus("Requested")}
                                  </SelectItem>
                                  <SelectItem value="Processing">
                                    {translateReturnTicketStatus("Processing")}
                                  </SelectItem>
                                  <SelectItem value="Processed">
                                    {translateReturnTicketStatus("Processed")}
                                  </SelectItem>
                                  <SelectItem value="Returned">
                                    {translateReturnTicketStatus("Returned")}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {new Date(
                                returnTicket.startDate
                              ).toLocaleDateString("vi-VN")}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleViewReturnTicketDetail(returnTicket.id)
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
                    {filteredReturnTickets.map((returnTicket) => (
                      <Card key={returnTicket.id} className="shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">
                            {returnTicket.productIdentity.product.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-2">
                          <p>
                            <strong>IMEI:</strong>{" "}
                            {returnTicket.productIdentity.imei || "Không có"}
                          </p>
                          <p>
                            <strong>Người dùng:</strong>{" "}
                            {returnTicket.user.fullName}
                          </p>
                          <p>
                            <strong>Thời gian đổi trả:</strong>{" "}
                            {new Date(
                              returnTicket.startDate
                            ).toLocaleDateString("vi-VN")}{" "}
                            -{" "}
                            {new Date(returnTicket.endDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                          <p>
                            <strong>Trạng thái:</strong>{" "}
                            <Select
                              value={returnTicket.status}
                              onValueChange={(value) =>
                                handleUpdateReturnTicketStatus(
                                  returnTicket.id,
                                  value
                                )
                              }
                              disabled={isUpdating === returnTicket.id}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue>
                                  {translateReturnTicketStatus(
                                    returnTicket.status
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Requested">
                                  {translateReturnTicketStatus("Requested")}
                                </SelectItem>
                                <SelectItem value="Processing">
                                  {translateReturnTicketStatus("Processing")}
                                </SelectItem>
                                <SelectItem value="Processed">
                                  {translateReturnTicketStatus("Processed")}
                                </SelectItem>
                                <SelectItem value="Returned">
                                  {translateReturnTicketStatus("Returned")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </p>
                          <p>
                            <strong>Ngày bắt đầu:</strong>{" "}
                            {new Date(
                              returnTicket.startDate
                            ).toLocaleDateString("vi-VN")}
                          </p>
                          <div className="flex space-x-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewReturnTicketDetail(returnTicket.id)
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

        {/* Modal Xem chi tiết yêu cầu đổi trả */}
        <ReturnDetail
          open={isReturnDetailOpen}
          onOpenChange={setIsReturnDetailOpen}
          returnDetail={selectedReturn}
        />

        {/* Modal Xem chi tiết phiếu đổi trả */}
        <ReturnTicketDetail
          open={isReturnTicketDetailOpen}
          onOpenChange={setIsReturnTicketDetailOpen}
          returnTicket={selectedReturnTicket}
        />
      </div>
    </Card>
  );
}
