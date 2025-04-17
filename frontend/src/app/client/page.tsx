"use client";

import { getProducts } from "@/api/admin/productsApi";
import { getSlides } from "@/api/admin/slidesApi";
import HomeCarousel from "@/components/client/homes/HomeCarousel";
import ProductCard from "@/components/client/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Product, Slide } from "@/lib/types";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ClientHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Sử dụng Promise.all để gọi cả 2 API cùng lúc
        const [productsData, slidesData] = await Promise.all([
          getProducts(),
          getSlides(),
        ]);

        setProducts(productsData);

        // Lọc các Slide có isActive = true và sắp xếp theo displayOrder
        const activeSlides = slidesData
          .filter((slide) => slide.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        setSlides(activeSlides);
      } catch (error: any) {
        setError(error.message || "Không thể lấy dữ liệu");
        toast.error("Lỗi", {
          description: error.message || "Không thể lấy dữ liệu",
          duration: 2000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
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
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <HomeCarousel slides={slides} />
      <h1 className="text-3xl font-bold mb-8">Sản phẩm nổi bật</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
