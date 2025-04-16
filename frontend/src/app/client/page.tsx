"use client";

import { getProducts } from "@/api/admin/productsApi";
import HomeCarousel from "@/components/client/homes/HomeCarousel";
import ProductCard from "@/components/client/ProductCard";
import { Product } from "@/lib/types";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ClientHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
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

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <HomeCarousel />
      <h1 className="text-3xl font-bold mb-8">Sản phẩm nổi bật</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
