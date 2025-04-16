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
import { Slider } from "@/components/ui/slider"; // Cần cài @radix-ui/react-slider
import { getBrands } from "@/api/admin/brandsApi";
import { getProducts } from "@/api/admin/productsApi";
import { Brand, Product } from "@/lib/types";

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();

  const brandSlug = searchParams.get("brand");
  const modelSlug = searchParams.get("model");

  const [filterValues, setFilterValues] = useState({
    minPrice: 0,
    maxPrice: 50000000,
    minScreenSize: 4,
    maxScreenSize: 7,
    minRam: 4,
    maxRam: 16,
    minStorage: 64,
    maxStorage: 1024,
  });

  const fetchData = async () => {
    startTransition(async () => {
      try {
        const [brandsData, productsData] = await Promise.all([
          getBrands(),
          getProducts(brandSlug || undefined, modelSlug || undefined),
        ]);

        console.log("productsData", productsData);

        setBrands(brandsData);
        setAllProducts(productsData); // Lưu toàn bộ sản phẩm
        applyFilters(productsData); // Áp dụng lọc ngay sau khi lấy dữ liệu
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
  }, [brandSlug, modelSlug]);

  // Hàm áp dụng lọc trên frontend
  const applyFilters = (products: Product[]) => {
    const filtered = products.filter((product) => {
      const priceMatch =
        product.price >= filterValues.minPrice &&
        product.price <= filterValues.maxPrice;
      const screenSizeMatch =
        product.screenSize >= filterValues.minScreenSize &&
        product.screenSize <= filterValues.maxScreenSize;
      const ramMatch =
        product.ram >= filterValues.minRam &&
        product.ram <= filterValues.maxRam;
      const storageMatch =
        product.storage >= filterValues.minStorage &&
        product.storage <= filterValues.maxStorage;
      return priceMatch && screenSizeMatch && ramMatch && storageMatch;
    });
    setFilteredProducts(filtered);
  };

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
  };

  const handleModelChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      newSearchParams.delete("model");
    } else {
      newSearchParams.set("model", value);
    }
    router.push(`/client/products?${newSearchParams.toString()}`);
  };

  const handleFilterChange = (key: string, value: number[]) => {
    const newFilterValues = {
      ...filterValues,
      [key]: value[1],
      [`min${key}`]: value[0],
    };
    setFilterValues(newFilterValues);
    applyFilters(allProducts); // Lọc lại với toàn bộ dữ liệu
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

        {/* Lọc theo giá */}
        <div className="flex-1 sm:flex-none">
          <Label htmlFor="price-filter" className="block mb-2">
            Giá (VNĐ)
          </Label>
          <Slider
            id="price-filter"
            min={0}
            max={50000000}
            step={100000}
            value={[filterValues.minPrice, filterValues.maxPrice]}
            onValueChange={(value) => handleFilterChange("Price", value)}
            className="w-full sm:w-48"
          />
          <div className="text-sm text-gray-600">
            {filterValues.minPrice.toLocaleString()} -{" "}
            {filterValues.maxPrice.toLocaleString()} VNĐ
          </div>
        </div>

        {/* Lọc theo kích thước màn hình */}
        <div className="flex-1 sm:flex-none">
          <Label htmlFor="screenSize-filter" className="block mb-2">
            Kích thước màn hình (inch)
          </Label>
          <Slider
            id="screenSize-filter"
            min={4}
            max={7}
            step={0.1}
            value={[filterValues.minScreenSize, filterValues.maxScreenSize]}
            onValueChange={(value) => handleFilterChange("ScreenSize", value)}
            className="w-full sm:w-48"
          />
          <div className="text-sm text-gray-600">
            {filterValues.minScreenSize} - {filterValues.maxScreenSize} inch
          </div>
        </div>

        {/* Lọc theo RAM */}
        <div className="flex-1 sm:flex-none">
          <Label htmlFor="ram-filter" className="block mb-2">
            RAM (GB)
          </Label>
          <Slider
            id="ram-filter"
            min={4}
            max={16}
            step={2}
            value={[filterValues.minRam, filterValues.maxRam]}
            onValueChange={(value) => handleFilterChange("Ram", value)}
            className="w-full sm:w-48"
          />
          <div className="text-sm text-gray-600">
            {filterValues.minRam} - {filterValues.maxRam} GB
          </div>
        </div>

        {/* Lọc theo dung lượng lưu trữ */}
        <div className="flex-1 sm:flex-none">
          <Label htmlFor="storage-filter" className="block mb-2">
            Dung lượng (GB)
          </Label>
          <Slider
            id="storage-filter"
            min={64}
            max={1024}
            step={64}
            value={[filterValues.minStorage, filterValues.maxStorage]}
            onValueChange={(value) => handleFilterChange("Storage", value)}
            className="w-full sm:w-48"
          />
          <div className="text-sm text-gray-600">
            {filterValues.minStorage} - {filterValues.maxStorage} GB
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">
          Không tìm thấy sản phẩm nào.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
