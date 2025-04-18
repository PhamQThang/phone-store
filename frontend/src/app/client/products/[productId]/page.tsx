"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { addToCart } from "@/api/cart/cartApi";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { getProductById, getSimilarProducts } from "@/api/admin/productsApi";
import { getColors } from "@/api/admin/colorsApi";
import { Color, Product, ProductIdentity } from "@/lib/types";
import ProductCard from "@/components/client/ProductCard";

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const router = useRouter();
  const { productId } = useParams();

  const fetchData = useCallback(async () => {
    try {
      const [productData, colorsData, similarProductsData] = await Promise.all([
        getProductById(productId as string),
        getColors(),
        getSimilarProducts(productId as string),
      ]);

      console.log("similarProductsData", similarProductsData);

      setProduct(productData);
      setColors(colorsData);
      setSimilarProducts(similarProductsData);

      const firstAvailableColor = productData.productIdentities.find(
        (pi: ProductIdentity) => !pi.isSold
      )?.colorId;
      setSelectedColorId(firstAvailableColor || null);
    } catch (error: any) {
      setError(error.message || "Không thể lấy thông tin sản phẩm");
      toast.error("Lỗi", {
        description: error.message || "Không thể lấy thông tin sản phẩm",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchData();
    }
  }, [fetchData, productId]);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleAddToCart = async () => {
    const cartId = localStorage.getItem("cartId");
    if (!cartId) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      router.push("/auth/login");
      return;
    }

    if (!selectedColorId) {
      toast.error("Vui lòng chọn màu sắc trước khi thêm vào giỏ hàng");
      return;
    }

    try {
      await addToCart(cartId, {
        productId: product!.id,
        colorId: selectedColorId,
        quantity: 1,
      });
      toast.success("Đã thêm vào giỏ hàng", {
        duration: 2000,
      });
    } catch (error: any) {
      toast.error("Lỗi", {
        description: error.message || "Không thể thêm vào giỏ hàng",
        duration: 2000,
      });
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  if (!product) {
    return <div className="text-center mt-10">Sản phẩm không tồn tại</div>;
  }

  const availableColors = product.productIdentities
    .filter((pi) => !pi.isSold)
    .map((pi) => {
      const color = colors.find((c) => c.id === pi.colorId);
      return color || null;
    })
    .filter((color) => color !== null) as Color[];

  const productImages = product.productFiles.map((pf) => ({
    url: pf.file.url,
    isMain: pf.isMain,
  }));

  // Kiểm tra xem có khuyến mãi áp dụng không
  const activePromotion = product.promotions?.find(({ promotion }) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return promotion.isActive && startDate <= now && now <= endDate;
  });

  const originalPrice = product.price;
  const discountedPrice = product.discountedPrice ?? originalPrice;

  return (
    <div className="container mx-auto px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Phần hình ảnh sản phẩm với Carousel */}
            <div>
              {/* Carousel chính */}
              <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                  {productImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative w-full h-96">
                        <Image
                          src={image.url}
                          alt={`${product.name} - Image ${index + 1}`}
                          fill
                          className="object-contain rounded-md"
                          priority={index === 0}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* Danh sách ảnh nhỏ để chọn */}
              <div className="flex space-x-4 mt-4 overflow-x-auto py-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                      current === index + 1
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Thông tin sản phẩm */}
            <div>
              {activePromotion ? (
                <div className="flex items-center gap-4 mb-4">
                  <p className="text-2xl font-semibold text-red-600">
                    {discountedPrice.toLocaleString("vi-VN")} VNĐ
                  </p>
                  <p className="text-xl text-gray-500 line-through">
                    {originalPrice.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-semibold text-primary mb-4">
                  {originalPrice.toLocaleString("vi-VN")} VNĐ
                </p>
              )}
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Dung lượng:</span>{" "}
                  {product.storage} GB
                </p>
                <p>
                  <span className="font-semibold">RAM:</span> {product.ram} GB
                </p>
                <p>
                  <span className="font-semibold">Kích thước màn hình:</span>{" "}
                  {product.screenSize} inch
                </p>
                <p>
                  <span className="font-semibold">Pin:</span> {product.battery}{" "}
                  mAh
                </p>
                <p>
                  <span className="font-semibold">Chip:</span> {product.chip}
                </p>
                <p>
                  <span className="font-semibold">Hệ điều hành:</span>{" "}
                  {product.operatingSystem}
                </p>
                {availableColors.length > 0 ? (
                  <div>
                    <span className="font-semibold">Màu sắc:</span>
                    <Select
                      onValueChange={(value) => setSelectedColorId(value)}
                      value={selectedColorId || ""}
                    >
                      <SelectTrigger className="w-[200px] mt-2">
                        <SelectValue placeholder="Chọn màu sắc" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableColors.map((color) => (
                          <SelectItem key={color.id} value={color.id}>
                            {color.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <p className="text-red-600">Sản phẩm đã hết hàng</p>
                )}
              </div>
              {availableColors.length > 0 && (
                <Button onClick={handleAddToCart} className="mt-6 w-full">
                  Thêm vào giỏ hàng
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section sản phẩm tương tự */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Sản phẩm tương tự</h2>
        {similarProducts.length === 0 ? (
          <p className="text-center text-gray-500">
            Không có sản phẩm tương tự.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map((similarProduct) => (
              <ProductCard key={similarProduct.id} product={similarProduct} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
