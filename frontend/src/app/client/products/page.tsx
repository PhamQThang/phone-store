// app/client/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/client/ProductCard";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBrands } from "@/api/admin/brandsApi";
import { getProducts } from "@/api/admin/productsApi";
import { Brand, Product } from "@/lib/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const brandSlug = searchParams.get("brand");
  const modelSlug = searchParams.get("model");

  // Lấy danh sách thương hiệu và model
  const fetchBrands = async () => {
    try {
      const brandsData = await getBrands();
      setBrands(brandsData);
    } catch (error) {
      console.error("Không thể lấy danh sách thương hiệu:", error);
    }
  };

  // Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      const productsData = await getProducts(
        brandSlug || undefined,
        modelSlug || undefined
      );
      setProducts(productsData);
    } catch (error: any) {
      setError(error.message || "Không thể lấy danh sách sản phẩm");
      toast.error("Lỗi", {
        description: error.message || "Không thể lấy danh sách sản phẩm",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchProducts();
  }, [brandSlug, modelSlug]);

  // Lọc danh sách model dựa trên brand đã chọn
  const selectedBrand = brands.find((b) => b.slug === brandSlug);
  const availableModels = selectedBrand ? selectedBrand.models : [];

  // Xử lý khi chọn brand
  const handleBrandChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      newSearchParams.delete("brand");
      newSearchParams.delete("model");
    } else {
      newSearchParams.set("brand", value);
      newSearchParams.delete("model"); // Xóa model khi thay đổi brand
    }
    router.push(`/client/products?${newSearchParams.toString()}`);
  };

  // Xử lý khi chọn model
  const handleModelChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      newSearchParams.delete("model");
    } else {
      newSearchParams.set("model", value);
    }
    router.push(`/client/products?${newSearchParams.toString()}`);
  };

  if (loading) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Danh sách sản phẩm</h1>

      {/* Bộ lọc */}
      <div className="flex space-x-4 mb-6">
        {/* Lọc theo thương hiệu */}
        <Select onValueChange={handleBrandChange} value={brandSlug || "all"}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Chọn thương hiệu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thương hiệu</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.slug}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Lọc theo model (chỉ hiển thị nếu đã chọn thương hiệu) */}
        {brandSlug && availableModels.length > 0 && (
          <Select onValueChange={handleModelChange} value={modelSlug || "all"}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Chọn dòng sản phẩm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả dòng sản phẩm</SelectItem>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.slug}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Danh sách sản phẩm */}
      {products.length === 0 ? (
        <p className="text-center">Không tìm thấy sản phẩm nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
