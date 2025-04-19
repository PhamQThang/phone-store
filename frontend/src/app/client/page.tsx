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
        const [productsData, slidesData] = await Promise.all([
          getProducts(),
          getSlides(),
        ]);

        setProducts(productsData);

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
      <div className=" mx-auto px-4 py-10">

        <div className=" mx-auto px-4 py-10">
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
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  return (
    <div className="w-full mx-auto mb-10">
      <div className="container mx-auto">
        <HomeCarousel slides={slides} />
      </div>
      <div className="container mx-auto px-3 py-3 mt-5 bg-red-500 border-2 rounded-md shadow-md">
        <h1 className="text-5xl font-bold mt-5 mb-8 uppercase text-white">Tất cả sản phẩm</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>  
  );
}
