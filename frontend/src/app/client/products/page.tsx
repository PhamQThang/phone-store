"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/client/ProductCard";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { getProducts } from "@/api/admin/productsApi";
import { Product } from "@/lib/types";

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  const brandSlug = searchParams.get("brand");
  const modelSlug = searchParams.get("model");

  // Định nghĩa các giá trị cố định cho bộ lọc
  const priceRanges = [
    { label: "Dưới 3 triệu", min: 0, max: 3000000 },
    { label: "3 - 4 triệu", min: 3000000, max: 4000000 },
    { label: "Trên 4 triệu", min: 4000000, max: 5000000 },
  ];

  const screenSizeOptions = [
    { label: "Dưới 6 inch", min: 0, max: 6 },
    { label: "6 - 7 inch", min: 6, max: 7 },
    { label: "Trên 7 inch", min: 7, max: 10 },
  ];

  const ramOptions = [
    { label: "4GB", value: 4 },
    { label: "6GB", value: 6 },
    { label: "8GB", value: 8 },
  ];

  const storageOptions = [
    { label: "164GB", value: 64 },
    { label: "128GB", value: 128 },
    { label: "256GB", value: 256 },
  ];

  const batteryOptions = [
    { label: "Dưới 4000mAh", min: 0, max: 4000 },
    { label: "4000 - 5000mAh", min: 4000, max: 5000 },
    { label: "Trên 5000mAh", min: 5000, max: 10000 },
  ];

  // State để lưu các giá trị bộ lọc được chọn
  const [filterValues, setFilterValues] = useState<{
    selectedPriceRanges: string[];
    selectedScreenSizes: string[];
    selectedRams: number[];
    selectedStorages: number[];
    selectedBatteries: string[];
  }>({
    selectedPriceRanges: [],
    selectedScreenSizes: [],
    selectedRams: [],
    selectedStorages: [],
    selectedBatteries: [],
  });

  const fetchData = async () => {
    startTransition(async () => {
      try {
        const [productsData] = await Promise.all([
          getProducts(brandSlug || undefined, modelSlug || undefined),
        ]);

        setAllProducts(productsData);
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

  // Áp dụng bộ lọc khi allProducts hoặc filterValues thay đổi
  useEffect(() => {
    if (allProducts.length > 0) {
      applyFilters(allProducts);
    }
  }, [allProducts, filterValues]);

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [brandSlug, modelSlug]);

  const applyFilters = (products: Product[]) => {
    if (!Array.isArray(products)) {
      console.error("Dữ liệu đầu vào không phải là mảng:", products);
      setFilteredProducts([]);
      return;
    }

    // Kiểm tra xem có bộ lọc nào được chọn không
    const isFilterApplied = Object.values(filterValues).some(
      (filterArray) => Array.isArray(filterArray) && filterArray.length > 0
    );

    if (!isFilterApplied) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) => {
      const price = product.price || 0;
      const screenSize = product.screenSize || 0;
      const ram = product.ram || 0;
      const storage = product.storage || 0;
      const battery = product.battery || 0;

      // Lọc theo giá
      const priceMatch =
        filterValues.selectedPriceRanges.length === 0 ||
        filterValues.selectedPriceRanges.some((rangeLabel) => {
          const range = priceRanges.find((r) => r.label === rangeLabel);
          return range && price >= range.min && price <= range.max;
        });

      // Lọc theo kích thước màn hình
      const screenSizeMatch =
        filterValues.selectedScreenSizes.length === 0 ||
        filterValues.selectedScreenSizes.some((sizeLabel) => {
          const sizeRange = screenSizeOptions.find(
            (s) => s.label === sizeLabel
          );
          return (
            sizeRange &&
            screenSize >= sizeRange.min &&
            screenSize <= sizeRange.max
          );
        });

      // Lọc theo RAM
      const ramMatch =
        filterValues.selectedRams.length === 0 ||
        filterValues.selectedRams.includes(ram);

      // Lọc theo dung lượng lưu trữ
      const storageMatch =
        filterValues.selectedStorages.length === 0 ||
        filterValues.selectedStorages.includes(storage);

      // Lọc theo dung lượng pin
      const batteryMatch =
        filterValues.selectedBatteries.length === 0 ||
        filterValues.selectedBatteries.some((batteryLabel) => {
          const batteryRange = batteryOptions.find(
            (b) => b.label === batteryLabel
          );
          return (
            batteryRange &&
            battery >= batteryRange.min &&
            battery <= batteryRange.max
          );
        });

      return (
        priceMatch &&
        screenSizeMatch &&
        ramMatch &&
        storageMatch &&
        batteryMatch
      );
    });

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (
    filterKey: keyof typeof filterValues,
    value: string | number,
    checked: boolean
  ) => {
    setFilterValues((prev) => {
      const currentValues = prev[filterKey] as any[];
      let newValues: any[];
      if (checked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter((v) => v !== value);
      }
      const updatedFilters = {
        ...prev,
        [filterKey]: newValues,
      };
      return updatedFilters;
    });
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
        {/* Lọc theo giá */}
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <Label className="block mb-2 text-sm font-medium">Giá (VNĐ)</Label>
          <div className="flex flex-wrap gap-3">
            {priceRanges.map((range) => (
              <div key={range.label} className="flex items-center space-x-2">
                <Checkbox
                  id={`price-${range.label}`}
                  checked={filterValues.selectedPriceRanges.includes(
                    range.label
                  )}
                  onCheckedChange={(checked) =>
                    handleFilterChange(
                      "selectedPriceRanges",
                      range.label,
                      checked as boolean
                    )
                  }
                  disabled={isPending}
                  className="h-4 w-4"
                />
                <Label htmlFor={`price-${range.label}`} className="text-sm">
                  {range.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Lọc theo kích thước màn hình */}
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <Label className="block mb-2 text-sm font-medium">
            Kích thước màn hình (inch)
          </Label>
          <div className="flex flex-wrap gap-3">
            {screenSizeOptions.map((option) => (
              <div key={option.label} className="flex items-center space-x-2">
                <Checkbox
                  id={`screenSize-${option.label}`}
                  checked={filterValues.selectedScreenSizes.includes(
                    option.label
                  )}
                  onCheckedChange={(checked) =>
                    handleFilterChange(
                      "selectedScreenSizes",
                      option.label,
                      checked as boolean
                    )
                  }
                  disabled={isPending}
                  className="h-4 w-4"
                />
                <Label
                  htmlFor={`screenSize-${option.label}`}
                  className="text-sm"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Lọc theo RAM */}
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <Label className="block mb-2 text-sm font-medium">RAM (GB)</Label>
          <div className="flex flex-wrap gap-3">
            {ramOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`ram-${option.value}`}
                  checked={filterValues.selectedRams.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleFilterChange(
                      "selectedRams",
                      option.value,
                      checked as boolean
                    )
                  }
                  disabled={isPending}
                  className="h-4 w-4"
                />
                <Label htmlFor={`ram-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Lọc theo dung lượng lưu trữ */}
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <Label className="block mb-2 text-sm font-medium">
            Dung lượng (GB)
          </Label>
          <div className="flex flex-wrap gap-3">
            {storageOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`storage-${option.value}`}
                  checked={filterValues.selectedStorages.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleFilterChange(
                      "selectedStorages",
                      option.value,
                      checked as boolean
                    )
                  }
                  disabled={isPending}
                  className="h-4 w-4"
                />
                <Label htmlFor={`storage-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Lọc theo dung lượng pin */}
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <Label className="block mb-2 text-sm font-medium">
            Dung lượng pin (mAh)
          </Label>
          <div className="flex flex-wrap gap-3">
            {batteryOptions.map((option) => (
              <div key={option.label} className="flex items-center space-x-2">
                <Checkbox
                  id={`battery-${option.label}`}
                  checked={filterValues.selectedBatteries.includes(
                    option.label
                  )}
                  onCheckedChange={(checked) =>
                    handleFilterChange(
                      "selectedBatteries",
                      option.label,
                      checked as boolean
                    )
                  }
                  disabled={isPending}
                  className="h-4 w-4"
                />
                <Label htmlFor={`battery-${option.label}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
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
