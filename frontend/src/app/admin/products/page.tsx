// app/admin/products/page.tsx
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
import { Edit, Trash, Eye, Plus, Loader2 } from "lucide-react";
import {
  Product,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from "@/api/admin/productsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductDetail } from "@/components/admin/products/ProductDetail";
import { clearLocalStorage } from "@/lib/utils";
import { ProductForm } from "@/components/admin/products/ProductForm";

export default function ProductsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    setRole(userRole);

    if (!userRole || userRole !== "Admin") {
      toast.error("Không có quyền truy cập", {
        description: "Chỉ Admin mới được truy cập trang này.",
        duration: 2000,
      });
      clearLocalStorage();
      router.push("/auth/login");
    } else {
      fetchProducts();
    }
  }, [router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error: any) {
      toast.error("Lỗi khi lấy danh sách sản phẩm", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Thêm sản phẩm
  const handleAddProduct = async (data: {
    name: string;
    price: number;
    storage: number;
    ram: number;
    screenSize: number; // Thêm screenSize
    battery: number; // Thêm battery
    chip: string; // Thêm chip
    operatingSystem: string; // Thêm operatingSystem
    modelId: string;
    files: FileList | null;
  }) => {
    try {
      const newProduct = await createProduct(data);
      setProducts([...products, newProduct]);
      toast.success("Thêm sản phẩm thành công");
    } catch (error: any) {
      toast.error("Thêm sản phẩm thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  // Sửa sản phẩm
  const handleEditProduct = async (data: {
    name: string;
    price: number;
    storage: number;
    ram: number;
    screenSize: number; // Thêm screenSize
    battery: number; // Thêm battery
    chip: string; // Thêm chip
    operatingSystem: string; // Thêm operatingSystem
    modelId: string;
    files: FileList | null;
  }) => {
    if (!selectedProduct) return;
    try {
      const updatedProduct = await updateProduct(selectedProduct.id, data);
      setProducts(
        products.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
      toast.success("Cập nhật sản phẩm thành công");
    } catch (error: any) {
      toast.error("Cập nhật sản phẩm thất bại", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  // Xóa sản phẩm
  const handleDeleteProduct = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((product) => product.id !== id));
        toast.success("Xóa sản phẩm thành công");
      } catch (error: any) {
        toast.error("Xóa sản phẩm thất bại", {
          description: error.message || "Vui lòng thử lại sau.",
          duration: 2000,
        });
      }
    }
  };

  // Xem chi tiết sản phẩm
  const handleViewDetail = async (id: string) => {
    try {
      const product = await getProductById(id);
      setSelectedProduct(product);
      setIsDetailOpen(true);
    } catch (error: any) {
      toast.error("Lỗi khi lấy chi tiết sản phẩm", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
    }
  };

  // Mở form chỉnh sửa và lấy dữ liệu sản phẩm
  const handleOpenEdit = async (id: string) => {
    try {
      const product = await getProductById(id); // Lấy dữ liệu mới nhất từ API
      setSelectedProduct(product);
      setIsEditOpen(true);
    } catch (error: any) {
      toast.error("Lỗi khi lấy thông tin sản phẩm", {
        description: error.message || "Vui lòng thử lại sau.",
        duration: 2000,
      });
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
          Quản lý sản phẩm
        </h2>
        {role === "Admin" && (
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
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">Không có sản phẩm nào.</p>
      ) : (
        <>
          {/* Hiển thị dạng bảng trên màn hình lớn (PC, tablet) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">
                    Tên sản phẩm
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Slug</TableHead>
                  <TableHead className="text-xs sm:text-sm">Giá</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Dung lượng
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">RAM</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Kích thước màn hình
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Pin</TableHead>
                  <TableHead className="text-xs sm:text-sm">Chip</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Hệ điều hành
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Model</TableHead>
                  <TableHead className="text-xs sm:text-sm">Ngày tạo</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {product.slug}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {product.price.toLocaleString()} VNĐ
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {product.storage} GB
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {product.ram} GB
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {product.screenSize} inch
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {product.battery} mAh
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {product.chip}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {product.operatingSystem}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {product.model.name} ({product.model.brand.name})
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
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {role === "Admin" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(product.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
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
            {products.map((product) => (
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
                    <strong>Slug:</strong> {product.slug}
                  </p>
                  <p>
                    <strong>Giá:</strong> {product.price.toLocaleString()} VNĐ
                  </p>
                  <p>
                    <strong>Dung lượng:</strong> {product.storage} GB
                  </p>
                  <p>
                    <strong>RAM:</strong> {product.ram} GB
                  </p>
                  <p>
                    <strong>Kích thước màn hình:</strong> {product.screenSize}{" "}
                    inch
                  </p>
                  <p>
                    <strong>Pin:</strong> {product.battery} mAh
                  </p>
                  <p>
                    <strong>Chip:</strong> {product.chip}
                  </p>
                  <p>
                    <strong>Hệ điều hành:</strong> {product.operatingSystem}
                  </p>
                  <p>
                    <strong>Model:</strong> {product.model.name} (
                    {product.model.brand.name})
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
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
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
        />
      )}

      {/* Modal Sửa sản phẩm */}
      {role === "Admin" && (
        <ProductForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleEditProduct}
          initialData={selectedProduct || undefined}
        />
      )}

      {/* Modal Xem chi tiết sản phẩm */}
      <ProductDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        product={selectedProduct}
      />
    </div>
  );
}
