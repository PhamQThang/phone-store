"use client";

import { useState, useEffect, useTransition } from "react";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getBrands } from "@/api/admin/brandsApi";
import { getProducts } from "@/api/admin/productsApi";
import { Brand, Product } from "@/lib/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // Giới hạn mặc định
  const [totalPages, setTotalPages] = useState(1);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();

  const brandSlug = searchParams.get("brand");
  const modelSlug = searchParams.get("model");

  const fetchData = async () => {
    startTransition(async () => {
      try {
        const [brandsData, productsData] = await Promise.all([
          getBrands(),
          getProducts(
            brandSlug || undefined,
            modelSlug || undefined,
            page,
            limit
          ),
        ]);

        setBrands(brandsData);
        setProducts(productsData.data);
        setTotalPages(productsData.pagination.totalPages);
      } catch (error: any) {
        setError(error.message || "Không thể lấy dữ liệu");
        toast.error("Lỗi", {
          description: error.message || "Không thể lấy dữ liệu",
          duration: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [brandSlug, modelSlug, page, limit]);

  const selectedBrand = brands.find((b) => b.slug === brandSlug);
  const availableModels = selectedBrand ? selectedBrand.models : [];

  const handleBrandChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      newSearchParams.delete("brand");
      newSearchParams.delete("model");
    } else {
      newSearchParams.set("brand", value);
      newSearchParams.delete("model");
    }
    router.push(`/client/products?${newSearchParams.toString()}`);
    setPage(1); // Reset về trang 1 khi thay đổi thương hiệu
  };

  const handleModelChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      newSearchParams.delete("model");
    } else {
      newSearchParams.set("model", value);
    }
    router.push(`/client/products?${newSearchParams.toString()}`);
    setPage(1); // Reset về trang 1 khi thay đổi dòng sản phẩm
  };

  const handleLimitChange = (value: string) => {
    setLimit(parseInt(value, 10));
    setPage(1); // Reset về trang 1 khi thay đổi giới hạn
  };

  if (isLoading && !isPending) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="flex space-x-4 mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <Skeleton key={index} className="h-96 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Alert variant="destructive">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Danh sách sản phẩm</h1>

      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
        <div className="flex-1 sm:flex-none">
          <Label htmlFor="brand-filter" className="block mb-2">
            Thương hiệu
          </Label>
          <Select
            onValueChange={handleBrandChange}
            value={brandSlug || "all"}
            disabled={isPending}
          >
            <SelectTrigger id="brand-filter" className="w-full sm:w-48">
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
        </div>

        {brandSlug && availableModels.length > 0 && (
          <div className="flex-1 sm:flex-none">
            <Label htmlFor="model-filter" className="block mb-2">
              Dòng sản phẩm
            </Label>
            <Select
              onValueChange={handleModelChange}
              value={modelSlug || "all"}
              disabled={isPending}
            >
              <SelectTrigger id="model-filter" className="w-full sm:w-48">
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
          </div>
        )}

        <div className="flex-1 sm:flex-none">
          <Label htmlFor="limit-filter" className="block mb-2">
            Số lượng mỗi trang
          </Label>
          <Select
            onValueChange={handleLimitChange}
            value={limit.toString()}
            disabled={isPending}
          >
            <SelectTrigger id="limit-filter" className="w-full sm:w-48">
              <SelectValue placeholder="Chọn số lượng" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((val) => (
                <SelectItem key={val} value={val.toString()}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">
          Không tìm thấy sản phẩm nào.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <Button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || isPending}
              >
                Trước
              </Button>
              <span className="self-center">
                Trang {page} / {totalPages}
              </span>
              <Button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages || isPending}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
