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
import { Edit, Trash, Eye, Plus, Search, X } from "lucide-react";
import { Product, Model } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { ProductDetail } from "@/components/admin/products/ProductDetail";

interface ClientModalsProps {
  products: Product[];
  models: Model[];
  role: string;
  addProductAction: (formData: FormData) => Promise<any>;
  editProductAction: (id: string, formData: FormData) => Promise<any>;
  deleteProductAction: (id: string) => Promise<any>;
  getProductDetailAction: (id: string) => Promise<any>;
}

export default function ClientModals({
  products,
  models,
  role,
  addProductAction,
  editProductAction,
  deleteProductAction,
  getProductDetailAction,
}: ClientModalsProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc danh sách sản phẩm dựa trên từ khóa tìm kiếm
  const filteredProducts = products.filter((product) =>
    [product.name, product.slug]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Thêm sản phẩm
  const handleAddProduct = async (data: {
    name?: string;
    price?: number;
    storage?: number;
    ram?: number;
    screenSize?: number;
    battery?: number;
    chip?: string;
    operatingSystem?: string;
    modelId?: string;
    files: FileList | null;
    filesToDelete?: string[];
  }) => {
    setIsAdding(true);
    try {
      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.price) formData.append("price", data.price.toString());
      if (data.storage) formData.append("storage", data.storage.toString());
      if (data.ram) formData.append("ram", data.ram.toString());
      if (data.screenSize)
        formData.append("screenSize", data.screenSize.toString());
      if (data.battery) formData.append("battery", data.battery.toString());
      if (data.chip) formData.append("chip", data.chip);
      if (data.operatingSystem)
        formData.append("operatingSystem", data.operatingSystem);
      if (data.modelId) formData.append("modelId", data.modelId);
      if (data.files) {
        Array.from(data.files).forEach((file) => {
          formData.append("files", file);
        });
      }
      if (data.filesToDelete) {
        data.filesToDelete.forEach((fileId) => {
          formData.append("filesToDelete[]", fileId);
        });
      }

      const result = await addProductAction(formData);
      if (result.success) {
        toast.success(result.message);
        setIsAddOpen(false); // Tự động đóng form sau khi thêm thành công
      } else {
        toast.error("Thêm sản phẩm thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Thêm sản phẩm thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Sửa sản phẩm
  const handleEditProduct = async (data: {
    name?: string;
    price?: number;
    storage?: number;
    ram?: number;
    screenSize?: number;
    battery?: number;
    chip?: string;
    operatingSystem?: string;
    modelId?: string;
    files: FileList | null;
    filesToDelete?: string[];
  }) => {
    if (!selectedProduct) return;
    setIsEditing(true);
    try {
      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.price) formData.append("price", data.price.toString());
      if (data.storage) formData.append("storage", data.storage.toString());
      if (data.ram) formData.append("ram", data.ram.toString());
      if (data.screenSize)
        formData.append("screenSize", data.screenSize.toString());
      if (data.battery) formData.append("battery", data.battery.toString());
      if (data.chip) formData.append("chip", data.chip);
      if (data.operatingSystem)
        formData.append("operatingSystem", data.operatingSystem);
      if (data.modelId) formData.append("modelId", data.modelId);
      if (data.files) {
        Array.from(data.files).forEach((file) => {
          formData.append("files", file);
        });
      }
      if (data.filesToDelete) {
        data.filesToDelete.forEach((fileId) => {
          formData.append("filesToDelete[]", fileId);
        });
      }

      const result = await editProductAction(selectedProduct.id, formData);
      if (result.success) {
        toast.success(result.message);
        setIsEditOpen(false); // Tự động đóng form sau khi sửa thành công
      } else {
        toast.error("Cập nhật sản phẩm thất bại", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Cập nhật sản phẩm thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsEditing(false);
    }
  };

  // Xóa sản phẩm
  const handleDeleteProduct = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      setIsDeleting(true);
      try {
        const result = await deleteProductAction(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error("Xóa sản phẩm thất bại", {
            description: result.error || "Vui lòng thử lại sau.",
            duration: 2000,
          });
        }
      } catch (error: any) {
        toast.error("Xóa sản phẩm thất bại", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Xem chi tiết sản phẩm
  const handleViewDetail = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getProductDetailAction(id);
      if (result.success) {
        setSelectedProduct(result.product);
        setIsDetailOpen(true);
      } else {
        toast.error("Lỗi khi lấy chi tiết sản phẩm", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết sản phẩm", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setIsViewing(false);
    }
  };

  // Mở form chỉnh sửa và lấy dữ liệu sản phẩm
  const handleOpenEdit = async (id: string) => {
    setIsViewing(true);
    try {
      const result = await getProductDetailAction(id);
      if (result.success) {
        setSelectedProduct(result.product);
        setIsEditOpen(true);
      } else {
        toast.error("Lỗi khi lấy thông tin sản phẩm", {
          description: result.error || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast.error("Lỗi khi lấy thông tin sản phẩm", {
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
      {/* Header và tìm kiếm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          Quản lý sản phẩm
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9 text-sm sm:text-base w-full"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {role === "Admin" && (
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
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">
          {searchTerm
            ? "Không tìm thấy sản phẩm nào."
            : "Không có sản phẩm nào."}
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
                    Tên sản phẩm
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Giá</TableHead>
                  <TableHead className="text-xs sm:text-sm">Model</TableHead>
                  <TableHead className="text-xs sm:text-sm">Ngày tạo</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {product.id}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {product.price.toLocaleString()} VNĐ
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {product.model.name}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(product.id)}
                          disabled={isLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {role === "Admin" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(product.id)}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
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
            {filteredProducts.map((product) => (
              <Card key={product.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <p>
                    <strong>ID:</strong> {product.id}
                  </p>
                  <p>
                    <strong>Giá:</strong> {product.price.toLocaleString()} VNĐ
                  </p>
                  <p>
                    <strong>Model:</strong> {product.model.name}
                  </p>
                  <p>
                    <strong>Ngày tạo:</strong>{" "}
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(product.id)}
                      disabled={isLoading}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Xem
                    </Button>
                    {role === "Admin" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(product.id)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
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

      {/* Modal Thêm sản phẩm */}
      {role === "Admin" && (
        <ProductForm
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSubmit={handleAddProduct}
          models={models}
          isLoading={isAdding}
        />
      )}

      {/* Modal Sửa sản phẩm */}
      {role === "Admin" && (
        <ProductForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleEditProduct}
          initialData={selectedProduct || undefined}
          models={models}
          isLoading={isEditing}
        />
      )}

      {/* Modal Xem chi tiết sản phẩm */}
      <ProductDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        product={selectedProduct}
      />
    </>
  );
}
