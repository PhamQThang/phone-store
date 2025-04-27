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
import { Edit, Eye, Search, X } from "lucide-react";
import { Warranty, WarrantyRequest } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WarrantyRequestForm } from "@/components/admin/warrantys/WarrantyRequestForm";
import { WarrantyRequestDetail } from "@/components/admin/warrantys/WarrantyRequestDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarrantyDetail } from "./WarrantyDetail";
import { WarrantyForm } from "./WarrantyForm";

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
  const [isWarrantyRequestEditOpen, setIsWarrantyRequestEditOpen] =
    useState(false);
  const [isWarrantyRequestDetailOpen, setIsWarrantyRequestDetailOpen] =
    useState(false);
  const [isWarrantyEditOpen, setIsWarrantyEditOpen] = useState(false);
  const [isWarrantyDetailOpen, setIsWarrantyDetailOpen] = useState(false);
  const [selectedWarrantyRequest, setSelectedWarrantyRequest] =
    useState<WarrantyRequest | null>(null);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(
    null
  );
  const [isEditingWarrantyRequest, setIsEditingWarrantyRequest] =
    useState(false);
  const [isEditingWarranty, setIsEditingWarranty] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc danh sách yêu cầu bảo hành dựa trên từ khóa tìm kiếm
  const filteredWarrantyRequests = warrantyRequests.filter((request) =>
    [
      request.productIdentity.product.name,
      request.user.fullName,
      request.reason,
      request.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Lọc danh sách phiếu bảo hành dựa trên từ khóa tìm kiếm
  const filteredWarranties = warranties.filter((warranty) =>
    [
      warranty.productIdentity.product.name,
      warranty.user.fullName,
      warranty.status,
      warranty.productIdentity.imei,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Cập nhật trạng thái yêu cầu bảo hành
  const handleUpdateWarrantyRequestStatus = async (status: string) => {
    if (!selectedWarrantyRequest) return;
    setIsEditingWarrantyRequest(true);
    try {
      const result = await updateWarrantyRequestStatusAction(
        selectedWarrantyRequest.id,
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
      setIsEditingWarrantyRequest(false);
    }
  };

  // Cập nhật trạng thái phiếu bảo hành
  const handleUpdateWarrantyStatus = async (status: string) => {
    if (!selectedWarranty) return;
    setIsEditingWarranty(true);
    try {
      const result = await updateWarrantyStatusAction(
        selectedWarranty.id,
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
      setIsEditingWarranty(false);
    }
  };

  // Xem chi tiết yêu cầu bảo hành
  const handleViewWarrantyRequestDetail = async (requestId: string) => {
    setIsViewing(true);
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
    } finally {
      setIsViewing(false);
    }
  };

  // Xem chi tiết phiếu bảo hành
  const handleViewWarrantyDetail = async (warrantyId: string) => {
    setIsViewing(true);
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
    } finally {
      setIsViewing(false);
    }
  };

  // Mở form chỉnh sửa trạng thái yêu cầu bảo hành
  const handleOpenWarrantyRequestEdit = async (requestId: string) => {
    setIsViewing(true);
    try {
      const result = await getWarrantyRequestDetailAction(requestId);
      if (result.success) {
        setSelectedWarrantyRequest(result.request);
        setIsWarrantyRequestEditOpen(true);
        toast.success("Tải thông tin yêu cầu bảo hành thành công");
      } else {
        toast.error("Lỗi khi lấy thông tin yêu cầu bảo hành", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy thông tin yêu cầu bảo hành", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsViewing(false);
    }
  };

  // Mở form chỉnh sửa trạng thái phiếu bảo hành
  const handleOpenWarrantyEdit = async (warrantyId: string) => {
    setIsViewing(true);
    try {
      const result = await getWarrantyDetailAction(warrantyId);
      if (result.success) {
        setSelectedWarranty(result.warranty);
        setIsWarrantyEditOpen(true);
        toast.success("Tải thông tin phiếu bảo hành thành công");
      } else {
        toast.error("Lỗi khi lấy thông tin phiếu bảo hành", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy thông tin phiếu bảo hành", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsViewing(false);
    }
  };

  const isLoading = isEditingWarrantyRequest || isEditingWarranty || isViewing;

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
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
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">ID</TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Sản phẩm
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Người yêu cầu
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Lý do
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Trạng thái
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Ngày yêu cầu
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Hành động
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWarrantyRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="text-xs sm:text-sm">
                          {request.id}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {request.productIdentity.product.name}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {request.user.fullName}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {request.reason}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {request.status}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleOpenWarrantyRequestEdit(request.id)
                              }
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
                {filteredWarrantyRequests.map((request) => (
                  <Card key={request.id} className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        {request.productIdentity.product.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <p>
                        <strong>ID:</strong> {request.id}
                      </p>
                      <p>
                        <strong>Người yêu cầu:</strong> {request.user.fullName}
                      </p>
                      <p>
                        <strong>Lý do:</strong> {request.reason}
                      </p>
                      <p>
                        <strong>Trạng thái:</strong> {request.status}
                      </p>
                      <p>
                        <strong>Ngày yêu cầu:</strong>{" "}
                        {new Date(request.requestDate).toLocaleDateString()}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleOpenWarrantyRequestEdit(request.id)
                          }
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
        </TabsContent>

        {/* Tab Phiếu bảo hành */}
        <TabsContent value="warranties">
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
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">ID</TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Sản phẩm
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">IMEI</TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Số lần bảo hành
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Người dùng
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Trạng thái
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Ngày bắt đầu
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Hành động
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWarranties.map((warranty) => (
                      <TableRow key={warranty.id}>
                        <TableCell className="text-xs sm:text-sm">
                          {warranty.id}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {warranty.productIdentity.product.name}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {warranty.productIdentity.imei}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {warranty.productIdentity.warrantyCount || 0}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {warranty.user.fullName}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {warranty.status}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {new Date(warranty.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleOpenWarrantyEdit(warranty.id)
                              }
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
                {filteredWarranties.map((warranty) => (
                  <Card key={warranty.id} className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        {warranty.productIdentity.product.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <p>
                        <strong>ID:</strong> {warranty.id}
                      </p>
                      <p>
                        <strong>IMEI:</strong> {warranty.productIdentity.imei}
                      </p>
                      <p>
                        <strong>S RESOURCE lần bảo hành:</strong>{" "}
                        {warranty.productIdentity.warrantyCount || 0}
                      </p>
                      <p>
                        <strong>Người dùng:</strong> {warranty.user.fullName}
                      </p>
                      <p>
                        <strong>Trạng thái:</strong> {warranty.status}
                      </p>
                      <p>
                        <strong>Ngày bắt đầu:</strong>{" "}
                        {new Date(warranty.startDate).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewWarrantyDetail(warranty.id)}
                          disabled={isLoading}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenWarrantyEdit(warranty.id)}
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
        </TabsContent>
      </Tabs>

      {/* Modal Cập nhật trạng thái yêu cầu bảo hành */}
      <WarrantyRequestForm
        open={isWarrantyRequestEditOpen}
        onOpenChange={setIsWarrantyRequestEditOpen}
        onSubmit={handleUpdateWarrantyRequestStatus}
        initialData={selectedWarrantyRequest || undefined}
        isLoading={isEditingWarrantyRequest}
      />

      {/* Modal Xem chi tiết yêu cầu bảo hành */}
      <WarrantyRequestDetail
        open={isWarrantyRequestDetailOpen}
        onOpenChange={setIsWarrantyRequestDetailOpen}
        warrantyRequest={selectedWarrantyRequest}
      />

      {/* Modal Cập nhật trạng thái phiếu bảo hành */}
      <WarrantyForm
        open={isWarrantyEditOpen}
        onOpenChange={setIsWarrantyEditOpen}
        onSubmit={handleUpdateWarrantyStatus}
        initialData={selectedWarranty || undefined}
        isLoading={isEditingWarranty}
      />

      {/* Modal Xem chi tiết phiếu bảo hành */}
      <WarrantyDetail
        open={isWarrantyDetailOpen}
        onOpenChange={setIsWarrantyDetailOpen}
        warranty={selectedWarranty}
      />
    </div>
  );
}
